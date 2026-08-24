#!/usr/bin/env python3
"""Aggregate welcome-email activation report for LOOP-03.

Only PII-free columns are requested. Session identifiers are used in memory to
deduplicate activity and are never printed.

Usage:
  SUPABASE_SERVICE_KEY=... python3 scripts/report_welcome_activation.py [--days 30]
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone


SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xtwxemlxzbnadkkrvozr.supabase.co")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
MIN_EVIDENCE_SESSIONS = 20


def fetch(path: str) -> list[dict]:
    if not SERVICE_KEY:
        raise SystemExit("Set SUPABASE_SERVICE_KEY to run this aggregate report.")
    request = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}",
        headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            raise SystemExit("Use the service key; aggregate source tables are intentionally not public.") from None
        raise SystemExit(f"Supabase returned HTTP {exc.code} for the aggregate query.") from None


def path_label(path: object) -> str:
    return {
        "/start": "start",
        "/playbook": "vault",
        "/ai-exposure-score": "diagnostic",
    }.get(str(path or ""), "other")


def is_qualified(row: dict) -> bool:
    return row.get("event_name") in {"resource_open", "content_share", "reader_pulse_response"} or (
        row.get("event_name") == "page_view" and row.get("page_path") == "/cs-analyzer/demo"
    )


def summarise(events: list[dict], accepted_email_count: int) -> dict[str, object]:
    filtered = [
        row for row in events
        if str(row.get("source") or "").lower() == "welcome"
        and str(row.get("medium") or "").lower() == "email"
        and str(row.get("campaign") or "").lower() == "starter_kit"
    ]
    first_pages: dict[str, tuple[str, str]] = {}
    qualified_sessions: set[str] = set()
    for row in filtered:
        session_id = str(row.get("session_id") or "")
        if not session_id:
            continue
        if is_qualified(row):
            qualified_sessions.add(session_id)
        if row.get("event_name") == "page_view":
            candidate = (str(row.get("created_at") or ""), path_label(row.get("page_path")))
            if session_id not in first_pages or candidate[0] < first_pages[session_id][0]:
                first_pages[session_id] = candidate

    rows: dict[str, dict[str, int | str]] = {}
    for session_id, (_, path) in first_pages.items():
        row = rows.setdefault(path, {"path": path, "sessions": 0, "qualified_action_sessions": 0})
        row["sessions"] = int(row["sessions"]) + 1
        if session_id in qualified_sessions:
            row["qualified_action_sessions"] = int(row["qualified_action_sessions"]) + 1

    clicked_sessions = set(first_pages)
    qualified_clicked_sessions = clicked_sessions & qualified_sessions
    return {
        "welcome_emails_accepted": accepted_email_count,
        "tagged_click_sessions": len(clicked_sessions),
        "qualified_action_sessions": len(qualified_clicked_sessions),
        "no_qualified_action_sessions": len(clicked_sessions - qualified_sessions),
        "paths": sorted(rows.values(), key=lambda row: (-int(row["sessions"]), str(row["path"]))),
        "evidence_gate_met": len(clicked_sessions) >= MIN_EVIDENCE_SESSIONS,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=30)
    return parser.parse_args()


def main() -> int:
    days = max(1, parse_args().days)
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    cutoff_value = urllib.parse.quote(cutoff.isoformat(), safe="")
    events = fetch(
        "growth_events?select=event_name,session_id,page_path,source,medium,campaign,created_at&"
        f"created_at=gte.{cutoff_value}&source=eq.welcome&medium=eq.email&campaign=eq.starter_kit&"
        "order=created_at.asc&limit=5000"
    )
    accepted = fetch(
        "subscribers?select=welcome_email_sent_at&"
        f"welcome_email_sent_at=gte.{cutoff_value}&limit=5000"
    )
    report = summarise(events, len(accepted))

    print(f"Welcome activation, last {days} days")
    print("=" * 44)
    print(f"Welcome emails accepted        {report['welcome_emails_accepted']}")
    print(f"Tagged click sessions          {report['tagged_click_sessions']}")
    print(f"Qualified-action sessions      {report['qualified_action_sessions']}")
    print(f"No qualified action            {report['no_qualified_action_sessions']}")
    for row in report["paths"]:
        print(f"  {row['path']:12} {row['sessions']} sessions, {row['qualified_action_sessions']} qualified")
    if report["evidence_gate_met"]:
        print("Decision: evidence gate met; a one-variable welcome test may be selected.")
    else:
        remaining = MIN_EVIDENCE_SESSIONS - int(report["tagged_click_sessions"])
        print(f"Decision: observe; {remaining} more tagged click sessions are needed before a copy test.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
