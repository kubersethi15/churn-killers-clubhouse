from __future__ import annotations

import unittest
from datetime import datetime, timezone

from prerender_public_routes import archive_markup, published_archive_items


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


if __name__ == "__main__":
    unittest.main()
