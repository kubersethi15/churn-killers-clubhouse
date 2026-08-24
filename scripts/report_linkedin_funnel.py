"""Weekly LinkedIn comment -> profile -> site funnel report (LI-04).

What this can and cannot see
----------------------------
The site side is fully instrumented. `growth_events` tags the Premium profile
button as source=linkedin, medium=featured, campaign=always_on, so
profile-to-site and site-to-signup are measurable from first-party data.

The comment-to-profile step is not, and no amount of site instrumentation will
fix that. The founder relationship loop posts deliberately no-link comments, so
a reader who sees a comment, visits the profile, and clicks the button is
indistinguishable from any other profile visitor. The only observation of that
middle step lives in LinkedIn Premium's own aggregate analytics and has to be
entered by hand.

This report therefore prints the measured site side and leaves labelled slots
for the manual LinkedIn figures, rather than silently implying the whole funnel
is measured.

Aggregate and counts-only. Never records viewer, follower or engager identity.

Usage:
  SUPABASE_SERVICE_KEY=... python3 scripts/report_linkedin_funnel.py [--days 7]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xtwxemlxzbnadkkrvozr.supabase.co")
KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

# Below this, report descriptively and make no rate or winner claim. Matches the
# CID-001 rule already applied to the Tuesday baseline.
MIN_EVIDENCE_SESSIONS = 20


def fetch(path: str) -> list[dict]:
    if not KEY:
        raise SystemExit(
            "Set SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) to run this report."
        )
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
                "growth_events is not readable with this key. RLS keeps it closed to "
                "the anon key by design, since it is a write-only surface for clients. "
                "Run this with SUPABASE_SERVICE_KEY set."
            ) from None
        raise SystemExit(f"Supabase returned HTTP {exc.code} for {path}") from None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=7)
    args = ap.parse_args()

    since = f"now() - interval '{args.days} days'"
    # PostgREST cannot express `now() - interval`, so filter client-side on a
    # bounded pull rather than pushing an unsafe expression into the query.
    rows = fetch(
        "growth_events?select=event_name,source,medium,campaign,utm_content,"
        "session_id,created_at&order=created_at.desc&limit=5000"
    )

    from datetime import datetime, timedelta, timezone

    cutoff = datetime.now(timezone.utc) - timedelta(days=args.days)

    def recent(r):
        try:
            return datetime.fromisoformat(r["created_at"].replace("Z", "+00:00")) >= cutoff
        except (ValueError, KeyError):
            return False

    rows = [r for r in rows if recent(r)]
    li = [r for r in rows if (r.get("source") or "").lower() == "linkedin"]

    li_sessions = {r["session_id"] for r in li if r.get("session_id")}
    all_sessions = {r["session_id"] for r in rows if r.get("session_id")}
    li_signups = {
        r["session_id"]
        for r in li
        if "signup" in (r.get("event_name") or "").lower()
        or "subscrib" in (r.get("event_name") or "").lower()
    }

    print(f"LinkedIn funnel, last {args.days} days")
    print("=" * 46)
    print()
    print("MEASURED (first-party site data)")
    print(f"  LinkedIn tagged sessions        {len(li_sessions)}")
    print(f"  LinkedIn tagged events          {len(li)}")
    print(f"  Signups from LinkedIn sessions  {len(li_signups)}")
    print(f"  All sessions, all sources       {len(all_sessions)}")

    by_surface: dict[str, set] = {}
    for r in li:
        key = f"{r.get('medium') or '-'}/{r.get('campaign') or '-'}/{r.get('utm_content') or '-'}"
        by_surface.setdefault(key, set()).add(r.get("session_id"))
    if by_surface:
        print()
        print("  By LinkedIn surface (medium/campaign/content)")
        for key, sessions in sorted(by_surface.items(), key=lambda kv: -len(kv[1])):
            print(f"    {key:44} {len(sessions)} sessions")

    print()
    print("NOT MEASURED HERE (enter from LinkedIn Premium analytics, aggregate only)")
    for label in (
        "Substantive comments published",
        "Profile views",
        "Custom button clicks",
        "Impressions",
        "Members reached",
        "Out-of-network reach share",
        "New followers",
    ):
        print(f"  {label:38} ____")
    print()
    print("  Never record individual viewers, followers or engagers.")

    print()
    if len(li_sessions) < MIN_EVIDENCE_SESSIONS:
        print(
            f"VERDICT: descriptive only. {len(li_sessions)} LinkedIn sessions is below the "
            f"{MIN_EVIDENCE_SESSIONS}-session minimum."
        )
        print("  Do not state a conversion rate, compare surfaces, or call a winner.")
    else:
        rate = 100.0 * len(li_signups) / len(li_sessions)
        print(f"VERDICT: above minimum evidence. Signup rate {rate:.1f}% of LinkedIn sessions.")
        print("  Still one variable at a time. Do not attribute to comments without the manual figures above.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
