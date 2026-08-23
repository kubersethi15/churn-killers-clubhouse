# Churn Is Dead Editorial Runbook

The website is the canonical publication. LinkedIn is optional and always manually reviewed. Medium remains manual-only. No production workflow asks an LLM to research, draft, approve, or publish an issue.

## Weekly rhythm

### Sunday: research and prepare

Use the `churn-is-dead-editorial` Codex skill. Read the editorial contract, verified experience ledger, recent issues, and content audit before choosing a thesis. Prefer primary sources and official guidance. Create a pending issue package containing:

- `metadata.json`
- `content.md`
- `evidence.json`
- `playbook.json`
- `linkedin.md` when LinkedIn distribution is useful
- `approval.json` with status `pending`

Run the validator and review every warning. A draft is not a publication decision.

### Before Tuesday: approve and stage

Kuber reviews the thesis, factual support, first-person claims, tone, playbook, and LinkedIn copy. Only then change `approval.json` to `approved`, with the approver, timestamp, and basis.

```sh
python3 scripts/validate_editorial_issue.py editorial/issues/<slug> --require-approved
python3 scripts/publish_editorial_issue.py editorial/issues/<slug> --dry-run
```

Open a pull request. Merge the approved package to `main`. The approved publisher updates the existing Supabase row by exact slug or creates it if absent. Future-dated issues remain hidden.

### Tuesday: release

The publication timestamp is Tuesday 08:00 UTC. In Sydney that is 18:00 during AEST and 19:00 during AEDT. The scheduled workflow runs at 08:05 UTC to regenerate the public article, social image, sitemap, RSS feed, and Playbook Vault manifest after the issue becomes eligible.

Confirm:

1. The article URL returns the approved title and body.
2. The playbook downloads and appears in the vault.
3. Sitemap, RSS, canonical URL, and social image use the approved issue.
4. No pre-publication draft is available at the article URL.
5. If publishing on LinkedIn, paste from `linkedin.md`, re-read it in context, and post manually.

## Corrections and rollback

Never create a second issue to correct a scheduled draft. Keep the same slug, update the package, revalidate it, and merge the correction. The publisher performs an exact-slug update.

To hold an issue, change `approval.json` back to `pending` and remove or postpone the publication timestamp in Supabase. Regenerate the public discovery assets so no future static page remains. Do not delete subscriber or send history.

## Email safety prerequisites

The website release is independent from email. If subscriber delivery is enabled, require all of the following before sending:

- one individually addressed message per subscriber, never BCC;
- a signed per-subscriber unsubscribe URL and one-click unsubscribe headers;
- verified Resend webhook signatures using `RESEND_WEBHOOK_SECRET`;
- the production gate `NEWSLETTER_SEND_ENABLED=true` set only after the current provider deliverability review passes;
- idempotency keys and recorded provider message IDs;
- bounce and complaint suppression;
- a test send reviewed on mobile and desktop.

If any prerequisite is missing, publish to the website and hold the email send.

Use `editorial/email-operations.md` for the cutover and post-send checks. Never use the retired correction sender or any BCC-based workaround.

## Quality review

Every issue must make one defensible argument, distinguish sourced fact from proposal, link visible sources, avoid invented experience and unsupported metrics, provide a usable artifact, and tell the reader what to do next. Optimise for trust and practical value, not content volume.
