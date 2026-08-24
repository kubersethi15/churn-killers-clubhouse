#!/usr/bin/env python3

from __future__ import annotations

import copy
import unittest
from dataclasses import replace
from pathlib import Path

from editorial_issue import load_issue, validate_issue


REPO_ROOT = Path(__file__).resolve().parent.parent
ISSUE_DIR = REPO_ROOT / "editorial" / "issues" / "renewal-evidence-packet"


class EditorialApprovalProvenanceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.issue = load_issue(ISSUE_DIR)

    def test_current_autonomous_approval_records_provenance(self) -> None:
        result = validate_issue(self.issue, require_approved=True)

        self.assertNotIn(
            "approved issue must record human_reviewed as true or false",
            result.errors,
        )
        self.assertNotIn(
            "standing-mandate approval must not be attributed to Kuber as human reviewer",
            result.errors,
        )

    def test_approved_issue_requires_human_reviewed_boolean(self) -> None:
        approval = copy.deepcopy(self.issue.approval)
        approval.pop("human_reviewed")

        result = validate_issue(replace(self.issue, approval=approval), require_approved=True)

        self.assertIn(
            "approved issue must record human_reviewed as true or false",
            result.errors,
        )

    def test_autonomous_approval_cannot_name_kuber_as_reviewer(self) -> None:
        approval = copy.deepcopy(self.issue.approval)
        approval["human_reviewed"] = False
        approval["approved_by"] = "Kuber Sethi"

        result = validate_issue(replace(self.issue, approval=approval), require_approved=True)

        self.assertIn(
            "standing-mandate approval must not be attributed to Kuber as human reviewer",
            result.errors,
        )


if __name__ == "__main__":
    unittest.main()
