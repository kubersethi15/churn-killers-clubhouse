# Editorial and release handoff

Prepared 6 October 2026. Status: **approved by Kuber on 6 October**, not staged
or scheduled. Planned website slot: Tuesday 13 October 2026 at 18:00 Sydney
(07:00 UTC). Email and native LinkedIn distribution are separate gates.

## Model and voice

- Kuber explicitly requested GPT-6 Sol for this one issue. The current turn's
  local `turn_context.model` was verified as `gpt-6-sol` before the substantive
  editorial review. The default Astra rule remains in place for later issues.
- One message: a prior customer yes is not a blank cheque for another ask. The
  opening and closing example is explicitly fictional, not Kuber's account.
- Plain-English pass: explained CS on first use, shortened the decision to
  ask / smaller ask / existing proof / wait, kept one real buyer question in the
  story, and removed jargon, hashtags, emojis and em dashes.
- Counterargument is included: some customers welcome the opportunity and a
  heavy approval process would hurt. The article proposes a short note in an
  existing opportunity, not a committee or another database.

## Evidence and editorial limits

- Three first-party GitLab documents support distinct reference uses, written
  permission, advocate workload and reciprocal value. They are examples of
  one company's operating choices, not an industry benchmark or causal study.
- No invented Kuber customer, employer event, sales outcome, churn effect or
  legal claim. No source is used to promise improved win rate or retention.
- The one-page aid earns its place by making the account-owner decision easy
  to capture and reuse; it is not an article summary or a multi-page worksheet.
- Editorial validator passed with no warnings at 1,649 words before approval.
  The `--require-approved` validator passed after Kuber's approval on 6 October.
- Four compact-playbook regression tests pass. The generated PDF is one page;
  text extraction includes the decision note and fictional-example label. The
  rendered page was visually checked for readable type, alignment and clipping.

## Release gates still open

1. Kuber approved the exact package on 6 October; `approval.json` records the
   named approval. Revalidate before staging.
2. Refresh remote main, integrate the package through a branch and PR, then
   stage with the deterministic Approved Newsletter Publisher. Local `git fetch`
   currently fails DNS; an open-PR search found none at preparation time.
3. At release, verify initial HTML, title, self-canonical, sitemap, RSS and the
   exact PDF response before any subscriber distribution.
4. Check sender health, domain, signed webhooks, provider suppressions,
   unsubscribe/footer, eligible active audience, prior sends and idempotent
   ledger. Keep `NEWSLETTER_SEND_ENABLED` false outside the authorised window.
5. Native LinkedIn Newsletter requires separate title, body, link, calendar,
   duplicate-queue and action-time checks. Do not infer it from the website
   issue or Tanya's feed calendar.
