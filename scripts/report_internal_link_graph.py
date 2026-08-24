"""Report the internal link graph over the published archive.

Counts-only. Prints the inbound-link distribution under the previous
recency rule and under the topical graph, so the change can be re-measured
after any archive change.

Run: python3 scripts/report_internal_link_graph.py
"""

from __future__ import annotations

import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from prerender_newsletters import load_newsletter_catalog  # noqa: E402
from related_graph import (  # noqa: E402
    RELATED_PER_ISSUE,
    build_related_graph,
    graph_stats,
    load_hub_membership,
    normalise_category,
)


def recency_graph(items: list[dict], k: int = RELATED_PER_ISSUE) -> dict[str, list[str]]:
    """Reproduce the previous rule: k most recent issues in the same category."""
    by_category: dict[str, list[dict]] = defaultdict(list)
    for item in items:
        by_category[item.get("category") or ""].append(item)
    for bucket in by_category.values():
        bucket.sort(key=lambda i: str(i.get("published_date") or ""), reverse=True)

    graph: dict[str, list[str]] = {}
    for item in items:
        peers = by_category[item.get("category") or ""]
        graph[item["slug"]] = [
            p["slug"] for p in peers if p["slug"] != item["slug"]
        ][:k]
    return graph


def published_items(catalog: dict) -> list[dict]:
    """Only issues already live, matching what prerender actually emits."""
    now = datetime.now(timezone.utc)
    items = []
    for slug, record in catalog.items():
        try:
            published = datetime.fromisoformat(
                str(record.get("published_date", "")).replace("Z", "+00:00")
            )
        except ValueError:
            continue
        if published.tzinfo is None:
            published = published.replace(tzinfo=timezone.utc)
        if published <= now:
            items.append(dict(record, slug=slug))
    return items


def distribution(graph: dict[str, list[str]]) -> dict[int, int]:
    in_degree = {slug: 0 for slug in graph}
    for targets in graph.values():
        for target in targets:
            if target in in_degree:
                in_degree[target] += 1
    buckets: dict[int, int] = defaultdict(int)
    for count in in_degree.values():
        buckets[count] += 1
    return dict(sorted(buckets.items()))


def main() -> int:
    items = published_items(load_newsletter_catalog())
    if not items:
        print("No published issues found.")
        return 1

    membership = load_hub_membership()
    before = recency_graph(items)
    after = build_related_graph(items, membership=membership)

    b_stats, a_stats = graph_stats(before), graph_stats(after)

    print(f"Published issues: {len(items)}")
    print(f"Curated hub mappings: {len(membership)}")
    cats = {normalise_category(i.get('category')) for i in items}
    print(f"Distinct categories after alias folding: {len(cats)}")
    print()
    print(f"{'':28} {'before (recency)':>18} {'after (topical)':>18}")
    for label, key in (
        ("issues with zero inbound", "orphans"),
        ("lowest inbound count", "min_inbound"),
        ("highest inbound count", "max_inbound"),
        ("total internal edges", "total_edges"),
    ):
        print(f"{label:28} {b_stats[key]:>18} {a_stats[key]:>18}")

    print()
    print("Inbound-link distribution (inbound -> issues)")
    print(f"  before: {distribution(before)}")
    print(f"  after:  {distribution(after)}")

    orphan_slugs = [s for s, c in (
        (slug, sum(1 for t in before.values() if slug in t)) for slug in before
    ) if c == 0]
    if orphan_slugs:
        print()
        print(f"Previously orphaned issues ({len(orphan_slugs)}):")
        for slug in sorted(orphan_slugs):
            print(f"  {slug} -> now {sum(1 for t in after.values() if slug in t)} inbound")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
