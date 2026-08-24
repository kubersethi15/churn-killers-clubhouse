#!/usr/bin/env python3
"""Validate the delayed canonical syndication register without publishing."""

from __future__ import annotations

import argparse
import csv
import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, urlparse

REPO_ROOT = Path(__file__).resolve().parent.parent
REGISTER = REPO_ROOT / "growth" / "syndication-register.csv"
SITE_ORIGIN = "https://churnisdead.com"
MIN_CANONICAL_AGE = timedelta(days=14)
VALID_MODES = {"import", "native_excerpt", "hold"}
VALID_STATUSES = {"prepared", "held", "published", "stopped"}


def parse_time(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError(f"timestamp must include a timezone: {value}")
    return parsed.astimezone(timezone.utc)


def load_rows(path: Path = REGISTER) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def validate_row(row: dict[str, str], repo_root: Path = REPO_ROOT) -> list[str]:
    errors: list[str] = []
    row_id = row.get("syndication_id") or "<missing-id>"
    mode = row.get("mode", "")
    status = row.get("status", "")
    if mode not in VALID_MODES:
        errors.append(f"{row_id}: unsupported mode {mode!r}")
    if status not in VALID_STATUSES:
        errors.append(f"{row_id}: unsupported status {status!r}")
    if mode == "hold":
        if status != "held":
            errors.append(f"{row_id}: hold rows must have held status")
        return errors

    slug = row.get("source_slug", "")
    metadata_path = repo_root / "editorial" / "issues" / slug / "metadata.json"
    if not metadata_path.exists():
        return errors + [f"{row_id}: issue metadata does not exist for {slug!r}"]

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    if metadata.get("slug") != slug:
        errors.append(f"{row_id}: metadata slug does not match register")

    try:
        canonical_published = parse_time(row["canonical_published_at"])
        canonical_eligible = parse_time(row["canonical_eligible_at"])
        experiment_eligible = parse_time(row["experiment_eligible_at"])
        planned = parse_time(row["planned_publish_at"])
        metadata_published = parse_time(metadata["published_date"])
    except (KeyError, TypeError, ValueError) as exc:
        return errors + [f"{row_id}: invalid timestamp: {exc}"]

    if metadata_published != canonical_published:
        errors.append(f"{row_id}: canonical publish time differs from issue metadata")
    if canonical_eligible < canonical_published + MIN_CANONICAL_AGE:
        errors.append(f"{row_id}: canonical-age gate is less than 14 days")
    if planned < canonical_eligible:
        errors.append(f"{row_id}: planned publication precedes canonical-age gate")
    if planned < experiment_eligible:
        errors.append(f"{row_id}: planned publication precedes experiment gate")

    expected_canonical = f"{SITE_ORIGIN}/newsletter/{slug}"
    if row.get("canonical_url") != expected_canonical:
        errors.append(f"{row_id}: canonical URL must be {expected_canonical}")

    campaign_url = urlparse(row.get("campaign_url", ""))
    query = parse_qs(campaign_url.query)
    expected_query = {
        "utm_source": [row.get("platform", "")],
        "utm_medium": ["syndication"],
        "utm_campaign": [row.get("campaign_label", "")],
        "utm_content": ["canonical_footer"],
    }
    if f"{campaign_url.scheme}://{campaign_url.netloc}{campaign_url.path}" != expected_canonical:
        errors.append(f"{row_id}: campaign URL must use the exact canonical path")
    if query != expected_query:
        errors.append(f"{row_id}: campaign URL has incorrect or extra UTM fields")

    approval_path = repo_root / row.get("approval_file", "")
    if not approval_path.exists():
        errors.append(f"{row_id}: approval file does not exist")
    else:
        approval = json.loads(approval_path.read_text(encoding="utf-8"))
        platform_approval = approval.get(row.get("platform", ""), {})
        if status == "published" and platform_approval.get("status") != "approved":
            errors.append(f"{row_id}: published status requires platform approval")
    return errors


class CanonicalParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.canonicals: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "link":
            return
        values = {key.lower(): value or "" for key, value in attrs}
        if "canonical" in values.get("rel", "").lower().split():
            self.canonicals.append(values.get("href", ""))


def verify_live_canonical(url: str) -> list[str]:
    request = urllib.request.Request(url, headers={"User-Agent": "ChurnIsDead-Syndication-QA/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            html = response.read().decode("utf-8", errors="replace")
            if response.status != 200:
                return [f"{url}: returned HTTP {response.status}"]
    except urllib.error.URLError as exc:
        return [f"{url}: live check failed: {exc}"]
    parser = CanonicalParser()
    parser.feed(html)
    if parser.canonicals != [url]:
        return [f"{url}: expected one exact canonical, found {parser.canonicals}"]
    return []


def readiness(row: dict[str, str], as_of: datetime) -> str:
    if row.get("mode") == "hold" or row.get("status") in {"held", "stopped"}:
        return row.get("status", "held")
    if row.get("status") == "published":
        return "published"
    planned = parse_time(row["planned_publish_at"])
    if as_of < planned:
        return f"scheduled:{planned.isoformat()}"
    approval = json.loads((REPO_ROOT / row["approval_file"]).read_text(encoding="utf-8"))
    if approval.get(row["platform"], {}).get("status") != "approved":
        return "awaiting_manual_approval"
    return "ready_for_manual_import"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--register", type=Path, default=REGISTER)
    parser.add_argument("--as-of", default=datetime.now(timezone.utc).isoformat())
    parser.add_argument("--live", action="store_true")
    args = parser.parse_args()

    try:
        as_of = parse_time(args.as_of)
    except ValueError as exc:
        print(f"Invalid --as-of: {exc}", file=sys.stderr)
        return 2

    rows = load_rows(args.register)
    errors = [error for row in rows for error in validate_row(row)]
    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1

    for row in rows:
        state = readiness(row, as_of)
        print(f"{row['syndication_id']}: {state}")
        if args.live and state in {"awaiting_manual_approval", "ready_for_manual_import"}:
            live_errors = verify_live_canonical(row["canonical_url"])
            if live_errors:
                for error in live_errors:
                    print(f"ERROR {error}")
                return 1
            print(f"{row['syndication_id']}: live canonical verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

