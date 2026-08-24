#!/usr/bin/env python3

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from check_syndication_readiness import validate_row


class SyndicationReadinessTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        issue = self.root / "editorial" / "issues" / "example"
        issue.mkdir(parents=True)
        (issue / "metadata.json").write_text(
            json.dumps(
                {
                    "slug": "example",
                    "published_date": "2026-08-01T08:00:00+00:00",
                }
            ),
            encoding="utf-8",
        )
        (issue / "distribution-approval.json").write_text(
            json.dumps({"medium": {"status": "hold_until_canonical_is_live"}}),
            encoding="utf-8",
        )
        self.row = {
            "syndication_id": "MED-TEST",
            "platform": "medium",
            "source_slug": "example",
            "canonical_published_at": "2026-08-01T08:00:00Z",
            "canonical_eligible_at": "2026-08-15T08:00:00Z",
            "experiment_eligible_at": "2026-08-20T08:00:00Z",
            "planned_publish_at": "2026-08-20T08:00:00Z",
            "mode": "import",
            "status": "prepared",
            "canonical_url": "https://churnisdead.com/newsletter/example",
            "campaign_url": "https://churnisdead.com/newsletter/example?utm_source=medium&utm_medium=syndication&utm_campaign=example_campaign&utm_content=canonical_footer",
            "campaign_label": "example_campaign",
            "approval_file": "editorial/issues/example/distribution-approval.json",
            "stop_rule": "stop",
        }

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_valid_prepared_row(self) -> None:
        self.assertEqual(validate_row(self.row, self.root), [])

    def test_rejects_short_canonical_age(self) -> None:
        self.row["canonical_eligible_at"] = "2026-08-14T08:00:00Z"
        self.assertIn("canonical-age gate is less than 14 days", " ".join(validate_row(self.row, self.root)))

    def test_rejects_planned_date_before_experiment_gate(self) -> None:
        self.row["experiment_eligible_at"] = "2026-08-21T08:00:00Z"
        self.assertIn("planned publication precedes experiment gate", " ".join(validate_row(self.row, self.root)))

    def test_rejects_wrong_or_extra_utm_fields(self) -> None:
        self.row["campaign_url"] += "&utm_term=extra"
        self.assertIn("incorrect or extra UTM fields", " ".join(validate_row(self.row, self.root)))

    def test_rejects_unknown_issue(self) -> None:
        self.row["source_slug"] = "missing"
        self.assertIn("issue metadata does not exist", " ".join(validate_row(self.row, self.root)))

    def test_published_row_requires_approval(self) -> None:
        self.row["status"] = "published"
        self.assertIn("published status requires platform approval", " ".join(validate_row(self.row, self.root)))

    def test_hold_row_needs_no_source(self) -> None:
        row = {"syndication_id": "DEV-TEST", "mode": "hold", "status": "held"}
        self.assertEqual(validate_row(row, self.root), [])


if __name__ == "__main__":
    unittest.main()

