"""Tests for the issue-to-issue internal link graph.

Run: python3 scripts/test_related_graph.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from related_graph import (  # noqa: E402
    build_related_graph,
    graph_stats,
    load_hub_membership,
    normalise_category,
    tokenise,
)


def _corpus(n: int, categories: list[str] | None = None) -> list[dict]:
    categories = categories or ["Strategy", "Trust"]
    return [
        {
            "slug": f"issue-{i:02d}",
            "title": f"Issue {i} about renewal forecasting and adoption",
            "excerpt": f"Body {i} covering evidence, intervention and executive alignment.",
            "category": categories[i % len(categories)],
        }
        for i in range(n)
    ]


def test_category_aliases_fold_together():
    assert normalise_category("Strategy & Impact") == normalise_category("Strategy")
    assert normalise_category("Revenue & Expansion") == normalise_category("Revenue")
    assert normalise_category(None) == ""
    print("ok  category aliases fold near-duplicates together")


def test_tokenise_drops_brand_and_short_words():
    tokens = tokenise("Customer Success is dead", "The CS renewal playbook")
    assert "customer" not in tokens and "success" not in tokens and "dead" not in tokens
    assert "renewal" in tokens and "playbook" in tokens
    print("ok  tokeniser drops brand and stop words")


def test_no_self_links_and_fixed_out_degree():
    items = _corpus(20)
    graph = build_related_graph(items, membership={})
    for slug, targets in graph.items():
        assert slug not in targets, f"{slug} links to itself"
        assert len(targets) == 3, f"{slug} has {len(targets)} outbound links"
        assert len(set(targets)) == len(targets), f"{slug} has duplicate links"
    print("ok  every issue links out to 3 distinct others, never itself")


def test_no_orphans_the_regression_this_fixes():
    """The recency version left 13 of 41 issues with zero inbound links."""
    items = _corpus(41)
    graph = build_related_graph(items, membership={})
    stats = graph_stats(graph)
    assert stats["orphans"] == 0, f"{stats['orphans']} orphaned issues"
    assert stats["min_inbound"] >= 3, f"min inbound was {stats['min_inbound']}"
    print(f"ok  no orphans at 41 issues (min inbound {stats['min_inbound']})")


def test_coverage_holds_across_archive_sizes():
    for n in (4, 5, 12, 41, 60, 120):
        graph = build_related_graph(_corpus(n), membership={})
        stats = graph_stats(graph)
        assert stats["orphans"] == 0, f"n={n}: {stats['orphans']} orphans"
        expected_floor = min(3, n - 1)
        assert stats["min_inbound"] >= expected_floor, (
            f"n={n}: min inbound {stats['min_inbound']} < {expected_floor}"
        )
    print("ok  coverage guarantee holds from 4 to 120 issues")


def test_graph_is_stable_and_date_independent():
    """Publish dates must not move links, or the graph churns every Tuesday."""
    items = _corpus(30)
    first = build_related_graph(items, membership={})

    dated = [dict(item, published_date=f"2026-01-{(i % 28) + 1:02d}") for i, item in enumerate(items)]
    second = build_related_graph(dated, membership={})
    assert first == second, "graph changed when publish dates were added"

    shuffled = list(reversed(items))
    third = build_related_graph(shuffled, membership={})
    assert first == third, "graph changed when input order changed"
    print("ok  graph is deterministic and ignores publish dates")


def test_hub_membership_beats_token_overlap():
    items = [
        {"slug": "a", "title": "Renewal forecasting", "excerpt": "x", "category": "Revenue"},
        {"slug": "b", "title": "Renewal forecasting", "excerpt": "x", "category": "Revenue"},
        {"slug": "c", "title": "Totally unrelated onboarding", "excerpt": "y", "category": "Trust"},
        {"slug": "d", "title": "Another unrelated topic", "excerpt": "z", "category": "Trust"},
    ]
    graph = build_related_graph(items, membership={"a": "hub-1", "c": "hub-1"}, k=1, min_inbound=0)
    assert graph["a"] == ["c"], f"hub membership ignored: a -> {graph['a']}"
    print("ok  curated hub membership outranks token overlap")


def test_tiny_archive_does_not_crash():
    assert build_related_graph([], membership={}) == {}
    single = build_related_graph([{"slug": "only", "title": "t", "excerpt": "e"}], membership={})
    assert single == {"only": []}
    pair = build_related_graph(
        [{"slug": "a", "title": "t", "excerpt": "e"}, {"slug": "b", "title": "t", "excerpt": "e"}],
        membership={},
    )
    assert pair == {"a": ["b"], "b": ["a"]}
    print("ok  empty, single and two-issue archives are handled")


def test_real_hub_membership_parses():
    membership = load_hub_membership()
    assert membership, "no hub membership parsed from topicHubs.ts"
    hubs = set(membership.values())
    assert len(hubs) >= 3, f"expected several hubs, got {hubs}"
    for issue_slug, hub_slug in membership.items():
        assert issue_slug != hub_slug, f"{issue_slug} mapped to itself as a hub"
    print(f"ok  parsed {len(membership)} curated issue->hub mappings across {len(hubs)} hubs")


if __name__ == "__main__":
    failures = 0
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
            except AssertionError as exc:
                failures += 1
                print(f"FAIL {name}: {exc}")
    print()
    if failures:
        print(f"{failures} test(s) failed")
        sys.exit(1)
    print("all related-graph tests passed")
