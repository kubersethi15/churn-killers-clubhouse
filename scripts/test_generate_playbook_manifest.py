#!/usr/bin/env python3
"""Focused safety tests for the generated Playbook Vault route manifest."""

from __future__ import annotations

import unittest
from datetime import datetime, timezone

import generate_playbook_manifest as generator


class PlaybookManifestSafetyTest(unittest.TestCase):
    def test_description_does_not_repeat_the_article(self) -> None:
        self.assertEqual(
            generator.download_description("The Silence Ledger Audit"),
            "Download The Silence Ledger Audit worksheet from the Churn Is Dead archive.",
        )
        self.assertEqual(
            generator.download_description("Revenue Readiness Audit"),
            "Download the Revenue Readiness Audit worksheet from the Churn Is Dead archive.",
        )

    def test_refuses_empty_or_truncated_live_catalog(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "refusing to rewrite"):
            generator.build_rows({}, datetime.now(timezone.utc))

    def test_legacy_index_uses_exact_pdf_links_only(self) -> None:
        catalog = {
            "exact": {
                "title": "Exact source",
                "published_date": "2026-01-01T00:00:00Z",
                "content": "Download /pdfs/Exact_Audit_ChurnIsDead.pdf",
            },
            "guess": {
                "title": "Looks similar",
                "published_date": "2026-01-02T00:00:00Z",
                "content": "An Exact Audit is discussed, but no file is linked.",
            },
        }
        index = generator.legacy_slug_index(catalog)
        self.assertEqual(index["Exact_Audit_ChurnIsDead.pdf"][0], "exact")
        self.assertEqual(len(index), 1)

    def test_rejects_destructive_mapping_drop(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "31 to 10"):
            generator.ensure_safe_coverage(previous=31, mapped=10)
        generator.ensure_safe_coverage(previous=31, mapped=26)
        generator.ensure_safe_coverage(previous=31, mapped=10, allow_drop=True)


if __name__ == "__main__":
    unittest.main()
