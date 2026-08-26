# Tuesday distribution baseline: 25 August 2026

**Status:** Activated. Kuber approved the Tuesday short post and explicitly added a separately tagged native LinkedIn Newsletter edition for Wednesday.

**Observation window:** 25 August 2026 08:15 UTC to 1 September 2026 08:14 UTC.

**Canonical issue:** `stealing-sprint-planning-from-engineering`

**Tracked variant:** `linkedin / post / stealing-sprint-planning-from-engineering / tuesday_launch`

## Decision this run supports

Can Churn Is Dead reliably attribute useful reader behaviour and subscriber acquisition to the approved Tuesday short post and the reactivated native LinkedIn Newsletter as two distinct acquisition surfaces?

This is a measurement baseline, not an A/B test and not evidence that LinkedIn is the best channel.

## Hypothesis

One evidence-led LinkedIn post, with the canonical article in the first comment, will produce tagged visits and at least one observable qualified action or acquired signup during the seven-day window.

## Distribution treatments

- Publish the approved Tuesday LinkedIn adaptation after the canonical website issue is verified live, using the exact `tuesday_launch` first-comment URL from the issue package and manager sheet.
- Publish the substantial native LinkedIn Newsletter adaptation on Wednesday 26 August at 18:15 Sydney, using the exact `linkedin_newsletter` URL in the edition.
- Do not publish the displaced Wednesday carousel or another duplicate launch post.
- Make no other website conversion change during the window.

The issue thesis, article CTA, playbook, Tuesday posting time, first-comment placement, and website experience remain fixed. Do not add Medium, a follow-up short launch post, paid distribution, or a second CTA test. The Tuesday post has an uncontested first 24-hour window; after the newsletter starts, report each surface by its exact attribution label and do not claim the run isolates channel causality.

## Aggregate measures

| Measure | Definition | Use |
|---|---|---|
| Tagged visits | Unique first-party sessions with the exact `tuesday_launch` or `linkedin_newsletter` campaign variant and a page view | Per-surface denominator and instrumentation check |
| Form-view sessions | Unique tagged sessions that saw a subscription form | CTA exposure diagnostic |
| Qualified-action sessions | Unique tagged sessions that opened a resource, shared, answered the reader pulse, or visited the CS Analyzer demo | Reader activation |
| Acquired signups | Subscriber records created with the exact campaign variant, regardless of later subscription status | Primary acquisition outcome |
| Still active | Acquired signup records currently subscribed | Early safety signal, not mature retention |
| Meaningful replies | Manual aggregate count of replies that discuss the operating problem | Qualitative signal; store no identity or message content |

Primary observed rate: acquired signups / tagged visits.

Secondary observed rate: qualified-action sessions / tagged visits.

## Validity and decision rules

1. Each surface is measurable only if its approved URL is posted exactly, at least one tagged visit is recorded, the full surface window elapses, and no competing asset uses its campaign label.
2. If the post is confirmed live but tagged visits remain zero, diagnose posting or attribution. Do not label the topic a failure.
3. Fewer than 20 tagged visits on a surface is descriptive only. Extend that surface without adding another attribution label. The 20-visit floor is an internal operating rule, not statistical significance.
4. Regardless of reach, do not declare a winning format from this issue. The decision after Week 1 is whether measurement is usable and whether the same controlled baseline should continue.
5. Do not begin the hard-problem versus operating-model opening test until two baseline weeks have complete campaign, form, qualified-action, and acquisition recording.

## Preflight record

| Check | Required evidence | Status |
|---|---|---|
| Canonical article live | Public URL returns the approved issue after 08:00 UTC | Pending |
| Playbook works | PDF opens from the canonical issue | Verified 24 August |
| LinkedIn approval recorded | `distribution-approval.json` and manager sheet agree | Verified 24 August |
| Exact tracked link present | Package and manager sheet contain the registered four-part campaign; verify the live first comment after posting | Staged |
| Native newsletter scheduled | `Product does not need another customer request`, Wednesday 26 August at 18:15 Sydney | Verified 24 August |
| No unlabelled competing distribution | No Medium, paid distribution, duplicate launch post, or Wednesday carousel | Verified pre-launch |
| Aggregate dashboard ready | Variant row can report visits, form views, qualified sessions, acquired, and active | Verified in production 25 August |

## Exact pre-launch aggregate baseline

Captured with read-only aggregate SQL in the linked production Supabase project
on 25 August 2026 before either labelled release began. No subscriber identity,
email address, session identifier, or free text was read or exported.

| Measure | Value | Interpretation |
|---|---:|---|
| Subscriber records | 325 | Exact row count, not a table estimate |
| Currently active subscribers | 325 | Current status only; not mature cohort retention |
| Acquired in the last 7 days | 1 | The same one record is currently active |
| Acquired in the last 30 days | 14 | All 14 are currently active |
| Acquired in the last 90 days | 65 | The latest two weekly cohorts contained one acquisition each |
| Recent acquisition with no source or medium | 64 of 65 | Historic channel contribution cannot be reconstructed honestly |
| Recent acquisition labelled direct | 1 of 65 | Descriptive only |
| `tuesday_launch` tagged sessions / acquisitions | 0 / 0 | Correct pre-launch zero |
| `linkedin_newsletter` tagged sessions / acquisitions | 0 / 0 | Correct pre-launch zero |

The growth problem is therefore not literal zero acquisition across the quarter;
it is a sharp recent slowdown combined with almost no historic channel
attribution. CID-001 and CID-004 are designed to make the next acquisition
observable, not to retrofit certainty onto the previous 65.

## Result record

Complete only after the observation window. Never add names, email addresses, profile URLs, or reply text.

### Mid-window diagnostic, 26 August 2026

Read-only aggregate SQL recorded 43 first-party page-view sessions after the Tuesday release boundary. Seven carried the exact `linkedin / post / stealing-sprint-planning-from-engineering / tuesday_launch` tuple. That surface had zero qualified-action sessions and zero acquired subscribers at this early read. Across all traffic there were eight form-view sessions, zero form-submit sessions and zero signup-success sessions. This is descriptive only: seven tagged visits is below the 20-visit evidence floor and the observation window remains open.

The signed-in 17-hour LinkedIn post view recorded 870 impressions, 542 members reached, 43% out-of-network reach, 42 social engagements, 18 reactions, 21 comments, two saves, one LinkedIn send, two profile viewers and zero followers attributed by LinkedIn. The tracked-link first comment had 171 impressions and one reaction. The website recorded seven exact `tuesday_launch` issue sessions, of which two reached a subscription form and none submitted it.

The topic generated useful conversation with the intended audience: LinkedIn reports Customer Success Manager as 20% of reached job titles and Senior as 46% of reached seniority. The weak point is outbound visibility. A first-comment link received materially fewer impressions than the post, so seven site visits cannot be treated as evidence that the issue or website failed. After this baseline closes, stage one isolated direct-link-versus-first-comment test on a comparable post. Keep the issue, CTA and destination stable, use distinct campaign labels, and do not claim a format winner below 20 tagged visits per route.

| Result | Value |
|---|---|
| Tagged visits | Pending |
| Form-view sessions | Pending |
| Qualified-action sessions | Pending |
| Acquired signups | Pending |
| Still active | Pending |
| Meaningful replies, aggregate | Pending |
| Visit-to-action rate | Pending |
| Visit-to-signup rate | Pending |
| Measurement gate | Pending |
| Next decision | Pending |
