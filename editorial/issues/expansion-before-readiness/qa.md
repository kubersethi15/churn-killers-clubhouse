# Editorial and release handoff

## Plain-English revision, 27 September

Kuber liked the direction and requested simpler, natural language throughout.
Rewrote the article, metadata, sender-aligned teaser and one-page guide. Replaced
abstract terminology with concrete work, people and dates; explained CS on first
use; kept source limits and labelled examples. The fictional example now uses
data cleanup rather than data mapping, consistently in article and guide.
No deliberate typos added. Editorial validation and ten tests pass; regenerated
one-page PDF visually checked. Email extraction retains the made-up-example
disclosure. No publishing or scheduling action taken in this editing pass.

Prepared 27 September 2026. Status: **approved for scheduling**, staging not yet verified.
Proposed website publication: Tuesday 29 September 2026, 18:00 Australia/Sydney
(08:00 UTC). Subscriber send follows live-route and current email-safety gates.

## Model and topic

- Executing session's latest `turn_context.model` verified as `gpt-6-astra` before drafting. Astra drafted and performed the substantive critique in this session. No independent reviewer is claimed.
- Recent sequence: renewal evidence, senior-CSM authority, health-score intervention, customer-side AI work. This issue returns to commercial mechanics rather than repeating AI or health-score content.
- Existing archive includes expansion-opportunity identification and timing. This issue's narrower decision is whether to proceed, phase or pause a willing buyer's proposed scope when delivery dependencies are unresolved.
- Thesis is an editorial proposal, not a proven causal intervention. Two first-party sources support bounded planning principles only. No revenue uplift, churn reduction, universal threshold or invented first-person result.

## Substantive critique and fixes

1. Avoid an anti-Sales framing: opening commercial counterargument includes capability constraints, independent departments and the cost of waiting. CS does not get a unilateral veto.
2. Avoid paternalism in the subject: article makes customer choice explicit and separates buying now from deploying now. Buying ahead can be reasonable if the trade-off is understood.
3. Prevent bureaucracy: apply the note to material new dependencies, not every seat increase. Store it in the existing opportunity, not a new tracker.
4. Avoid a vague hold: every pause needs the condition that changes the answer and a review date.
5. Preserve factual boundaries: fictional example clearly labelled; GitLab practice and Microsoft's legacy migration guidance are not represented as expansion-results research.
6. Artifact earns its place as an account-owner/customer-delivery decision aid. One page, three actions, short worked example and an evidence-only prompt. Not a six-page worksheet.
7. Sender integration checked: `email.md` documents the actual opening-paragraph teaser, not a nonfunctional body override. Removed the alternate subject from metadata; no underpowered A/B split.

## Verification

- `validate_editorial_issue.py`: PASS, no warnings.
- `--require-approved`: correctly blocks with exactly the pending-approval error.
- Compact playbook, email subject and approval provenance unit suites: 10 tests PASS.
- PDF generated through existing compact renderer; exactly one page. Rendered PNG visually inspected: no clipping, overlap or unreadable content.
- Minimal renderer fix permits an issue-specific example heading while preserving the old default; regression test verifies both prior and new outputs.
- Actual TypeScript email formatting and template functions checked under Node: fictional-example disclosure retained, one selected subject, exact `utm_content=read_issue` URL in HTML and plain text, unsubscribe placeholders retained. HTML output 5,729 bytes. Test used a placeholder postal address, not a production send.
- No production provider check, actual email-client inbox test or spam-placement guarantee is claimed.

## Remaining release gates

1. Complete: Kuber explicitly requested scheduling after the plain-English rewrite. Approval recorded at 2026-09-26T23:41:30Z.
2. Complete: authorised network access restored GitHub fetch; no open PRs. Release isolated on fresh origin/main c07ca67. Existing unrelated dirty files preserved in the original checkout.
3. Merge and deterministically stage approved package. Metadata date is only a planned timestamp, not evidence of a live schedule.
4. Publish website build; verify initial HTML, self-canonical, exact PDF, sitemap and RSS.
5. Check eligible audience, provider suppressions and current health, signed webhook handling, footer and unsubscribe, plus absence of prior send. Use existing sender and idempotency. Return send switch to false after the authorised production window.
6. Native LinkedIn Newsletter schedule remains separate and unconfirmed. Do not replace Tanya's approved Tuesday Customer Work follow-up or add a duplicate feed post.

Local review PDF: `output/pdf/Expansion_Decision_Note_ChurnIsDead.pdf`.
Publishing will regenerate the identical content under the public PDF path.
