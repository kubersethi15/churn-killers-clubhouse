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


def publish_post(token: str, user_id: str, title: str, content: str, tags: list, canonical_url: str, publish_status: str = "draft") -> dict:
    """Publish a post to Medium.

    publish_status: 'draft', 'unlisted', or 'public'
      - draft: only the author can see it
      - unlisted: anyone with the link can see, not in feeds
      - public: full distribution
    """
    if publish_status not in ("draft", "unlisted", "public"):
        publish_status = "draft"

    payload = json.dumps({
        "title": title,
        "contentFormat": "markdown",
        "content": content,
        "tags": tags[:5],  # Medium allows max 5 tags
        "canonicalUrl": canonical_url,
        "publishStatus": publish_status,
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


# Backwards-compat alias
def publish_draft(token: str, user_id: str, title: str, content: str, tags: list, canonical_url: str) -> dict:
    return publish_post(token, user_id, title, content, tags, canonical_url, publish_status="draft")


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


def get_latest_published_slug() -> str | None:
    """Query Supabase for the most recent newsletter slug whose published_date <= now()."""
    supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url or not service_key:
        return None
    from datetime import datetime, timezone
    now_iso = datetime.now(timezone.utc).isoformat()
    url = f"{supabase_url}/rest/v1/newsletters?select=slug&published_date=lte.{now_iso}&order=published_date.desc&limit=1"
    try:
        req = urllib.request.Request(url)
        req.add_header("apikey", service_key)
        req.add_header("Authorization", f"Bearer {service_key}")
        with urllib.request.urlopen(req, timeout=15) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
        if rows and "slug" in rows[0]:
            return rows[0]["slug"].strip()
    except Exception as e:
        print(f"   Medium: Could not query Supabase for slug ({e})")
    return None


def main():
    token = os.environ.get("MEDIUM_TOKEN", "").strip()
    if not token:
        print("   Medium: MEDIUM_TOKEN not set — skipping Medium publish")
        return

    # PUBLISH_STATUS controls whether this is a draft or live post.
    # - Sunday workflow (alongside generation): MEDIUM_PUBLISH_STATUS=draft (legacy default)
    # - Wednesday workflow (after subscribers got email): MEDIUM_PUBLISH_STATUS=public
    publish_status = os.environ.get("MEDIUM_PUBLISH_STATUS", "draft").strip().lower()

    # Slug resolution: prefer /tmp file (set by generator on Sunday), then Supabase query (Wednesday job)
    slug_file = Path("/tmp/newsletter_slug.txt")
    slug = None
    if slug_file.exists():
        slug = slug_file.read_text().strip()
        print(f"   Medium: Using slug from generator: {slug}")
    elif os.environ.get("MEDIUM_SLUG_OVERRIDE"):
        slug = os.environ["MEDIUM_SLUG_OVERRIDE"].strip()
        print(f"   Medium: Using slug from env override: {slug}")
    else:
        slug = get_latest_published_slug()
        if slug:
            print(f"   Medium: Resolved latest published slug from Supabase: {slug}")

    if not slug:
        print("   Medium: No slug available (no /tmp file, no env override, no Supabase result) — skipping")
        return

    medium_file = DISTRIBUTION_DIR / slug / "medium_article.md"
    if not medium_file.exists():
        print(f"   Medium: No medium_article.md found for {slug} — skipping")
        return

    print(f"   Medium: Publishing as '{publish_status.upper()}' for '{slug}'...")

    try:
        article = parse_medium_article(medium_file)
        if not article["title"] or not article["body"]:
            print("   Medium: Article title or body is empty — skipping")
            return

        user = get_medium_user(token)
        user_id = user["id"]
        username = user.get("username", "unknown")
        print(f"   Medium: Authenticated as @{username}")

        canonical_url = f"https://churnisdead.com/newsletter/{slug}"
        result = publish_post(
            token=token,
            user_id=user_id,
            title=article["title"],
            content=article["body"],
            tags=article["tags"],
            canonical_url=canonical_url,
            publish_status=publish_status,
        )

        post_url = result.get("url", "unknown")
        post_status = result.get("publishStatus", publish_status)
        print(f"   Medium: Post created successfully!")
        print(f"   Medium: URL: {post_url}")
        print(f"   Medium: Status: {post_status.upper()}")

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else "No details"
        print(f"   Medium: API error ({e.code}): {error_body}")
    except Exception as e:
        print(f"   Medium: Failed (non-fatal): {e}")


if __name__ == "__main__":
    main()
