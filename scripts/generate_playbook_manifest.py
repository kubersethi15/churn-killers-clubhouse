#!/usr/bin/env python3
"""Generate a public manifest so every PDF in the Playbook Vault is discoverable."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

from editorial_issue import ISSUES_DIR, load_issue

REPO_ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = REPO_ROOT / "public" / "pdfs"
OUTPUT = PDF_DIR / "manifest.json"


def title_from_filename(filename: str) -> str:
    stem = Path(filename).stem
    stem = re.sub(r"_?ChurnIsDead$", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"_?Audit$", " Audit", stem, flags=re.IGNORECASE)
    stem = stem.replace("_", " ").replace("-", " ")
    return re.sub(r"\s+", " ", stem).strip()


def main() -> None:
    current = datetime.now(timezone.utc)
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

    rows = []
    for pdf in sorted(PDF_DIR.glob("*.pdf")):
        issue_data = editorial_by_pdf.get(pdf.name)
        if issue_data and issue_data[1] > current:
            continue
        issue = issue_data[0] if issue_data else None
        title = issue.metadata["playbook_title"] if issue else title_from_filename(pdf.name)
        rows.append({
            "id": f"pdf-{pdf.stem.lower()}",
            "title": title,
            "description": issue.metadata["playbook_description"] if issue else f"Download the {title} worksheet from the Churn Is Dead archive.",
            "pdf_path": f"/pdfs/{pdf.name}",
            "notion_link": None,
            "newsletter_slug": issue.metadata["slug"] if issue else None,
            "newsletter_title": issue.metadata["title"] if issue else None,
            "published_date": issue.metadata["published_date"] if issue else None,
        })
    OUTPUT.write_text(json.dumps(rows, indent=2) + "\n", encoding="utf-8")
    print(f"Playbook manifest: {len(rows)} PDFs")


if __name__ == "__main__":
    main()
