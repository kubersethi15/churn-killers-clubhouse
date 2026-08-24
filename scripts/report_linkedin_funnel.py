#!/usr/bin/env python3
"""Weekly LinkedIn -> site -> subscriber funnel report (LI-04).

The first-party side is measured from aggregate event and acquisition fields.
The no-link comment -> profile step exists only in LinkedIn Premium analytics,
so the output leaves labelled manual slots instead of inventing attribution.

Only PII-free columns are requested from Supabase.

Usage:
  SUPABASE_SERVICE_KEY=... python3 scripts/report_linkedin_funnel.py [--days 7]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
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
            raise SystemExit(
                "The aggregate tables are not readable with this key. "
                "Use the service key; the anon key is intentionally write-only."
            ) from None
        raise SystemExit(f"Supabase returned HTTP {exc.code} for {path}") from None


def surface(row: dict) -> str:
    medium = row.get("utm_medium") or row.get("medium") or "-"
    campaign = row.get("utm_campaign") or row.get("campaign") or "-"
    content = row.get("utm_content") or "-"
    return "/".join(str(value).lower() for value in (medium, campaign, content))


def is_linkedin(row: dict) -> bool:
    return str(row.get("utm_source") or row.get("source") or "").lower() == "linkedin"


def summarise(events: list[dict], subscribers: list[dict]) -> dict[str, object]:
    linkedin_events = [row for row in events if is_linkedin(row)]
    linkedin_subscribers = [row for row in subscribers if is_linkedin(row)]
    linkedin_sessions = {
        row["session_id"] for row in linkedin_events if row.get("session_id")
    }
    all_sessions = {row["session_id"] for row in events if row.get("session_id")}

    sessions_by_surface: dict[str, set[str]] = {}
    for row in linkedin_events:
        if row.get("session_id"):
            sessions_by_surface.setdefault(surface(row), set()).add(row["session_id"])

    acquisitions_by_surface: dict[str, int] = {}
    for row in linkedin_subscribers:
        key = surface(row)
        acquisitions_by_surface[key] = acquisitions_by_surface.get(key, 0) + 1

    return {
        "linkedin_sessions": len(linkedin_sessions),
        "linkedin_events": len(linkedin_events),
        "linkedin_acquisitions": len(linkedin_subscribers),
        "linkedin_currently_active": sum(
            1 for row in linkedin_subscribers if row.get("subscribed") is True
        ),
        "all_sessions": len(all_sessions),
        "all_acquisitions": len(subscribers),
        "sessions_by_surface": {
            key: len(value) for key, value in sessions_by_surface.items()
        },
        "acquisitions_by_surface": acquisitions_by_surface,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=7)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    cutoff = datetime.now(timezone.utc) - timedelta(days=max(1, args.days))
    cutoff_value = urllib.parse.quote(cutoff.isoformat(), safe="")

    events = fetch(
        "growth_events?select=event_name,source,medium,campaign,utm_content,"
        f"session_id,created_at&created_at=gte.{cutoff_value}&order=created_at.desc&limit=5000"
    )
    # Explicit PII-safe projection: no email, name, IP, referrer, or free text.
    subscribers = fetch(
        "subscribers?select=acquisition_session_id,utm_source,utm_medium,utm_campaign,"
        f"utm_content,created_at,subscribed&created_at=gte.{cutoff_value}&order=created_at.desc&limit=5000"
    )
    report = summarise(events, subscribers)

    print(f"LinkedIn funnel, last {max(1, args.days)} days")
    print("=" * 48)
    print("\nMEASURED (first-party aggregate data)")
    print(f"  LinkedIn tagged sessions          {report['linkedin_sessions']}")
    print(f"  LinkedIn tagged events            {report['linkedin_events']}")
    print(f"  LinkedIn acquired subscribers     {report['linkedin_acquisitions']}")
    print(f"  LinkedIn acquisitions active now  {report['linkedin_currently_active']}")
    print(f"  All measured sessions             {report['all_sessions']}")
    print(f"  All acquired subscribers          {report['all_acquisitions']}")

    session_surfaces = report["sessions_by_surface"]
    acquisition_surfaces = report["acquisitions_by_surface"]
    if session_surfaces or acquisition_surfaces:
        print("\n  LinkedIn surfaces (medium/campaign/content)")
        for key in sorted(set(session_surfaces) | set(acquisition_surfaces)):
            print(
                f"    {key:44} {session_surfaces.get(key, 0)} sessions, "
                f"{acquisition_surfaces.get(key, 0)} acquisitions"
            )

    print("\nNOT MEASURED HERE (enter from LinkedIn Premium, aggregate only)")
    for label in (
        "Substantive comments published",
        "Profile views",
        "Premium custom-button clicks",
        "Impressions",
        "Members reached",
        "Out-of-network reach share",
        "New followers",
    ):
        print(f"  {label:40} ____")
    print("  Never record individual viewers, followers, or engagers.")

    linkedin_sessions = int(report["linkedin_sessions"])
    linkedin_acquisitions = int(report["linkedin_acquisitions"])
    if linkedin_sessions < MIN_EVIDENCE_SESSIONS:
        print(
            f"\nVERDICT: descriptive only. {linkedin_sessions} LinkedIn sessions is "
            f"below the {MIN_EVIDENCE_SESSIONS}-session minimum."
        )
        print("  Do not state a conversion rate, compare surfaces, or call a winner.")
    else:
        rate = 100.0 * linkedin_acquisitions / linkedin_sessions
        print(f"\nVERDICT: acquisition rate {rate:.1f}% of LinkedIn-tagged sessions.")
        print("  Do not attribute movement to comments without the manual Premium figures.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
