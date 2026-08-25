# Email operations

The website is the canonical publication. Email is a separate, fail-closed distribution channel.

## Current hold

Do not broadcast while Resend marks deliverability or bounce health as risky, while no signed event webhook is configured, or while any safety prerequisite below is missing. A website issue can still release on Tuesday.

`send-latest-newsletter` requires `NEWSLETTER_SEND_ENABLED=true` for a production broadcast. Leave it unset or set it to `false` while email is held. Test sends still require an authorised admin request.

The legacy `send-correction-email` function is retired. It must not be used for tests, corrections, or broadcasts.

## Cutover checklist

Before enabling a production send:

1. Confirm `churnisdead.com` is verified in Resend.
2. Configure the deployed `resend-webhook` URL in Resend for all email events, including delivered, bounced, complained, suppressed, opened, and clicked.
3. Store the Resend signing secret as `RESEND_WEBHOOK_SECRET` in Supabase. Never copy it into the repository, a ticket, or a chat.
4. Confirm `NEWSLETTER_UNSUBSCRIBE_SECRET` exists and the unsubscribe function works from a real test message.
5. Confirm the send function produces one `to` address per message. Do not use CC or BCC for subscribers.
6. Confirm the newsletter has explicit editorial approval and email distribution approval.
7. Configure `NEWSLETTER_POSTAL_ADDRESS` with the lawful business or PO Box mailing address that appears in both HTML and plain-text footers. Never invent or infer this address.
8. Send one production-equivalent test to an active subscriber address controlled by Kuber. Check desktop, mobile, subject, preheader, plain text, reply-to, links, the one-click unsubscribe header, the visible unsubscribe link, and the mailing address.
9. Review Resend's current provider health signals and suppressions. Use the provider's current risk classification rather than a static benchmark copied into this runbook.
10. Enable `NEWSLETTER_SEND_ENABLED=true` only for the approved production window.

## Subscriber email content contract

- Use one specific subject for a small list. Do not split a few hundred readers across underpowered variants and mistake noisy opens for evidence.
- Pair the subject with a controlled preheader that adds the consequence or outcome instead of repeating the title.
- Give the reader the opening argument in the email. Use one primary tracked route to the canonical issue and playbook.
- Include a faithful plain-text alternative, a reply invitation, a quiet visible unsubscribe link, and the lawful mailing address.
- Keep sharing, starter-kit, archive, and other secondary campaigns out of the main body. The footer may carry the archive as a utility link.
- Never use fake reply prefixes, urgency tricks, all caps, emoji, or punctuation engineered only to force an open.

Webhook retries and manual replays must return success without creating a second `email_events` row. Permanent bounces, complaints, and provider suppressions deactivate the subscriber. An explicitly temporary bounce is recorded against the send but does not unsubscribe the reader.

## After a production send

1. Confirm every accepted message has a recorded Resend message ID.
2. Confirm webhook events are arriving and signature failures are not present in function logs.
3. Confirm permanent bounces and complaints suppress the affected subscriber before the next send; confirm temporary delivery failures do not silently remove readers.
4. Record delivered, bounced, complained, opened, and clicked counts for the issue. Keep reporting aggregate.
5. Return `NEWSLETTER_SEND_ENABLED` to `false` after the approved send window.
6. If the provider flags risk, stop the next broadcast and diagnose the recipient and sending pattern. Do not route around a suppression.

## Corrections

Correct the canonical website first. If an email correction is genuinely necessary, create an approved issue-specific correction through the same per-recipient sender and unsubscribe controls. Do not revive the legacy BCC sender.
