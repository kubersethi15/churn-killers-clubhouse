# CG-07: post-to-asset continuity across LinkedIn

**Run:** 24 August 2026, from the signed-in account, read only. Aggregate
counts only. No viewer, follower or engager identity was inspected or recorded.

## Headline

**None of the five most recent posts contains a route to churnisdead.com.**

Not a weak route. None. The only outbound links in any post body are company
mentions of Gainsight and ChurnZero, which route to their pages rather than his.

| # | Post, opening line | Reactions | Comments | Route to owned site |
|---|---|---:|---:|---|
| 1 | "My AI agent told me it had updated six records" | 30 | 14 | none |
| 2 | "Three numbers from this quarter's CX research" | 16 | 12 | none |
| 3 | "CS teams reporting to a CRO jumped from 24% to 33%" | 20 | 8 | none |
| 4 | "Every lost account has three people pointing at each other" | 7 | 4 | none |
| 5 | "Nine mistakes almost every founding CS hire makes" | 39 | 27 | none |

Roughly 112 reactions and 65 comments across the five, and no owned destination
from any of them.

## The gap, with the caveat stated first

**The caveat matters more than the ratio.** Site instrumentation began on
23 August, so first-party data covers about two days, while the Premium figures
cover seven. These are not the same window and the comparison is indicative
only.

| Source | Figure | Window |
|---|---:|---|
| Post impressions (Premium, aggregate) | 3,678 | 7 days |
| Profile views (Premium, aggregate) | 1,531 | 7 days |
| Search appearances (Premium, aggregate) | 133 | 7 days |
| LinkedIn-tagged sessions on site | 5 | ~2 days of data |

Even normalised, the shape is the same: a large amount of attention on LinkedIn
and a very small number of arrivals. Five sessions is below the 20-action floor,
so this stays descriptive. No conversion rate is claimed.

The mechanism is not mysterious. The only standing route from LinkedIn to the
site is the Premium profile button, which is passive: the reader has to leave
the post, open the profile, and click. Every post is a dead end by default.

## Top three repair opportunities, ranked

**1. Decide the route at authoring time, for future posts only.**
Two of the five map onto assets that already exist or are already planned. Post
4, on everyone blaming each other after a lost account, is the
`Churn_Attribution_Matrix_Audit` in the vault today. Post 1, on an AI agent
confidently reporting work it never performed, is the CS Decision Rights Map
already scheduled for 22 September. The fix is a step in the authoring
checklist, not a campaign.

**2. Do not retrofit calls to action onto the five published posts.**
None of them promised a resource. Editing them after the fact to add one is
manufacturing demand, it is explicitly against the sprint stop rule, and on a
feed it reads as exactly what it is. Recommended action here is deliberately
nothing.

**3. Treat the profile button as a floor, not the route.**
It is the correct always-on control and CID-006 will test its destination after
CID-001 closes. But a passive profile surface cannot carry a channel where the
attention lives in the feed. This is context for CID-006, not a change to make
now.

## What this does not recommend

No mass direct messages. No CTA added to any existing post. No change to
CID-001's surfaces, copy, timing or mix. No gating of any free tool.

## Metric and stop rule

Aggregate only: LinkedIn-tagged sessions, `resource_open`, and acquired
subscribers by campaign label. **Minimum 20 tagged actions before any rate is
stated.** Re-read once instrumentation covers a full seven days so the site and
Premium windows finally align, which is the first point a real comparison
becomes possible.
