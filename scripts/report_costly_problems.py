"""Aggregate costly-problem ledger (CG-09).

Implements the smallest ledger the monetization evidence plan allows. It counts
independent aggregate signals per problem so Gate 1, "one problem repeats
across at least two independent signals", can be judged from evidence instead of
from a hunch about which post did well.

What it deliberately does not do
--------------------------------
No identity, no reply text, no email, no viewer or engager data. Nothing here
can answer "who". It answers "which problem, how often, from how many
independent directions".

It also makes no offer recommendation. Gate 0 requires a complete seven-day
Tuesday baseline, and until CID-001 closes the correct output is a count and a
blocked status.

Problem taxonomy is the five existing topic hubs. Inventing a second taxonomy
would make the ledger disagree with the site.

Usage:
  SUPABASE_SERVICE_KEY=... python3 scripts/report_costly_problems.py
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from related_graph import load_hub_membership  # noqa: E402

REPO_ROOT = Path(__file__).parent.parent
MANIFEST = REPO_ROOT / "public" / "pdfs" / "manifest.json"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xtwxemlxzbnadkkrvozr.supabase.co")
KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

# Gate 1: a problem advances only on two independent signal classes.
GATE_1_SIGNAL_CLASSES = 2
# Within a class, this many events before the class counts as present at all.
MIN_EVENTS_PER_CLASS = 3


def fetch(path: str) -> list[dict]:
    if not KEY:
        raise SystemExit("Set SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY.")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            raise SystemExit(
                f"{path.split('?')[0]} is not readable with this key. "
                "Run with SUPABASE_SERVICE_KEY."
            ) from None
        raise SystemExit(f"Supabase returned HTTP {exc.code}") from None


def main() -> int:
    hub_of_issue = load_hub_membership()
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else []
    hub_of_pdf = {
        e["pdf_path"]: hub_of_issue.get(e.get("newsletter_slug") or "")
        for e in manifest
    }

    events = fetch(
        "growth_events?select=event_name,page_path,content_slug,resource_id,created_at"
        "&order=created_at.desc&limit=5000"
    )

    # signal class -> problem -> count. Classes must be independent of each other.
    signals: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for row in events:
        name = (row.get("event_name") or "").lower()
        slug = row.get("content_slug") or ""
        path = row.get("page_path") or ""
        hub = hub_of_issue.get(slug)
        if not hub:
            for issue_slug, h in hub_of_issue.items():
                if issue_slug and issue_slug in path:
                    hub = h
                    break
        if name == "resource_open":
            rid = str(row.get("resource_id") or "")
            hub = hub or hub_of_pdf.get(rid) or hub_of_pdf.get(f"/pdfs/{rid}")
            if hub:
                signals["vault_open"][hub] += 1
        elif hub:
            signals["site_visit"][hub] += 1

    hubs = sorted({h for h in hub_of_issue.values() if h})

    print("Costly-problem ledger")
    print("=" * 62)
    print()
    print("GATE 0: measurement trustworthy    NOT MET")
    print("  The seven-day Tuesday baseline (CID-001) closes 1 September 2026.")
    print("  No commercial research request may be raised before then.")
    print()
    print(f"{'problem (topic hub)':32} {'site':>6} {'vault':>6} {'classes':>8}")
    print("-" * 62)
    advanced = []
    for hub in hubs:
        site = signals["site_visit"].get(hub, 0)
        vault = signals["vault_open"].get(hub, 0)
        classes = sum(1 for v in (site, vault) if v >= MIN_EVENTS_PER_CLASS)
        print(f"{hub:32} {site:>6} {vault:>6} {classes:>8}")
        if classes >= GATE_1_SIGNAL_CLASSES:
            advanced.append(hub)

    print()
    print("MANUAL CLASSES (aggregate only, enter from the source, never identities)")
    for label in (
        "LinkedIn engagement by problem",
        "Approved reply themes by problem",
        "Reader-pulse responses by problem",
        "CS Analyzer demo behaviour by problem",
    ):
        print(f"  {label:44} ____")
    print()
    print("  These are independent of the two automated classes above, which is the")
    print("  point: Gate 1 needs independence, not volume from one surface.")
    print()

    if advanced:
        print(f"GATE 1 candidates ({GATE_1_SIGNAL_CLASSES}+ independent classes): {', '.join(advanced)}")
        print("  Still blocked by Gate 0. Record only; do not open research.")
    else:
        print("GATE 1: no problem yet appears in two independent automated classes.")
        print("  Expected. Instrumentation began 23 August 2026.")

    print()
    print("Review cadence: weekly, after the Tuesday readout. Advance a problem only")
    print("on evidence, never on one strong post.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
