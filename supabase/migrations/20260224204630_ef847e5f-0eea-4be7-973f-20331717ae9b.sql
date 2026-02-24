
-- Create internal config table (no RLS policies = only service role can access)
CREATE TABLE IF NOT EXISTS public.internal_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
ALTER TABLE public.internal_config ENABLE ROW LEVEL SECURITY;

-- Generate a random cron API key
INSERT INTO public.internal_config (key, value)
VALUES ('cron_api_key', encode(gen_random_bytes(32), 'hex'))
ON CONFLICT (key) DO NOTHING;

-- Update invoke_newsletter_function to pass the cron key as a header
CREATE OR REPLACE FUNCTION public.invoke_newsletter_function()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  request_id text;
  cron_key text;
BEGIN
  -- Read the cron API key from internal config
  SELECT value INTO cron_key FROM public.internal_config WHERE key = 'cron_api_key';

  SELECT net.http_post(
    url:='https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/send-latest-newsletter',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-key', COALESCE(cron_key, '')
    ),
    body:='{}'::jsonb
  ) INTO request_id;

  RETURN request_id;
END;
$function$;
