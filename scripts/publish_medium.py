#!/usr/bin/env python3
"""
Publish the latest newsletter's Medium article as a DRAFT on Medium.
Reads from distribution/{slug}/medium_article.md
Requires MEDIUM_TOKEN environment variable (integration token from Medium settings).

Usage:
  python scripts/publish_medium.py
  # Reads slug from /tmp/newsletter_slug.txt (set by generate_newsletter.py)
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
DISTRIBUTION_DIR = REPO_ROOT / "distribution"

MEDIUM_API_BASE = "https://api.medium.com/v1"


def get_medium_user(token: str) -> dict:
    """Get authenticated Medium user info."""
    req = urllib.request.Request(
        f"{MEDIUM_API_BASE}/me",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["data"]


def publish_draft(token: str, user_id: str, title: str, content: str, tags: list, canonical_url: str) -> dict:
    """Publish a draft post to Medium."""
    payload = json.dumps({
        "title": title,
        "contentFormat": "markdown",
        "content": content,
        "tags": tags[:5],  # Medium allows max 5 tags
        "canonicalUrl": canonical_url,
        "publishStatus": "draft",  # Always draft — review before publishing
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{MEDIUM_API_BASE}/users/{user_id}/posts",
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["data"]


def parse_medium_article(filepath: Path) -> dict:
    """Parse the medium_article.md file to extract title, tags, and body."""
    text = filepath.read_text()

    # Extract metadata from header comments
    title = ""
    subtitle = ""
    tags = []
    body_started = False
    body_lines = []

    for line in text.split("\n"):
        if line.startswith("# Title:"):
            title = line.replace("# Title:", "").strip()
        elif line.startswith("# Subtitle:"):
            subtitle = line.replace("# Subtitle:", "").strip()
        elif line.startswith("# Tags:"):
            tags_str = line.replace("# Tags:", "").strip()
            tags = [t.strip() for t in tags_str.split(",") if t.strip()]
        elif line.strip() == "---" and not body_started:
            body_started = True
        elif body_started:
            body_lines.append(line)

    body = "\n".join(body_lines).strip()

    # Prepend subtitle as italic if present
    if subtitle:
        body = f"*{subtitle}*\n\n{body}"

    return {
        "title": title,
        "tags": tags,
        "body": body,
    }


def main():
    token = os.environ.get("MEDIUM_TOKEN", "").strip()
    if not token:
        print("   Medium: MEDIUM_TOKEN not set — skipping Medium publish")
        return

    # Get the slug from the newsletter generator
    slug_file = Path("/tmp/newsletter_slug.txt")
    if not slug_file.exists():
        print("   Medium: No slug file found — skipping")
        return

    slug = slug_file.read_text().strip()
    medium_file = DISTRIBUTION_DIR / slug / "medium_article.md"

    if not medium_file.exists():
        print(f"   Medium: No medium_article.md found for {slug} — skipping")
        return

    print(f"   Medium: Publishing draft for '{slug}'...")

    try:
        # Parse the article
        article = parse_medium_article(medium_file)
        if not article["title"] or not article["body"]:
            print("   Medium: Article title or body is empty — skipping")
            return

        # Get user info
        user = get_medium_user(token)
        user_id = user["id"]
        username = user.get("username", "unknown")
        print(f"   Medium: Authenticated as @{username}")

        # Publish as draft
        canonical_url = f"https://churnisdead.com/newsletter/{slug}"
        result = publish_draft(
            token=token,
            user_id=user_id,
            title=article["title"],
            content=article["body"],
            tags=article["tags"],
            canonical_url=canonical_url,
        )

        post_url = result.get("url", "unknown")
        print(f"   Medium: Draft created successfully!")
        print(f"   Medium: URL: {post_url}")
        print(f"   Medium: Status: DRAFT (review and publish manually)")

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else "No details"
        print(f"   Medium: API error ({e.code}): {error_body}")
    except Exception as e:
        print(f"   Medium: Failed (non-fatal): {e}")


if __name__ == "__main__":
    main()
