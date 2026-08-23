-- Website publication remains scheduled independently. Subscriber email is held
-- until the Resend webhook, suppressions, test send, and provider health review
-- have passed the editorial email-safety checklist.
DO $$
DECLARE
  scheduled_job record;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_cron'
  ) THEN
    FOR scheduled_job IN
      SELECT jobid
      FROM cron.job
      WHERE jobname IN (
        'send-latest-newsletter-weekly',
        'send-latest-newsletter-every-15min',
        'send-latest-newsletter-test-cron'
      )
    LOOP
      PERFORM cron.unschedule(scheduled_job.jobid);
    END LOOP;
  END IF;
END;
$$;
