#!/usr/bin/env python3
"""Load and validate a Churn Is Dead editorial issue package."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

REPO_ROOT = Path(__file__).resolve().parent.parent
ISSUES_DIR = REPO_ROOT / "editorial" / "issues"
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SAFE_FILENAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]*\.pdf$")
REQUIRED_METADATA = {
    "title",
    "slug",
    "excerpt",
    "category",
    "read_time",
    "published_date",
    "pdf_filename",
    "playbook_title",
    "playbook_description",
    "format",
    "primary_goal",
    "primary_cta",
}
ALLOWED_SOURCE_TYPES = {"primary", "official_guidance", "original_research", "secondary"}


@dataclass
class EditorialIssue:
    directory: Path
    metadata: dict[str, Any]
    content: str
    evidence: list[dict[str, Any]]
    playbook: dict[str, Any]
    approval: dict[str, Any]
    linkedin: str | None


@dataclass
class ValidationResult:
    errors: list[str]
    warnings: list[str]

    @property
    def ok(self) -> bool:
        return not self.errors


def _read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValueError(f"Missing required file: {path.name}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in {path.name}: {exc}") from exc


def load_issue(issue_dir: str | Path) -> EditorialIssue:
    directory = Path(issue_dir).resolve()
    if not directory.is_dir():
        raise ValueError(f"Issue directory does not exist: {directory}")
    try:
        content = (directory / "content.md").read_text(encoding="utf-8").strip()
    except FileNotFoundError as exc:
        raise ValueError("Missing required file: content.md") from exc
    linkedin_path = directory / "linkedin.md"
    return EditorialIssue(
        directory=directory,
        metadata=_read_json(directory / "metadata.json"),
        content=content,
        evidence=_read_json(directory / "evidence.json"),
        playbook=_read_json(directory / "playbook.json"),
        approval=_read_json(directory / "approval.json"),
        linkedin=linkedin_path.read_text(encoding="utf-8").strip() if linkedin_path.exists() else None,
    )


def _public_urls(markdown: str) -> set[str]:
    urls = set(re.findall(r"https?://[^\s)\]>]+", markdown))
    return {url.rstrip(".,") for url in urls}


def _is_external_source(url: str) -> bool:
    host = (urlparse(url).hostname or "").lower()
    return bool(host and host not in {"churnisdead.com", "www.churnisdead.com"})


def validate_issue(issue: EditorialIssue, require_approved: bool = False) -> ValidationResult:
    errors: list[str] = []
    warnings: list[str] = []
    meta = issue.metadata

    if not isinstance(meta, dict):
        return ValidationResult(["metadata.json must contain an object"], warnings)
    missing = sorted(REQUIRED_METADATA - set(meta))
    if missing:
        errors.append(f"metadata.json is missing: {', '.join(missing)}")

    slug = str(meta.get("slug", ""))
    if not SLUG_RE.fullmatch(slug):
        errors.append("slug must contain only lowercase letters, numbers, and single hyphens")
    if slug and issue.directory.name != slug:
        errors.append(f"directory name must match slug '{slug}'")

    pdf_filename = str(meta.get("pdf_filename", ""))
    if pdf_filename and not SAFE_FILENAME_RE.fullmatch(pdf_filename):
        errors.append("pdf_filename must be a safe .pdf filename without path separators")

    published_at: datetime | None = None
    try:
        published_at = datetime.fromisoformat(str(meta.get("published_date", "")).replace("Z", "+00:00"))
    except ValueError:
        errors.append("published_date must be a timezone-aware ISO 8601 timestamp")
    if published_at and published_at.tzinfo is None:
        errors.append("published_date must include a timezone")
    if published_at and published_at.weekday() != 1:
        errors.append("published_date must fall on Tuesday")

    word_count = len(re.findall(r"\b[\w’'-]+\b", issue.content))
    if word_count < 1200 or word_count > 2000:
        errors.append(f"article is {word_count} words; hard limit is 1,200 to 2,000")
    elif not 1300 <= word_count <= 1800:
        warnings.append(f"article is {word_count} words; preferred range is 1,300 to 1,800")

    if "## Sources and methodology" not in issue.content:
        errors.append("content.md must end with a 'Sources and methodology' section")
    if "—" in issue.content or (issue.linkedin and "—" in issue.linkedin):
        errors.append("house style forbids em dashes")
    if re.search(r"(^|\s)#[A-Za-z]", issue.content) or (issue.linkedin and re.search(r"(^|\s)#[A-Za-z]", issue.linkedin)):
        errors.append("publishable copy must not contain hashtags")

    if meta.get("format") not in {"operating_system", "leadership", "commercial_mechanics", "measurement", "evidence_teardown"}:
        errors.append("format must use an approved editorial portfolio type")
    if not str(meta.get("primary_goal", "")).strip():
        errors.append("primary_goal must name the reader decision this issue improves")
    if not str(meta.get("primary_cta", "")).strip():
        errors.append("primary_cta must name one primary next action")
    risky_first_person = re.compile(
        r"\b(I|we)\s+(saw|saved|helped|worked with|advised|led|managed|learned from)|"
        r"\b(my|our)\s+(customer|client|team|company|account|renewal)",
        re.IGNORECASE,
    )
    combined_copy = issue.content + "\n" + (issue.linkedin or "")
    if risky_first_person.search(combined_copy):
        errors.append("copy contains an experience claim that requires the author-experience ledger")

    if not isinstance(issue.evidence, list) or len(issue.evidence) < 2:
        errors.append("evidence.json must contain at least two sources")
        evidence_rows: list[dict[str, Any]] = []
    else:
        evidence_rows = [row for row in issue.evidence if isinstance(row, dict)]
        if len(evidence_rows) != len(issue.evidence):
            errors.append("every evidence entry must be an object")

    evidence_urls: set[str] = set()
    evidence_ids: set[str] = set()
    for index, row in enumerate(evidence_rows, 1):
        required = {"id", "claim", "source_title", "url", "publisher", "source_type", "accessed_at", "notes"}
        row_missing = sorted(required - set(row))
        if row_missing:
            errors.append(f"evidence entry {index} is missing: {', '.join(row_missing)}")
            continue
        evidence_id = str(row["id"])
        if evidence_id in evidence_ids:
            errors.append(f"duplicate evidence id: {evidence_id}")
        evidence_ids.add(evidence_id)
        url = str(row["url"])
        if not _is_external_source(url):
            errors.append(f"evidence {evidence_id} must use an external source URL")
        evidence_urls.add(url.rstrip("/"))
        if row["source_type"] not in ALLOWED_SOURCE_TYPES:
            errors.append(f"evidence {evidence_id} has invalid source_type")

    article_external_urls = {url.rstrip("/") for url in _public_urls(issue.content) if _is_external_source(url)}
    for url in sorted(article_external_urls - evidence_urls):
        errors.append(f"article source is missing from evidence.json: {url}")
    for url in sorted(evidence_urls - article_external_urls):
        warnings.append(f"evidence source is not visibly linked in the article: {url}")

    playbook = issue.playbook
    if not isinstance(playbook, dict):
        errors.append("playbook.json must contain an object")
    else:
        for field in ("title", "subtitle", "intro_text", "sections"):
            if not playbook.get(field):
                errors.append(f"playbook.json is missing '{field}'")
        sections = playbook.get("sections", [])
        if not isinstance(sections, list) or len(sections) < 3:
            errors.append("playbook must contain at least three usable sections")
        elif any(not isinstance(section, dict) or not section.get("rows") for section in sections):
            errors.append("every playbook section must contain rows")

    approval = issue.approval
    status = approval.get("status") if isinstance(approval, dict) else None
    if status not in {"pending", "approved"}:
        errors.append("approval status must be 'pending' or 'approved'")
    if status == "approved":
        for field in ("approved_by", "approved_at", "basis"):
            if not approval.get(field):
                errors.append(f"approved issue is missing approval field '{field}'")
        if not isinstance(approval.get("human_reviewed"), bool):
            errors.append("approved issue must record human_reviewed as true or false")
        if approval.get("human_reviewed") is False and approval.get("approved_by") == "Kuber Sethi":
            errors.append("standing-mandate approval must not be attributed to Kuber as human reviewer")
    if require_approved and status != "approved":
        errors.append("publication blocked: issue is not approved")

    variants = meta.get("subject_variants", [])
    if variants and (
        not isinstance(variants, list)
        or any(not isinstance(row, dict) for row in variants)
    ):
        errors.append("subject_variants must be a list of labelled subjects")
    elif isinstance(variants, list):
        if status == "approved" and len(variants) != 1:
            errors.append("approved issues must select exactly one email subject for the current small list")
        for index, row in enumerate(variants, 1):
            for field in ("label", "subject", "preheader"):
                if not str(row.get(field, "")).strip():
                    errors.append(f"subject variant {index} is missing '{field}'")
            subject = str(row.get("subject", "")).strip()
            preheader = str(row.get("preheader", "")).strip()
            if len(subject) > 60:
                errors.append(f"subject variant {index} exceeds 60 characters")
            if len(preheader) > 140:
                errors.append(f"subject variant {index} preheader exceeds 140 characters")
            if "—" in subject or "—" in preheader:
                errors.append(f"subject variant {index} contains a forbidden em dash")

    return ValidationResult(errors, warnings)


def approved_issue_directories() -> list[Path]:
    directories: list[Path] = []
    if not ISSUES_DIR.exists():
        return directories
    for directory in sorted(path for path in ISSUES_DIR.iterdir() if path.is_dir()):
        try:
            approval = _read_json(directory / "approval.json")
        except ValueError:
            continue
        if isinstance(approval, dict) and approval.get("status") == "approved":
            directories.append(directory)
    return directories


def approved_newsletters() -> dict[str, dict[str, Any]]:
    """Return validated approved packages in the shape used by SEO generators."""
    newsletters: dict[str, dict[str, Any]] = {}
    for directory in approved_issue_directories():
        issue = load_issue(directory)
        result = validate_issue(issue, require_approved=True)
        if not result.ok:
            joined = "; ".join(result.errors)
            raise ValueError(f"Invalid approved issue {directory.name}: {joined}")
        meta = issue.metadata
        newsletters[meta["slug"]] = {
            "title": meta["title"],
            "slug": meta["slug"],
            "excerpt": meta["excerpt"],
            "content": issue.content,
            "published_date": meta["published_date"],
            "read_time": meta["read_time"],
            "category": meta["category"],
        }
    return newsletters
