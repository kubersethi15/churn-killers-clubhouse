-- CS Pulse aggregate responses (BC-05). Insert-only, PII-free.
-- STAGED, gated on: (1) the costly-problem ledger showing a repeated problem on
-- clean data, and (2) CID-001 baseline close on 1 September 2026. Filename dated
-- 1 September so it does not apply before the gate. Do not apply earlier.
create table if not exists public.pulse_responses (
  id uuid primary key default gen_random_uuid(),
  pulse_slug text not null,
  question_key text not null,
  answer_key text not null,
  session_id uuid,
  created_at timestamptz not null default now()
);

alter table public.pulse_responses enable row level security;

-- Anonymous clients may insert a response but never read the table, matching
-- the growth_events pattern. Aggregate reads use the service role.
create policy pulse_insert_anon on public.pulse_responses
  for insert to anon with check (true);

comment on table public.pulse_responses is
  'Aggregate CS Pulse survey responses. No identity, no raw free text. Q5 free text is theme-classified client-side; only the theme key is stored.';
