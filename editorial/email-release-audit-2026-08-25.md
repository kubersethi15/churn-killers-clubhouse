# Subscriber email release audit

**Reviewed:** 25 August 2026  
**Issue:** `stealing-sprint-planning-from-engineering`  
**Status:** production broadcast completed 25 August 2026; aggregate outcome verified 26 August

## Reader-facing decision

- **From:** Churn Is Dead `<newsletter@churnisdead.com>`
- **Reply-to:** `hello@churnisdead.com`
- **Subject:** Your backlog is not a customer commitment
- **Preheader:** A 30-minute review that helps CS and Product give the customer an honest next answer.
- **Primary action:** Read the issue and get the playbook
- **Canonical route:** the exact Churn Is Dead issue URL with one `newsletter/email` tracked link

The list is too small for three simultaneous subject variants to produce a dependable decision. This release uses one specific subject and one controlled preheader. The body gives the reader the opening argument before asking for a click.

## Repairs made

1. Removed the fade-out, duplicate reading links, LinkedIn share block, and Starter Kit promotion.
2. Added a faithful plain-text alternative to every production and test message.
3. Made test sends use the exact production subject, preheader, HTML, plain text, signed unsubscribe URL, and one-click headers.
4. Restricted test sends to an active subscriber address so unsubscribe testing cannot silently point at the homepage.
5. Added a required `NEWSLETTER_POSTAL_ADDRESS` gate and placed the lawful address in both message formats.
6. Preserved individual addressing, stable sender identity, reply handling, signed one-click unsubscribe, idempotency, and aggregate delivery-event processing.

## Local evidence

- 23 focused template, payload, idempotency, and unsubscribe tests pass.
- Repository TypeScript check and focused lint pass.
- The approved issue validator passes.
- Rendered HTML is approximately 6 KB, well below Gmail's clipping threshold.
- Desktop visual review and semantic link review pass.
- The email contains one main campaign link, the archive utility link, and the required unsubscribe route.
- Resend confirms the sending domain is verified. Open tracking and click rewriting are both disabled, so the main campaign URL remains a direct `churnisdead.com` link and aggregate attribution moves to the website session.

## Production gate used for this release

The release was originally held behind these checks:

1. Kuber provides the business or PO Box mailing address to store as `NEWSLETTER_POSTAL_ADDRESS`. The weekly sender and welcome email now both fail closed without it.
2. The repaired function from merged PR #152 is deployed and its downloaded source matches `main`.
3. The approved issue metadata, including the single subject and preheader, is staged in Supabase.
4. One production-equivalent test reaches an active address controlled by Kuber.
5. Desktop, mobile, plain text, reply-to, exact canonical link, visible unsubscribe, one-click POST, authentication and provider insights are checked from that received message.
6. Resend no longer presents current sender health as unsafe for this broadcast.

Kuber then supplied the mailing address, approved the received production-equivalent test and explicitly instructed that the issue be sent to subscribers. The broadcast proceeded under that release decision. Do not treat the successful send as permission to bypass the same gate for a future issue: recheck the approved issue, lawful footer, test message, sender authentication, suppression handling and aggregate provider health every Tuesday.

## Aggregate production outcome

Captured with read-only aggregate SQL on 26 August 2026. No email address, subscriber identifier, provider message identifier or recipient-level outcome was read or exported.

| Measure | Value | Interpretation |
|---|---:|---|
| Production `email.sent` events | 312 | Provider-accepted send events for the approved issue; excludes the separate test message |
| Production `email.delivered` events | 310 | Provider delivery events, not proof of inbox placement or readership |
| Provider suppressions | 11 | Correctly removed from the active subscriber list |
| Transient bounce events | 2 | Temporary failures; the webhook correctly did not unsubscribe these records |
| Complaint events | 0 | Early safety signal only |
| Other inactive status changes | 2 | Not matched to a suppression or bounce within five minutes; the current ledger does not prove whether these were reader unsubscribes or another status-change route |
| Active subscribers after processing | 312 of 325 records | Current sendable list size, not an acquisition result |

The subject was `Your backlog is not a customer commitment`, and the recorded newsletter slug was `stealing-sprint-planning-from-engineering`. The first clean broadcast reduced the sendable list mainly through provider suppression. That is healthy list hygiene. The two unmatched inactive events are reported separately rather than being labelled as unsubscribes without evidence.

Inbox placement cannot be guaranteed by copy or code. Mailbox providers make the final decision using authentication, reputation, wanted-mail signals, complaint rates, list quality, sending history, and message construction. The release therefore fails closed instead of treating a successful API response as proof of inbox delivery.

## Primary guidance used

- Google Email sender guidelines: <https://support.google.com/mail/answer/81126>
- Yahoo Sender Best Practices: <https://senders.yahooinc.com/best-practices/>
- RFC 8058 one-click unsubscribe: <https://www.rfc-editor.org/rfc/rfc8058.html>
- Resend Deliverability Insights: <https://resend.com/docs/dashboard/emails/deliverability-insights>
- Resend unsubscribe guidance: <https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails>
