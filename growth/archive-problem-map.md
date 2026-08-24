# Archive problem-map decision

**Date:** 24 August 2026  
**Lane:** SEO-03, problem-led archive and hub coverage  
**Scope:** aggregate archive structure only; no reader or subscriber data

## Baseline

The catalogue contains 47 issue packages, including the approved future issue. Before this change, four curated topic hubs mapped 13 issues. The other issues were still reachable through the archive and the merged internal-link graph, but most had no problem-led collection that explained why a reader should continue.

## Problem clusters reviewed

| Reader problem | Representative archive material | Decision |
|---|---|---|
| Replace account health scores with actionable signals | `case-against-customer-health-scores`, `usage-is-not-success`, `health-scores-are-astrology`, plus several overlapping health-score issues | Ship one focused hub. The problem, decision and existing predictability tool are coherent. Curate three distinct reads rather than collecting every near-duplicate. |
| Make CSM work genuinely strategic | `be-strategic-no-one-tells-you-how`, `stop-calling-yourself-strategic`, `csms-task-collectors-not-problem-solvers`, `cs-team-hoarding-work` | Hold. Several historical pieces contain first-person or numerical claims that are not in the current evidence ledger. Do not amplify them through a new hub until the useful operating ideas are re-verified. |
| Design onboarding around customer decisions | `the-perfect-kickoff-call`, `their-timeline-not-yours`, `onboarding-is-the-first-revenue-moment` | Hold. The material is relevant but currently mixes ceremony, trust and timeline problems; it does not yet support one clean decision and tool without editorial rework. |
| Separate expansion and revenue mechanics from CS accountability | `expansion-recession-not-retention-problem`, `nrr-no-csm-touched-consumption-illusion`, `the-revenue-ownership-trap` | Hold. This is already substantially covered by Renewal Economics. A second route would risk intent overlap before Search Console evidence shows a separate reader need. |
| Redesign CS work around AI | Several AI and role-design issues | No change. `ai-role-design` already owns this problem and should be measured before another route is created. |

## Shipped path

`/topics/health-score-alternatives` answers one decision: **What observed change would make us intervene differently this week?**

The path deliberately curates only:

1. why blended health scores fail to identify an intervention;
2. why usage is not equivalent to customer success;
3. how a predictability view changes the operating model.

It points to the existing Customer Predictability and renewal-risk tools. It adds no new claims, gated asset, form, or competing CTA. Historical issues retain the existing archive evidence note.

## Proof and review rule

- Build proof: the hub must have a crawlable production entrypoint, a sitemap entry, valid referenced issue slugs, and no duplicate issue ownership across hubs.
- Aggregate product signals: `resource_open` for `topic:health-score-alternatives` and `topic-tool:health-score-alternatives`.
- Search proof after Search Console is connected: indexed status, non-brand impressions, clicks and CTR for the hub and its three linked issues.
- Earliest decision review: 21 September 2026, allowing a crawl and observation window after deployment.
- Keep the hub as archive infrastructure while it is crawlable and accurate. Revise its framing if it receives at least 20 organic entrances but produces no linked-issue or tool actions. Revert if it creates a route, sitemap or navigation regression.

## Next archive action

Do not add another hub from titles alone. Establish Search Console evidence first, then re-verify the strongest historical strategic-work cluster before deciding whether it deserves a public collection.
