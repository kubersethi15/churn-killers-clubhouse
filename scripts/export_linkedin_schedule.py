#!/usr/bin/env python3
"""
Export LinkedIn posts to a CSV file compatible with Buffer, Typefully, and other schedulers.
Reads from distribution/{slug}/linkedin_posts.md
Also creates a consolidated schedule.csv in distribution/ with all posts for the week.

Usage:
  python scripts/export_linkedin_schedule.py
  # Reads slug from /tmp/newsletter_slug.txt (set by generate_newsletter.py)

Output:
  distribution/{slug}/linkedin_schedule.csv
  distribution/weekly_schedule.csv (append mode)
"""

import csv
import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
DISTRIBUTION_DIR = REPO_ROOT / "distribution"

# Default posting times in AEST (UTC+10 during non-DST, UTC+11 during DST)
# LinkedIn best engagement: 7-8am, 12pm, 5-6pm AEST
POST_TIMES = {
    "Tuesday": "08:00",
    "Wednesday": "12:00",
    "Thursday": "08:00",
    "Friday": "17:00",
}


def get_next_weekday(target_day: str) -> datetime:
    """Get the next occurrence of a weekday from today."""
    days = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
            "Friday": 4, "Saturday": 5, "Sunday": 6}
    today = datetime.now(timezone.utc)
    target = days.get(target_day, 1)
    days_ahead = target - today.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    return today + timedelta(days=days_ahead)


def parse_linkedin_posts(filepath: Path) -> list:
    """Parse linkedin_posts.md into structured posts."""
    text = filepath.read_text()
    posts = []

    # Split by the separator pattern
    blocks = re.split(r'={50,}', text)

    current_day = None
    current_strategy = None

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        # Check if this is a header block (POST N -- DAY)
        day_match = re.search(r'POST \d+ -- (\w+)', block)
        if day_match:
            current_day = day_match.group(1).title()
            # Extract strategy
            strat_match = re.search(r'Strategy: (.+)', block)
            current_strategy = strat_match.group(1) if strat_match else ""
            continue

        # This is a content block
        if current_day and block:
            # Clean up the content
            content = block.strip()
            if content and len(content) > 20:  # Skip very short fragments
                posts.append({
                    "day": current_day,
                    "content": content,
                    "strategy": current_strategy or "",
                })
                current_day = None  # Reset for next post

    return posts


def create_schedule_csv(posts: list, slug: str, output_path: Path):
    """Create a CSV file compatible with Buffer and Typefully."""
    rows = []

    for post in posts:
        day = post["day"]
        time = POST_TIMES.get(day, "08:00")
        date = get_next_weekday(day)
        scheduled_dt = date.strftime(f"%Y-%m-%d") + f" {time}"

        rows.append({
            "Date": scheduled_dt,
            "Day": day,
            "Content": post["content"],
            "Platform": "LinkedIn",
            "Status": "Scheduled",
            "Newsletter": slug,
            "Strategy": post["strategy"],
        })

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Day", "Content", "Platform", "Status", "Newsletter", "Strategy"])
        writer.writeheader()
        writer.writerows(rows)

    return rows


def create_buffer_csv(posts: list, slug: str, output_path: Path):
    """Create a simplified CSV for Buffer bulk upload (Text, Scheduled At)."""
    rows = []

    for post in posts:
        day = post["day"]
        time = POST_TIMES.get(day, "08:00")
        date = get_next_weekday(day)
        # Buffer expects: Text, Scheduled At (ISO format)
        scheduled_iso = date.strftime(f"%Y-%m-%dT{time}:00+10:00")

        rows.append({
            "Text": post["content"],
            "Scheduled At": scheduled_iso,
        })

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Text", "Scheduled At"])
        writer.writeheader()
        writer.writerows(rows)

    return rows


def main():
    # Get the slug
    slug_file = Path("/tmp/newsletter_slug.txt")
    if not slug_file.exists():
        print("   LinkedIn export: No slug file found — skipping")
        return

    slug = slug_file.read_text().strip()
    posts_file = DISTRIBUTION_DIR / slug / "linkedin_posts.md"

    if not posts_file.exists():
        print(f"   LinkedIn export: No linkedin_posts.md found for {slug} — skipping")
        return

    print(f"   LinkedIn export: Processing posts for '{slug}'...")

    posts = parse_linkedin_posts(posts_file)

    if not posts:
        print("   LinkedIn export: No posts parsed — skipping")
        return

    # Create detailed schedule CSV
    schedule_path = DISTRIBUTION_DIR / slug / "linkedin_schedule.csv"
    rows = create_schedule_csv(posts, slug, schedule_path)
    print(f"   LinkedIn export: {len(rows)} posts → {schedule_path}")

    # Create Buffer-compatible CSV
    buffer_path = DISTRIBUTION_DIR / slug / "buffer_import.csv"
    create_buffer_csv(posts, slug, buffer_path)
    print(f"   LinkedIn export: Buffer CSV → {buffer_path}")

    # Create/update consolidated weekly schedule
    weekly_path = DISTRIBUTION_DIR / "weekly_schedule.csv"
    file_exists = weekly_path.exists()

    with open(weekly_path, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Day", "Content", "Platform", "Status", "Newsletter", "Strategy"])
        if not file_exists:
            writer.writeheader()
        writer.writerows(rows)

    print(f"   LinkedIn export: Appended to {weekly_path}")


if __name__ == "__main__":
    main()
