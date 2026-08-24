# Costly-problem ledger (CG-09)

**Instrument:** `scripts/report_costly_problems.py`. Aggregate counts only.

## Field dictionary

| Field | Meaning | Source |
|---|---|---|
| problem | One of the five topic hubs | `src/data/topicHubs.ts` |
| site_visit | Page views on the hub or its issues | `growth_events` |
| vault_open | `resource_open` on the hub's tool | `growth_events` |
| classes | Independent signal classes at or above threshold | derived |
| manual classes | LinkedIn engagement, approved reply themes, reader-pulse, CS Analyzer demo behaviour | entered by hand, aggregate only |

The taxonomy is the existing five topic hubs. Inventing a second one would make
the ledger disagree with the site, and `resource_open` already records
`topic:<hub>`, so the instrumentation was pointing this way already.

## Thresholds

- A signal class counts only at **3 or more events**. Below that it is noise.
- **Gate 1 needs 2 independent classes.** Volume from one surface is not
  repetition; it is one surface. A single strong post is explicitly insufficient
  under the monetization evidence plan.

## No PII path

No identity, no reply text, no email, no viewer or engager data. The ledger can
answer which problem and how often. It cannot answer who, by construction.

## Corrections applied under BC-01

The first version of this ledger had two flaws, both fixed:

1. **Session deduplication.** Weight is now unique sessions, not raw events. One
   reader refreshing five times is one session.
2. **One on-site class, not two.** Site visits and Vault opens are both
   first-party on-site behaviour, so they are a single signal class. The earlier
   version counted them as two independent classes, which would have let one
   behaviour satisfy Gate 1's two-signal rule on its own. A genuine second class
   must come from a different surface: LinkedIn, approved replies, reader-pulse,
   or Analyzer demo behaviour, all entered by hand.

## Contamination: only what is verified

**Verified.** `trackGrowthEvent` was guarded solely by `import.meta.env.DEV`,
which is false in any production build including localhost `vite preview`. The
table grew from 353 to 572 rows during one agent working session. Both facts are
directly observable.

**Not claimed.** Which specific rows are agent versus reader. No host or
environment field exists on the row, so real production traffic in the pre-guard
window is valid but not separable from agent traffic. The window is therefore
set aside wholesale rather than any row being labelled, which is a coarser but
honest treatment.

**The cutoff.** `growth_measurement_state.growth_events_clean_from` is set to
`2026-08-24T05:10:00Z`, just after the #90 merge and after the last observed
pre-guard event at 04:50:52Z. The report drops every row before it: on the live
table that is 584 of 595 rows dropped, 11 kept. Advance the cutoff to the
confirmed production-deploy time if it is later than the merge.

## Current state: blocked, and the data is not yet trustworthy

**Gate 0 is not met, for two separate reasons.**

First, the written reason: the seven-day Tuesday baseline (CID-001) does not
close until 1 September 2026. No commercial research request may be raised
before then.

Second, and discovered while building this: **`growth_events` is contaminated.**
`trackGrowthEvent` was guarded only by `import.meta.env.DEV`, which is false in
any production build including one served by `vite preview` from localhost. Both
agents have been running preview servers against production Supabase all day.

The contamination is visible in the shape of the data. The table holds hundreds
of page views and 153 direct sessions from roughly two days, on a property
Search Console credits with 18 clicks in three months. Topic hubs show a near
1:1 page-view to resource-open ratio, which no real audience produces.

The guard is fixed in the same branch. **Events recorded before that fix cannot
be separated into real and agent traffic**, because no host or environment field
exists on the row. They should be treated as unusable for any commercial
inference.

## What this means for existing readouts

Every measurement reading this table is affected: CID-001, the LinkedIn funnel
report, CID-006, referral measurement, and this ledger. None of them were wrong
to be built. All of them need a clean measurement window before their numbers
mean anything.

The LinkedIn session counts previously reported, 2 and later 5, are inside the
contaminated window and should not be quoted.

## Review cadence

Weekly, after the Tuesday readout. Advance a problem only on evidence, never on
one strong post. Do not name a price, publish an offer, invite buyers, or make a
delivery promise. Those need Kuber's explicit approval and Gates 1 through 4,
none of which are open.

## First trustworthy read

Seven days of clean data after the guard deploys, so from **31 August 2026** at
the earliest, and after CID-001 closes on 1 September. Both conditions, not
either.
