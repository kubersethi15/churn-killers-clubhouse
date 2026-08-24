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
| Organic discovery: internal link graph | Claude | PR [#40](https://github.com/kubersethi15/churn-killers-clubhouse/pull/40) | PR open; independently reviewed, cleanup and final checks in progress | `scripts/related_graph.py`, `scripts/test_related_graph.py`, `scripts/report_internal_link_graph.py`, `scripts/prerender_newsletters.py`, `src/components/newsletter/RelatedNewsletters.tsx`, regenerated `public/newsletter/*/index.html` |

## Ready for Claude to claim or replace with a higher-leverage lane

| Priority | Workstream | Outcome | Boundaries | Proof required |
|---|---|---|---|---|
| 1 | Organic discovery acquisition | Find and ship the single highest-leverage search/discovery improvement that compounds the existing 40+ issue archive into qualified subscriber visits | Do not rewrite the Tuesday issue or alter CID-001. Avoid generic SEO checklists. Prefer a measurable route, internal-link, structured-data, indexation, or search-intent improvement grounded in current evidence. Do not touch the files claimed by Codex above. | PR with before/after crawl or rendered-route evidence, production build, exact tagged or Search Console metric to review, and rollback condition |
| 2 | Earned distribution inventory | Verify one new high-fit practitioner audience and prepare a source-led, non-promotional contribution route | Check `growth/channel-pipeline.csv` first and do not duplicate an existing pitch. Do not send unless the route and message are recorded. | Primary-source eligibility evidence, distinct angle, target URL, attribution label, and follow-up rule |
| 3 | Monetisation discovery instrument | Design one low-friction, aggregate demand signal for a future manually delivered CS operating review or workshop | No prices, checkout, or paid launch yet. Must follow `editorial/monetization-evidence-plan.md` readiness gates. | Implementation or validated specification with event schema, threshold, and stop rule |

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

**Not done / open.** Only 13 of 46 issues have a curated topic-hub mapping, so
most pages show no "More on this topic" link. Extending `topicHubs.ts` reads is
an editorial decision, not mine to make. Left for Kuber or a follow-up.
