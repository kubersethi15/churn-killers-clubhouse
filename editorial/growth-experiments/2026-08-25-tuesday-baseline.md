# Tuesday distribution baseline: 25 August 2026

**Status:** Preregistered. External activation requires Kuber's explicit LinkedIn approval.

**Observation window:** 25 August 2026 08:15 UTC to 1 September 2026 08:14 UTC.

**Canonical issue:** `stealing-sprint-planning-from-engineering`

**Tracked variant:** `linkedin / post / stealing-sprint-planning-from-engineering / tuesday_launch`

## Decision this run supports

Can Churn Is Dead reliably attribute useful reader behaviour and subscriber acquisition to one approved Tuesday LinkedIn launch before testing alternative openings or adding channels?

This is a measurement baseline, not an A/B test and not evidence that LinkedIn is the best channel.

## Hypothesis

One evidence-led LinkedIn post, with the canonical article in the first comment, will produce tagged visits and at least one observable qualified action or acquired signup during the seven-day window.

## Single treatment

- Publish the approved Tuesday LinkedIn adaptation after the canonical website issue is verified live.
- Use the exact `tuesday_launch` first-comment URL from the issue package and manager sheet.
- Make no other distribution or website conversion change during the window.

The issue thesis, article CTA, playbook, posting time, first-comment placement, and website experience remain fixed. Do not add Medium, a LinkedIn Newsletter, a follow-up launch post, paid distribution, or a second CTA test.

## Aggregate measures

| Measure | Definition | Use |
|---|---|---|
| Tagged visits | Unique first-party sessions with the exact campaign variant and a page view | Denominator and instrumentation check |
| Form-view sessions | Unique tagged sessions that saw a subscription form | CTA exposure diagnostic |
| Qualified-action sessions | Unique tagged sessions that opened a resource, shared, answered the reader pulse, or visited the CS Analyzer demo | Reader activation |
| Acquired signups | Subscriber records created with the exact campaign variant, regardless of later subscription status | Primary acquisition outcome |
| Still active | Acquired signup records currently subscribed | Early safety signal, not mature retention |
| Meaningful replies | Manual aggregate count of replies that discuss the operating problem | Qualitative signal; store no identity or message content |

Primary observed rate: acquired signups / tagged visits.

Secondary observed rate: qualified-action sessions / tagged visits.

## Validity and decision rules

1. The run is measurable only if the approved URL is posted exactly, at least one tagged visit is recorded, the full seven-day window elapses, and no competing asset uses the campaign label.
2. If the post is confirmed live but tagged visits remain zero, diagnose posting or attribution. Do not label the topic a failure.
3. Fewer than 20 tagged visits is descriptive only. Extend the baseline through the second weekly issue without adding a new channel. The 20-visit floor is an internal operating rule, not statistical significance.
4. Regardless of reach, do not declare a winning format from this issue. The decision after Week 1 is whether measurement is usable and whether the same controlled baseline should continue.
5. Do not begin the hard-problem versus operating-model opening test until two baseline weeks have complete campaign, form, qualified-action, and acquisition recording.

## Preflight record

| Check | Required evidence | Status |
|---|---|---|
| Canonical article live | Public URL returns the approved issue after 08:00 UTC | Pending |
| Playbook works | PDF opens from the canonical issue | Pending |
| LinkedIn approval recorded | `distribution-approval.json` and manager sheet agree | Pending |
| Exact tracked link present | First comment contains the registered four-part campaign | Pending |
| No competing distribution | No Medium, LinkedIn Newsletter, paid, or duplicate launch post | Pending |
| Aggregate dashboard ready | Variant row can report visits, form views, qualified sessions, acquired, and active | Pending deployment approval |

## Result record

Complete only after the observation window. Never add names, email addresses, profile URLs, or reply text.

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
