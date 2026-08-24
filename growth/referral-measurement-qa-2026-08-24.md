# Referral measurement QA

**Workstream:** `LOOP-01` and `LOOP-02`  
**Date:** 24 August 2026  
**State:** Repair implemented; evidence gate reset from exact tracking start

## Why this repair exists

The first referral dashboard used `content_share` for every post-signup share
button. That overstated certainty for LinkedIn: opening the composer does not
prove the reader published the share. The rolling rate also divided acquired
subscriber records by visits, even though more than one address can be
submitted in one browser session. The acquisition count was useful, but the
percentage was not an exact converted-session rate.

## Exact event semantics

| Signal | Exact meaning |
|---|---|
| Share intent | A post-signup reader opened the LinkedIn composer. Completion is not inferred. |
| Completed share path | The native share promise resolved successfully, or the private message or referral link was copied successfully. |
| Referred visit | One unique first-party session arrived with `subscriber_referral / share` attribution. |
| Converted visit | A referred visit session produced at least one subscriber record after that visit. |
| Acquired subscribers | All subscriber records produced by matched referred visit sessions. This may exceed converted visits if one session submits more than one address. |
| Active subscribers | Acquired subscriber records currently subscribed. Exact day-30 status remains in the retention dashboard. |

Welcome-email share-button opens remain excluded from share-intent and
completed-share counts because they open a third-party composer or mail client
without passing through a first-party redirect. Referred visits and acquisitions
from those links remain measurable through their destination attribution.

## Measurement boundary

Exact intent-versus-completed-share measurement begins when migration
`20260825002000_exact_referral_event_semantics.sql` deploys. Historical LinkedIn
composer opens that were previously logged as `content_share` are not guessed
or reclassified. The dashboard filters share-intent and completed-share counts
from the exact tracking start while retaining the rolling 30-day referred-visit
and acquisition view.

The visit-to-signup percentage now uses converted visit sessions divided by
referred visit sessions. Acquired and active subscriber counts remain separate
outcomes.

## Evidence gate

Do not revise the referral prompt before both conditions are met:

- 10 unique completed post-signup share sessions; and
- 20 unique referred visit sessions.

At smaller samples, report counts only. If 10 completed share sessions produce
no referred visit, test one prompt change. If referred visits appear but do not
produce converted sessions, inspect destination continuity before changing the
share prompt.

## Rollback

Revert the UI event-name change and the additive RPC migration. Existing
referral URLs, destinations, and subscriber attribution remain intact.
