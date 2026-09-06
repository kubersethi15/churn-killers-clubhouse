#!/usr/bin/env python3

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import prepare_distribution as preparation


class PrepareDistributionTests(unittest.TestCase):
    def test_packaging_removes_stale_first_comment_when_source_is_absent(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            issue_dir = root / "editorial" / "issues" / "example-issue"
            private_output = root / "distribution"
            public_output = root / "public" / "distribution"
            issue_dir.mkdir(parents=True)

            for output in (private_output, public_output):
                stale = output / "example-issue" / "linkedin_first_comment.md"
                stale.parent.mkdir(parents=True)
                stale.write_text("Old link that must not survive.", encoding="utf-8")

            original_private = preparation.PRIVATE_OUTPUT
            original_public = preparation.PUBLIC_OUTPUT
            original_loader = preparation.load_issue
            original_validator = preparation.validate_issue
            preparation.PRIVATE_OUTPUT = private_output
            preparation.PUBLIC_OUTPUT = public_output
            preparation.load_issue = lambda _: type("Issue", (), {
                "metadata": {"slug": "example-issue", "title": "Example issue"},
                "linkedin": "A sufficiently long approved LinkedIn post without a first comment.",
            })()
            preparation.validate_issue = lambda *_args, **_kwargs: type("Validation", (), {
                "ok": True,
                "errors": [],
            })()
            try:
                preparation.package(issue_dir)
            finally:
                preparation.PRIVATE_OUTPUT = original_private
                preparation.PUBLIC_OUTPUT = original_public
                preparation.load_issue = original_loader
                preparation.validate_issue = original_validator

            self.assertFalse((private_output / "example-issue" / "linkedin_first_comment.md").exists())
            self.assertFalse((public_output / "example-issue" / "linkedin_first_comment.md").exists())


if __name__ == "__main__":
    unittest.main()
