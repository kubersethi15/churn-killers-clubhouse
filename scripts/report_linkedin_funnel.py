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
QUALIFIED_EVENT_NAMES = {"resource_open", "content_share", "reader_pulse_response"}


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


def is_linkedin_newsletter(row: dict) -> bool:
    medium = str(row.get("utm_medium") or row.get("medium") or "").lower()
    content = str(row.get("utm_content") or "").lower()
    return is_linkedin(row) and medium == "newsletter" and content == "linkedin_newsletter"


def public_path(value: object) -> str:
    """Return a query-free public path without carrying arbitrary URL data into reports."""
    raw = str(value or "").strip()
    if not raw:
        return "-"
    parsed = urllib.parse.urlparse(raw)
    path = parsed.path or (raw if raw.startswith("/") else "")
    if not path.startswith("/"):
        return "-"
    return path[:300]


def is_qualified_action(row: dict) -> bool:
    event_name = str(row.get("event_name") or "")
    return event_name in QUALIFIED_EVENT_NAMES or (
        event_name == "page_view" and public_path(row.get("page_path")) == "/cs-analyzer/demo"
    )


def summarise(events: list[dict], subscribers: list[dict]) -> dict[str, object]:
    linkedin_events = [row for row in events if is_linkedin(row)]
    linkedin_subscribers = [row for row in subscribers if is_linkedin(row)]
    linkedin_sessions = {
        row["session_id"] for row in linkedin_events if row.get("session_id")
    }
    linkedin_qualified_sessions = {
        row["session_id"]
        for row in linkedin_events
        if row.get("session_id") and is_qualified_action(row)
    }
    all_sessions = {row["session_id"] for row in events if row.get("session_id")}

    sessions_by_surface: dict[str, set[str]] = {}
    qualified_sessions_by_surface: dict[str, set[str]] = {}
    for row in linkedin_events:
        if row.get("session_id"):
            sessions_by_surface.setdefault(surface(row), set()).add(row["session_id"])
            if is_qualified_action(row):
                qualified_sessions_by_surface.setdefault(surface(row), set()).add(row["session_id"])

    acquisitions_by_surface: dict[str, int] = {}
    for row in linkedin_subscribers:
        key = surface(row)
        acquisitions_by_surface[key] = acquisitions_by_surface.get(key, 0) + 1

    first_page_by_session: dict[str, tuple[str, str, str]] = {}
    for row in linkedin_events:
        session_id = str(row.get("session_id") or "")
        if not session_id or row.get("event_name") != "page_view":
            continue
        path = public_path(row.get("page_path"))
        if path == "-":
            continue
        candidate = (str(row.get("created_at") or ""), surface(row), path)
        current = first_page_by_session.get(session_id)
        if current is None or candidate[0] < current[0]:
            first_page_by_session[session_id] = candidate

    destination_rows: dict[tuple[str, str], dict[str, object]] = {}
    for _, surface_name, path in first_page_by_session.values():
        key = (surface_name, path)
        destination = destination_rows.setdefault(
            key,
            {"surface": surface_name, "landing_page": path, "visits": 0, "acquired": 0, "active": 0},
        )
        destination["visits"] = int(destination["visits"]) + 1

    for row in linkedin_subscribers:
        surface_name = surface(row)
        path = public_path(row.get("landing_page"))
        key = (surface_name, path)
        destination = destination_rows.setdefault(
            key,
            {"surface": surface_name, "landing_page": path, "visits": 0, "acquired": 0, "active": 0},
        )
        destination["acquired"] = int(destination["acquired"]) + 1
        if row.get("subscribed") is True:
            destination["active"] = int(destination["active"]) + 1

    signup_locations: dict[str, int] = {}
    for row in linkedin_subscribers:
        location = str(row.get("signup_location") or "unknown").strip().lower()[:80] or "unknown"
        signup_locations[location] = signup_locations.get(location, 0) + 1

    newsletter_events = [row for row in linkedin_events if is_linkedin_newsletter(row)]
    newsletter_subscribers = [row for row in linkedin_subscribers if is_linkedin_newsletter(row)]
    newsletter_campaigns: dict[str, dict[str, object]] = {}
    for row in newsletter_events:
        campaign = str(row.get("campaign") or row.get("utm_campaign") or "-").lower()
        record = newsletter_campaigns.setdefault(
            campaign,
            {"campaign": campaign, "sessions": set(), "qualified_sessions": set(), "acquired": 0, "active": 0},
        )
        session_id = row.get("session_id")
        if session_id:
            record["sessions"].add(session_id)
            if is_qualified_action(row):
                record["qualified_sessions"].add(session_id)
    for row in newsletter_subscribers:
        campaign = str(row.get("utm_campaign") or row.get("campaign") or "-").lower()
        record = newsletter_campaigns.setdefault(
            campaign,
            {"campaign": campaign, "sessions": set(), "qualified_sessions": set(), "acquired": 0, "active": 0},
        )
        record["acquired"] = int(record["acquired"]) + 1
        if row.get("subscribed") is True:
            record["active"] = int(record["active"]) + 1

    newsletter_rows = []
    for record in newsletter_campaigns.values():
        newsletter_rows.append({
            "campaign": record["campaign"],
            "sessions": len(record["sessions"]),
            "qualified_sessions": len(record["qualified_sessions"]),
            "acquired": record["acquired"],
            "active": record["active"],
        })
    newsletter_rows.sort(key=lambda row: str(row["campaign"]))
    newsletter_sessions = {
        row["session_id"] for row in newsletter_events if row.get("session_id")
    }
    newsletter_qualified_sessions = {
        row["session_id"]
        for row in newsletter_events
        if row.get("session_id") and is_qualified_action(row)
    }

    return {
        "linkedin_sessions": len(linkedin_sessions),
        "linkedin_qualified_sessions": len(linkedin_qualified_sessions),
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
        "qualified_sessions_by_surface": {
            key: len(value) for key, value in qualified_sessions_by_surface.items()
        },
        "acquisitions_by_surface": acquisitions_by_surface,
        "destinations": sorted(
            destination_rows.values(),
            key=lambda row: (str(row["surface"]), str(row["landing_page"])),
        ),
        "signup_locations": signup_locations,
        "newsletter_block": {
            "sessions": len(newsletter_sessions),
            "qualified_sessions": len(newsletter_qualified_sessions),
            "acquired": len(newsletter_subscribers),
            "active": sum(1 for row in newsletter_subscribers if row.get("subscribed") is True),
            "campaigns": newsletter_rows,
        },
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
        f"session_id,page_path,created_at&created_at=gte.{cutoff_value}&order=created_at.desc&limit=5000"
    )
    # Explicit PII-safe projection: no email, name, IP, referrer, or free text.
    subscribers = fetch(
        "subscribers?select=acquisition_session_id,utm_source,utm_medium,utm_campaign,"
        "utm_content,landing_page,signup_location,created_at,subscribed&"
        f"created_at=gte.{cutoff_value}&order=created_at.desc&limit=5000"
    )
    report = summarise(events, subscribers)

    print(f"LinkedIn funnel, last {max(1, args.days)} days")
    print("=" * 48)
    print("\nMEASURED (first-party aggregate data)")
    print(f"  LinkedIn tagged sessions          {report['linkedin_sessions']}")
    print(f"  LinkedIn qualified-action sessions {report['linkedin_qualified_sessions']}")
    print(f"  LinkedIn tagged events            {report['linkedin_events']}")
    print(f"  LinkedIn acquired subscribers     {report['linkedin_acquisitions']}")
    print(f"  LinkedIn acquisitions active now  {report['linkedin_currently_active']}")
    print(f"  All measured sessions             {report['all_sessions']}")
    print(f"  All acquired subscribers          {report['all_acquisitions']}")

    session_surfaces = report["sessions_by_surface"]
    qualified_surfaces = report["qualified_sessions_by_surface"]
    acquisition_surfaces = report["acquisitions_by_surface"]
    if session_surfaces or acquisition_surfaces:
        print("\n  LinkedIn surfaces (medium/campaign/content)")
        for key in sorted(set(session_surfaces) | set(acquisition_surfaces)):
            print(
                f"    {key:44} {session_surfaces.get(key, 0)} sessions, "
                f"{qualified_surfaces.get(key, 0)} qualified, "
                f"{acquisition_surfaces.get(key, 0)} acquisitions"
            )

    newsletter_block = report["newsletter_block"]
    print("\n  CID-004 LinkedIn Newsletter block")
    print(f"    Tagged sessions                            {newsletter_block['sessions']}")
    print(f"    Qualified-action sessions                  {newsletter_block['qualified_sessions']}")
    print(f"    Acquired website subscribers               {newsletter_block['acquired']}")
    print(f"    Acquisitions currently active              {newsletter_block['active']}")
    for row in newsletter_block["campaigns"]:
        print(
            f"    {row['campaign']:42} {row['sessions']} sessions, "
            f"{row['qualified_sessions']} qualified, {row['acquired']} acquired, {row['active']} active"
        )

    destinations = report["destinations"]
    if destinations:
        print("\n  LinkedIn destinations (surface -> first landing path)")
        for row in destinations:
            print(
                f"    {row['surface']:38} {row['landing_page']:24} "
                f"{row['visits']} visits, {row['acquired']} acquisitions, {row['active']} active"
            )
        print("  Paths are query-free. Campaign labels remain the experiment boundary.")

    signup_locations = report["signup_locations"]
    if signup_locations:
        print("\n  LinkedIn acquisition form locations")
        for location, count in sorted(signup_locations.items()):
            print(f"    {location:44} {count} acquisitions")

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

    newsletter_session_count = int(newsletter_block["sessions"])
    if newsletter_session_count < MIN_EVIDENCE_SESSIONS:
        print(
            f"\nCID-004 VERDICT: descriptive only. {newsletter_session_count} newsletter sessions is "
            f"below the {MIN_EVIDENCE_SESSIONS}-session four-edition floor."
        )
    else:
        newsletter_acquired = int(newsletter_block["acquired"])
        newsletter_qualified = int(newsletter_block["qualified_sessions"])
        print(
            f"\nCID-004 VERDICT: {100.0 * newsletter_qualified / newsletter_session_count:.1f}% "
            "qualified-action rate and "
            f"{100.0 * newsletter_acquired / newsletter_session_count:.1f}% acquisition rate."
        )
        print("  Apply the written weekly-versus-monthly rule only after all four editions and maturity checks.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
