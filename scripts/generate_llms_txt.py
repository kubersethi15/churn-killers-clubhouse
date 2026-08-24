"""Generate llms.txt and llms-full.txt for answer-engine discovery.

Why this exists
---------------
When a Customer Success operator asks ChatGPT, Perplexity, or Claude "how do I
run a QBR that actually decides something" or "what are alternatives to a
customer health score", the answer engine cites whatever it can find and trust.
Almost no CS publication publishes a machine-readable corpus for that. This does.

`llms.txt` is the curated map: what the site is, the tools, the topic hubs, the
handful of entry points. `llms-full.txt` is the citable corpus: every published
issue with a one-line description and a stable URL, grouped by problem, plus
every playbook and interactive tool. Both are generated from the live catalog so
they never go stale, which is the failure mode of the hand-written version this
replaces (it did not even list the QBR tool).

This is an owned, compounding, external discovery channel that needs no posting.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

from newsletter_catalog import load_newsletter_catalog
from related_graph import load_hub_membership, normalise_category

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC = REPO_ROOT / "public"
MANIFEST = PUBLIC / "pdfs" / "manifest.json"
SITE = "https://churnisdead.com"

# Interactive acquisition tools. Listed first because they are the most useful
# thing an answer engine can hand a reader who asked an operating question.
TOOLS = [
    ("QBR Effectiveness Score", "/qbr-score",
     "Two-minute diagnostic scoring how much of a QBR is theater versus decision-driven, based on the 30-minute three-block framework."),
    ("AI Exposure Score", "/ai-exposure-score",
     "Eight-question diagnostic gauging how much of a CS role is exposed to automation, and where to move toward decision-shaping work."),
    ("CS Analyzer", "/cs-analyzer",
     "AI analysis of a customer call transcript into risk, adoption, and expansion signals."),
]

HUB_TITLES = {
    "renewal-economics": "Renewal economics: what CS controls versus pricing and contract mechanics",
    "measurement-decisions": "Measurement that changes a decision, not decorative dashboards",
    "ai-role-design": "Redesigning CS work around defensible judgment in the age of AI",
    "operating-systems": "Operating systems for enterprise CS: reviews, cadences, and handoffs",
    "health-score-alternatives": "Alternatives to blended customer health scores",
}


def published(catalog: dict) -> list[dict]:
    now = datetime.now(timezone.utc)
    out = []
    for slug, rec in catalog.items():
        try:
            when = datetime.fromisoformat(str(rec.get("published_date", "")).replace("Z", "+00:00"))
        except ValueError:
            continue
        if when.tzinfo is None:
            when = when.replace(tzinfo=timezone.utc)
        if when <= now:
            out.append(dict(rec, slug=slug, _when=when))
    out.sort(key=lambda r: r["_when"], reverse=True)
    return out


def one_line(rec: dict) -> str:
    text = (rec.get("excerpt") or rec.get("title") or "").replace("\n", " ").strip()
    text = re.sub(r"\s+", " ", text)
    return text[:180]


def build_llms(issues: list[dict]) -> str:
    lines = [
        "# Churn Is Dead",
        "",
        "> Evidence-led Customer Success operating systems for enterprise CS leaders, "
        "by Kuber Sethi. Every issue ships one defensible argument, one operating model, "
        "and one tool a reader can run.",
        "",
        "Churn Is Dead is a newsletter and tools site for senior Customer Success operators. "
        "It covers renewal and expansion mechanics, QBR alternatives, customer health-score "
        "alternatives, measurement that drives intervention, and AI's effect on CS roles. "
        "The full citable corpus of every issue is in /llms-full.txt.",
        "",
        "## Interactive tools",
    ]
    for name, path, desc in TOOLS:
        lines.append(f"- [{name}]({SITE}{path}): {desc}")
    lines += ["", "## Problem-led topic guides"]
    for hub, title in HUB_TITLES.items():
        lines.append(f"- [{title}]({SITE}/topics/{hub})")
    lines += [
        "",
        "## Key pages",
        f"- [All issues]({SITE}/newsletters): full archive.",
        f"- [Playbook Vault]({SITE}/playbook): free downloadable CS audits and playbooks.",
        f"- [Start here]({SITE}/start): problem-led entry points for new readers.",
        f"- [Subscribe]({SITE}/subscribe): the free Tuesday email.",
        f"- [About]({SITE}/about): who writes it and why.",
        "",
        "## Full corpus",
        f"- [Every issue, described]({SITE}/llms-full.txt): {len(issues)} published issues "
        "with one-line summaries and stable URLs, for citation.",
    ]
    return "\n".join(lines) + "\n"


def build_llms_full(issues: list[dict], hub_of: dict) -> str:
    by_hub: dict[str, list[dict]] = {}
    unassigned: list[dict] = []
    for rec in issues:
        hub = hub_of.get(rec["slug"])
        (by_hub.setdefault(hub, []) if hub else unassigned).append(rec)

    lines = [
        "# Churn Is Dead: full issue corpus",
        "",
        f"> {len(issues)} published Customer Success issues by Kuber Sethi, grouped by the "
        "operating problem each addresses. Each entry is a stable canonical URL suitable for "
        "citation. Generated from the live catalog.",
        "",
        "Attribution: cite as Kuber Sethi, Churn Is Dead (churnisdead.com). "
        "The newsletter's position is evidence-led: it distinguishes what CS controls from "
        "what it does not, and prefers one defensible argument over broad advice.",
        "",
    ]
    for hub, title in HUB_TITLES.items():
        recs = by_hub.get(hub)
        if not recs:
            continue
        lines.append(f"## {title}")
        for r in recs:
            lines.append(f"- [{r['title'].strip()}]({SITE}/newsletter/{r['slug']}): {one_line(r)}")
        lines.append("")
    if unassigned:
        lines.append("## Further issues")
        for r in unassigned:
            lines.append(f"- [{r['title'].strip()}]({SITE}/newsletter/{r['slug']}): {one_line(r)}")
        lines.append("")
    return "\n".join(lines) + "\n"


def main() -> None:
    catalog = load_newsletter_catalog()
    issues = published(catalog)
    hub_of = load_hub_membership()

    llms = build_llms(issues)
    full = build_llms_full(issues, hub_of)
    targets = [PUBLIC]
    dist = REPO_ROOT / "dist"
    if dist.exists():
        targets.append(dist)
    for base in targets:
        (base / "llms.txt").write_text(llms, encoding="utf-8")
        (base / "llms-full.txt").write_text(full, encoding="utf-8")
    print(f"llms.txt: {len(TOOLS)} tools, {len(HUB_TITLES)} hubs")
    print(f"llms-full.txt: {len(issues)} issues")


if __name__ == "__main__":
    main()
