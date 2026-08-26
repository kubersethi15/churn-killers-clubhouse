# Churn Is Dead agent coordination

**Last updated:** 25 August 2026

This is the shared coordination board for Claude and Codex. It contains no subscriber identities or customer PII.

**Open questions live in [`growth/agent-inbox.md`](agent-inbox.md), not here.** This
file is the durable record of claims, handoffs and decisions. It is long by
design, which makes it the wrong place to raise something needing an answer.

The durable execution queue is [`growth/full-growth-backlog.md`](full-growth-backlog.md). It gives both agents enough sequenced work across acquisition, activation, retention, partnerships, product-led loops, and monetisation; claim only one non-overlapping item at a time.

## Shared objective

Increase qualified Churn Is Dead subscribers and organic traffic, improve activation and retention, and build an evidence-led path to monetisation. The website is canonical. Preserve Kuber Sethi's voice, never invent personal experience or results, and measure aggregate outcomes.

## Launch-week focus: 25 August to 1 September

The build sprint is closed. Until CID-001 reaches its seven-day read, Codex and
Claude keep no more than three outcome lanes active between them:

1. execute and measure CID-001 and the separately labelled CID-004 editions;
2. deepen qualified conversations and rescue useful replies without exceeding
   the shared engagement cap; and
3. earn one non-duplicate practitioner or newsletter distribution route.

Do not open a process-only PR, another dashboard, a new measurement framework,
or a site restyle during this window. A production failure may be repaired. A
research artifact is useful only when it supports a named pitch, editorial
decision, or dated evidence read. Commits and documents are not growth metrics.

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
4. Do not change CID-001's Tuesday post, tracked link, site CTA, or timing before its baseline closes on 1 September 2026 at 18:14 Sydney. Kuber's 24 August override activates the separately tagged CID-004 LinkedIn Newsletter surface from 26 August; keep both labels intact and never present the resulting multi-surface run as an isolated channel test.
5. Relationship work, research, partner pitching, and separately labelled always-on infrastructure may continue. Log consequential external actions in `growth/action-log.md` so another agent does not repeat them.
6. Never expose subscriber emails, viewer identities, customer transcripts, or other PII in issues, PRs, logs, screenshots, or shared documents.

## Active ownership

| Workstream | Owner | Branch or surface | Status | Claimed files / boundary |
|---|---|---|---|---|
| SITE-01 best-in-class publication experience | Codex | merged PR [#106](https://github.com/kubersethi15/churn-killers-clubhouse/pull/106) | Complete and live 24 August 2026 | Public publication surfaces, semantic route integrity, archive taxonomy, featured-issue evidence, playbook workspace/PDF, brand assets and analyzer accessibility shipped. No files remain claimed. |
| SITE-02 plain-language brand repair | Codex | merged PR [#109](https://github.com/kubersethi15/churn-killers-clubhouse/pull/109) | Complete and live 24 August 2026 | Human publication voice restored across the homepage and supporting surfaces. No files remain claimed; hold further copy changes through the CID-001 read unless production is broken. |
| SITE-03 category-defining editorial art direction | Codex | merged PR [#112](https://github.com/kubersethi15/churn-killers-clubhouse/pull/112), production commit `64ed47d` | Complete and live 24 August 2026 | Oversized editorial masthead, red signal motif, asymmetric issue presentation, authentic author imagery, and shared art direction shipped across Homepage, Issues, Playbooks, About, article headers/content, navigation, footer, and signup forms. Focused lint, TypeScript, production build, 19 public-route checks, desktop/mobile QA, and live production verification passed. No files remain claimed. |
| Subscriber referral loop v2 | Codex | PR [#36](https://github.com/kubersethi15/churn-killers-clubhouse/pull/36), merged as `b7d1b23`; QA repair on `codex/referral-measurement-qa-fixes` | Public surfaces live; exact event-semantics and conversion-rate repair claimed 24 August | Claimed: `NewsletterForm`, growth event types, referral RPC migration, referral dashboard copy, focused tests, and aggregate action log. Do not review performance until exact semantics deploy and the `LOOP-02` evidence gate is met. |
| Tuesday CID-001 launch | Codex + social manager | Website at 18:00 Sydney; generated SEO assets at 18:05; LinkedIn after the crawlable release gate | Approved, staged in Supabase, playbook live, measurement-ready, and covered by the active growth heartbeat | Do not alter copy, CTA, UTM, timing, or add a second short launch post through baseline close. Publisher run [32690490235](https://github.com/kubersethi15/churn-killers-clubhouse/actions/runs/32690490235) succeeded 24 August. The 18:05 publisher commit still requires an explicit Lovable Publish. Verify the issue title and exact self-canonical in initial HTML, the PDF, sitemap and RSS before allowing the 18:15 LinkedIn post. Hold distribution if the crawlable build is not live; do not duplicate manager actions. |
| CID-004 LinkedIn Newsletter reactivation | Codex + social manager | Existing `Churn is Dead` LinkedIn Newsletter | All four editions prepared, approved, scheduled, and verified for 26 August, 2 September, 9 September, and 16 September at 18:15 Sydney | Preserve `linkedin/newsletter/linkedin_newsletter` attribution, replace the Wednesday calendar slot rather than adding a duplicate post, and run the aggregate CID-004 report after each seven-day window |
| CID-002 LinkedIn link-placement crossover | Codex + social manager | Merged PR [#172](https://github.com/kubersethi15/churn-killers-clubhouse/pull/172); `2026 Calendar` row 248; 8 September Tuesday post | First direct-in-body observation staged, approved in the shared Sheet and handed off to the manager for 8 September after CID-001 closes | The 25 August post produced 870 impressions but seven tagged site visits, while its first-comment link had 171 impressions. The 8 September senior-CSM post keeps the text-only format, 18:15 timing, site CTA and free-playbook promise but carries the exact canonical URL in the body with `tuesday_inline_link`. Final Sheet formatting, status validation and hyperlink metadata were verified, and the no-first-comment-duplicate instruction was delivered in `Kuber X LinkedIn`. Alternate placement across later comparable Tuesday issues and require at least two posts plus 20 tagged visits per placement before a decision; topic differences prevent a one-post causal claim. |
| Existing partner outreach and replies | Codex | Gmail, LinkedIn, shared Growth Partnerships sheet | Active | Customer Success Collective, Customer Success Network, Practical CSM, SaaS Therapy, Digital CX, Retention Ranch, CS Insider, Lifetime Value Media, Gain Grow Retain, and SuccessCOACHING; exact follow-up dates are in `growth/channel-pipeline.csv`. Claude may claim a new, non-duplicate route after checking this list, the pipeline, and Gmail. |
| Reddit practitioner trust | Codex | r/CustomerSuccess and other relevant practitioner communities; `growth/reddit-practitioner-signal-map.md` | Active; first no-link contribution live, 30-thread signal map complete, and transparent profile conversion path live 26 August | Codex owns candidate selection, native contributions, substantive replies, the profile-to-canonical path, and aggregate 72-hour reads. The profile now identifies `Kuber | Churn Is Dead`, explains the publication plainly, and links to the clean canonical homepage; comments remain complete and link-free. The next-window candidate is onboarding success measured by coordination risk and first value; do not publish a second contribution on 26 August. Contribute only where Kuber has a useful practitioner view; no promotional posts, manufactured questions, link-dropping, duplicate comments, or same-day volume. Claude must not duplicate this lane. |
| LOOP-03 welcome activation measurement | Codex | PR [#73](https://github.com/kubersethi15/churn-killers-clubhouse/pull/73), merged as `6017c7d`; linked Supabase production project | Measurement implementation complete and backend deployed; observing until 20 tagged welcome click sessions | No files remain claimed. Re-run the aggregate report after each Tuesday acquisition window. Do not change welcome copy during CID-001 or before the 20-session evidence gate. |
| ACQ-07 podcast outreach | Claude staged, Codex verified and sent | PR [#42](https://github.com/kubersethi15/churn-killers-clubhouse/pull/42), merged as `63febe2`; Gmail | Two pitches sent and verified 24 August | No files remain claimed. Monitor replies; follow up once on 7 September if silent, then stop. |
| Organic discovery: internal link graph | Claude | PR [#40](https://github.com/kubersethi15/churn-killers-clubhouse/pull/40), merged as `a04de10` | Complete; independently reviewed and merged | No longer file-claimed. Review Search Console impact from 7 September 2026; use `scripts/report_internal_link_graph.py` to remeasure after archive changes. |
| SEO-05 single-page CTR diagnostic | Codex | Search Console and `growth/search-console-baseline.md` | Complete; no-change decision recorded 24 August | No files remain claimed. The page-filtered queries were too sparse or irrelevant to select a defensible intent. Recheck 21 September; then change at most one surface. |
| SEO-02 technical discovery audit | Claude | PR [#52](https://github.com/kubersethi15/churn-killers-clubhouse/pull/52) | Complete; no critical discovery blockers across 62 live sitemap URLs | No files remain claimed after merge. Recheck the missing live topic-hub route after deployment and review indexation on 7 September. |
| Claude launch-week earned-distribution lane | Claude | execution issue [#92](https://github.com/kubersethi15/churn-killers-clubhouse/issues/92), `growth/claude-growth-sprint.md`, and `growth/claude-best-in-class-wave.md` | BC-01 is complete; next active outcome is one non-duplicate practitioner or newsletter route | Claim one of CG-03 or CG-15, verify it against the live pipeline and sent-mail history, and carry one tailored proposal to a send-ready handoff. Do not duplicate Codex's CID-001/CID-004, reply, email-monitoring, or Medium lanes. Do not open another coordination or measurement artifact. |
| Engagement playbook manager handoff | Codex | PR [#79](https://github.com/kubersethi15/churn-killers-clubhouse/pull/79); Google Sheet and WhatsApp | Complete; access, message delivery, and the live Sheet link are verified | No files remain claimed. The document governs engagement execution; the live Sheet remains authoritative for copy, timing, links, and assets. |
| Claude first-read growth activation | Codex | PR [#82](https://github.com/kubersethi15/churn-killers-clubhouse/pull/82); activation issue [#83](https://github.com/kubersethi15/churn-killers-clubhouse/issues/83) closed after multiple Claude claims | Complete | Superseded by execution issue #92 and the expanded queue on `main`. |
| CG-10 continuity corrective release | Codex | merged PR [#91](https://github.com/kubersethi15/churn-killers-clubhouse/pull/91), repairing merged PRs #85/#86 | Complete; build and focused safety tests passed | No files remain claimed. Claude may consume the corrected manifest and audits but must preserve live-catalog validation and outage-safe generation. |
| CG-09 costly-problem ledger and analytics guard | Claude, closed by Codex | merged PRs [#90](https://github.com/kubersethi15/churn-killers-clubhouse/pull/90) and [#97](https://github.com/kubersethi15/churn-killers-clubhouse/pull/97); historical-migration repair in PR [#114](https://github.com/kubersethi15/churn-killers-clubhouse/pull/114) | Complete after deploy-time cutoff repair; host guard deployed and verified at 05:29:38 UTC | Preserve the already-applied 05:10 migration as history and advance the boundary with the later idempotent 05:30 upsert. Preserve session deduplication, one on-site source class, resource mapping, the two Gate 0 conditions, and narrowed evidence language. |
| CG-18 delayed canonical syndication | Codex | `growth/cg18-syndication-system` | Prepared; no external publication | Claimed: `growth/cg-18-syndication-operating-plan.md`, `growth/syndication-register.csv`, and the readiness checker/tests. MED-001 cannot publish before 24 September and requires live canonical verification, Medium approval, signed-in access, and action-time confirmation. Claude must not duplicate this lane. |
| SEO-08 crawlable homepage identity schema | Codex | merged PR [#98](https://github.com/kubersethi15/churn-killers-clubhouse/pull/98); Lovable deployment `453bc5f7-6547-4ae1-b9cd-ec7e1d52c9df` | Complete and live | Public homepage HTML contains one factual WebSite, Organization, and Kuber Person graph. Production build and 17 route checks passed; non-home leakage is a build failure. No launch, CTA, copy, or attribution change. |
| DELIV-01 unsubscribe-token contract hardening | Claude, reviewed by Codex | merged PR [#143](https://github.com/kubersethi15/churn-killers-clubhouse/pull/143) | Complete; focused tests pass | The signer and verifier now share `supabase/functions/_shared/unsubscribeToken.ts`, following Supabase's supported shared-code structure. The golden-vector contract test passes. No schema, broadcast switch, or launch surface changed. |
| DELIV-02 broadcast retry idempotency | Claude, production verified by Codex | merged PR [#144](https://github.com/kubersethi15/churn-killers-clubhouse/pull/144); Supabase function version 154 | Complete, deployed and exercised by the 25 August broadcast | Production download is byte-identical to merged `index.ts`, `sendPlan.ts`, email identity, and unsubscribe-token source. Migration `20260901010000` is recorded remotely and the required unique index already existed. The production broadcast completed without duplicate-recipient evidence; future sends retain the same fail-closed retry and log-persistence contract. |
| CG-15/ACQ-06 curated-directory + adjacent-swap routes | Claude | `growth/cg15-gtmindex-customer-education-routes` | Prepared and staged 26 August; nothing sent | Claimed: the new entries in `growth/outreach-pitches.md`, `growth/cross-newsletter-collaboration.md`, `growth/channel-pipeline.csv`, the action-log entry, and this row. Two verified non-overlapping routes: The GTM Index CS directory and Customer Education Bi-Weekly swap. Does not touch Codex's Wednesday newsletter, Resend, funnel measurement, LinkedIn comments, CG-18 Medium, the live native Reddit contribution recorded in PR #162, or the RevOps Impact swap. Codex or Kuber confirms each first-party route and sends. |
| DELIV-03 subscriber email release quality | Codex | merged PRs [#152](https://github.com/kubersethi15/churn-killers-clubhouse/pull/152) and [#154](https://github.com/kubersethi15/churn-killers-clubhouse/pull/154); Resend domain configuration | Production broadcast completed 25 August; aggregate outcome verified 26 August | The approved issue and subject produced 312 production sent events, 310 deliveries, 11 provider suppressions, two transient bounces and zero complaints. Provider suppression correctly cleaned the active list; temporary bounces remained subscribed. Future issues must repeat the lawful-footer, production-test, authentication, unsubscribe and sender-health gate rather than assuming this send permanently clears it. |
| DELIV-04 approved subscriber-email packages | Codex | `editorial/renewal-email-release-package`; three approved upcoming issue packages and the editorial validator | One-subject packages prepared and validated 26 August; next production remains gated to 1 September | Selected one direct subject and controlled preheader for each approved 1, 8 and 15 September issue instead of splitting roughly 312 active readers across three underpowered variants. The validator now blocks an approved package unless it selects exactly one subject, includes a preheader, stays inside the 60/140-character limits, and follows the no-em-dash rule. The 1 September email distribution approval is explicit, but production still requires the Tuesday sender-health, lawful-footer, production-equivalent test, unsubscribe, canonical-route, and live-issue checks; do not enable or send early. |

## Claude rolling queue

**Kuber expanded Claude's brief on 24 August 2026: audience growth, engagement,
authority and monetisation discovery are all in scope.** The complete execution
contract is [`growth/claude-growth-sprint.md`](claude-growth-sprint.md). It has
20 immediate audience-system tasks, five gated follow-throughs, metrics, stop rules, connection
order and a binding handoff format.

The best-in-class expansion in
[`growth/claude-best-in-class-wave.md`](claude-best-in-class-wave.md) remains a
durable queue, not a launch-week concurrency target. BC-01 is complete. Claude's
next outcome is one earned-distribution route under CG-03 or CG-15. BC-02 and
BC-03 resume only after that route is sent or explicitly parked with current
eligibility evidence.

Claude should claim one item, finish or explicitly park it with evidence, and
take the next unblocked item without waiting for Codex to assign more work. A
missing connection is not a reason to idle: complete the repository, research,
draft or test portion, record the precise live action still needed, then take a
task supported by the available connections.

| Priority | ID | Workstream | Required outcome now |
|---|---|---|---|
| 1 | CG-03 | New earned-audience route | Verify one non-duplicate practitioner audience and prepare one source-safe proposal tied to an existing Churn Is Dead tool |
| 2 | CG-15 | Cross-newsletter collaboration | Carry one high-fit newsletter collaboration to a send-ready handoff with originality and canonical treatment stated |
| 3 | BC-02 | Category and editorial benchmark | Resume only after the earned-distribution lane; produce a decision that changes a named issue or pitch, not a standalone report |
| 4 | BC-03 | Archive credibility triage | Resume after BC-02; prioritize pages with current discovery or distribution evidence |
| 5 | CG-05 | Community-native contribution | Keep PR #105 parked until it is rebased, passes the shared three-action cap, and proves a current eligible community route |

CG-06 to CG-11 continue with the contributor kit, LinkedIn post-to-asset
continuity, best-in-class editorial decision research, the aggregate costly-
problem ledger, problem-to-tool continuity, and relevant backlink reclamation.
CG-14 to CG-22 add conversation-led frameworks, cross-newsletter
collaborations, live operating rooms, a practitioner evidence council,
canonical syndication, original research, reader partnerships, appearance
journeys and co-created assets. CG-23 is gated by welcome-path evidence.
Post-baseline implementation and the 7 and 21 September organic reviews are
date-gated. Completed Search Console,
technical discovery, welcome-instrumentation and QBR-deep-link work must not be
reopened without new measured evidence.

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

## Kuber's audience-acquisition priority, 24 August 2026

**Kuber's explicit number-one priority is audience acquisition.** He directed
both agents to work beyond the website and editorial because strong content
without subscribers does not build the brand. The current channel allocation
applies that mandate: let the completed organic-search foundation compound while
the next active cycles prioritise earned distribution and LinkedIn relationships.

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

## Claude handoff — LI-04 LinkedIn funnel report

**Branch:** `growth/li-04-linkedin-funnel-report`. Adds
`scripts/report_linkedin_funnel.py`. Aggregate and counts-only.

**Instrumentation verdict: no repair needed.** The site side already preserves
LinkedIn source, medium, campaign, content and acquisition session. The Premium
button uses `linkedin/profile/always_on/premium_button`; the Featured card uses
`linkedin/featured/always_on/newsletter_home`. The report keeps those surfaces
separate and changes neither one during the controlled baseline.

**The structural finding.** The comment-to-profile step cannot be measured from
this side and never will be. The founder relationship loop posts deliberately
no-link comments, so a reader who reads a comment, opens the profile and clicks
the button is indistinguishable from any other profile visitor. The only
observation of that middle step lives in LinkedIn Premium's own aggregate
analytics.

The report is built around that honestly: it prints the measured site side and
leaves labelled manual slots for the Premium figures, rather than implying the
full funnel is instrumented. Anyone reading its output can see exactly which
half is measured.

**Live state, verified 24 August, last seven days:**

| Measure | Value |
|---|---:|
| LinkedIn tagged sessions | 2 |
| LinkedIn tagged events | 4 |
| Acquired subscribers from LinkedIn | 0 |
| All sessions, all sources | 164 |
| Instrumentation start | 23 August 2026 |

**Minimum evidence: 20 LinkedIn sessions.** Below that the report refuses to
state a conversion rate, compare surfaces or call a winner, matching the rule
already applied to CID-001. At 2 sessions everything is descriptive. The
constraint is elapsed time, not tooling: instrumentation is two days old.

**Access note.** `growth_events` is closed to anonymous reads by RLS, correctly,
since it is a write-only surface for clients. The script needs
`SUPABASE_SERVICE_KEY`, requests only PII-free event and acquisition columns,
and fails with a clear message rather than a traceback when access is absent.
The figures above were verified through the Supabase connection instead.

**Review:** first meaningful read once LinkedIn sessions pass 20, expected after
CID-001 closes on 1 September.

## Claude handoff — ACQ-03 route map, independently corrected

**Branch:** `growth/acq-03-route-map`.

Claude initially reported that five checked targets had no open route. Codex
rechecked the highest-fit target before accepting the no-route conclusion and
found a material contradiction: Lifetime Value Media's official `www` site was
live, described The Daily Standup's broad guest format, and published
`hello@lifetimevaluemedia.com`. Gmail had no existing thread. A distinct pitch
was sent and verified rather than suppressing the route.

Targets researched and first-party checked on 24 August:

| Target | Result |
|---|---|
| Lifetime Value Media, The Daily Standup | **Open route.** `https://www.lifetimevaluemedia.com/podcasts` was live and published `hello@lifetimevaluemedia.com`; Monthly Business Review pitch sent and verified |
| CSM Practice podcast | Contact page returns HTTP 500; podcast page publishes no guest route |
| Unchurned (UpdateAI) | No first-party guest route, checked earlier |
| The Customer Success Channel (Planhat) | Mid host transition; only address found was from an aggregator |
| The CS Café | Sells sponsorship packages, does not offer guest slots |

Four of the five checked targets remain relationship-gated or blocked. This
small convenience sample supports a relationship-first hypothesis, not a claim
about the entire CS media market. Every apparent dead end still needs a direct
first-party recheck, including `www` host variants and visible public contact
routes, before it is closed.

### The useful part: the circuit is small and interconnected

From Alex Turkovic's own episode listings on `podcast.digitalcustomersuccess.com`:

- Dillon Young (Lifetime Value) appeared on The Digital CX Podcast twice,
  episodes 022 and 088.
- Irit Eizips (CSM Practice) appeared on episode 047.

Both Dillon Young and Irit Eizips have appeared on the show already pitched.
Alex Turkovic is therefore a useful relationship node, but no single host should
be treated as the only route into the category.

**Strategy implication.** Keep the Digital CX relationship active and use warm
introductions when available, while continuing careful first-party route
verification. Route quality matters more than cold-pitch volume, but a general
public address on a show that explicitly features diverse guests remains a
legitimate one-to-one route.

**Recommended sequencing.**

1. Let the Digital CX pitch run. Follow up once on 7 September as recorded.
2. Let the new Lifetime Value Media pitch run. Follow up once on 7 September if
   silent, then stop. Do not send Dillon Young a duplicate direct message.
3. Keep Irit Eizips as a relationship route unless CSM Practice publishes a
   current first-party guest or contact path.
4. Retention Ranch runs independently, since it had its own open route.
5. Measure verified routes, replies, invitations, tagged visits, and acquired
   subscribers, not pitches written.

**Recorded** as pipeline row 18 with a verified sent status and row 19 as a
relationship route. Neither agent should duplicate either action.

**Metric.** Replies, invitations, tagged resource visits, and acquired
subscribers. Review 8 September, after the single follow-up date.

## Claude finding — the largest conversion leak found so far

Kuber's featured LinkedIn post asking readers to comment "FRAMEWORK" for the
30-Minute QBR structure has **342 comments**. Churn Is Dead has **325
subscribers**. One post produced more hand-raises than the entire subscriber
list. Live review of the thread shows that some commenters received individual
DMs, but there was no public, tracked destination for the whole demand pool.

**Nothing needs building.** The PDF is live, the Playbook Vault already lists it
first, `resource_open` already fires, and `NewsletterForm` is already on the
page. Individual replies did not create a durable, measurable route for
everyone who asked. Plan and staged copy are in
`growth/qbr-framework-distribution.md`.

**Released in two steps.** A top-level public reply was published on the
original post on 24 August with the tracked vault URL. The full feed post is
approved in the manager calendar for 3 September at 17:30, after the 1 September
website launch and the 2 September native newsletter edition. CID-001 remains a
mixed-surface window because the native newsletter reactivation was already
authorised.

**No mass direct messages.** 342 individual DMs is slow, reads as automation and
risks the account. The original-thread activity and the new feed post may create
notifications or feed distribution subject to LinkedIn settings; neither should
be represented as guaranteed delivery to every commenter.

**Not gating the download.** Every other playbook is free. Gating one to force
signups is inconsistent with the vault and clashes with the brand position.
Revisit only if tagged visits are high and signups near zero, as a measured
decision.

**The repeatable part matters more than the backlog.** Every future "comment X"
post should route to a tracked vault URL from the start, turning each engagement
spike into a measured acquisition surface instead of comments that go nowhere.

## Codex response — QBR and Newsletter acquisition surfaces

1. **Posting route.** LinkedIn is a hybrid route. Codex can execute directly in
   the signed-in account, while the shared manager sheet remains the source of
   truth so scheduled work is not duplicated. The original-thread reply is live;
   the full feed post is approved for 3 September at 17:30 in the manager sheet.
2. **Mixed-surface label.** Agreed and binding. CID-001 must be reported as a
   mixed-surface window, not an isolated channel test.
3. **Rule and practice.** Independently tagged acquisition surfaces may run
   concurrently when each has its own campaign label and the readout names the
   overlap. A clean single-variable window exists only when it is explicitly
   declared and actually enforced. This is the operating rule going forward.
4. **680-subscriber route.** Each native Newsletter edition contains a dedicated
   `linkedin/newsletter` canonical link. The 2 September edition links to the
   Renewal Evidence Packet issue and its free playbook, so the subscriber pool
   has an attributable owned-site route without adding a generic vault CTA.
## Author-experience ledger confirmed, 24 August 2026

Kuber confirmed five first-person claims. `editorial/author-experience.md` is no
longer empty, which removes the constraint that had every pitch routing around
his background.

**Ranked by usefulness in outreach, which is not the order they were given in:**

1. **The thirty minute QBR.** He replaced the standard quarterly business
   review with three slides: the customer's goal and how the quarter aligned to
   it, what was achieved, and what is next including where support is needed.
   This is the strongest asset in the ledger. It is specific, first person, and
   contrarian against a practice the whole category defends. Prefer it over
   tenure in any pitch.
2. **The reversal.** He used to believe a strong product carried an account
   through anything, and changed his mind after being burnt relying on it.
   Admitting a reversal buys more credibility with senior operators than any
   credential.
3. Tenure, leadership scope and revenue scale establish standing. They are
   background, never evidence, and never results.

**One open clarification.** The USD 5 to 10 million ARR figure was given in
answer to a question about account sizes. It is recorded conservatively as
revenue accountability. Confirm whether it means a single account band or a
total book before using it where the distinction matters.

**Not independently verified.** LinkedIn could not be read: it returns HTTP 999
to unauthenticated fetches, the Claude in Chrome extension is not connected, and
the in-app browser hits a sign-in wall. These are self-confirmed first-person
claims, which is exactly what this ledger is for. Do not describe them as
verified.

**Editorial consistency.** The archive publishes "The 30-Minute Monthly Business
Review". The ledger claim is a thirty minute quarterly format. Different
artifacts, not a contradiction, but copy using both should make the cadence
distinction explicit.

### Follow-up copy staged for Codex

`growth/outreach-pitches.md` now carries the 7 September follow-ups for all
three live pitches. Each is short and adds exactly one thing the original could
not say: a system Kuber personally built. One follow-up each, then stop, per the
existing rule.

**Merge standing:** Kuber confirmed on 24 August that he is happy for Codex to
merge Claude's PRs.

## Claude handoff, BC-02 complete, 25 August 2026

`editorial/category-benchmark.md`: 14 publications benchmarked with labelled
provenance, an 8-dimension score, three strengths to protect, six ranked gaps,
a 12-point reusable issue scorecard (ship at 9+), and three testable changes.
The usefulness change is the quarterly CS pulse benchmark, which activates
CG-19 and is the one move that makes CID citable rather than citing. Next
unblocked package: BC-03 archive triage, using the new scorecard.

**Review date:** first franchise/diagram tests read after four issues; pulse
test after one edition with 30+ qualified responses.

## Claude handoff, CG-15 cross-newsletter swap, 25 August 2026

One earned-distribution outcome, not an audit. A net-new channel Codex has not
worked: manual mutual-mention newsletter swaps. Details in
`growth/cross-newsletter-collaboration.md`.

**Staged for send:** RevOps Impact (Jeff Ignacio, over 6,000 subscribers,
verified on its public Substack page 25 August). The testable hypothesis is that
an adjacent RevOps audience will add qualified readers beyond the current CS
audience; audience overlap is unknown. The hook is Kuber's published "You Don't
Own NRR, You Rent It From Pricing". The pitch accurately describes Kuber's
roughly 8,200 LinkedIn followers without implying guaranteed reach. Route is
LinkedIn (no public email). Kuber or Codex sends.

**Constraint recorded:** Churn Is Dead is not on Substack, so it cannot use the
one-click Recommendations network. Swaps are manual mutual mentions, which
favours a few real agreements over volume.

Second-best backing candidate is Customer Education Bi-Weekly. Its legacy About
page names Joe Ryan, but current posts and the publication profile identify Eric
Mistry as the active editor. Work it only after RevOps Impact resolves.
## Claude handoff, CG-03 Product-Led Alliance, 25 August 2026

Second earned-distribution outcome, a genuinely new route. Product-Led Alliance
serves product managers and product-operations practitioners. The hypothesis is
that this adjacent audience will include qualified readers beyond the current
CS audience; overlap has not been measured.

**Verified open first-party 25 August:** content@productledalliance.com, minimum
1,000 words, no product promotion, headshot required (have it), and bio of 200
characters or fewer (staged at 142). PLA accepts previously published work with
a custom canonical link. Pitch and bio are staged in
`growth/outreach-pitches.md`; send only after the 18:00 Sydney release gate
verifies the exact Churn Is Dead canonical, and require that canonical on PLA
and any full-text downstream cross-post. Codex or Kuber sends.

The angle is the Product Friction Review, the one boundary product and CS share,
which is exactly this week's issue. Not a duplicate of any pipeline target.

## Claude handoff, partner distribution (ChurnZero, Pavilion), 25 August 2026

Two new non-duplicate partner-distribution routes to qualified US/UK CS/GTM
leaders, staged send-ready. Pipeline rows 22 and 23; pitches in
`growth/outreach-pitches.md`. **Nothing was sent; no Gmail drafts created (Gmail
access was unavailable this cycle).**

- **ChurnZero blog** — first-party guest-post evidence at
  `https://churnzero.com/blog/generative-ai-customer-success/`. Angle: Kuber's
  confirmed thirty-minute quarterly QBR replacement (ledger claim 4). The guest
  piece is original; the tracked Churn Is Dead monthly-review article is related
  reading, not the same artifact, so request an attributed bio link rather than
  canonical equivalence.
- **Pavilion** — first-party Guest Post category at
  `https://www.joinpavilion.com/blog/tag/guest-post`. Angle: "You Don't Own NRR,
  You Rent It From Pricing." Use an attributed source link for an adaptation and
  preserve the Churn Is Dead canonical if Pavilion republishes the full text.

**Open action before either send:** neither publisher exposes an open submission
form, so the exact editorial/guest contact must be confirmed first-party at send
time. Do not guess an address. One follow-up on 4 September if actioned and
silent, then stop.

**Deliberately dropped, with cause:** Women in Customer Success (route
first-party verified, but its podcast takes women guests only, so it is a poor
fit for Kuber as author); SaaStr and The Jasons Take On (could not be verified
first-party this cycle — 403 and DNS failure respectively). Recorded so neither
agent re-researches them without a new reason.

## Codex handoff, CID-001 live release and PLA distribution, 25 August 2026

CID-001 is live and crawlable. The article title and exact self-canonical were
verified in initial HTML, the PDF returned 200, sitemap/RSS contained the issue,
and Tanya's approved 18:15 LinkedIn post plus exact `tuesday_launch` first
comment were verified at
`https://www.linkedin.com/feed/update/urn:li:activity:7497929535347253248/`.
Shared calendar row 234 is marked Posted. Do not publish a duplicate or add a
competing launch post during the seven-day baseline.

The single Product-Led Alliance pitch was sent after a final Gmail duplicate
check and verified in Sent. It requests the Churn Is Dead source canonical on
the PLA version and any full-text downstream cross-post. Monitor the existing
thread only; if silent, follow up once on 4 September, then stop.

## Claude handoff, ChurnZero and Pavilion route decision, 25 August 2026

**Branch:** `growth/cg03-churnzero-pavilion-route-decision`. Files: pipeline rows
22 and 23 rewritten, a new row 24, and the ChurnZero, Pavilion and new
CustomerThink sections in `growth/outreach-pitches.md`. **Nothing was sent.**

Both staged partner routes were re-verified first-party and neither is
executable as a cold editorial pitch:

- **ChurnZero: warm-introduction or invited only.** No public write-for-us or
  editorial submission form, and no editorial address is exposed. The external
  guest contributors it publishes are partner or vendor executives with an
  existing relationship, so that is invited, not open. The only public contact is
  a sales and demo form, which is not an editorial route.
- **Pavilion: members or invited, or paid sponsorship.** Confirmed a paid private
  membership community. No contact page, no write-for-us; the footer exposes only
  Support, Careers and paid Sponsorships. The Guest Post tag is a curated member
  or invited series dominated by one fractional-CRO contributor, not an open call.

**Replacement, one strong US practitioner publication with a verified first-party
route: CustomerThink** (pipeline row 24). Active in 2026, founded and edited by
Bob Thompson. The route is the public Write For Us application form at
`https://customerthink.com/write-for-us/`. Bob Thompson personally reviews
submissions and invites approved applicants to register, so registration is not
the first step. Questions or proposals may also go to `editor@customerthink.com`.
A business email is required and free email services are rejected, so use a
`churnisdead.com` address, not the gmail on file. The text staged in
`growth/outreach-pitches.md` is an application abstract only; CustomerThink
requires the article be written by the author (AI may assist only with ideation,
research, and editing), so if accepted Kuber must personally draft it. Body stays
neutral and educational with the Churn Is Dead link in the author bio only.
Angle: the thirty-minute QBR replacement, ledger claim 4.

**Next external action:** none is send-ready yet. To open CustomerThink, Kuber or
Codex submits the staged application through the Write For Us form (or emails
`editor@customerthink.com`) from a `churnisdead.com` business email; if approved
and invited, Kuber personally drafts the article. If actioned and silent, one
follow-up on 4 September, then stop. Do not cold-pitch ChurnZero or Pavilion;
both wait on a warm introduction (or, for Pavilion, an explicit paid decision).

## Claude handoff, curated-directory + adjacent-swap routes, 26 August 2026

**Branch:** `growth/cg15-gtmindex-customer-education-routes`. Files:
`growth/outreach-pitches.md` (two staged notes), `growth/cross-newsletter-collaboration.md`
(both routes plus the CS Cafe hold), `growth/channel-pipeline.csv` (the two new
entries), `growth/action-log.md`, and this file. **Nothing was sent; no external
account, message, email, or listing was created.**

The off-platform lane this cycle is one high-trust directory and one adjacent
swap, with one overlapping route held for a sharper angle. It is deliberately non-overlapping: it
does not touch Codex's Wednesday LinkedIn Newsletter release, Resend
deliverability, on-site funnel measurement, or LinkedIn comment execution; it
does not touch CG-18 Medium (MED-001 stays 24 September, MED-002 stays 8 October,
website canonical preserved, Medium story free); and it does not duplicate the
live native Reddit contribution recorded in PR #162 or the RevOps Impact swap.

### Route 1, primary: The GTM Index Customer Success directory

- **Verified first-party 26 August** at `https://thegtmindex.com/customer-success/`
  and `https://thegtmindex.com/about/`. Curated by Rome Thorndike. No payment for
  listings, quarterly review, removes stale resources, lists only work that
  teaches beyond a Google search and is practitioner-recommended, excludes
  product-marketing-as-editorial, links out to each resource's own site. Churn Is
  Dead is not listed. High intent and competitor-neutral, so a CS newsletter is
  welcome.
- **Tracked destination:** `https://churnisdead.com/?utm_source=the_gtm_index&utm_medium=directory&utm_campaign=cs_resource_listing&utm_content=newsletter_entry`.
- **Hypothesis:** an editorial no-pay CS index reaches high-intent readers and
  produces tagged referral visits plus a durable backlink; conversion unknown.
- **Aggregate metric:** tagged referral visits (`the_gtm_index/directory`),
  acquired subscribers active at 30 days, live listing/backlink. Descriptive
  below 20 tagged visits.
- **Status:** sent once and verified in Gmail on 26 August after a clear duplicate
  search and semantic route check. The not-yet-live Renewal Evidence Packet was
  replaced with the live onboarding issue before send.
- **Follow-up:** 9 September once if silent, then stop; park if still unlisted
  after the next quarterly review.
- **Send route (verified first-party 26 August):** the `/about` contact link
  resolves to `hello@thegtmindex.com`. Executable now; Rome Thorndike on LinkedIn
  is a secondary route only if the email bounces.
- **Guardrail:** no payment, no reciprocal-listing ask, no second send while the
  existing thread is active.
- **Owner:** Codex monitors the existing thread and acts once on 9 September if
  silent.

### Route 2, backing: Customer Education Bi-Weekly (Eric Mistry, current editor)

- **Verified 26 August** at `https://customered.substack.com/`. Free bi-weekly,
  adjacent (customer education / instructional design / CS / customer marketing),
  surfaces others' work so it is swap-amenable and not a direct competitor.
- **Tracked hook (default):** `https://churnisdead.com/newsletter/fire-your-qbr-heres-what-to-do-instead?utm_source=customer_education&utm_medium=newsletter_swap&utm_campaign=thirty_minute_qbr`.
- **Metric:** tagged referred visits (`newsletter_swap/customer_education`),
  acquired subscribers, 30-day active status.
- **Follow-up:** one message and one follow-up on 9 September, then stop.
- **Guardrail:** confirm the hook returns 200; one tracked link per side; no
  payment, list sharing, or scraping; accurate audience descriptions.
- **Verified contact route:** Eric Mistry's Substack profile
  (`https://substack.com/@ericmistry1`) exposes a first-party `Message` action.
  The publication's legacy About page still names Joe Ryan; use Eric because the
  current posts, footer and profile identify him as the active editor.
- **Owner:** Codex or Kuber sends the staged note through Eric's Substack
  `Message` action.

### Held for a sharper collaboration angle

A generic swap with **The CS Cafe** (Hakan Ozturk, 4,300+ core-CS) is held, not
rejected. Its audience overlap can be valuable, but outreach needs a specific
complementary topic, debate, or co-created asset rather than a vague mutual
mention. The ChurnZero, Sybill, TheCXLead, and TopCSJobs roundups are vendor or
SEO content marketing rather than independent curation and were declined. None
are staged.

**Next owner action:** route 1 (The GTM Index) is sent and now in monitoring.
Route 2 (Customer Education) needs its Substack DM route confirmed, then send.
The next unblocked Claude item is one
more verified non-competing swap (Customer Education is now staged; SaaS
Barometer needs author verification) or a second independently-curated, no-pay CS
directory.

## Claude handoff, second no-pay CS directory (keon/awesome-customer-success), 26 August 2026

**Prepared on:** `growth/cs-directory-second-route`. **Executed by Codex on 26
August:** [upstream PR #15](https://github.com/keon/awesome-customer-success/pull/15)
is open with the staged clean-canonical entry. Files: `growth/outreach-pitches.md`,
`growth/channel-pipeline.csv` (row 27), `growth/action-log.md`, and this file.

One additional independently curated, no-pay CS directory, distinct from The GTM
Index (row 25) and the CSA Index (row 8). `mutedblues/Customer-Success-Management`
was rejected as abandoned (last push January 2020). `keon/awesome-customer-success`
was verified first-party: active (pushed 2026-07-31, recent external PRs merged),
free, non-vendor, CC0-1.0, and its `Additional Resources` section already lists
peer newsletters and blogs (Gain Grow Retain, HubSpot Resources, Catalyst Blog,
The CS Cafe Newsletter), so a free CS newsletter fits without being promotional.

- **Route:** a plain GitHub pull request adding one entry to `Additional
  Resources`. First-party and verifiable; no signed-out wall.
- **The entry (matches the section format, bare URL to maximise acceptance):**
  `- **[Churn Is Dead](https://churnisdead.com/)** - Weekly evidence-led Customer
  Success newsletter by Kuber Sethi; each issue frames one operating decision and
  ships a practical tool.` A UTM variant is optional only if the maintainer
  explicitly allows query params.
- **Metric:** the only exact route outcome is merge status (accepted as a durable
  backlink). A bare URL means `github.com` referrer data cannot separate this list
  from other GitHub traffic, so the supporting read is aggregate
  `github.com`-referred visits and acquired subscribers during the active window;
  descriptive and not route-specific. Niche discovery (24 stars), not proven reach.
- **Follow-up:** one PR comment on 9 September if unreviewed, then park. Do not
  open another submission or email the maintainer while PR #15 is active.
- **Guardrail:** confirm the entry URL returns 200 before opening; one factual
  entry, no reach claim, no payment, no reciprocal ask.
- **Owner:** Codex monitors PR #15 from Kuber's real GitHub account. Copy remains
  in `growth/outreach-pitches.md`. Avoids Reddit, LinkedIn Newsletter, Resend,
  Medium, and every existing outreach thread.
