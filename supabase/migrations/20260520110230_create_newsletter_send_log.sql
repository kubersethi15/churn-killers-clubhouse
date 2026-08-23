CREATE TABLE IF NOT EXISTS public.newsletter_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id uuid REFERENCES public.newsletters(id) ON DELETE CASCADE,
  subscriber_email text NOT NULL,
  subject_variant text NOT NULL,
  variant_index integer NOT NULL,
  sent_at timestamptz DEFAULT now(),
  send_status text DEFAULT 'sent',
  resend_message_id text,
  error_message text
);;
