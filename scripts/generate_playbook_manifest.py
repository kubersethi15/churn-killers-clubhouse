#!/usr/bin/env python3
"""Generate a public manifest so every PDF in the Playbook Vault is discoverable."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from editorial_issue import ISSUES_DIR, approved_newsletters, load_issue
from newsletter_catalog import live_newsletters, migration_newsletters

REPO_ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = REPO_ROOT / "public" / "pdfs"
OUTPUT = PDF_DIR / "manifest.json"
MIN_LIVE_NEWSLETTERS = 30
MIN_MAPPING_RETENTION = 0.75


def title_from_filename(filename: str) -> str:
    stem = Path(filename).stem
    stem = re.sub(r"_?ChurnIsDead$", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"_?Audit$", " Audit", stem, flags=re.IGNORECASE)
    stem = stem.replace("_", " ").replace("-", " ")
    return re.sub(r"\s+", " ", stem).strip()


def download_description(title: str) -> str:
    article = "" if title.lower().startswith("the ") else "the "
    return f"Download {article}{title} worksheet from the Churn Is Dead archive."


def legacy_slug_index(catalog: dict[str, dict]) -> dict[str, tuple[str, str, str]]:
    """Recover pdf -> issue links for playbooks that predate editorial/issues/.

    Only four issues use the editorial-issue format, so the other twenty-eight
    PDFs resolved to a null newsletter_slug and the vault had no route back to
    the article that produced each tool. The link is not missing though: those
    articles already link their own PDF in the body. Read it back out rather
    than guessing from titles, so nothing here is inferred.
    """
    index: dict[str, tuple[str, str, str]] = {}
    for slug, record in catalog.items():
        body = record.get("content") or ""
        for filename in re.findall(r"/pdfs/([A-Za-z0-9_\-\.]+\.pdf)", body):
            index.setdefault(
                filename, (slug, record.get("title", ""), record.get("published_date", ""))
            )
    return index


def existing_mapping_count() -> int:
    if not OUTPUT.exists():
        return 0
    try:
        rows = json.loads(OUTPUT.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return 0
    return sum(1 for row in rows if row.get("newsletter_slug"))


def build_rows(live: dict[str, dict], current: datetime) -> list[dict]:
    if len(live) < MIN_LIVE_NEWSLETTERS:
        raise RuntimeError(
            f"Live newsletter catalog returned only {len(live)} rows; refusing to rewrite "
            f"the manifest below the {MIN_LIVE_NEWSLETTERS}-row safety floor."
        )

    catalog = migration_newsletters()
    catalog.update(live)
    catalog.update(approved_newsletters())
    legacy = legacy_slug_index(catalog)
    live_slugs = set(live)
    editorial_by_pdf = {}
    for directory in ISSUES_DIR.iterdir() if ISSUES_DIR.exists() else []:
        if not directory.is_dir():
            continue
        try:
            issue = load_issue(directory)
            published_at = datetime.fromisoformat(issue.metadata["published_date"].replace("Z", "+00:00"))
        except (ValueError, KeyError):
            continue
        editorial_by_pdf[issue.metadata.get("pdf_filename")] = (issue, published_at)

    rows: list[dict] = []
    for pdf in sorted(PDF_DIR.glob("*.pdf")):
        issue_data = editorial_by_pdf.get(pdf.name)
        if issue_data and issue_data[1] > current:
            continue
        issue = issue_data[0] if issue_data else None
        fallback = legacy.get(pdf.name) if issue is None else None
        source_slug = issue.metadata["slug"] if issue else (fallback[0] if fallback else None)
        # A static shell is not a usable article route after React hydrates. Only
        # emit a backlink when the newsletter exists in the live delivery table.
        if source_slug not in live_slugs:
            source_slug = None
        title = issue.metadata["playbook_title"] if issue else title_from_filename(pdf.name)
        rows.append({
            "id": f"pdf-{pdf.stem.lower()}",
            "title": title,
            "description": issue.metadata["playbook_description"] if issue else download_description(title),
            "pdf_path": f"/pdfs/{pdf.name}",
            "notion_link": None,
            "newsletter_slug": source_slug,
            "newsletter_title": (
                issue.metadata["title"] if issue and source_slug
                else fallback[1] if fallback and source_slug
                else None
            ),
            "published_date": (
                issue.metadata["published_date"] if issue and source_slug
                else fallback[2] if fallback and source_slug
                else None
            ),
        })
    return rows


def ensure_safe_coverage(previous: int, mapped: int, allow_drop: bool = False) -> None:
    minimum = int(previous * MIN_MAPPING_RETENTION)
    if previous and mapped < minimum and not allow_drop:
        raise RuntimeError(
            f"Manifest mapping coverage fell from {previous} to {mapped}; refusing to overwrite "
            f"below the {MIN_MAPPING_RETENTION:.0%} retention guard. Re-run with "
            "--allow-coverage-drop only after confirming an intentional live-catalog removal."
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--allow-coverage-drop",
        action="store_true",
        help="Permit an intentional mapping reduction after reviewing live catalog changes.",
    )
    args = parser.parse_args()

    rows = build_rows(live_newsletters(), datetime.now(timezone.utc))
    previous = existing_mapping_count()
    mapped = sum(1 for row in rows if row.get("newsletter_slug"))
    ensure_safe_coverage(previous, mapped, args.allow_coverage_drop)
    OUTPUT.write_text(json.dumps(rows, indent=2) + "\n", encoding="utf-8")
    print(f"Playbook manifest: {len(rows)} PDFs, {mapped} live article routes")


if __name__ == "__main__":
    main()
