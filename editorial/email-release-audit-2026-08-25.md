# Subscriber email release audit

**Reviewed:** 25 August 2026  
**Issue:** `stealing-sprint-planning-from-engineering`  
**Status:** template repaired and locally verified; production broadcast remains disabled

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

## Production gate still closed

Do not enable `NEWSLETTER_SEND_ENABLED` until all of these are true:

1. Kuber provides the business or PO Box mailing address to store as `NEWSLETTER_POSTAL_ADDRESS`.
2. The repaired function from merged PR #152 is deployed and its downloaded source matches `main`.
3. The approved issue metadata, including the single subject and preheader, is staged in Supabase.
4. One production-equivalent test reaches an active address controlled by Kuber.
5. Desktop, mobile, plain text, reply-to, exact canonical link, visible unsubscribe, one-click POST, authentication and provider insights are checked from that received message.
6. Resend no longer presents current sender health as unsafe for this broadcast.

Inbox placement cannot be guaranteed by copy or code. Mailbox providers make the final decision using authentication, reputation, wanted-mail signals, complaint rates, list quality, sending history, and message construction. The release therefore fails closed instead of treating a successful API response as proof of inbox delivery.

## Primary guidance used

- Google Email sender guidelines: <https://support.google.com/mail/answer/81126>
- Yahoo Sender Best Practices: <https://senders.yahooinc.com/best-practices/>
- RFC 8058 one-click unsubscribe: <https://www.rfc-editor.org/rfc/rfc8058.html>
- Resend Deliverability Insights: <https://resend.com/docs/dashboard/emails/deliverability-insights>
- Resend unsubscribe guidance: <https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails>
