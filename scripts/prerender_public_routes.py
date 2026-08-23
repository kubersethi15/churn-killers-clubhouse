#!/usr/bin/env python3
"""Create crawlable production entrypoints for public non-article routes."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
ORIGIN = "https://churnisdead.com"

ROUTES = {
    "newsletters": (
        "All Issues | Churn Is Dead Newsletter Archive",
        "Search every Churn Is Dead issue by topic: renewals, risk, QBRs, AI, expansion, and enterprise Customer Success strategy.",
        "All Churn Is Dead issues",
        "Search 40+ evidence-led Customer Success frameworks by the operating problem on your desk.",
    ),
    "playbook": (
        "Playbook Vault | Churn Is Dead",
        "Free Customer Success playbooks, audits, and diagnostics for renewal risk, executive value, AI readiness, QBRs, and expansion.",
        "Customer Success Playbook Vault",
        "Pick the operating problem. Leave with a practical tool you can run this week.",
    ),
    "start": (
        "Start Here | Churn Is Dead",
        "Three essential Churn Is Dead issues for Customer Success leaders who want practical operating models instead of vague advice.",
        "New here? Start here.",
        "Read the three essential issues, then explore the newsletter, playbooks, and diagnostics.",
    ),
    "about": (
        "About Kuber Sethi | Churn Is Dead",
        "Why Churn Is Dead exists, who it serves, and the editorial operating system behind each weekly Customer Success issue.",
        "About Churn Is Dead",
        "Evidence-led operating systems for enterprise Customer Success, edited by Kuber Sethi.",
    ),
    "editorial-standards": (
        "Editorial Standards | Churn Is Dead",
        "How Churn Is Dead researches, reviews, publishes, labels AI support, and corrects its Customer Success newsletter.",
        "Editorial standards",
        "The evidence, human review, attribution, and corrections rules behind every issue.",
    ),
    "ai-exposure-score": (
        "AI Exposure Score | Churn Is Dead",
        "An eight-question directional diagnostic for Customer Success professionals to examine which parts of their work are easier to automate.",
        "AI Exposure Score",
        "Eight questions. About two minutes. A directional prompt for redesigning your CS work—not a scientific or employment forecast.",
    ),
    "cs-analyzer/demo": (
        "Example Report | CS Analyzer | Churn Is Dead",
        "Inspect an illustrative CS Analyzer report before submitting a redacted customer-call transcript of your own.",
        "See what the CS Analyzer produces",
        "Inspect an illustrative five-pass call analysis with evidence anchors and clear next actions.",
    ),
    "privacy": (
        "Privacy | Churn Is Dead",
        "How Churn Is Dead collects, uses, stores, and shares information across the newsletter and CS Analyzer.",
        "Privacy",
        "A plain-language explanation of the information Churn Is Dead collects and how you can control it.",
    ),
    "terms": (
        "Terms of Use | Churn Is Dead",
        "Terms for using the Churn Is Dead website, newsletter, playbooks, diagnostics, and CS Analyzer.",
        "Terms of use",
        "The responsibilities and limitations that apply when using Churn Is Dead content and tools.",
    ),
    "analyzer-data-handling": (
        "Analyzer Data Handling | Churn Is Dead",
        "How CS Analyzer transcripts are processed, stored, and shared with external AI providers.",
        "Analyzer data handling",
        "Redact sensitive details and understand the processing path before you upload a customer-call transcript.",
    ),
}


def replace_meta(source: str, selector: str, value: str) -> str:
    escaped = html.escape(value, quote=True)
    pattern = rf'(<meta\s+{selector}\s+content=")[^"]*("\s*/?>)'
    updated, count = re.subn(pattern, rf"\g<1>{escaped}\g<2>", source, count=1, flags=re.IGNORECASE)
    if count == 0:
        raise RuntimeError(f"Missing meta tag: {selector}")
    return updated


def render(route: str, title: str, description: str, heading: str, intro: str, template: str) -> str:
    url = f"{ORIGIN}/{route}"
    source = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title)}</title>", template, count=1, flags=re.DOTALL)
    source = re.sub(r'(<link\s+rel="canonical"\s+href=")[^"]*("\s*/?>)', rf"\g<1>{url}\g<2>", source, count=1)
    for selector, value in (
        ('name="description"', description),
        ('property="og:title"', title),
        ('property="og:description"', description),
        ('property="og:url"', url),
        ('name="twitter:title"', title),
        ('name="twitter:description"', description),
    ):
        source = replace_meta(source, selector, value)

    structured = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": url,
        "isPartOf": {"@type": "WebSite", "name": "Churn Is Dead", "url": ORIGIN},
    }
    source = source.replace("</head>", f'<script type="application/ld+json">{json.dumps(structured)}</script>\n  </head>', 1)
    static_content = f'''<main id="static-route" style="max-width:760px;margin:0 auto;padding:96px 24px;font-family:Inter,Arial,sans-serif;color:#17233a">
      <p style="color:#dc2626;font-weight:700;text-transform:uppercase;letter-spacing:.12em;font-size:12px">Churn Is Dead</p>
      <h1 style="font-family:Georgia,serif;font-size:44px;line-height:1.1;margin:18px 0">{html.escape(heading)}</h1>
      <p style="font-size:19px;line-height:1.65;color:#4b5563">{html.escape(intro)}</p>
      <nav aria-label="Explore Churn Is Dead" style="margin-top:32px;display:flex;gap:20px;flex-wrap:wrap">
        <a href="/start">Start here</a><a href="/newsletters">All issues</a><a href="/playbook">Playbooks</a><a href="/cs-analyzer/demo">CS Analyzer example</a>
      </nav>
    </main>'''
    # Keep the client mount empty to avoid layout shift when React starts. The
    # semantic fallback remains available when JavaScript is unavailable.
    source = source.replace('<div id="root"></div>', f'<div id="root"></div><noscript>{static_content}</noscript>', 1)
    return source


def main() -> None:
    index = DIST / "index.html"
    if not index.exists():
        raise SystemExit("dist/index.html does not exist; run Vite first")
    template = index.read_text(encoding="utf-8")
    for route, values in ROUTES.items():
        target = DIST / route / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        rendered = render(route, *values, template)
        expected = f'{ORIGIN}/{route}'
        if f'<link rel="canonical" href="{expected}"' not in rendered:
            raise RuntimeError(f"Canonical validation failed for {route}")
        target.write_text(rendered, encoding="utf-8")
    print(f"Created crawlable production entrypoints for {len(ROUTES)} public routes")


if __name__ == "__main__":
    main()
