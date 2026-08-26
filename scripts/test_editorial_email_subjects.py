#!/usr/bin/env python3

from __future__ import annotations

import copy
import unittest
from dataclasses import replace
from pathlib import Path

from editorial_issue import load_issue, validate_issue


REPO_ROOT = Path(__file__).resolve().parent.parent
ISSUE_DIR = REPO_ROOT / "editorial" / "issues" / "renewal-evidence-packet"


class EditorialEmailSubjectTests(unittest.TestCase):
    def setUp(self) -> None:
        self.issue = load_issue(ISSUE_DIR)

    def test_approved_issue_uses_one_subject_with_a_preheader(self) -> None:
        result = validate_issue(self.issue, require_approved=True)

        self.assertNotIn(
            "approved issues must select exactly one email subject for the current small list",
            result.errors,
        )
        self.assertFalse(any("subject variant" in error for error in result.errors))

    def test_approved_issue_rejects_an_underpowered_subject_split(self) -> None:
        metadata = copy.deepcopy(self.issue.metadata)
        metadata["subject_variants"].append({
            "label": "second",
            "subject": "A second subject",
            "preheader": "A second preheader.",
        })

        result = validate_issue(replace(self.issue, metadata=metadata), require_approved=True)

        self.assertIn(
            "approved issues must select exactly one email subject for the current small list",
            result.errors,
        )

    def test_subject_requires_a_controlled_preheader(self) -> None:
        metadata = copy.deepcopy(self.issue.metadata)
        metadata["subject_variants"][0].pop("preheader")

        result = validate_issue(replace(self.issue, metadata=metadata), require_approved=True)

        self.assertIn("subject variant 1 is missing 'preheader'", result.errors)


if __name__ == "__main__":
    unittest.main()
