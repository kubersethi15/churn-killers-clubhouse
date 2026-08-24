#!/usr/bin/env python3

from report_welcome_activation import summarise


def event(session: str, name: str, path: str, created_at: str, source: str = "welcome") -> dict:
    return {
        "session_id": session,
        "event_name": name,
        "page_path": path,
        "created_at": created_at,
        "source": source,
        "medium": "email",
        "campaign": "starter_kit",
    }


def test_welcome_paths_and_qualified_actions_are_session_deduplicated() -> None:
    rows = [
        event("start-session", "page_view", "/start", "2026-08-24T01:00:00Z"),
        event("start-session", "page_view", "/start", "2026-08-24T01:00:01Z"),
        event("start-session", "resource_open", "/playbook", "2026-08-24T01:01:00Z"),
        event("vault-session", "page_view", "/playbook", "2026-08-24T02:00:00Z"),
        event("diagnostic-session", "page_view", "/ai-exposure-score", "2026-08-24T03:00:00Z"),
        event("unrelated", "page_view", "/start", "2026-08-24T04:00:00Z", source="linkedin"),
    ]
    report = summarise(rows, accepted_email_count=4)

    assert report["welcome_emails_accepted"] == 4
    assert report["tagged_click_sessions"] == 3
    assert report["qualified_action_sessions"] == 1
    assert report["no_qualified_action_sessions"] == 2
    assert report["paths"] == [
        {"path": "diagnostic", "sessions": 1, "qualified_action_sessions": 0},
        {"path": "start", "sessions": 1, "qualified_action_sessions": 1},
        {"path": "vault", "sessions": 1, "qualified_action_sessions": 0},
    ]
    assert report["evidence_gate_met"] is False


if __name__ == "__main__":
    test_welcome_paths_and_qualified_actions_are_session_deduplicated()
    print("welcome activation report tests passed")
