# Welcome starter-kit activation audit

**Workstream:** `LOOP-03`  
**Date:** 24 August 2026  
**Decision owner:** Codex  
**State:** Instrumentation repaired; observe until the minimum evidence gate

## Decision this audit must support

The welcome email should help a new subscriber reach one useful operating path,
not merely record a send or an open. We will change one welcome element only
after at least 20 unique tagged click sessions show where readers start and
whether they reach a qualified action.

At fewer than 20 sessions, every result is descriptive. Do not change the
subject, promise, path order, or number of choices during `CID-001`.

## Event dictionary

| Signal | Exact definition | Why it matters |
|---|---|---|
| Welcome email accepted | A subscriber has a non-null `welcome_email_sent_at`; the marker is cleared when the email provider rejects the send | Confirms the provider accepted the first-party welcome send; it is not an inferred open or delivery claim |
| Tagged click session | The first `page_view` in a unique session with `welcome / email / starter_kit` attribution | Shows that the welcome email moved a reader back to the owned site |
| Start path | The first tagged page is `/start` | Reader chose the problem-led routing page |
| Vault path | The first tagged page is `/playbook` | Reader chose the operating-tool library |
| Diagnostic path | The first tagged page is `/ai-exposure-score` | Reader chose the directional role diagnostic |
| Qualified action | The same tagged session opens a resource, shares content, answers the closed reader pulse, or reaches the CS Analyzer demo | Distinguishes a useful action from a landing-page click |
| No qualified action | A tagged click session has none of the qualified events above | Identifies a possible welcome-to-resource continuity problem without pretending to know why the reader left |
| Reply | Aggregate count reviewed manually in the provider or mailbox, without reading, exporting, or recording identities or message content | Reply is a valuable signal but cannot be joined safely to first-party session events |

The three welcome destinations now carry `utm_content=start`,
`utm_content=vault`, and `utm_content=diagnostic`. The aggregate dashboard still
uses the first tagged page as the authoritative path so legacy clicks without
the new content label remain measurable.

## Live baseline

The privacy-safe reports were run against the linked production project on 24
August 2026:

- two subscribers were acquired in the last seven days;
- zero welcome sends were marked provider-accepted in the last 30 days;
- zero tagged welcome click sessions and zero qualified welcome sessions were recorded;
- one welcome-function failure log existed and was the generic `invalid welcome email payload` class; no subscriber identity or payload was read;
- five LinkedIn-tagged sessions were recorded in the last seven days, with zero acquired subscribers and zero qualified actions;
- all of these figures are below the 20-session decision floor.

This does not prove the welcome email is poor. It proves the current live sample
cannot support a copy decision and that accepted-send visibility needs to ship
before the next acquisition window adds readers.

## Implementation

- `get_welcome_activation_dashboard()` returns aggregate-only accepted sends,
  click sessions, qualified sessions, dead-end sessions, and first-path rows to
  authenticated admins.
- The private Growth dashboard shows the evidence gate and does not expose
  emails, subscriber ids, session ids, or free-text replies.
- `scripts/report_welcome_activation.py` provides the same decision readout from
  a PII-free service-key projection; its output never prints session ids.
- The welcome links retain the same public destinations and copy. Only their
  measurement labels change during `CID-001`.

## Next decision and stop rule

1. Deploy the database function and welcome-email function.
2. Verify the private dashboard loads the aggregate panel.
3. Re-run the report after each Tuesday acquisition window until 20 tagged
   welcome click sessions exist.
4. If one path produces qualified action while another repeatedly stops at the
   landing page, test moving the productive path to the primary position. That
   is the single changed variable.
5. If 20 tagged click sessions produce zero qualified actions, replace the
   three-choice welcome block with one problem-led primary path and measure
   another 20 sessions.
6. Stop the experiment and restore the prior layout if complaints or bounces
   worsen, or if the changed path does not improve qualified-action sessions.

Do not build a seven-day nurture sequence until this first welcome decision is
measurable and provider safety remains healthy.
