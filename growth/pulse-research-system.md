# BC-05: the original-evidence engine (CS Pulse)

**By Claude, 25 August 2026.** Designs a reproducible research system that gives
Churn Is Dead one number nobody else has. BC-02 and BC-03 both named this as the
single biggest authority gap: the publication cites others' evidence or none,
which caps how far peers can cite it back.

**Status: designed, not activated.** Two gates block the run, both honest:
1. The costly-problem ledger (BC-01) must show one problem across two genuinely
   independent signal classes. On clean data it does not yet; the window is
   days old.
2. Monetization Gate 0 (measurement trustworthy) does not close until the
   CID-001 baseline ends on 1 September.

Activation is a deliberate later step, not this PR.

## The instrument

Five questions on one costly decision. Five is the ceiling: past that, completion
falls and the aggregate degrades. The decision is chosen from the ledger, not
guessed. As a worked example, if the ledger surfaces "QBRs that decide nothing":

1. In your last QBR, did the customer leave having decided something? (yes / no / unsure)
2. Who owns the QBR agenda? (CSM / customer / shared template / no one)
3. How long is your standard QBR? (bucketed)
4. What does the customer leave with? (slides / recap / action list / a decision record)
5. What is the single hardest part of running a QBR that matters? (one line, optional, free text NOT stored raw)

Rules: no identity field, no company field, no email tied to a response. Q5 free
text is classified into preset themes client-side and only the theme is stored.
This keeps the whole instrument aggregate-only and PII-free.

## The schema

A single aggregate table. One row per response, no identity, no raw free text.

```sql
create table if not exists public.pulse_responses (
  id uuid primary key default gen_random_uuid(),
  pulse_slug text not null,          -- which pulse, e.g. 'qbr-2026-q3'
  question_key text not null,        -- q1..q5
  answer_key text not null,          -- the chosen option key, never free text
  session_id uuid,                   -- dedupe only, never joined to a person
  created_at timestamptz not null default now()
);
```

RLS: insert-only for the anon key (like growth_events), never readable by anon.
Aggregate reads are server-side or via the service role. The migration is staged
in this branch and NOT applied, because activation is gated.

## Isolation and honesty rules

- A pulse is a labelled experiment with its own slug, reported separately from
  CID-001 and every other campaign, exactly like the channel-discipline rule.
- Minimum 30 qualified responses before any number is published. Below that the
  readout says "insufficient responses" and nothing else.
- The published number carries its own denominator every time. "62% of 41 CS
  operators" not "62% of operators." Never drop the n.
- No projection to the whole profession. It is a reader poll, described as one.
- Q5 themes are reported as counts, never as quotes, never attributed.

## The publishing loop

1. Ledger surfaces a repeated problem after clean data (gate 1).
2. Build the five-question pulse for it, one slug.
3. Run it inside one issue and on LinkedIn, tagged, for two weeks.
4. At 30+ responses, publish the aggregate readout as its own issue: the one
   number, the denominator, the honest uncertainty, and what it means for the
   reader's next decision. This readout is an Evidence Brief (BC-04 format 3).
5. Every respondent gets the readout. That is the reciprocity that makes the
   next pulse easier to run.

## Why this is the highest-value editorial change

Growth Unhinged's entire moat is that it publishes SaaS benchmark data nobody
else has. Churn Is Dead has the audience and the distinct point of view but zero
proprietary data. One recurring pulse turns readers into the data source, makes
the publication citable by peers, and feeds the monetization costly-problem
ledger at the same time. It is the flywheel the benchmark identified.

## Measurement and stop rule

Per pulse: response count, completion rate, and the subscriber lift and citations
from the readout issue versus the trailing four issues. Stop running a pulse
topic if two consecutive pulses draw fewer than 30 responses; the problem is not
as felt as the ledger suggested, and that itself is a finding.
