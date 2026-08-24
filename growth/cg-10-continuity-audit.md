# CG-10: problem-to-tool continuity audit

**Run:** 24 August 2026. Reproducible with
`scripts/audit_content_tool_continuity.py` using the live delivery catalogue.

## Corrected baseline

| Measure | Count |
|---|---:|
| Published issues | 41 |
| Issues linking a tool directly | 27 |
| Issues promising a resource but linking none in the body | **2** |
| Issues offering no detected next action | 12 |

The two explicit promise gaps are `their-timeline-not-yours`, which says a
duplicate-ready Notion template has been supplied, and
`the-perfect-kickoff-call`, which promises two companion playbooks. The
corresponding Notion resources already exist in the repository's playbook
migration. They are now rendered as Related Resources on those article routes
and as first-class entries in the Playbook Vault; no substitute resource or
new claim was invented.

## Tool-to-article route repair

The first implementation recovered exact PDF links from article bodies, but it
had three integrity defects:

1. the Vault discarded recovered metadata for existing static cards;
2. five repository-only slugs looked valid in static HTML but were absent from
   the live delivery table and failed after React hydration;
3. a transient database outage could reduce coverage and overwrite the checked-
   in manifest.

The corrective implementation merges exact manifest metadata into static
cards, emits backlinks only for slugs present in the live delivery table, and
refuses to rewrite the manifest when the live catalogue or mapping coverage
drops below a safety floor. An intentional deletion can use the explicit
`--allow-coverage-drop` override after review.

| | Corrected result |
|---|---:|
| PDF tools in manifest | 32 |
| PDFs linked to a live article | 26 |
| PDFs left without an asserted article source | 6 |

The six unmapped PDFs include the separate quarterly QBR framework and five
tools whose repository article shells are not backed by live delivery rows.
They remain downloadable without a false backlink. The Vault also includes the
three verified Notion resources above, bringing the rendered resource total to
37 without gating any tool.

## Verification and measurement

- live catalogue: 41 rows;
- generated manifest: 32 PDFs, 26 live article routes;
- focused generator failure and exact-link tests pass;
- focused runtime merge test covers null fill, stale-route replacement,
  supplemental cards, and curated-copy preservation;
- TypeScript and production build are the release gates.

Read aggregate `resource_open` events and playbook-to-article visits only after
20 Vault sessions. Do not infer subscriber growth from this repair alone. The
rollback is the corrective commit; the manifest remains generated and no free
tool was gated.
