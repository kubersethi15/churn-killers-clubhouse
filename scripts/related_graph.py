"""Build the internal link graph between published issues.

Why this exists
---------------
`RelatedNewsletters` used to show the three most recent issues in the same
category. That concentrated every internal link on the newest three issues per
category and left the deep archive with no lateral inbound links at all: on
24 August 2026, 13 of 41 published issues (all of them in Strategy or Trust)
had zero. Their only inbound internal link was the archive listing. The target
set also changed every Tuesday, so the graph never accumulated.

This module builds the graph instead, with three properties the recency
version could not offer:

1. Topical, not chronological. Editor-curated topic-hub membership is the
   strongest signal; token overlap on title and excerpt breaks the rest.
2. Stable. Nothing in the scoring depends on the current date, so the graph
   only changes when the archive changes.
3. Covered. Every issue is guaranteed at least MIN_INBOUND lateral inbound
   links. This is the property that stops the deep archive from going dark.
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
TOPIC_HUBS_TS = REPO_ROOT / "src" / "data" / "topicHubs.ts"

RELATED_PER_ISSUE = 3
MIN_INBOUND = 3

# Category labels drifted over time. Fold the near-duplicates together so
# "Strategy" and "Strategy & Impact" are one cluster, not two.
CATEGORY_ALIASES = {
    "strategy & impact": "strategy",
    "revenue & expansion": "revenue",
    "data & intelligence": "data",
    "predictability & risk": "risk",
    "ai & automation": "ai",
}

# Brand and domain words appear in nearly every issue, so they carry no
# discriminating signal and would make everything look related to everything.
STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "before", "but", "by",
    "can", "cs", "customer", "customers", "do", "does", "dont", "every", "for",
    "from", "get", "has", "have", "how", "i", "if", "in", "is", "it", "its",
    "just", "more", "most", "no", "not", "of", "on", "one", "or", "our", "out",
    "own", "run", "should", "so", "success", "still", "than", "that", "the",
    "their", "them", "then", "there", "they", "this", "to", "up", "use", "was",
    "way", "we", "what", "when", "which", "who", "why", "will", "with", "won",
    "you", "your", "churn", "dead", "issue", "team", "teams", "work",
}

WORD_RE = re.compile(r"[a-z0-9]+")


def normalise_category(category: str | None) -> str:
    key = (category or "").strip().lower()
    if not key:
        return ""
    return CATEGORY_ALIASES.get(key, key)


def tokenise(*parts: str | None) -> set[str]:
    tokens: set[str] = set()
    for part in parts:
        if not part:
            continue
        for word in WORD_RE.findall(part.lower()):
            if len(word) > 2 and word not in STOPWORDS:
                tokens.add(word)
    return tokens


def load_hub_membership(source: Path = TOPIC_HUBS_TS) -> dict[str, str]:
    """Map issue slug -> topic hub slug from the curated topicHubs.ts reads.

    The hub lists are hand-picked by the editor, so they are the most reliable
    topical signal available. Parsed rather than duplicated to keep one source
    of truth.
    """
    if not source.exists():
        return {}
    text = source.read_text(encoding="utf-8")
    membership: dict[str, str] = {}
    # Each hub object opens with `slug: "<hub>"` and later lists reads, each of
    # which also opens with `slug: "<issue>"`. Walking the slugs in document
    # order and tracking `reads:` boundaries attributes each read to its hub.
    hub_slug: str | None = None
    in_reads = False
    for line in text.splitlines():
        stripped = line.strip()
        match = re.match(r'slug:\s*"([^"]+)"', stripped)
        if stripped.startswith("reads:"):
            in_reads = True
            continue
        if stripped.startswith("tool:"):
            in_reads = False
            continue
        if match:
            if in_reads:
                if hub_slug:
                    membership.setdefault(match.group(1), hub_slug)
            else:
                hub_slug = match.group(1)
                in_reads = False
    return membership


def hub_for_slug(slug: str, membership: dict[str, str]) -> str | None:
    return membership.get(slug)


def _score(a: dict, b: dict, membership: dict[str, str]) -> float:
    """Topical closeness of issue b to issue a. Higher is closer."""
    score = 0.0

    # Curated hub membership must dominate: the category and token terms cap
    # out at 10.0 combined, so a shared hub always outranks them.
    hub_a, hub_b = membership.get(a["slug"]), membership.get(b["slug"])
    if hub_a and hub_a == hub_b:
        score += 20.0

    if a["_cat"] and a["_cat"] == b["_cat"]:
        score += 4.0

    shared = a["_tokens"] & b["_tokens"]
    union = a["_tokens"] | b["_tokens"]
    if union:
        score += 6.0 * (len(shared) / len(union))

    return score


def build_related_graph(
    items: list[dict],
    membership: dict[str, str] | None = None,
    k: int = RELATED_PER_ISSUE,
    min_inbound: int = MIN_INBOUND,
) -> dict[str, list[str]]:
    """Return slug -> ordered list of related slugs.

    Guarantees, for any archive of at least k + 1 issues:
      * every issue links out to exactly k others (never itself);
      * every issue receives at least `min_inbound` inbound links, provided
        min_inbound <= k and the archive is large enough to allow it.
    """
    membership = membership if membership is not None else load_hub_membership()

    published = sorted(
        (dict(item) for item in items if item.get("slug")),
        key=lambda item: item["slug"],
    )
    if len(published) <= 1:
        return {item["slug"]: [] for item in published}

    k = min(k, len(published) - 1)

    for item in published:
        item["_cat"] = normalise_category(item.get("category"))
        item["_tokens"] = tokenise(item.get("title"), item.get("excerpt"))

    by_slug = {item["slug"]: item for item in published}
    slugs = [item["slug"] for item in published]

    # Full ranking per issue, so the repair pass can reach past the top k.
    ranked: dict[str, list[str]] = {}
    for item in published:
        others = [o for o in published if o["slug"] != item["slug"]]
        # Sort by score desc, then slug asc — deterministic, date-independent.
        others.sort(key=lambda o: (-_score(item, o, membership), o["slug"]))
        ranked[item["slug"]] = [o["slug"] for o in others]

    related: dict[str, list[str]] = {s: list(ranked[s][:k]) for s in slugs}

    in_degree: dict[str, int] = defaultdict(int)
    for targets in related.values():
        for target in targets:
            in_degree[target] += 1

    # Total edges are n*k over n nodes, so mean in-degree is k; any floor at
    # or below k is reachable by redistribution.
    achievable = min(min_inbound, k)

    # Repair pass: pull under-linked issues into the related set of whichever
    # issue they are most similar to, displacing a target that has links to
    # spare. Deterministic order so the graph is reproducible.
    for slug in sorted(slugs, key=lambda s: (in_degree[s], s)):
        guard = 0
        while in_degree[slug] < achievable and guard < len(slugs) * k:
            guard += 1
            host = _find_host(slug, ranked, related, in_degree, achievable)
            if host is None:
                break
            displaced = _weakest_displaceable(
                host, related, in_degree, achievable, by_slug, membership
            )
            if displaced is None:
                break
            related[host][related[host].index(displaced)] = slug
            in_degree[displaced] -= 1
            in_degree[slug] += 1
            # Keep each host's list in descending topical order for display.
            related[host].sort(
                key=lambda t: (-_score(by_slug[host], by_slug[t], membership), t)
            )

    return {slug: related[slug] for slug in slugs}


def _find_host(
    slug: str,
    ranked: dict[str, list[str]],
    related: dict[str, list[str]],
    in_degree: dict[str, int],
    achievable: int,
) -> str | None:
    """The issue most similar to `slug` that can afford to link to it."""
    for candidate in ranked[slug]:
        if slug in related[candidate]:
            continue
        if any(in_degree[t] > achievable for t in related[candidate]):
            return candidate
    return None


def _weakest_displaceable(
    host: str,
    related: dict[str, list[str]],
    in_degree: dict[str, int],
    achievable: int,
    by_slug: dict[str, dict],
    membership: dict[str, str],
) -> str | None:
    """The least topical target on `host` that has inbound links to spare."""
    spare = [t for t in related[host] if in_degree[t] > achievable]
    if not spare:
        return None
    spare.sort(key=lambda t: (_score(by_slug[host], by_slug[t], membership), t))
    return spare[0]


def graph_stats(related: dict[str, list[str]]) -> dict:
    in_degree: dict[str, int] = {slug: 0 for slug in related}
    for targets in related.values():
        for target in targets:
            in_degree[target] = in_degree.get(target, 0) + 1
    counts = sorted(in_degree.values())
    return {
        "issues": len(related),
        "orphans": sum(1 for c in counts if c == 0),
        "min_inbound": counts[0] if counts else 0,
        "max_inbound": counts[-1] if counts else 0,
        "total_edges": sum(len(t) for t in related.values()),
    }


if __name__ == "__main__":  # pragma: no cover - manual inspection helper
    import sys

    payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    graph = build_related_graph(payload)
    print(json.dumps(graph_stats(graph), indent=2))
