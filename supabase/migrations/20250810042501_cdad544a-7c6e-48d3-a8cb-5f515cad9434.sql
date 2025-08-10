-- Safely unschedule with helper that ignores missing jobs
SELECT public.unschedule_job('send-latest-newsletter-test-cron');
SELECT public.unschedule_job('send-latest-newsletter-every-15min');

-- Ensure the weekly setup function schedules 6:00 PM AEST (08:00 UTC) on Tuesdays and removes any others
CREATE OR REPLACE FUNCTION public.setup_newsletter_weekly_11pm()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  -- Remove any existing newsletter cron jobs to avoid duplicates
  PERFORM public.unschedule_job('send-latest-newsletter-test-cron');
  PERFORM public.unschedule_job('send-latest-newsletter-every-15min');
  PERFORM public.unschedule_job('send-latest-newsletter-weekly');

  -- Schedule the weekly job: 08:00 UTC every Tuesday = 6:00 PM AEST
  PERFORM cron.schedule(
    'send-latest-newsletter-weekly',
    '0 8 * * 2',
    'SELECT public.invoke_newsletter_function();'
  );
END;
$function$;