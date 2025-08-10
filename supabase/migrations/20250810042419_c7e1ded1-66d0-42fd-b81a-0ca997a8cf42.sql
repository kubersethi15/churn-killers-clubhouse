-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- One-time cleanup: remove any other cron jobs related to newsletters
SELECT cron.unschedule('send-latest-newsletter-test-cron');
SELECT cron.unschedule('send-latest-newsletter-every-15min');
-- We'll reschedule the weekly job in the function below

-- Update the weekly setup function to schedule at 6:00 PM AEST (08:00 UTC) on Tuesdays
CREATE OR REPLACE FUNCTION public.setup_newsletter_weekly_11pm()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  -- Remove any existing newsletter cron jobs to avoid duplicates
  PERFORM cron.unschedule('send-latest-newsletter-test-cron');
  PERFORM cron.unschedule('send-latest-newsletter-every-15min');
  PERFORM cron.unschedule('send-latest-newsletter-weekly');

  -- Schedule the weekly job: 08:00 UTC every Tuesday = 6:00 PM AEST (non-daylight time)
  PERFORM cron.schedule(
    'send-latest-newsletter-weekly',   -- unique job name
    '0 8 * * 2',                      -- cron expression: At 08:00 UTC on Tuesday
    'SELECT public.invoke_newsletter_function();'
  );
END;
$function$;