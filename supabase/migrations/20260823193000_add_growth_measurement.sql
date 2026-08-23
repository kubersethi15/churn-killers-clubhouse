-- Privacy-safe, first-party acquisition and conversion measurement.
-- This table deliberately excludes email addresses and persistent user identifiers.

ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS signup_location text,
  ADD COLUMN IF NOT EXISTS landing_page text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text;

CREATE TABLE IF NOT EXISTS public.growth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  event_name text NOT NULL CHECK (event_name IN (
    'page_view',
    'form_view',
    'form_submit',
    'signup_success',
    'signup_duplicate',
    'signup_error',
    'content_share',
    'resource_open'
  )),
  page_path text NOT NULL CHECK (char_length(page_path) BETWEEN 1 AND 300),
  content_slug text CHECK (content_slug IS NULL OR char_length(content_slug) <= 160),
  signup_location text CHECK (signup_location IS NULL OR char_length(signup_location) <= 80),
  source text CHECK (source IS NULL OR char_length(source) <= 120),
  medium text CHECK (medium IS NULL OR char_length(medium) <= 120),
  campaign text CHECK (campaign IS NULL OR char_length(campaign) <= 160),
  referrer_host text CHECK (referrer_host IS NULL OR char_length(referrer_host) <= 255),
  resource_id text CHECK (resource_id IS NULL OR char_length(resource_id) <= 180),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS growth_events_created_at_idx
  ON public.growth_events (created_at DESC);
CREATE INDEX IF NOT EXISTS growth_events_event_name_created_at_idx
  ON public.growth_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS growth_events_source_created_at_idx
  ON public.growth_events (source, created_at DESC);

ALTER TABLE public.growth_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can record privacy-safe growth events" ON public.growth_events;
CREATE POLICY "Anyone can record privacy-safe growth events"
  ON public.growth_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

REVOKE SELECT, UPDATE, DELETE ON public.growth_events FROM anon, authenticated;
GRANT INSERT ON public.growth_events TO anon, authenticated;

COMMENT ON TABLE public.growth_events IS
  'First-party aggregate growth events. Never store email, free text, full referrer URLs, or other PII here.';
