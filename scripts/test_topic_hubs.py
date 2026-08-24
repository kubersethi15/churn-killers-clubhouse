#!/usr/bin/env python3
"""Contract checks for curated topic hubs and their crawlable routes."""

from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

from newsletter_catalog import load_newsletter_catalog


ROOT = Path(__file__).resolve().parent.parent
TOPIC_DATA = ROOT / "src" / "data" / "topicHubs.ts"
PRERENDER = ROOT / "scripts" / "prerender_public_routes.py"
SITEMAP_GENERATOR = ROOT / "scripts" / "generate_sitemap_rss.py"
PUBLIC_SITEMAP = ROOT / "public" / "sitemap.xml"


def main() -> int:
    topic_source = TOPIC_DATA.read_text(encoding="utf-8")
    hub_slugs = re.findall(r'^    slug: "([a-z0-9-]+)",$', topic_source, re.MULTILINE)
    read_slugs = re.findall(r'^        slug: "([a-z0-9-]+)",$', topic_source, re.MULTILINE)

    assert hub_slugs, "no curated topic hubs found"
    assert len(hub_slugs) == len(set(hub_slugs)), "duplicate topic-hub slug"

    duplicate_reads = sorted(slug for slug, count in Counter(read_slugs).items() if count > 1)
    assert not duplicate_reads, f"issues assigned to multiple topic hubs: {duplicate_reads}"

    catalog = load_newsletter_catalog()
    missing_reads = sorted(set(read_slugs) - set(catalog))
    assert not missing_reads, f"topic reads missing from newsletter catalog: {missing_reads}"

    prerender_source = PRERENDER.read_text(encoding="utf-8")
    generator_source = SITEMAP_GENERATOR.read_text(encoding="utf-8")
    public_sitemap = PUBLIC_SITEMAP.read_text(encoding="utf-8")
    for slug in hub_slugs:
        route = f"topics/{slug}"
        assert f'"{route}": (' in prerender_source, f"{route} missing from public prerender routes"
        assert f'/topics/{slug}"' in generator_source, f"{route} missing from sitemap generator"
        assert f"https://churnisdead.com/topics/{slug}</loc>" in public_sitemap, (
            f"{route} missing from checked-in sitemap"
        )

    print(
        f"topic hub contract passed: {len(hub_slugs)} hubs, "
        f"{len(read_slugs)} distinct reads, all routes crawlable"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AssertionError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
