# CG-10: problem-to-tool continuity audit

**Run:** 24 August 2026. Reproducible via
`scripts/audit_content_tool_continuity.py`.

## The premise was mostly wrong, and that is the useful finding

CG-10 assumed "traffic is wasted when an article names a problem but the next
action is a generic vault or unrelated subscribe prompt." Measured across all 41
published issues rather than the six requested:

| Measure | Count |
|---|---:|
| Issues linking a tool directly | 27 |
| Issues promising a resource but linking none | **0** |
| Issues offering no next action | 14 |

**There are no content repairs.** Every issue that promises the reader something
already links it. The editorial discipline here is sound and did not need fixing.

The 14 issues with no next action are counted, not listed as repairs. They never
promised one. Adding a call to action the author did not make is manufacturing
demand, which the sprint stop rule forbids, and it would degrade the voice.

Worth naming one temptation that was declined. `ai-wont-fix-customer-experience`
ranks at position 4.5 with 15 impressions and no clicks, which makes it the most
attractive place in the archive to bolt on a tool. It offers no resource and is
roughly 450 words. A keyword scan flags it as promising one, but the only match
is the phrase "automated playbooks" in ordinary prose. It was left alone.

## The real discontinuity was in the opposite direction

The gap was not article to tool. It was **tool back to article**.

All 32 vault PDFs carried `newsletter_slug: null`, so a reader who arrived at
the Playbook Vault, and it draws 52 search impressions at position 8.1, could
download a tool with no route to the thinking behind it.

`generate_playbook_manifest.py` already had the mapping logic. It resolves
through `editorial/issues/`, and only four issues use that newer authoring
format, so the other twenty-eight silently produced null. A coverage gap rather
than a bug.

## The repair

The link was never missing, only unread: those articles already link their own
PDF in the body. The generator now recovers it from that, so nothing is inferred
from titles and no editorial judgment is applied.

| | Before | After |
|---|---:|---:|
| Vault tools traceable to their issue | 0 | **31** |
| "From: [article]" back-links rendered | 2 | **30** |

One tool stays unmapped: `30-Minute-QBR-Framework-ChurnIsDead.pdf`. No article
links it, because it was distributed as a LinkedIn lead magnet rather than
attached to an issue. Mapping it is a genuine editorial decision and it runs
into the cadence question already recorded in the ledger: the closest candidate
is "The 30-Minute Monthly Business Review", which is a monthly review, while the
framework is quarterly. Left for Kuber.

## Verification

`tsc --noEmit` clean. Production build passes with all 17 crawlable routes
validated. Back-links confirmed rendering on a production preview: 30 present,
34 cards total.

## Metric and stop rule

Aggregate only: `resource_open` on vault tools, and page views on
`/newsletter/*` arriving from `/playbook`. **Minimum 20 vault sessions before
any rate is stated**, consistent with CID-001, LI-04 and CID-006.

One variable. No CTA added, no tool gated, no CID-001 surface touched.

**Rollback:** revert the generator change and rerun it. The manifest is
generated, so nothing needs hand-editing.

## Honest expectation

This will not move subscriber numbers soon. The vault draws 52 impressions a
quarter and the whole property earns 18 clicks. It is a real continuity repair
on a surface that barely has traffic yet, done because it was cheap and correct,
not because it is a growth lever. Search remains background per Kuber's
24 August channel decision.
