#!/usr/bin/env python3
"""Create an approval-safe LinkedIn manager handoff for one editorial issue.

The website remains canonical. Tuesday's LinkedIn adaptation is timed after the
issue is live in Sydney and remains a draft until distribution approval exists.

Usage:
  python scripts/export_linkedin_schedule.py <slug>
  python scripts/export_linkedin_schedule.py <slug> --approved-buffer

The Buffer export is deliberately unavailable until the issue's
distribution-approval.json records LinkedIn as approved.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

REPO_ROOT = Path(__file__).resolve().parent.parent
DISTRIBUTION_DIR = REPO_ROOT / "distribution"
EDITORIAL_DIR = REPO_ROOT / "editorial" / "issues"
SYDNEY = ZoneInfo("Australia/Sydney")
DEFAULT_POST_TIME = time(17, 30)
TUESDAY_LAUNCH_DELAY = timedelta(minutes=15)
WEEKDAYS = {
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5,
    "Sunday": 6,
}


def parse_linkedin_posts(filepath: Path) -> list[dict[str, str]]:
    """Parse the deterministic POST N - DAY distribution format."""
    blocks = re.split(r"={50,}", filepath.read_text(encoding="utf-8"))
    posts: list[dict[str, str]] = []
    current_day: str | None = None
    current_strategy = ""

    for raw_block in blocks:
        block = raw_block.strip()
        if not block:
            continue

        day_match = re.search(r"POST\s+\d+\s+-{1,2}\s+([A-Za-z]+)", block, re.IGNORECASE)
        if day_match:
            current_day = day_match.group(1).title()
            strategy_match = re.search(r"Strategy:\s*(.+)", block, re.IGNORECASE)
            current_strategy = strategy_match.group(1).strip() if strategy_match else "Newsletter launch"
            continue

        if current_day and len(block) > 20:
            posts.append({"day": current_day, "content": block, "strategy": current_strategy})
            current_day = None
            current_strategy = ""

    return posts


def load_publication_time(slug: str) -> datetime | None:
    metadata_path = EDITORIAL_DIR / slug / "metadata.json"
    if not metadata_path.exists():
        return None
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    published_date = metadata.get("published_date")
    if not published_date:
        return None
    parsed = datetime.fromisoformat(str(published_date).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(SYDNEY)


def scheduled_time(day_name: str, publication_time: datetime | None, now: datetime | None = None) -> datetime:
    target_weekday = WEEKDAYS.get(day_name)
    if target_weekday is None:
        raise ValueError(f"Unknown weekday in LinkedIn pack: {day_name}")

    if publication_time is not None:
        if day_name == "Tuesday":
            return publication_time + TUESDAY_LAUNCH_DELAY
        week_start = publication_time.date() - timedelta(days=publication_time.weekday())
        target_date = week_start + timedelta(days=target_weekday)
        return datetime.combine(target_date, DEFAULT_POST_TIME, tzinfo=SYDNEY)

    current = (now or datetime.now(SYDNEY)).astimezone(SYDNEY)
    days_ahead = (target_weekday - current.weekday()) % 7
    target_date = current.date() + timedelta(days=days_ahead)
    candidate = datetime.combine(target_date, DEFAULT_POST_TIME, tzinfo=SYDNEY)
    if candidate <= current:
        candidate += timedelta(days=7)
    return candidate


def manager_rows(
    posts: list[dict[str, str]],
    slug: str,
    publication_time: datetime | None,
    first_comment: str = "",
    approved: bool = False,
) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for post in posts:
        scheduled_at = scheduled_time(post["day"], publication_time)
        rows.append({
            "Date": scheduled_at.strftime("%Y-%m-%d"),
            "Time": scheduled_at.strftime("%H:%M"),
            "Timezone": "Australia/Sydney",
            "Day": post["day"],
            "Content": post["content"],
            "First Comment": first_comment,
            "Platform": "LinkedIn",
            "Status": "Approved for Posting" if approved else "Draft - approval required",
            "Newsletter": slug,
            "Strategy": post["strategy"],
        })
    return rows


def write_csv(rows: list[dict[str, str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = ["Date", "Time", "Timezone", "Day", "Content", "First Comment", "Platform", "Status", "Newsletter", "Strategy"]
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def linkedin_is_approved(slug: str) -> bool:
    approval_path = EDITORIAL_DIR / slug / "distribution-approval.json"
    if not approval_path.exists():
        return False
    approval = json.loads(approval_path.read_text(encoding="utf-8"))
    return approval.get("linkedin", {}).get("status") == "approved"


def write_buffer_csv(rows: list[dict[str, str]], output_path: Path) -> None:
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["Text", "Scheduled At"], lineterminator="\n")
        writer.writeheader()
        for row in rows:
            local_date = date.fromisoformat(row["Date"])
            local_time = time.fromisoformat(row["Time"])
            scheduled_at = datetime.combine(local_date, local_time, tzinfo=SYDNEY)
            writer.writerow({"Text": row["Content"], "Scheduled At": scheduled_at.isoformat()})


def resolve_slug(explicit_slug: str | None) -> str:
    if explicit_slug:
        return explicit_slug
    legacy_slug_file = Path("/tmp/newsletter_slug.txt")
    if legacy_slug_file.exists():
        return legacy_slug_file.read_text(encoding="utf-8").strip()
    raise ValueError("Pass the editorial issue slug explicitly.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", nargs="?")
    parser.add_argument("--approved-buffer", action="store_true", help="Create a Buffer import only after recorded LinkedIn approval")
    args = parser.parse_args()

    slug = resolve_slug(args.slug)
    if args.approved_buffer and not linkedin_is_approved(slug):
        parser.error("LinkedIn distribution is not approved; Buffer export was not created.")

    issue_dir = DISTRIBUTION_DIR / slug
    posts_file = issue_dir / "linkedin_posts.md"
    if not posts_file.exists():
        raise FileNotFoundError(f"No LinkedIn distribution pack found for {slug}")

    posts = parse_linkedin_posts(posts_file)
    if not posts:
        raise ValueError(f"No posts parsed from {posts_file}")

    first_comment_path = issue_dir / "linkedin_first_comment.md"
    first_comment = first_comment_path.read_text(encoding="utf-8").strip() if first_comment_path.exists() else ""
    approved = linkedin_is_approved(slug)
    rows = manager_rows(
        posts,
        slug,
        load_publication_time(slug),
        first_comment,
        approved=approved,
    )
    schedule_path = issue_dir / "linkedin_schedule.csv"
    write_csv(rows, schedule_path)
    handoff_state = "approved handoff" if approved else "draft"
    print(f"LinkedIn manager {handoff_state}: {len(rows)} post(s) -> {schedule_path}")

    if args.approved_buffer:
        buffer_path = issue_dir / "buffer_import.csv"
        write_buffer_csv(rows, buffer_path)
        print(f"Approved Buffer import -> {buffer_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
