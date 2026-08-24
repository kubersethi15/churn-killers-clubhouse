# Churn Is Dead agent coordination

**Last updated:** 24 August 2026

This is the shared coordination board for Claude and Codex. It contains no subscriber identities or customer PII.

The durable execution queue is [`growth/full-growth-backlog.md`](full-growth-backlog.md). It gives both agents enough sequenced work across acquisition, activation, retention, partnerships, product-led loops, and monetisation; claim only one non-overlapping item at a time.

## Shared objective

Increase qualified Churn Is Dead subscribers and organic traffic, improve activation and retention, and build an evidence-led path to monetisation. The website is canonical. Preserve Kuber Sethi's voice, never invent personal experience or results, and measure aggregate outcomes.

## Joint growth mandate

Claude and Codex both have the full growth mandate. Claude is not limited to organic search, and Codex is not limited to the website or editorial pipeline. Either agent may claim and execute a high-leverage, non-overlapping workstream across:

- audience acquisition and borrowed distribution;
- conversion, activation, referral, and retention loops;
- partnerships, communities, podcasts, directories, and platform-native distribution;
- growth tooling, measurement, and automation;
- evidence-led customer discovery and eventual monetisation tests.

The ready-to-claim list is a starting queue, not a ceiling. An agent may add and claim a better workstream when current evidence supports it. Growth is judged by qualified traffic, acquired subscribers, retained subscribers, useful reader actions, and credible commercial demand, not by output volume.

## Operating rules

1. Pull `main`, read `CLAUDE.md`, `editorial/editorial-contract.md`, `growth/channel-operating-system.md`, and this file before starting.
2. Claim one unclaimed workstream below in the branch that will deliver it. Do not edit files currently claimed by another agent.
3. Use a branch and PR. Include tests, aggregate success metrics, rollback conditions, and any external action taken.
4. Do not change CID-001's Tuesday post, tracked link, site CTA, or channel mix before its baseline closes on 1 September 2026 at 18:14 Sydney.
5. Relationship work, research, partner pitching, and separately labelled always-on infrastructure may continue. Log consequential external actions in `growth/action-log.md` so another agent does not repeat them.
6. Never expose subscriber emails, viewer identities, customer transcripts, or other PII in issues, PRs, logs, screenshots, or shared documents.

## Active ownership

| Workstream | Owner | Branch or surface | Status | Claimed files / boundary |
|---|---|---|---|---|
| Subscriber referral loop v2 | Codex | PR [#36](https://github.com/kubersethi15/churn-killers-clubhouse/pull/36), merged as `b7d1b23` | Backend live; public UI awaiting the next Lovable publish | No longer file-claimed. Do not run performance conclusions until the public share surfaces are live and the minimum-evidence gates in `LOOP-02` are met. |
| Tuesday CID-001 launch | Codex + social manager | Website at 18:00 Sydney; LinkedIn at 18:15 | Approved and scheduled | Do not alter copy, CTA, UTM, timing, or add a second distribution surface through baseline close |
| Partner outreach and replies | Codex | Gmail, LinkedIn, shared Growth Partnerships sheet | Active | Customer Success Collective, Customer Success Network, Practical CSM, SaaS Therapy; follow-up dates are in `growth/channel-pipeline.csv` |
| ACQ-07 podcast outreach (staged) | Claude builds, Codex sends | `growth/podcast-outreach-acq-07` | Staged, awaiting dispatch by Codex | `growth/outreach-pitches.md` podcast sections, `growth/channel-pipeline.csv` rows 14-17, `editorial/author-experience.md` |
| Organic discovery: internal link graph | Claude | PR [#40](https://github.com/kubersethi15/churn-killers-clubhouse/pull/40), merged as `a04de10` | Complete; independently reviewed and merged | No longer file-claimed. Review Search Console impact from 7 September 2026; use `scripts/report_internal_link_graph.py` to remeasure after archive changes. |

## Ready for Claude to claim or replace with a higher-leverage lane

| Priority | Workstream | Outcome | Boundaries | Proof required |
|---|---|---|---|---|
| 1 | Search Console baseline and indexation evidence | Connect the verified domain property and establish page, query, click, impression, CTR, sitemap, and indexation baselines before the 7 September internal-link review | Requires a secure Search Console connection. Aggregate data only. Do not infer rankings from local crawls or change Tuesday's controlled acquisition surface. | Dated aggregate baseline, sitemap/indexation evidence, non-brand `/newsletter/*` segment, review query, and rollback or escalation rule |
| 2 | Problem-led archive and hub coverage | Map the remaining useful archive to non-duplicative reader problems and identify the smallest curated hub extension worth shipping | Do not generate thin SEO pages or mechanically assign every issue. Preserve editorial meaning and check `topicHubs.ts` plus the merged graph first. | Coverage map, cannibalisation check, proposed file boundary, measured internal-link effect, and explicit no-change cases |
| 3 | Earned distribution inventory | Verify one new high-fit practitioner audience and prepare a source-led, non-promotional contribution route | Check `growth/channel-pipeline.csv` first and do not duplicate an existing pitch. Do not send unless the route and message are recorded. | Primary-source eligibility evidence, distinct angle, target URL, attribution label, and follow-up rule |
| 4 | Monetisation discovery instrument | Design one low-friction, aggregate demand signal for a future manually delivered CS operating review or workshop | No prices, checkout, or paid launch yet. Must follow `editorial/monetization-evidence-plan.md` readiness gates. | Implementation or validated specification with event schema, threshold, and stop rule |

## Handoff format

When an agent completes or pauses a workstream, update its row and add:

- branch and PR URL;
- files changed;
- tests and live verification;
- aggregate metric and review date;
- external actions taken;
- remaining risk or blocker;
- suggested next owner action.

If two branches conflict, the agent who claimed the file first keeps ownership. The other agent leaves a note here and moves to a non-overlapping workstream.

## Claude handoff — organic discovery, internal link graph

**Branch:** `growth/topical-internal-link-graph`

**Merged:** PR [#40](https://github.com/kubersethi15/churn-killers-clubhouse/pull/40), `a04de10`

**Problem, measured.** `RelatedNewsletters` selected the three most recent
issues in the same category rather than the three most related. Measured over
the prerender catalogue on 24 August 2026: 23 of 46 published issues had zero
inbound internal links, while three issues held 16 each and three more held 9.
The only inbound link for half the archive was the archive listing itself. The
set was also recency-ordered, so it was rewritten every Tuesday and the graph
never accumulated. Prerendered issue pages carried no lateral links at all,
only "All issues" and "Subscribe".

**Change.** A build-time topical link graph (`scripts/related_graph.py`)
scored by curated `topicHubs.ts` membership first and title/excerpt overlap
second, with category aliases folded so Strategy and "Strategy & Impact" are
one cluster. Nothing in the scoring depends on a date, so the graph is stable
between archive changes. A repair pass guarantees a minimum inbound count, so
no issue can be orphaned again. The set is embedded in each prerendered page
and read by the React component, so the rendered DOM matches the crawlable
HTML with no Supabase round-trip inside the render budget.

**Aggregate result.** Issues with zero inbound links: 23 to 0. Inbound
distribution: `{0:23, 1:4, 2:3, 3:10, 9:3, 16:3}` to `{3:46}`. Lateral internal
links: 115 to 138. Re-measure any time with
`python3 scripts/report_internal_link_graph.py`.

**Verification.** 9/9 related-graph tests pass; `tsc --noEmit` clean;
`vite build` plus all three post-build scripts pass, including
`check_public_routes.py` on 15 routes. Rendered DOM confirmed to match the
prerendered payload on a local production preview. No app console errors.

**Metric and review date.** Google Search Console, aggregate only: indexed
page count, non-brand impressions, and average position for `/newsletter/*`.
Review from 7 September 2026, at least seven days after Google recrawls. This
is one changed variable and it is independent of CID-001's Tuesday post, CTA,
tracked link, and channel mix, none of which this branch touches.

**Rollback.** Revert the branch. `RelatedNewsletters` falls back to the
Supabase recency query automatically when the embedded payload is absent, so a
revert restores previous behaviour with no data migration.

**Next owner action.** Claim the Search Console baseline first if that account
is connected. Otherwise claim a read-only problem-led hub coverage audit or a
new earned-distribution route. Only 13 of 46 issues have a curated topic-hub
mapping, so most pages show no "More on this topic" link; extending
`topicHubs.ts` requires editorial judgment and should not be done mechanically.

## Claude handoff — ACQ-07 podcast outreach, staged for Codex to send

Kuber confirmed on 24 August 2026 that Claude stages outreach and **Codex sends
it on his behalf**. This section is the dispatch instruction.

### Send these two

Both are new routes. Neither duplicates an existing pipeline row, and both use a
distinct operating idea not used in any pitch already sent.

1. **The Digital CX Podcast** to `alex@digitalcustomersuccess.com`. Angle: CS
   Decision Rights Map. The address was verified first-party on
   `https://digitalcustomersuccess.com/contact/` on 24 August 2026. Copy is in
   `growth/outreach-pitches.md`.
2. **Retention Ranch** through the contact form at
   `https://www.retentionranch.com/contact`. The guest criteria at
   `https://www.retentionranch.com/guest` and the contact form were both
   verified first-party on 24 August 2026. Angle: Value Proof Cadence. Copy is
   in the same file.

Follow up once each on 7 September 2026 if no reply, then stop. Do not send a
second nudge. Log the send in `growth/action-log.md` with route, date and
status only.

### Do not send these two

- **Unchurned (UpdateAI)**: no first-party guest route exists. Relationship
  route through LinkedIn only.
- **The Customer Success Channel (Planhat)**: the show is mid host transition
  and the only address found is from an aggregator. Verify the current host and
  a first-party route first.

### Constraints carried into the copy

- The author-experience ledger was empty, so neither pitch claims any Kuber
  experience, customer outcome, or commercial result. Both are built on the
  published operating artifacts, which are verifiable.
- Kuber confirmed roughly 8,200 LinkedIn followers and active Premium on
  24 August. Both are now recorded in `editorial/author-experience.md` as
  bounded, re-confirmable claims. **Neither pitch cites the follower count**: a
  distinct operating idea is stronger currency with practitioner shows, and
  reach is not evidence of results.
- Neither pitch touches CID-001's Tuesday post, tracked link, site CTA, timing
  or channel mix. Outreach and relationship work are explicitly permitted
  during the baseline window.

### Metric and review

Aggregate only: replies received, invitations accepted, and tagged resource
visits from any resulting episode. Review 8 September 2026, after the single
follow-up date. Stop rule per ACQ-07: one tailored follow-up only.

### Open, needs Kuber

The author-experience ledger is otherwise still empty. It is the single biggest
constraint on pitch strength, because every pitch has to route around the fact
that nothing about Kuber's own operating history can be stated. The
confirmation queue in `editorial/author-experience.md` lists the five items.
Answering even two would materially improve every future pitch.

## Shared request — Search Console archive query data

No Google Search Console connection or baseline has been verified as of
24 August 2026. That external-data gap is currently the binding constraint on
three separate pieces of archive work. Codex or Claude may fulfil this request
after obtaining secure access; neither agent should infer the figures from a
local crawl or state that the baseline exists before the export is verified.

**Requested, aggregate and counts-only.** No PII is involved, but keep the
output to figures and URLs only.

For the last three months, restricted to `/newsletter/*`, `/topics/*` and
`/playbook`:

1. per-page impressions, clicks, CTR and average position;
2. indexed versus crawled-not-indexed status per URL;
3. the top non-brand queries, with the URL Google currently ranks for each;
4. for the query "customer health score" and close variants, **which URL Google
   currently selects**. This one is the decisive input.

**What it unblocks.**

- The health-score consolidation recorded in `growth/archive-problem-map.md`.
  Item 4 tells us which of the five competing pages Google already treats as
  canonical, which turns an editorial guess into a measurement. Per SEO-01 no
  ranking claim should be made without it, so the decision stays parked until
  this lands.
- SEO-05, refreshing high-impression low-CTR titles, which cannot be targeted
  without per-page CTR.
- Verifying the #40 internal link graph actually moved indexation, reviewable
  from 7 September.

**Format.** A counts-only table in `growth/search-console-baseline.md` is
sufficient. No screenshots, no per-query export dumps.

**Priority.** This is the next external-data dependency. Reading aggregate
Search Console data does not change CID-001's controlled acquisition surface,
so it does not need to wait for that baseline to close. Do not repeatedly
request access; continue with another unclaimed growth lane while disconnected.
