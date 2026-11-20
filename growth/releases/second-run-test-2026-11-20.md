# Second Run Test release completed — 20 November 2026

The approved Tuesday 17 November 18:00 Sydney release was delayed by unavailable browser publishing access. Codex completed the existing release under Kuber's explicit approval at approximately 08:30 Sydney on Friday 20 November when access recovered. The earlier blocker is resolved. This is the actual deployment date; the approved issue retains its 17 November editorial date.

## Website

Main a40b2f398c8e9825fc6bd192fb1835827209d873 was published through the existing Lovable project 6e0fea1a-7b20-4f35-aac1-28c17aa57724. Lovable confirmed the website was updated. No duplicate publisher workflow was dispatched. Public HTTP checks and in-app browser visual inspection passed:

- Article: https://churnisdead.com/newsletter/second-run-test — HTTP 200, 24,828 bytes, initial HTML exact title and self-canonical.
- PDF: https://churnisdead.com/pdfs/Second_Run_Check_ChurnIsDead.pdf — HTTP 200, 3,231 bytes, valid PDF header; previously visually verified one-page asset.
- Sitemap: HTTP 200, issue URL present.
- RSS: HTTP 200, issue present.

## Email gates and one-time send

Subject: It worked once. Can the customer run it again?

Preheader: One real workflow, one more run, and a clear decision on what the customer can take over.

Exact staged issue matched the approved repository package. Deployed send/template sources matched fresh main. Owner-controlled production-equivalent preview delivered with signed events; subject, preheader, fictional opening, tracked article CTA, unsubscribe, reply-to and footer verified. Current sender window 5–20 November before production: 3 sent / 3 delivered, zero bounce, complaint or failure. Enabled signed delivery webhook verified; invalid webhook and unsubscribe token rejected. Provider suppressions: 15, active suppression gaps: zero. Prior original active cohorts: zero acceptance gaps for champion-change-check, escalation-exit-criteria and renewal-evidence-packet. No older issue was broadcast again.

Production used only the established send-latest-newsletter function targeted to second-run-test and its recipient idempotency ledger. Four bounded batches accepted 100 + 100 + 100 + 21 = 321, each HTTP 200, zero invocation failures, pendingAfterRun zero. NEWSLETTER_SEND_ENABLED was restored false in finally and its digest verified.

At 08:36 Sydney: 321 accepted; 321 unique recipients; 321 unique provider IDs; 320 delivered; one accepted awaiting delivery confirmation; zero bounced, complained, delayed or unsigned outcomes. Independent eligible active unsent count: zero. Do not resend the accepted recipient awaiting a receipt. Later runs monitor aggregate provider outcomes only.

The existing informational password sign-up advisory was inspected before deployment. It concerned existing breached-password protection settings and did not arise from this static newsletter change. No auth setting, security finding, access permission or protection was changed.

No native LinkedIn edition, feed post, external comment or duplicate newsletter was added by this release. No recipient PII is recorded here.

## Midday outcome reconciliation, 12:27 Sydney

321 accepted, with 321 unique recipients/provider IDs; 320 delivered, one provider-delayed, zero bounces, complaints or unsigned events. No new send or switch mutation. The provider owns retries for the accepted delayed message.

## Afternoon receipt check, 15:27 Sydney

321 accepted, 320 signed delivered, one provider-delayed, zero bounced, complained, pending-sent or unsigned outcomes. No production action. The correct live article and worksheet link rendered in Codex in-app browser at about15:32, despite a Python request receiving403.


## Evening receipt check,17:27Sydney

321accepted,320signed delivered,oneprovider-delayed,zero bounces,complaints or unsigned events. No resend or production-switch change. The accepted delayed recipient remains with the provider for retry. Evening article/PDF preflight for the existing Saturday Note passed; PDF download byte-identical to the morning asset.


## Final overnight outcome,21November08:35–08:36Sydney

The accepted recipient previously delayed now has a signed Transient/General bounce. Total321unique accepted recipients/provider IDs,320delivered,1transient bounce,0complaints and0unsigned events. Ledger status320sent/1bounced does not reduce historical acceptance to320. No resend, switch change or suppression of a valid temporary failure. Permanent-bounce active suppression gaps0. New subscribers acquired after the completed broadcast do not require this older issue to be broadcast again.
