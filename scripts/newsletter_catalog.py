#!/usr/bin/env python3
"""Build one newsletter catalog for sitemap, RSS, prerender, and audit scripts."""

from __future__ import annotations

import json
import os
import re
import urllib.request
from pathlib import Path

from editorial_issue import SLUG_RE, approved_newsletters

REPO_ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
SUPABASE_URL_DEFAULT = "https://xtwxemlxzbnadkkrvozr.supabase.co"
SUPABASE_ANON_DEFAULT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d3hlbWx4emJuYWRra3J2b3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NTUzNDAsImV4cCI6MjA2MzAzMTM0MH0.FX3zb-zai6KIM24eW4pckqWLNIg0HFCPil8cJW7l3t4"


def migration_newsletters() -> dict[str, dict]:
    newsletters: dict[str, dict] = {}
    for migration in sorted(MIGRATIONS_DIR.glob("*.sql")):
        sql = migration.read_text(encoding="utf-8")
        if "INSERT INTO public.newsletters" in sql:
            values = re.search(r"VALUES\s*\(\s*(?:E)?'([^']*(?:''[^']*)*)',\s*'([^']+)'", sql)
            if values:
                title = values.group(1).replace("''", "'")
                slug = values.group(2)
                if SLUG_RE.fullmatch(slug):
                    content_match = re.search(r"E'((?:[^'\\]|\\.|'')*)'", sql)
                    article = ""
                    if content_match:
                        article = content_match.group(1).replace("''", "'").replace("\\n", "\n").replace("\\t", "\t").replace("\\'", "'")
                    date_match = re.search(r"'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^']*)'", sql)
                    read_match = re.search(r"'(\d+ min read)'", sql)
                    category_match = re.search(r"'(Strategy|Leadership|Trust|Operations|AI|Revenue)'", sql)
                    excerpt = title
                    for candidate in re.findall(r"(?:E)?'([^']{30,300}(?:''[^']{0,100})*)'", sql):
                        cleaned = candidate.replace("''", "'")
                        if "\\n" not in candidate and "##" not in candidate and cleaned not in {title, slug} and 30 < len(cleaned) <= 250:
                            excerpt = cleaned
                            break
                    newsletters[slug] = {
                        "title": title,
                        "slug": slug,
                        "excerpt": excerpt,
                        "content": article,
                        "published_date": date_match.group(1) if date_match else "2026-01-01T00:00:00+00:00",
                        "read_time": read_match.group(1) if read_match else "9 min read",
                        "category": category_match.group(1) if category_match else "Strategy",
                    }

        for update in re.finditer(r"UPDATE public\.newsletters SET published_date = '([^']+)' WHERE slug = '([^']+)'", sql):
            if update.group(2) in newsletters:
                newsletters[update.group(2)]["published_date"] = update.group(1)
        for update in re.finditer(r"UPDATE public\.newsletters\s+SET title = '([^']*(?:''[^']*)*)'\s+WHERE slug = '([^']+)'", sql):
            if update.group(2) in newsletters:
                newsletters[update.group(2)]["title"] = update.group(1).replace("''", "'")
    return newsletters


def live_newsletters() -> dict[str, dict]:
    base = os.environ.get("SUPABASE_URL", SUPABASE_URL_DEFAULT).rstrip("/")
    key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_PUBLISHABLE_KEY") or SUPABASE_ANON_DEFAULT
    url = f"{base}/rest/v1/newsletters?select=title,slug,excerpt,content,published_date,read_time,category&order=published_date.desc&limit=200"
    request = urllib.request.Request(url, headers={"apikey": key, "Authorization": f"Bearer {key}"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            rows = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        print(f"  Live DB fetch failed ({exc}); using repository sources")
        return {}

    newsletters = {}
    for row in rows:
        slug = str(row.get("slug") or "")
        if not SLUG_RE.fullmatch(slug):
            if slug:
                print(f"  Skip unsafe live slug: {slug!r}")
            continue
        newsletters[slug] = {
            "title": row.get("title") or "",
            "slug": slug,
            "excerpt": row.get("excerpt") or row.get("title") or "",
            "content": row.get("content") or "",
            "published_date": row.get("published_date") or "2026-01-01T00:00:00+00:00",
            "read_time": row.get("read_time") or "9 min read",
            "category": row.get("category") or "Strategy",
        }
    print(f"  Live DB: {len(newsletters)} newsletters")
    return newsletters


def load_newsletter_catalog() -> dict[str, dict]:
    """Use migrations as fallback, live delivery rows as current state, and approved packages as authority."""
    catalog = migration_newsletters()
    catalog.update(live_newsletters())
    catalog.update(approved_newsletters())
    return catalog
