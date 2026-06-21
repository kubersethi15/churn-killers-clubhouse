-- Migration: add core_claim for thesis-level newsletter dedup
-- Paired with the generate_newsletter.py repeatability fixes.
-- Safe to run more than once (idempotent).

alter table public.newsletters
  add column if not exists core_claim text;

comment on column public.newsletters.core_claim is
  'One-sentence core argument of the issue. Read by generate_newsletter.py to block issues that repeat a recent thesis under a different title/theme.';
