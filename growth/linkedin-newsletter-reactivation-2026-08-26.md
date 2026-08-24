# LinkedIn Newsletter reactivation

**Experiment:** `CID-004`

**Decision date:** 24 August 2026

**First edition:** Wednesday 26 August 2026 at 18:15 Australia/Sydney

**Native publication:** `Churn is Dead`

**Aggregate subscriber baseline:** 680 LinkedIn Newsletter subscribers

## Why this moved forward

The native newsletter is not a new channel starting at zero. The signed-in LinkedIn publication showed 680 subscribers, three prior editions, and no edition in the previous six months. LinkedIn says newsletter subscribers may receive push, in-app, and email notifications when a new edition publishes, subject to their settings. That makes a quality-controlled reactivation one of the highest-leverage existing audience assets.

The Wednesday edition replaces the unapproved carousel in the social calendar. It is not an extra duplicate post.

## First edition record

- Title: `Product does not need another customer request`
- Source file: `editorial/issues/stealing-sprint-planning-from-engineering/linkedin-newsletter.md`
- Native schedule verified: Wednesday 26 August at 18:15 Sydney
- Canonical resource campaign: `linkedin / newsletter / stealing-sprint-planning-from-engineering / linkedin_newsletter`
- Canonical resource URL: `https://churnisdead.com/newsletter/stealing-sprint-planning-from-engineering?utm_source=linkedin&utm_medium=newsletter&utm_campaign=stealing-sprint-planning-from-engineering&utm_content=linkedin_newsletter`
- Manager sheet: `2026 Calendar` row 235, `Approved for Posting`
- Manager handoff: sent to `Kuber X LinkedIn`; the nine-page Wednesday carousel is cancelled

## Four-edition operating block

Publish one substantial native adaptation each Wednesday for four consecutive editions. Each edition must:

1. preserve the canonical Churn Is Dead article as the complete evidence-led source;
2. stand on its own inside LinkedIn rather than being a teaser or pasted website duplicate;
3. include one tagged canonical resource link;
4. replace an existing calendar slot instead of creating an unplanned duplicate post;
5. use only claims supported by the editorial ledgers and never invent Kuber's experience;
6. keep newsletter-subscriber and website-growth reporting aggregate-only.

## Second edition record

- Title: `An 80% renewal forecast is not evidence`
- Source file: `editorial/issues/renewal-evidence-packet/linkedin-newsletter.md`
- Native schedule verified: Wednesday 2 September at 18:15 Sydney
- Canonical resource campaign: `linkedin / newsletter / renewal-evidence-packet / linkedin_newsletter`
- Canonical resource URL: `https://churnisdead.com/newsletter/renewal-evidence-packet?utm_source=linkedin&utm_medium=newsletter&utm_campaign=renewal-evidence-packet&utm_content=linkedin_newsletter`
- Manager sheet: `2026 Calendar` row 242, `Approved for Posting`
- Calendar rule: the native edition replaces the blank Wednesday slot; no carousel or duplicate feed post

## Third edition record

- Title: `Your senior CSM is not the default owner`
- Source file: `editorial/issues/senior-csm-not-default-owner/linkedin-newsletter.md`
- Native schedule target: Wednesday 9 September at 18:15 Sydney
- Schedule status: prepared and approved; signed-in LinkedIn scheduling still to be verified
- Canonical resource campaign: `linkedin / newsletter / senior-csm-not-default-owner / linkedin_newsletter`
- Canonical resource URL: `https://churnisdead.com/newsletter/senior-csm-not-default-owner?utm_source=linkedin&utm_medium=newsletter&utm_campaign=senior-csm-not-default-owner&utm_content=linkedin_newsletter`
- Calendar rule: replace the Wednesday slot; do not add a duplicate feed post

## Fourth edition record

- Title: `Your health score changed. Now what?`
- Source file: `editorial/issues/health-score-is-not-an-intervention-trigger/linkedin-newsletter.md`
- Native schedule target: Wednesday 16 September at 18:15 Sydney
- Schedule status: prepared and approved; signed-in LinkedIn scheduling still to be verified
- Canonical resource campaign: `linkedin / newsletter / health-score-is-not-an-intervention-trigger / linkedin_newsletter`
- Canonical resource URL: `https://churnisdead.com/newsletter/health-score-is-not-an-intervention-trigger?utm_source=linkedin&utm_medium=newsletter&utm_campaign=health-score-is-not-an-intervention-trigger&utm_content=linkedin_newsletter`
- Calendar rule: replace the Wednesday slot; do not add a duplicate feed post

## Measurement

Record after each edition and for the four-edition block:

| Measure | Definition |
|---|---|
| LinkedIn Newsletter subscribers | Aggregate count before and seven days after each edition |
| Article views and reach | Aggregate LinkedIn edition analytics |
| Tagged visits | Unique first-party sessions with `linkedin_newsletter` attribution |
| Qualified-action sessions | Tagged sessions that open a resource, share, answer the reader pulse, or visit the CS Analyzer demo |
| Acquired website subscribers | New subscriber records with the exact campaign attribution |
| Active at day 30 | Acquired subscribers still active after the full retention window |

The aggregate report is `scripts/report_linkedin_funnel.py`. Its CID-004 section filters the exact `linkedin / newsletter / */ linkedin_newsletter` surface, reports unique tagged sessions, qualified-action sessions, acquired website subscribers, current-active status, and a per-edition campaign breakdown. Exact day-30 retention remains in the admin retention dashboard because it depends on status history rather than current subscriber state.

Qualified-action sessions contain at least one resource open, content share, reader-pulse response, or CS Analyzer demo visit. They are deduplicated by privacy-safe session ID. No viewer, follower, subscriber email, or free-text response is read into the report.

## Readout calendar

| Edition | Seven-day aggregate read | Day-30 eligibility begins |
|---|---|---|
| 26 August | 2 September at 18:15 Sydney | 25 September at 18:15 Sydney |
| 2 September | 9 September at 18:15 Sydney | 2 October at 18:15 Sydney |
| 9 September | 16 September at 18:15 Sydney | 9 October at 18:15 Sydney |
| 16 September | 23 September at 18:15 Sydney | 16 October at 18:15 Sydney |

Use the 23 September read for the weekly-versus-monthly format decision only after confirming all four editions went live with the exact tracked links. Use the 16 October retention read as a quality check, not as permission to rewrite the earlier acquisition result.

The Tuesday short post remains `CID-001` with `tuesday_launch` attribution. Its first 24 hours are uncontested. After Wednesday starts, compare the two surfaces descriptively by their separate labels; do not claim a causal channel winner from concurrent distribution.

## Decision rule

Twenty unique tagged visits across the four editions is the minimum evidence floor. Keep the weekly cadence if the block produces attributable qualified action or acquired website subscribers without weakening editorial quality. If it does not, reduce LinkedIn Newsletter to monthly, revise the native format, and preserve the subscriber audience rather than flooding it.

Platform reference: [LinkedIn newsletter access and subscriber notifications](https://www.linkedin.com/help/linkedin/answer/a517925).
