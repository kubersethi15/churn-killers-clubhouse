#!/usr/bin/env python3
"""Create crawlable production entrypoints for public non-article routes."""

from __future__ import annotations

import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from editorial_issue import SLUG_RE
from newsletter_catalog import load_newsletter_catalog


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
        "A problem-led starting point for Customer Success leaders who want practical operating models instead of vague advice.",
        "New here? Start here.",
        "Choose the operating problem on your desk, follow a focused reading path, and run one practical tool.",
    ),
    "subscribe": (
        "Subscribe to Churn Is Dead | Customer Success Newsletter",
        "Get one evidence-led Customer Success operating system and practical playbook every Tuesday. Free, direct, and built for decisions—not theatre.",
        "Customer Success advice should survive contact with a renewal.",
        "Every Tuesday, Churn Is Dead turns one difficult CS problem into a clear argument, an operating model, and a practical playbook.",
    ),
    "topics": (
        "Customer Success Topics | Churn Is Dead",
        "Explore practical operating systems for renewal economics, CS measurement, health-score alternatives, AI role design, and cross-functional operations.",
        "Start with the decision on your desk.",
        "Five durable Customer Success problems, each with a focused reading path and one tool to run.",
    ),
    "topics/renewal-economics": (
        "Renewal Economics | Churn Is Dead",
        "Separate the work Customer Success can influence from the pricing, product, contract, and commercial mechanics it does not control.",
        "Renewal economics",
        "Map the customer decision, the evidence, the contributing causes, and the cross-functional owners.",
    ),
    "topics/measurement-decisions": (
        "Measurement That Changes a Decision | Churn Is Dead",
        "Replace decorative Customer Success dashboards with signals that tell the team when to intervene and what to do next.",
        "Measurement that changes a decision",
        "Define the decision first, then choose the evidence and intervention signal.",
    ),
    "topics/ai-role-design": (
        "AI and Defensible CS Work | Churn Is Dead",
        "Redesign Customer Success work around accountable judgment, evidence, and decisions instead of protecting every current task.",
        "AI and defensible CS work",
        "Decide where AI supports preparation and where accountable human judgment still belongs.",
    ),
    "topics/operating-systems": (
        "Customer Success Operating Systems | Churn Is Dead",
        "Turn recurring cross-functional friction into explicit inputs, decisions, owners, and customer communication.",
        "Customer Success operating systems",
        "Replace escalation ambiguity with a repeatable operating mechanism.",
    ),
    "topics/health-score-alternatives": (
        "Customer Health Score Alternatives | Churn Is Dead",
        "Replace red, amber, and green account health scores with observed movement, outcome evidence, and explicit intervention signals.",
        "Customer health score alternatives",
        "Use customer movement and outcome evidence to decide when and how to intervene.",
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


def published_archive_items(catalog: dict[str, dict], now: datetime | None = None) -> list[dict[str, str]]:
    """Return publication-safe archive links, newest first."""
    current_time = now or datetime.now(timezone.utc)
    items: list[dict[str, str]] = []
    for newsletter in catalog.values():
        slug = str(newsletter.get("slug") or "")
        title = str(newsletter.get("title") or "").strip()
        published_date = str(newsletter.get("published_date") or "")
        if not title or not SLUG_RE.fullmatch(slug):
            continue
        try:
            published_at = datetime.fromisoformat(published_date.replace("Z", "+00:00"))
        except ValueError:
            continue
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)
        if published_at > current_time:
            continue
        items.append({"slug": slug, "title": title, "published_date": published_at.isoformat()})
    return sorted(items, key=lambda item: item["published_date"], reverse=True)


def archive_markup(items: list[dict[str, str]]) -> str:
    links = "".join(
        f'<li><a href="/newsletter/{html.escape(item["slug"], quote=True)}">{html.escape(item["title"])}</a></li>'
        for item in items
    )
    return f'''<section aria-labelledby="published-issues" style="margin-top:40px">
      <h2 id="published-issues" style="font-family:Georgia,serif;font-size:28px">Published issues</h2>
      <ol style="padding-left:22px;line-height:1.8">{links}</ol>
    </section>'''


def replace_meta(source: str, selector: str, value: str) -> str:
    escaped = html.escape(value, quote=True)
    pattern = rf'(<meta\s+{selector}\s+content=")[^"]*("\s*/?>)'
    updated, count = re.subn(pattern, rf"\g<1>{escaped}\g<2>", source, count=1, flags=re.IGNORECASE)
    if count == 0:
        raise RuntimeError(f"Missing meta tag: {selector}")
    return updated


def render(
    route: str,
    title: str,
    description: str,
    heading: str,
    intro: str,
    template: str,
    archive_items: list[dict[str, str]] | None = None,
) -> str:
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
    if archive_items:
        structured["@type"] = "CollectionPage"
        structured["mainEntity"] = {
            "@type": "ItemList",
            "numberOfItems": len(archive_items),
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": position,
                    "url": f'{ORIGIN}/newsletter/{item["slug"]}',
                    "name": item["title"],
                }
                for position, item in enumerate(archive_items, start=1)
            ],
        }
    source = source.replace("</head>", f'<script type="application/ld+json">{json.dumps(structured)}</script>\n  </head>', 1)
    issue_archive = archive_markup(archive_items) if archive_items else ""
    static_content = f'''<main id="static-route" style="max-width:760px;margin:0 auto;padding:96px 24px;font-family:Inter,Arial,sans-serif;color:#17233a">
      <p style="color:#dc2626;font-weight:700;text-transform:uppercase;letter-spacing:.12em;font-size:12px">Churn Is Dead</p>
      <h1 style="font-family:Georgia,serif;font-size:44px;line-height:1.1;margin:18px 0">{html.escape(heading)}</h1>
      <p style="font-size:19px;line-height:1.65;color:#4b5563">{html.escape(intro)}</p>
      <nav aria-label="Explore Churn Is Dead" style="margin-top:32px;display:flex;gap:20px;flex-wrap:wrap">
        <a href="/start">Start here</a><a href="/newsletters">All issues</a><a href="/playbook">Playbooks</a><a href="/cs-analyzer/demo">CS Analyzer example</a>
      </nav>
      {issue_archive}
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
    archive_items = published_archive_items(load_newsletter_catalog())
    for route, values in ROUTES.items():
        target = DIST / route / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        rendered = render(route, *values, template, archive_items=archive_items if route == "newsletters" else None)
        expected = f'{ORIGIN}/{route}'
        if f'<link rel="canonical" href="{expected}"' not in rendered:
            raise RuntimeError(f"Canonical validation failed for {route}")
        target.write_text(rendered, encoding="utf-8")
    print(f"Created crawlable production entrypoints for {len(ROUTES)} public routes; archive links {len(archive_items)} published issues")


if __name__ == "__main__":
    main()
