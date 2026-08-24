"""Aggregate costly-problem ledger (CG-09), corrected under BC-01.

Corrections to the first version (PR #90):

1. Session deduplication. A problem's weight is unique sessions, not raw
   events. One reader refreshing a page five times is one session, not five.

2. Correct source classes. Site visits and Vault opens are both first-party
   on-site behaviour, so they are ONE class, not two. The earlier version
   counted them as two independent classes, which let a single behaviour trip
   Gate 1's "two independent signals" rule on its own. That was wrong. A genuine
   second class must come from a different surface: LinkedIn engagement,
   approved reply themes, reader-pulse responses, or CS Analyzer demo
   behaviour, all entered by hand.

3. Resource-id mapping. `pdf-*`, `topic:*` and `topic-tool:*` identifiers all
   map to a problem. Only `topic:*` carries data today; the other two are
   handled for when they do.

4. No conclusion uses pre-fix rows. `growth_events` was contaminated by agent
   preview traffic before the host guard in #90 (see below). The report reads a
   `clean_from` cutoff from `growth_measurement_state` and ignores everything
   before it. With no cutoff recorded, it reports nothing and says why.

What can and cannot be claimed about the contamination, precisely:
  - Verified: `trackGrowthEvent` wrote from any production build including
    localhost `vite preview`, and the table grew from 353 to 572 rows during a
    single agent working session.
  - Not verified, and not claimable: exactly which rows are agent versus reader.
    No host or environment field exists on the row. Real production traffic
    before the cutoff is valid but not separable from agent traffic, so the
    whole pre-cutoff window is set aside rather than any row being labelled.

Aggregate only. No identity, no reply text, no email. Answers which problem and
how often, never who.

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
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from related_graph import load_hub_membership  # noqa: E402

REPO_ROOT = Path(__file__).parent.parent
MANIFEST = REPO_ROOT / "public" / "pdfs" / "manifest.json"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xtwxemlxzbnadkkrvozr.supabase.co")
KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

GATE_1_INDEPENDENT_CLASSES = 2
MIN_SESSIONS_PER_CLASS = 3
CLEAN_DAYS_REQUIRED = 7


def _parse_ts(value: object) -> datetime | None:
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def problem_for(row: dict, hub_of_issue: dict, hub_of_resource: dict) -> str | None:
    """Map one event to a problem (topic hub), or None."""
    rid = str(row.get("resource_id") or "")
    if rid.startswith("topic:") or rid.startswith("topic-tool:"):
        return rid.split(":", 1)[1] or None
    if rid.startswith("pdf-") or rid.startswith("/pdfs/"):
        hit = hub_of_resource.get(rid)
        if hit:
            return hit
    slug = row.get("content_slug") or ""
    if slug and hub_of_issue.get(slug):
        return hub_of_issue[slug]
    path = row.get("page_path") or ""
    for issue_slug, hub in hub_of_issue.items():
        if issue_slug and issue_slug in path:
            return hub
    if path.startswith("/topics/"):
        return path.split("/topics/", 1)[1].split("/")[0] or None
    return None


def summarise(
    events: list[dict],
    hub_of_issue: dict,
    hub_of_resource: dict,
    clean_from: datetime | None,
    now: datetime,
) -> dict:
    """Pure core. Deterministic given its inputs, so it is directly testable."""
    kept, dropped = [], 0
    for row in events:
        ts = _parse_ts(row.get("created_at"))
        if clean_from is not None and (ts is None or ts < clean_from):
            dropped += 1
            continue
        kept.append(row)

    # sessions per (source class, problem). site + vault are ONE class.
    onsite_sessions: dict[str, set] = defaultdict(set)
    for row in kept:
        problem = problem_for(row, hub_of_issue, hub_of_resource)
        if not problem:
            continue
        sid = row.get("session_id")
        if sid:
            onsite_sessions[problem].add(sid)

    problems = sorted({h for h in hub_of_issue.values() if h})
    rows = []
    for p in problems:
        onsite = len(onsite_sessions.get(p, set()))
        classes = 1 if onsite >= MIN_SESSIONS_PER_CLASS else 0
        rows.append({"problem": p, "onsite_sessions": onsite, "independent_classes": classes})

    clean_days = None
    if clean_from is not None:
        clean_days = (now - clean_from).total_seconds() / 86400.0

    gate0_met = (
        clean_from is not None
        and clean_days is not None
        and clean_days >= CLEAN_DAYS_REQUIRED
    )
    return {
        "kept": len(kept),
        "dropped_pre_cutoff": dropped,
        "clean_from": clean_from.isoformat() if clean_from else None,
        "clean_days": round(clean_days, 2) if clean_days is not None else None,
        "gate0_data_trustworthy": gate0_met,
        "rows": rows,
        # A problem needs the on-site class PLUS a second independent class,
        # which lives only in the manual sources, so on-site alone never reaches 2.
        "gate1_candidates_onsite": [r["problem"] for r in rows if r["independent_classes"] >= 1],
    }


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
    hub_of_resource = {}
    for e in manifest:
        hub = hub_of_issue.get(e.get("newsletter_slug") or "")
        if hub:
            hub_of_resource[e["pdf_path"]] = hub
            hub_of_resource[e["id"]] = hub

    state = fetch("growth_measurement_state?select=metric,tracked_from")
    clean_from = None
    for r in state:
        if r.get("metric") == "growth_events_clean_from":
            clean_from = _parse_ts(r.get("tracked_from"))

    events = fetch(
        "growth_events?select=event_name,page_path,content_slug,resource_id,"
        "session_id,created_at&order=created_at.desc&limit=5000"
    )

    # now() is unavailable to workflow scripts but fine here; stamp once.
    now = datetime.now(timezone.utc)
    summary = summarise(events, hub_of_issue, hub_of_resource, clean_from, now)

    print("Costly-problem ledger")
    print("=" * 60)
    if clean_from is None:
        print("\nGATE 0: NO clean_from recorded in growth_measurement_state.")
        print("Reporting nothing. Record growth_events_clean_from first, after")
        print("PR #90 is confirmed deployed. Migration is in this branch.")
        return 0

    print(f"\nclean_from: {summary['clean_from']}  ({summary['clean_days']} clean days)")
    print(f"rows kept: {summary['kept']}   dropped before cutoff: {summary['dropped_pre_cutoff']}")
    print(f"GATE 0 (>= {CLEAN_DAYS_REQUIRED} clean days): "
          f"{'MET' if summary['gate0_data_trustworthy'] else 'NOT MET'}")
    print()
    print(f"{'problem (topic hub)':32} {'sessions':>9} {'onsite class':>13}")
    print("-" * 60)
    for r in summary["rows"]:
        print(f"{r['problem']:32} {r['onsite_sessions']:>9} {r['independent_classes']:>13}")

    print("\nSECOND CLASS is required for Gate 1 and lives only in manual sources")
    print("(LinkedIn, approved replies, reader-pulse, Analyzer demo). On-site")
    print("behaviour is one class; it cannot satisfy the two-class rule alone.")

    if not summary["gate0_data_trustworthy"]:
        print("\nGate 0 not yet met. Counts only, no problem advances.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
