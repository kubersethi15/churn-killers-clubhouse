"""A recovery date needs explicit approval; missing/stale exceptions stay closed."""
import copy
from dataclasses import replace
from pathlib import Path
import unittest

from editorial_issue import load_issue, validate_issue


class PublicationExceptionTests(unittest.TestCase):
    def setUp(self):
        self.issue = load_issue(Path(__file__).resolve().parent.parent / "editorial/issues/renewal-evidence-packet")
        self.meta = copy.deepcopy(self.issue.metadata)
        self.meta["published_date"] = "2026-11-04T04:00:00Z"
        self.approval = copy.deepcopy(self.issue.approval)
        self.approval["publication_date_exception"] = {
            "date": "2026-11-04", "authorised_by": "Kuber Sethi",
            "basis": "Explicit request to complete the missed release today.",
        }

    def has_date_error(self, approval):
        result = validate_issue(replace(self.issue, metadata=self.meta, approval=approval), require_approved=True)
        return any("publication exception" in error for error in result.errors)

    def test_named_exact_date_exception_passes(self):
        self.assertFalse(self.has_date_error(self.approval))

    def test_missing_exception_fails(self):
        self.approval.pop("publication_date_exception")
        self.assertTrue(self.has_date_error(self.approval))

    def test_stale_date_fails(self):
        self.approval["publication_date_exception"]["date"] = "2026-10-28"
        self.assertTrue(self.has_date_error(self.approval))

    def test_pending_approval_fails(self):
        self.approval["status"] = "pending"
        self.assertTrue(self.has_date_error(self.approval))

    def test_unnamed_exception_fails(self):
        self.approval["publication_date_exception"].pop("authorised_by")
        self.assertTrue(self.has_date_error(self.approval))

    def test_tuesday_keeps_normal_rule(self):
        self.assertFalse(any("publication exception" in error for error in validate_issue(self.issue, require_approved=True).errors))


if __name__ == "__main__":
    unittest.main()
