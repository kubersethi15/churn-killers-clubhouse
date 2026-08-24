#!/usr/bin/env python3
"""Contract checks for the aggregate LinkedIn funnel report."""

from report_linkedin_funnel import summarise


def main() -> int:
    events = [
        {"event_name": "page_view", "source": "linkedin", "medium": "profile", "campaign": "always_on", "utm_content": "premium_button", "session_id": "a", "page_path": "/subscribe", "created_at": "2026-08-24T01:00:00Z"},
        {"event_name": "resource_open", "source": "linkedin", "medium": "profile", "campaign": "always_on", "utm_content": "premium_button", "session_id": "a", "page_path": "/playbook", "created_at": "2026-08-24T01:02:00Z"},
        {"event_name": "page_view", "source": "linkedin", "medium": "featured", "campaign": "always_on", "utm_content": "newsletter_home", "session_id": "b", "page_path": "/", "created_at": "2026-08-24T01:01:00Z"},
        {"source": "direct", "session_id": "c"},
    ]
    subscribers = [
        {"utm_source": "linkedin", "utm_medium": "profile", "utm_campaign": "always_on", "utm_content": "premium_button", "landing_page": "https://churnisdead.com/subscribe?email=never-report-this", "signup_location": "subscribe", "subscribed": True},
        {"utm_source": "direct", "subscribed": True},
    ]
    report = summarise(events, subscribers)
    assert report["linkedin_sessions"] == 2
    assert report["linkedin_events"] == 3
    assert report["linkedin_acquisitions"] == 1
    assert report["linkedin_currently_active"] == 1
    assert report["all_sessions"] == 3
    assert report["all_acquisitions"] == 2
    assert report["sessions_by_surface"]["profile/always_on/premium_button"] == 1
    assert report["sessions_by_surface"]["featured/always_on/newsletter_home"] == 1
    destinations = {(row["surface"], row["landing_page"]): row for row in report["destinations"]}
    assert destinations[("profile/always_on/premium_button", "/subscribe")]["visits"] == 1
    assert destinations[("profile/always_on/premium_button", "/subscribe")]["acquired"] == 1
    assert destinations[("profile/always_on/premium_button", "/subscribe")]["active"] == 1
    assert destinations[("featured/always_on/newsletter_home", "/")]["visits"] == 1
    assert report["signup_locations"]["subscribe"] == 1
    print("LinkedIn funnel report contract passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
