#!/usr/bin/env python3
"""Build and deterministically stage approved editorial issue packages."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

from editorial_issue import SLUG_RE, approved_issue_directories, load_issue, validate_issue
from generate_newsletter import build_playbook_pdf

REPO_ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = REPO_ROOT / "public" / "pdfs"
DISTRIBUTION_DIR = REPO_ROOT / "distribution"


def _request(url: str, key: str, method: str = "GET", payload: Any | None = None) -> Any:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    if payload is not None:
        req.add_header("Content-Type", "application/json")
        req.add_header("Prefer", "return=representation")
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read().decode("utf-8")
            return json.loads(body) if body else None
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8") if exc.fp else ""
        raise RuntimeError(f"Supabase request failed ({exc.code}): {body}") from exc


def _supabase_credentials() -> tuple[str, str]:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
    return url, key


def _upsert_by_column(table: str, match_column: str, match_value: str, payload: dict[str, Any]) -> dict[str, Any]:
    base, key = _supabase_credentials()
    encoded_value = urllib.parse.quote(match_value, safe="")
    select_url = f"{base}/rest/v1/{table}?select=id&{match_column}=eq.{encoded_value}&limit=1"
    existing = _request(select_url, key)
    if existing:
        patch_url = f"{base}/rest/v1/{table}?{match_column}=eq.{encoded_value}"
        result = _request(patch_url, key, method="PATCH", payload=payload)
        return {"action": "updated", "row": result[0] if result else {"id": existing[0]["id"]}}
    insert_url = f"{base}/rest/v1/{table}"
    result = _request(insert_url, key, method="POST", payload=payload)
    return {"action": "inserted", "row": result[0] if result else {}}


def repair_unsafe_newsletter_slugs() -> None:
    """Normalize legacy whitespace/backtick corruption without losing articles."""
    base, key = _supabase_credentials()
    rows = _request(f"{base}/rest/v1/newsletters?select=id,title,slug&limit=500", key) or []
    existing = {str(row.get("slug", "")) for row in rows}
    for row in rows:
        slug = str(row.get("slug", ""))
        if SLUG_RE.fullmatch(slug):
            continue
        cleaned = slug.strip().rstrip("`").strip()
        if not SLUG_RE.fullmatch(cleaned):
            print(f"WARNING: unsafe legacy slug requires manual review: {slug!r}")
            continue
        if cleaned in existing:
            print(f"WARNING: cannot repair duplicate legacy slug: {slug!r} -> {cleaned!r}")
            continue
        payload = {"slug": cleaned}
        title = row.get("title")
        if isinstance(title, str) and title != title.strip():
            payload["title"] = title.strip()
        encoded_id = urllib.parse.quote(str(row["id"]), safe="")
        _request(f"{base}/rest/v1/newsletters?id=eq.{encoded_id}", key, method="PATCH", payload=payload)
        existing.add(cleaned)
        print(f"Repaired legacy newsletter slug: {slug!r} -> {cleaned!r}")


def build_assets(issue) -> Path:
    pdf_path = PDF_DIR / issue.metadata["pdf_filename"]
    build_playbook_pdf(issue.playbook, issue.metadata, pdf_path)
    if issue.linkedin:
        output_dir = DISTRIBUTION_DIR / issue.metadata["slug"]
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "linkedin.md").write_text(issue.linkedin + "\n", encoding="utf-8")
    Path("/tmp/newsletter_slug.txt").write_text(issue.metadata["slug"], encoding="utf-8")
    Path("/tmp/newsletter_title.txt").write_text(issue.metadata["title"], encoding="utf-8")
    return pdf_path


def stage_issue(issue, dry_run: bool = False) -> None:
    result = validate_issue(issue, require_approved=True)
    for warning in result.warnings:
        print(f"WARNING: {warning}")
    if not result.ok:
        for error in result.errors:
            print(f"ERROR: {error}")
        raise RuntimeError("Editorial validation failed before publication")

    pdf_path = build_assets(issue)
    print(f"Built approved assets: {pdf_path.relative_to(REPO_ROOT)}")
    if dry_run:
        print("Dry run: Supabase was not changed")
        return

    meta = issue.metadata
    newsletter_payload = {
        "title": meta["title"],
        "slug": meta["slug"],
        "excerpt": meta["excerpt"],
        "content": issue.content,
        "published_date": meta["published_date"],
        "read_time": meta["read_time"],
        "category": meta["category"],
        "theme": meta.get("theme"),
        "subject_variants": meta.get("subject_variants"),
    }
    newsletter_result = _upsert_by_column("newsletters", "slug", meta["slug"], newsletter_payload)
    print(f"Supabase newsletter {newsletter_result['action']}: {meta['slug']}")

    playbook_payload = {
        "title": meta["playbook_title"],
        "description": meta["playbook_description"],
        "pdf_path": f"/pdfs/{meta['pdf_filename']}",
        "notion_link": None,
        "newsletter_slug": meta["slug"],
        "newsletter_title": meta["title"],
        "published_date": meta["published_date"],
    }
    try:
        playbook_result = _upsert_by_column("playbooks", "newsletter_slug", meta["slug"], playbook_payload)
        print(f"Supabase playbook {playbook_result['action']}: {meta['playbook_title']}")
    except RuntimeError as exc:
        if 'relation "public.playbooks" does not exist' not in str(exc):
            raise
        # Some production projects predate the optional playbooks table. The
        # generated public manifest remains the canonical vault data source.
        print("WARNING: Supabase playbooks table is unavailable; using the public PDF manifest")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("issue_dir", nargs="?")
    parser.add_argument("--all-approved", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if bool(args.issue_dir) == bool(args.all_approved):
        parser.error("provide one issue_dir or --all-approved")

    directories = approved_issue_directories() if args.all_approved else [Path(args.issue_dir)]
    if not directories:
        print("No approved issue packages found")
        return 0

    try:
        if not args.dry_run:
            repair_unsafe_newsletter_slugs()
        for directory in directories:
            stage_issue(load_issue(directory), dry_run=args.dry_run)
    except (RuntimeError, ValueError) as exc:
        print(f"ERROR: {exc}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
