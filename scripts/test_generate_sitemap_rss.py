#!/usr/bin/env python3

import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

import generate_sitemap_rss


class SitemapFreshnessTest(unittest.TestCase):
    def test_uses_real_issue_dates_and_omits_unknown_static_lastmod(self):
        newsletters = {
            "published-issue": {
                "slug": "published-issue",
                "published_date": "2026-08-18T08:00:00+00:00",
            },
            "future-issue": {
                "slug": "future-issue",
                "published_date": "2026-09-01T08:00:00+00:00",
            },
        }

        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.object(generate_sitemap_rss, "PUBLIC_DIR", Path(tmpdir)):
                path = generate_sitemap_rss.generate_sitemap(
                    newsletters,
                    now=datetime(2026, 8, 25, tzinfo=timezone.utc),
                )
                xml = path.read_text()

        homepage = xml.split("<loc>https://churnisdead.com/</loc>", 1)[1].split("</url>", 1)[0]
        subscribe = xml.split("<loc>https://churnisdead.com/subscribe</loc>", 1)[1].split("</url>", 1)[0]
        published = xml.split(
            "<loc>https://churnisdead.com/newsletter/published-issue</loc>", 1
        )[1].split("</url>", 1)[0]

        self.assertIn("<lastmod>2026-08-18</lastmod>", homepage)
        self.assertNotIn("<lastmod>", subscribe)
        self.assertIn("<lastmod>2026-08-18</lastmod>", published)
        self.assertNotIn("future-issue", xml)


if __name__ == "__main__":
    unittest.main()
