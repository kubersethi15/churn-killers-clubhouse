#!/usr/bin/env python3

from __future__ import annotations

import tempfile
import unittest
from datetime import datetime
from pathlib import Path

import export_linkedin_schedule as exporter


class LinkedInScheduleExporterTests(unittest.TestCase):
    def test_current_distribution_header_is_parsed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "linkedin_posts.md"
            source.write_text(
                "POST 1 - TUESDAY\n" + "=" * 60 + "\nA sufficiently long manager-ready post.\n" + "=" * 60 + "\n",
                encoding="utf-8",
            )

            posts = exporter.parse_linkedin_posts(source)

        self.assertEqual(posts, [{
            "day": "Tuesday",
            "content": "A sufficiently long manager-ready post.",
            "strategy": "Newsletter launch",
        }])

    def test_tuesday_launch_follows_canonical_publication(self) -> None:
        publication = datetime.fromisoformat("2026-08-25T18:00:00+10:00")

        scheduled = exporter.scheduled_time("Tuesday", publication)

        self.assertEqual(scheduled.isoformat(), "2026-08-25T18:15:00+10:00")

    def test_sydney_daylight_saving_offset_is_not_hard_coded(self) -> None:
        publication = datetime.fromisoformat("2026-12-01T18:00:00+11:00")

        scheduled = exporter.scheduled_time("Wednesday", publication)

        self.assertEqual(scheduled.isoformat(), "2026-12-02T17:30:00+11:00")

    def test_manager_rows_remain_drafts(self) -> None:
        publication = datetime.fromisoformat("2026-08-25T18:00:00+10:00")

        rows = exporter.manager_rows(
            [{"day": "Tuesday", "content": "Draft post", "strategy": "Newsletter launch"}],
            "example-issue",
            publication,
            "Tracked first comment",
        )

        self.assertEqual(rows[0]["Status"], "Draft - approval required")
        self.assertEqual(rows[0]["Time"], "18:15")
        self.assertEqual(rows[0]["Timezone"], "Australia/Sydney")
        self.assertEqual(rows[0]["First Comment"], "Tracked first comment")


if __name__ == "__main__":
    unittest.main()
