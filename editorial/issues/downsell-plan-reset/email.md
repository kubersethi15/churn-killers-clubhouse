# Subscriber email release draft

Status: pending issue-specific release approval. No staging, test email or production send performed.

Subject: Your customer bought less. What changed in the plan?

Preheader: Keep, narrow or pause the work, with the customer owner and service commitments clear.

Body: the complete approved version of content.md, rendered through the existing deployed send-latest-newsletter template. The deployed function removes the duplicate first-line title and uses the selected subject/preheader. No separate teaser-only or new broadcast template is proposed.

Planned canonical article: https://churnisdead.com/newsletter/downsell-plan-reset

Planned PDF: https://churnisdead.com/pdfs/Downsell_Plan_Reset_ChurnIsDead.pdf

These routes are not yet live. Website initial HTML, exact self-canonical, sitemap, RSS and downloadable PDF must pass after the approved release time before the subscriber send.

Before production, obtain the exact production-equivalent preview through the established owner-controlled active test subscriber. Verify current sender/domain health, signed webhook events, suppressions, footer/postal address, real signed unsubscribe and one-click headers, original-cohort completion and recipient acceptance ledger. Do not use a fake unsubscribe link as proof. No gate is marked passed from local editorial inspection alone.

If explicitly approved, target only downsell-plan-reset and eligible unsent recipients through the existing deployed function. Open NEWSLETTER_SEND_ENABLED only during that production window and restore false in finally. Reconcile acceptance before any retry; never resend an accepted recipient or create another Resend broadcast. Do not add recipients, channels, feed posts or a native edition from this approval.

Requested publication: Tuesday 24 November 2026, 18:00 Australia/Sydney (07:00 UTC). Send once only after the independent email and public-route gates pass. Any blockage must be reported with website and email states separate.
