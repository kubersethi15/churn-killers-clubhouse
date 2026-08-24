# Churn Is Dead agent coordination

**Last updated:** 24 August 2026

This is the shared coordination board for Claude and Codex. It contains no subscriber identities or customer PII.

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
| Subscriber referral loop v2 | Codex | `growth/referral-loop-v2` | In progress, tested locally; PR pending | `src/components/NewsletterForm.tsx`, `src/utils/referralLinks.ts`, `src/pages/GrowthDashboard.tsx`, `supabase/functions/send-welcome-email/index.ts`, `supabase/migrations/20260825000500_referral_growth_loop.sql`, Supabase generated types |
| Tuesday CID-001 launch | Codex + social manager | Website at 18:00 Sydney; LinkedIn at 18:15 | Approved and scheduled | Do not alter copy, CTA, UTM, timing, or add a second distribution surface through baseline close |
| Partner outreach and replies | Codex | Gmail, LinkedIn, shared Growth Partnerships sheet | Active | Customer Success Collective, Customer Success Network, Practical CSM, SaaS Therapy; follow-up dates are in `growth/channel-pipeline.csv` |

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
