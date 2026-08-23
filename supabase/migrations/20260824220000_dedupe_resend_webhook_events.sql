-- Resend retries and manual replays reuse the same signed Svix message ID.
-- Preserve one aggregate event per provider event without exposing it publicly.

ALTER TABLE public.email_events
  ADD COLUMN IF NOT EXISTS webhook_event_id text;

CREATE UNIQUE INDEX IF NOT EXISTS email_events_webhook_event_id_key
  ON public.email_events (webhook_event_id)
  WHERE webhook_event_id IS NOT NULL;

COMMENT ON COLUMN public.email_events.webhook_event_id IS
  'Signed Svix message ID used to make Resend webhook retries and replays idempotent.';
