"""Prevent publication from turning the short customer-work tool into a long guide."""

import tempfile
import unittest
from dataclasses import replace
from pathlib import Path

from pypdf import PdfReader
from editorial_issue import load_issue, validate_issue
from generate_newsletter import build_playbook_pdf

ROOT = Path(__file__).resolve().parents[1]


class CompactPlaybookTests(unittest.TestCase):
    def test_new_issue_is_valid_but_cannot_publish_without_approval(self):
        issue = load_issue(ROOT / "editorial/issues/customer-work-ai-roi")
        issue = replace(issue, approval={"status": "pending"})
        self.assertTrue(validate_issue(issue).ok)
        self.assertFalse(validate_issue(issue, require_approved=True).ok)

    def test_publisher_entrypoint_builds_one_readable_page_with_prompt(self):
        issue = load_issue(ROOT / "editorial/issues/customer-work-ai-roi")
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "check.pdf"
            build_playbook_pdf(issue.playbook, issue.metadata, path)
            pages = PdfReader(path).pages
            self.assertEqual(len(pages), 1)
            self.assertIn("Invented minutes", pages[0].extract_text())
            self.assertIn("Copy this prompt", pages[0].extract_text())
            self.assertIn("Do not invent missing facts", " ".join(pages[0].extract_text().split()))

    def test_legacy_playbook_is_unchanged(self):
        issue = load_issue(ROOT / "editorial/issues/health-score-is-not-an-intervention-trigger")
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "legacy.pdf"
            build_playbook_pdf(issue.playbook, issue.metadata, path)
            pages = PdfReader(path).pages
            self.assertEqual(len(pages), 6)
            self.assertIn("Intervention Trigger", pages[0].extract_text())


if __name__ == "__main__":
    unittest.main()
