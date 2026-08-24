"""Tests for the costly-problem ledger (CG-09 / BC-01).

Run: python3 scripts/test_report_costly_problems.py
"""
from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from report_costly_problems import (  # noqa: E402
    CLEAN_DAYS_REQUIRED,
    MIN_SESSIONS_PER_CLASS,
    problem_for,
    summarise,
)

HUB_OF_ISSUE = {"issue-a": "renewal-economics", "issue-b": "ai-role-design"}
HUB_OF_RESOURCE = {"pdf-x": "renewal-economics", "/pdfs/x.pdf": "renewal-economics"}
T0 = datetime(2026, 8, 24, 6, 0, tzinfo=timezone.utc)


def ev(session, when, **kw):
    return {"session_id": session, "created_at": when.isoformat(), **kw}


def test_resource_id_shapes_all_map():
    assert problem_for({"resource_id": "topic:ai-role-design"}, HUB_OF_ISSUE, HUB_OF_RESOURCE) == "ai-role-design"
    assert problem_for({"resource_id": "topic-tool:renewal-economics"}, HUB_OF_ISSUE, HUB_OF_RESOURCE) == "renewal-economics"
    assert problem_for({"resource_id": "pdf-x"}, HUB_OF_ISSUE, HUB_OF_RESOURCE) == "renewal-economics"
    assert problem_for({"content_slug": "issue-b"}, HUB_OF_ISSUE, HUB_OF_RESOURCE) == "ai-role-design"
    assert problem_for({"page_path": "/topics/renewal-economics"}, HUB_OF_ISSUE, HUB_OF_RESOURCE) == "renewal-economics"
    assert problem_for({"page_path": "/about"}, HUB_OF_ISSUE, HUB_OF_RESOURCE) is None
    print("ok  every resource-id shape and fallback maps to a problem")


def test_sessions_are_deduplicated_not_raw_events():
    from datetime import timedelta
    # one session, five events on the same problem -> weight 1, not 5
    events = [ev("s1", T0 + timedelta(minutes=i), resource_id="topic:renewal-economics") for i in range(5)]
    s = summarise(events, HUB_OF_ISSUE, HUB_OF_RESOURCE, clean_from=T0, now=T0 + timedelta(days=8))
    row = next(r for r in s["rows"] if r["problem"] == "renewal-economics")
    assert row["onsite_sessions"] == 1, row
    print("ok  five events from one session count as one session")


def test_site_and_vault_are_one_class_not_two():
    from datetime import timedelta
    # same session does a page_view AND a resource_open on the same problem.
    # That is one on-site class, so independent_classes must be 1, never 2.
    events = [
        ev("s1", T0, event_name="page_view", page_path="/topics/ai-role-design"),
        ev("s1", T0 + timedelta(minutes=1), event_name="resource_open", resource_id="topic:ai-role-design"),
        ev("s2", T0, resource_id="topic:ai-role-design"),
        ev("s3", T0, resource_id="topic:ai-role-design"),
    ]
    s = summarise(events, HUB_OF_ISSUE, HUB_OF_RESOURCE, clean_from=T0, now=T0 + timedelta(days=8))
    row = next(r for r in s["rows"] if r["problem"] == "ai-role-design")
    assert row["onsite_sessions"] == 3, row
    assert row["independent_classes"] == 1, "site+vault must be ONE class"
    print("ok  site visits and vault opens are one class, never two")


def test_pre_cutoff_rows_are_dropped():
    from datetime import timedelta
    before = ev("old", T0 - timedelta(hours=1), resource_id="topic:renewal-economics")
    after = ev("new", T0 + timedelta(hours=1), resource_id="topic:renewal-economics")
    s = summarise([before, after], HUB_OF_ISSUE, HUB_OF_RESOURCE, clean_from=T0, now=T0 + timedelta(days=8))
    assert s["dropped_pre_cutoff"] == 1 and s["kept"] == 1
    row = next(r for r in s["rows"] if r["problem"] == "renewal-economics")
    assert row["onsite_sessions"] == 1, "only the post-cutoff session should count"
    print("ok  events before clean_from are excluded from every count")


def test_gate0_requires_enough_clean_days():
    from datetime import timedelta
    events = [ev("s1", T0, resource_id="topic:renewal-economics")]
    early = summarise(events, HUB_OF_ISSUE, HUB_OF_RESOURCE, clean_from=T0, now=T0 + timedelta(days=CLEAN_DAYS_REQUIRED - 1))
    late = summarise(events, HUB_OF_ISSUE, HUB_OF_RESOURCE, clean_from=T0, now=T0 + timedelta(days=CLEAN_DAYS_REQUIRED))
    assert early["gate0_data_trustworthy"] is False
    assert late["gate0_data_trustworthy"] is True
    print(f"ok  Gate 0 needs {CLEAN_DAYS_REQUIRED} clean days, not fewer")


def test_no_cutoff_means_everything_dropped_conceptually():
    # With clean_from=None the caller reports nothing; summarise keeps rows but
    # gate0 is false, so no rate can be stated.
    from datetime import timedelta
    events = [ev("s1", T0, resource_id="topic:renewal-economics")]
    s = summarise(events, HUB_OF_ISSUE, HUB_OF_RESOURCE, clean_from=None, now=T0 + timedelta(days=99))
    assert s["gate0_data_trustworthy"] is False and s["clean_from"] is None
    print("ok  with no recorded cutoff, Gate 0 can never be met")


if __name__ == "__main__":
    fails = 0
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
            except AssertionError as e:
                fails += 1
                print(f"FAIL {name}: {e}")
    print()
    print("all costly-problem ledger tests passed" if not fails else f"{fails} failed")
    sys.exit(1 if fails else 0)
