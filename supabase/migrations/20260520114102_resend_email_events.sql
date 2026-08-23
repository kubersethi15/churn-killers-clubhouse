-- Email events from Resend webhook (delivered, opened, clicked, bounced, complained)
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_message_id text,
  event_type text NOT NULL,  -- email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
  email text NOT NULL,
  subject text,
  newsletter_slug text,
  payload jsonb,
  occurred_at timestamptz DEFAULT now(),
  received_at timestamptz DEFAULT now()
);;
