#!/usr/bin/env python3
"""Focused contract tests for future newsletter route identity."""

import unittest

from check_public_routes import is_held_newsletter
from prerender_newsletters import build_held_page


BASE_HTML = """<!doctype html>
<html>
<head>
  <title>Homepage title</title>
  <meta name="description" content="Homepage description">
  <link rel="canonical" href="https://churnisdead.com/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://churnisdead.com/">
  <meta property="og:title" content="Homepage title">
  <meta property="og:description" content="Homepage description">
  <meta name="twitter:title" content="Homepage title">
  <meta name="twitter:description" content="Homepage description">
</head>
<body><div id="root"></div></body>
</html>"""


class HeldNewsletterPageTests(unittest.TestCase):
    def setUp(self):
        self.page = build_held_page(BASE_HTML)

    def test_future_route_does_not_impersonate_an_article(self):
        self.assertIn("<title>Issue unavailable | Churn Is Dead</title>", self.page)
        self.assertIn('content="noindex, nofollow"', self.page)
        self.assertIn('href="https://churnisdead.com/newsletters"', self.page)
        self.assertNotIn('property="article:published_time"', self.page)
        self.assertNotIn('"@type": "Article"', self.page)
        self.assertNotIn('id="ci-newsletter"', self.page)

    def test_future_route_has_a_human_no_script_fallback(self):
        self.assertIn("This issue is not available yet.", self.page)
        self.assertIn("Browse all issues", self.page)

    def test_public_route_verifier_recognises_the_hold_shell(self):
        self.assertTrue(is_held_newsletter(self.page))
        self.assertFalse(is_held_newsletter(BASE_HTML))


if __name__ == "__main__":
    unittest.main()
