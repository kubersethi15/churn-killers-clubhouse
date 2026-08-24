# BC-03: archive credibility-and-utility triage

**Run:** 25 August 2026, against the live catalog (41 published issues) using
the BC-02 scorecard dimensions, the Search Console baseline, and structural
checks (length, tool route, source citations, ledger era).

## The structural finding: three eras, not 41 problems

| Era | Issues | Shape | Verdict class |
|---|---|---|---|
| 1: May-Sep 2025 | 14 | 300-700 words, no tool route, no sources | investigate or refresh |
| 2: Dec 2025-Jul 2026 | 24 | 1,100-2,600 words, tool route, no cited sources | keep, archive note covers sourcing |
| 3: Aug 2026+ (ledger) | 3 | Full evidence ledger, tools, sources | keep |

Only one issue in the archive cites an external source outside the ledger era.
The existing archive note on pre-ledger issues handles this honestly at the
page level, so era 2 does not need per-issue repair.

## Status for every issue

**Keep (27):** all era 2 and era 3 issues. Substantial, tooled, honest archive
note where pre-ledger. Named: digital-cs-coverage-silence,
renewal-not-yours-change-order-is, csm-title-liability-rebrand-wont-fix-it,
nrr-no-csm-touched-consumption-illusion, you-dont-own-nrr-you-rent-it-from-pricing,
onboarding-only-renewal-you-control, renewal-clause-lawyers-wrote-cs-forgot,
cs-platform-org-chart-you-cant-edit, expansion-recession-not-retention-problem,
csm-promoted-to-babysitter-agent-supervisor, renewal-cliff-data-intelligence-blind-spot,
cs-teams-courage-problem, 3-things-your-cfo-knows-about-cs,
fire-your-qbr-heres-what-to-do-instead, fire-your-qbr-what-to-do-instead,
stopped-tracking-health-scores, case-against-customer-health-scores,
ai-customer-success-firing-people, your-ai-strategy-is-just-expensive-layoffs,
cs-platform-expensive-spreadsheet, cs-metrics-performance-theater,
health-scores-are-astrology, stop-calling-yourself-strategic,
the-revenue-ownership-trap, ai-wont-save-customer-success,
customer-success-doesnt-deserve-to-survive, ai-didnt-kill-customer-success.

**Refresh (2), both era 1 with real search attention:**
- ai-wont-fix-customer-experience: position 4.5, 15 impressions, 450 words, no
  tool, no next action. Page-one ranking on the thinnest article in the
  archive. The single biggest repair opportunity.
- your-health-score-wont-save-you: the only pre-tool issue in the health-score
  cluster with any impressions; 8k chars but no tool route.

**Investigate (12), era 1 with no measured attention:** renewal-vs-calendar,
the-ai-trap-in-customer-success, the-expansion-moment-hiding-in-plain-sight,
co-op-renewal-framework, cs-leader-to-ceo, onboarding-is-the-first-revenue-moment,
customer-momentum-over-health-score, customer-predictability-revolution,
usage-is-not-success, their-timeline-not-yours, the-perfect-kickoff-call,
be-strategic-no-one-tells-you-how. No reader harm today because almost no
readers arrive; revisit only if Search Console shows movement. Two of these
(customer-predictability-revolution, onboarding-is-the-first-revenue-moment)
are the crawled-not-indexed pair from the baseline and would be the first to
graduate to refresh if attention appears.

**Consolidate (0).** The health-score consolidation was already evaluated and
closed against evidence on 24 August: zero measured query demand means nothing
to consolidate. The two fire-your-qbr slugs are genuinely different articles.
Nothing else overlaps enough to merge. This triage does not reopen closed
decisions.

## Top ten repairs, ranked by reader harm x opportunity

1. Refresh ai-wont-fix-customer-experience (page one, thinnest content)
2. Refresh your-health-score-wont-save-you (cluster's only traffic, no tool)
3. Pulse benchmark (BC-02 change 1) so future issues carry original evidence
4. Diagram-per-issue (BC-02 change 3) starting with the two refreshes
5. Title/description on ai-didnt-kill-customer-success (45 imp, pos 6.8) — owned by Codex's active SEO-05 row, listed not claimed
6. Title/description on cs-platform-org-chart (25 imp, pos 16.4) — same SEO-05 ownership
7. Graduate crawled-not-indexed pair if impressions appear
8. One quoted outside operator per new issue (BC-02 gap 5), forward-looking
9. Era-1 investigate set: hold, re-check at next GSC read
10. Nothing else meets the bar; padding this list would be theater

## Repairs implemented in this PR: zero, deliberately

BC-03 allows up to two isolated repairs. Both top repairs are editorial
rewrites of Kuber's published words. The rules I am holding to: no issue is
rewritten merely because it is old, refreshes need voice and named approval,
and titles/descriptions belong to the active SEO-05 row. The mechanical layer
(orphan links, tool back-routes, hub membership, archive notes, lateral links)
was already repaired across this week's PRs, so no safe mechanical repair
remains.

Instead, the two refresh briefs below are staged for editorial execution by
Kuber or Codex's editorial lane.

### Refresh brief 1: ai-wont-fix-customer-experience

Evidence: position 4.5, 15 impressions, zero clicks; 450 words; no tool.
Keep: the thesis and title (they earned the ranking). Add: the argument's
mechanism (why AI amplifies a broken process), one diagram, a route to the
AI Exposure Score (the natural tool for exactly this reader), sources per the
ledger. Target: 1,200+ words at scorecard 9+. Do not change the slug.

### Refresh brief 2: your-health-score-wont-save-you

Evidence: the only health-score issue with impressions; no tool route.
Keep: thesis. Add: route to the health-score-alternatives hub and the
Customer Predictability tool, one diagram, ledger-grade sourcing. Do not
change the slug; do not merge with the other health-score issues (closed
decision).

## Review

Re-run this triage after the next Search Console read (7 September). The
statuses of the investigate set move only on measured attention.
