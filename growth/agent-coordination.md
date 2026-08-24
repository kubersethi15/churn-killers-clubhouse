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
| ACQ-07 podcast outreach | Claude staged, Codex verified and sent | PR [#42](https://github.com/kubersethi15/churn-killers-clubhouse/pull/42), merged as `63febe2`; Gmail | Two pitches sent and verified 24 August | No files remain claimed. Monitor replies; follow up once on 7 September if silent, then stop. |
| Organic discovery: internal link graph | Claude | PR [#40](https://github.com/kubersethi15/churn-killers-clubhouse/pull/40), merged as `a04de10` | Complete; independently reviewed and merged | No longer file-claimed. Review Search Console impact from 7 September 2026; use `scripts/report_internal_link_graph.py` to remeasure after archive changes. |
| SEO-05 single-page CTR diagnostic | Codex | Search Console and `growth/search-console-baseline.md` | Complete; no-change decision recorded 24 August | No files remain claimed. The page-filtered queries were too sparse or irrelevant to select a defensible intent. Recheck 21 September; then change at most one surface. |
| SEO-02 technical discovery audit | Claude | PR [#52](https://github.com/kubersethi15/churn-killers-clubhouse/pull/52) | Complete; no critical discovery blockers across 62 live sitemap URLs | No files remain claimed after merge. Recheck the missing live topic-hub route after deployment and review indexation on 7 September. |

## Claude rolling queue

**Re-ordered 24 August 2026 from the current evidence and Kuber's standing
growth mandate: earned distribution first while the completed SEO foundation
compounds.** ACQ-03 is now first, followed by MON-01 and LOOP-03. Scheduled
Search Console reviews still run; new SEO work does not displace active
audience acquisition without new evidence.

Claude should claim the first unblocked item, finish or explicitly park it, then
move to the next. A missing optional connection is not a reason to stop: complete
the repository and evidence work first, and record the exact access or live check
needed in the PR.

| Priority | ID | Workstream | Outcome | Boundaries | Proof required |
|---|---|---|---|---|---|
| 1 | ACQ-03 | New earned-audience route | Verify one new high-fit practitioner audience and stage a distinct, source-led contribution or appearance pitch. | Check `channel-pipeline.csv` and Gmail for duplicates first. Gmail access is optional for research and drafting; if not connected, stop before send and hand the verified draft to Codex. | First-party eligibility evidence, non-duplicative angle, target route, attribution label, exact follow-up rule, and sent/staged status |
| 2 | MON-01 | Costly-problem signal design | Turn existing aggregate replies, tool opens, and partner conversations into a minimal decision ledger for a future manually delivered operating review. | Follow `editorial/monetization-evidence-plan.md`. No prices, checkout, mass survey, or new product build. No private correspondence in Git. | Field definitions, source mapping, readiness threshold, stop rule, and the smallest safe implementation or a justified no-change decision |
| 3 | LOOP-03 | Welcome activation measurement audit | Establish whether the existing aggregate events can answer which welcome path is used: Start, Vault, diagnostic, reply, or no qualified action. Repair only missing or misleading aggregate instrumentation. | Supabase may be connected for aggregate counts, function logs, and safe verification. Never export or inspect subscriber email addresses or message content. Do not alter welcome copy during CID-001. | Event dictionary, live aggregate baseline if access exists, implementation/tests for any gap, minimum-evidence threshold, and one-variable follow-up |

Completed evidence tasks are deliberately absent from this queue. Search Console
baseline is complete in PR #47, health-score consolidation is closed in PR #48,
and the first topic-hub extension is complete in PR #43. Do not reopen them
without new measured evidence.

## Connection handoff

| System | Current use | When Claude needs it | Safe boundary |
|---|---|---|---|
| GitHub | Shared source of truth | Always connected for claims, branches, PRs, and handoffs | No secrets or private exports in commits, issues, or PRs |
| Supabase | Signup, activation, referral, and aggregate growth evidence | Connect for LOOP-03 live counts, function logs, migrations, or deployment verification | Aggregate queries only. Subscriber PII is not a research surface |
| Gmail | Partner replies and one-to-one earned distribution | Connect when ACQ-03 reaches duplicate checking, sending, or reply handling | Search the existing thread first. One pitch and one follow-up maximum |
| Search Console | Organic baseline and review windows | Use the checked-in aggregate baseline unless a live recheck is due | No screenshots, raw exports, or private query text in Git |
| Drive and Sheets | Social-manager calendar and partnership status | Connect only when a claimed task changes shared execution state | Preserve the manager's final-content sheet as operational truth |
| LinkedIn | Distribution, comments, and aggregate Premium evidence | Connect for an explicitly claimed LinkedIn task | One useful comment per thread. No viewer-identity logging |

Access should be granted through the relevant account connection, never by
pasting credentials or tokens into GitHub or chat. Claude should state the exact
system and read/write action it needs, rather than requesting blanket access.

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

## Claude handoff — ACQ-07 podcast outreach, sent by Codex

Kuber confirmed on 24 August 2026 that Claude stages outreach and **Codex sends
it on his behalf**. The two approved routes below were sent and independently
verified in Gmail on 24 August 2026.

### Sent

Both are new routes. Neither duplicates an existing pipeline row, and both use a
distinct operating idea not used in any pitch already sent.

1. **The Digital CX Podcast** to `alex@digitalcustomersuccess.com`. Angle: CS
   Decision Rights Map. The address was verified first-party on
   `https://digitalcustomersuccess.com/contact/` on 24 August 2026. Copy is in
   `growth/outreach-pitches.md`.
2. **Retention Ranch** to the public management address on
   `https://www.retentionranch.com/contact`. The guest criteria at
   `https://www.retentionranch.com/guest` and the contact route were both
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

## Completed baseline — Search Console archive query data

Codex verified the `https://churnisdead.com/` property through the signed-in
Search Console browser on 24 August 2026. The aggregate three-month baseline is
recorded in `growth/search-console-baseline.md`. It contains counts and public
URLs only. No screenshot, raw export, identity data, or inferred ranking is in
the repository.

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

**Result.** Search Console showed 18 clicks, 246 impressions, 16 indexed pages,
two crawled-not-indexed pages, and a successful sitemap with 62 discovered
pages. The explicit `health score` query filter returned no impressions, so it
did not select a canonical winner. Consolidation remains evidence-gated.

**Next review.** Recheck indexation from 7 September and page/query performance
on 21 September. Do not change multiple titles at once or claim an internal-link
impact before those observation windows.

## Current channel allocation, 24 August 2026

The operating allocation is: **let the completed organic-search foundation
compound while the next active cycles prioritise earned distribution and
LinkedIn relationships.** This is an evidence-led agent decision under Kuber's
standing mandate to act beyond the website and editorial. It is not recorded as
a direct quote or a newly stated decision from Kuber.

The evidence behind it, from `growth/search-console-baseline.md`:

- 18 clicks in three months, 16 of them the homepage. Two non-homepage clicks.
- Only 16 URLs have any performance data, against 62 in the sitemap.
- 13 query rows for the whole property. The only query with a click was
  `totango catalyst`, a competitor product name.
- `kuber sethi` returned ten impressions and zero clicks.

Against that, LinkedIn is roughly 8,200 followers with Premium today. Search is
a slower compounding surface, while current LinkedIn and earned-audience work
can create attributable visits sooner. The foundation should accumulate until
the written review dates provide new evidence.

**What this changes.** Claude's rolling queue now puts earned distribution
first. Search Console reviews on 7 and 21 September remain mandatory. SEO-05 is
already complete with a no-change decision, so neither agent should manufacture
a metadata test before the next evidence window.

**What this does not change.** CID-001's baseline, its Tuesday post, CTA,
tracked link, timing and channel mix all stand until 1 September 18:14 Sydney.
The decision changes where effort goes next, not the running experiment.

## SEO-02 closed: technical discovery integrity audit

Completed 24 August 2026 before the channel decision above. Reproducible via
`scripts/audit_discovery_integrity.py`, which crawls every sitemap URL as
Googlebot.

**Result across all 62 live URLs: no critical discovery blockers.**

| Check | Failures |
|---|---:|
| Non-200 status | 0 |
| Unexpected redirect | 0 |
| Canonical not self-referential | 0 |
| Unintended `noindex` | 0 |
| Missing meta description | 0 |
| Missing JSON-LD | 1 |

The single JSON-LD gap is the homepage. It is an enhancement candidate, not a
crawlability failure or a ranking guarantee. It remains logged for a later
single-variable change rather than being bundled into this audit.

**One operational note.** The live sitemap served 62 URLs and did not contain
`/topics/health-score-alternatives`, while the repository sitemap contains 63
including it. The deployment was one release behind at audit time. Expected to
resolve on the next Lovable deploy. Re-check before relying on the hub being
crawlable, and treat a persistent gap as a deployment defect rather than an SEO
one.

The audit command is self-contained, creates no evidence file unless explicitly
requested, returns non-zero for critical discovery blockers, and has a local
contract test. No live metadata fix is bundled into this audit.
