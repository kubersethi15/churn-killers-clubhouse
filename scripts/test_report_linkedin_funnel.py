#!/usr/bin/env python3
"""Contract checks for the aggregate LinkedIn funnel report."""

from report_linkedin_funnel import summarise


def main() -> int:
    events = [
        {"source": "linkedin", "medium": "profile", "campaign": "always_on", "utm_content": "premium_button", "session_id": "a"},
        {"source": "linkedin", "medium": "profile", "campaign": "always_on", "utm_content": "premium_button", "session_id": "a"},
        {"source": "linkedin", "medium": "featured", "campaign": "always_on", "utm_content": "newsletter_home", "session_id": "b"},
        {"source": "direct", "session_id": "c"},
    ]
    subscribers = [
        {"utm_source": "linkedin", "utm_medium": "profile", "utm_campaign": "always_on", "utm_content": "premium_button", "subscribed": True},
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
    print("LinkedIn funnel report contract passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
