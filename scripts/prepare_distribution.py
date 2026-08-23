#!/usr/bin/env python3
"""Package approved editorial adaptations without generating or publishing prose."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from editorial_issue import load_issue, validate_issue

REPO_ROOT = Path(__file__).resolve().parent.parent
PRIVATE_OUTPUT = REPO_ROOT / "distribution"
PUBLIC_OUTPUT = REPO_ROOT / "public" / "distribution"
SITE_URL = "https://churnisdead.com"


def medium_checklist(title: str, slug: str) -> str:
    canonical = f"{SITE_URL}/newsletter/{slug}"
    return f"""# Medium import checklist: {title}

Status: HOLD until the canonical article is live and Medium publication is approved.

1. Open Medium's import tool: https://medium.com/p/import
2. Import {canonical}
3. Confirm the canonical URL is {canonical}
4. Check headings, source links, and the playbook link after import
5. Add this disclosure before publication:

   Editorial note: This article was researched and developed with AI assistance, then reviewed, sourced, and approved by Kuber Sethi.

6. Publish only after `distribution-approval.json` records Medium as approved

Do not rewrite the article just to avoid duplication. The canonical setting tells search engines which version is original.
"""


def package(issue_dir: Path) -> dict[str, str]:
    issue = load_issue(issue_dir)
    validation = validate_issue(issue, require_approved=True)
    if not validation.ok:
        raise ValueError("; ".join(validation.errors))

    slug = issue.metadata["slug"]
    title = issue.metadata["title"]
    private_dir = PRIVATE_OUTPUT / slug
    public_dir = PUBLIC_OUTPUT / slug
    private_dir.mkdir(parents=True, exist_ok=True)
    public_dir.mkdir(parents=True, exist_ok=True)

    if issue.linkedin:
        linkedin_posts = f"POST 1 - TUESDAY\n{'=' * 60}\n{issue.linkedin.strip()}\n{'=' * 60}\n"
        (private_dir / "linkedin_posts.md").write_text(linkedin_posts, encoding="utf-8")
        (public_dir / "linkedin_posts.md").write_text(linkedin_posts, encoding="utf-8")

    newsletter_source = issue_dir / "linkedin-newsletter.md"
    if newsletter_source.exists():
        for output_dir in (private_dir, public_dir):
            shutil.copyfile(newsletter_source, output_dir / "linkedin_newsletter.md")

    checklist = medium_checklist(title, slug)
    (private_dir / "medium_import.md").write_text(checklist, encoding="utf-8")
    (public_dir / "medium_import.md").write_text(checklist, encoding="utf-8")

    approval_source = issue_dir / "distribution-approval.json"
    if approval_source.exists():
        shutil.copyfile(approval_source, private_dir / "distribution-approval.json")

    return {"slug": slug, "title": title}


def write_manifest(rows: list[dict[str, str]]) -> None:
    existing: dict[str, dict[str, str]] = {}
    manifest_path = PUBLIC_OUTPUT / "manifest.json"
    if manifest_path.exists():
        for row in json.loads(manifest_path.read_text(encoding="utf-8")):
            existing[row["slug"]] = row
    for row in rows:
        existing[row["slug"]] = row
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(sorted(existing.values(), key=lambda item: item["title"]), indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("issue_dirs", nargs="+")
    args = parser.parse_args()
    rows = [package(Path(issue_dir).resolve()) for issue_dir in args.issue_dirs]
    write_manifest(rows)
    for row in rows:
        print(f"Distribution pack prepared: {row['slug']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
