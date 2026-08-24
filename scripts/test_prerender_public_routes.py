from __future__ import annotations

import unittest
from datetime import datetime, timezone
import json
import re

from prerender_public_routes import (
    HOMEPAGE_STRUCTURED_DATA,
    archive_markup,
    published_archive_items,
    render,
    render_homepage,
)


class PublicRoutePrerenderTests(unittest.TestCase):
    def test_archive_excludes_future_and_unsafe_issues(self) -> None:
        catalog = {
            "published": {
                "slug": "published-issue",
                "title": "Published issue",
                "published_date": "2026-08-23T08:00:00+00:00",
            },
            "future": {
                "slug": "future-issue",
                "title": "Future issue",
                "published_date": "2026-08-25T08:00:00+00:00",
            },
            "unsafe": {
                "slug": "../../unsafe",
                "title": "Unsafe issue",
                "published_date": "2026-08-23T08:00:00+00:00",
            },
        }

        items = published_archive_items(catalog, datetime(2026, 8, 24, tzinfo=timezone.utc))

        self.assertEqual([item["slug"] for item in items], ["published-issue"])

    def test_archive_links_escape_titles(self) -> None:
        source = archive_markup([{
            "slug": "evidence-led-cs",
            "title": "Evidence & decisions",
            "published_date": "2026-08-23T08:00:00+00:00",
        }])

        self.assertIn('href="/newsletter/evidence-led-cs"', source)
        self.assertIn("Evidence &amp; decisions", source)

    def test_homepage_schema_is_static_valid_and_unique(self) -> None:
        template = '<html><head><title>Home</title></head><body><div id="root"></div></body></html>'
        source = render_homepage(template)
        matches = re.findall(
            r'<script type="application/ld\+json" data-seo="homepage-jsonld">(.*?)</script>',
            source,
        )
        self.assertEqual(len(matches), 1)
        payload = json.loads(matches[0])
        self.assertEqual(payload, HOMEPAGE_STRUCTURED_DATA)
        self.assertEqual(
            {item["@type"] for item in payload["@graph"]},
            {"WebSite", "Organization", "Person"},
        )
        self.assertEqual(
            next(item for item in payload["@graph"] if item["@type"] == "Person")["sameAs"],
            ["https://www.linkedin.com/in/kuber-cs-strategist/"],
        )

    def test_homepage_schema_does_not_leak_into_public_route(self) -> None:
        template = '''<html><head><title>Home</title>
          <link rel="canonical" href="https://churnisdead.com/">
          <meta name="description" content="A sufficiently long homepage description for testing route rendering.">
          <meta property="og:title" content="Home"><meta property="og:description" content="Home description">
          <meta property="og:url" content="https://churnisdead.com/">
          <meta name="twitter:title" content="Home"><meta name="twitter:description" content="Home description">
          </head><body><div id="root"></div></body></html>'''
        route_source = render(
            "start",
            "Start here",
            "A sufficiently long description for the rendered start page test.",
            "Start here",
            "Choose the problem on your desk.",
            template,
        )
        self.assertNotIn('data-seo="homepage-jsonld"', route_source)
        self.assertIn('"@type": "WebPage"', route_source)


if __name__ == "__main__":
    unittest.main()
