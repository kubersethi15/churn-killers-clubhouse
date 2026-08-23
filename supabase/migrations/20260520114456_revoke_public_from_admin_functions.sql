-- Revoke PUBLIC (which includes anon, authenticated) from sensitive admin functions.
-- Only postgres + service_role should be able to call these. Lovable created these
-- with default PUBLIC EXECUTE which is why the advisor flagged them.

DO $$
DECLARE
  fn_sig text;
  sensitive_functions text[] := ARRAY[
    'public.create_newsletter_invoke_function()',
    'public.enable_pg_cron()',
    'public.invoke_newsletter_function()',
    'public.setup_newsletter_cron_job()',
    'public.setup_newsletter_once(text,text)',
    'public.setup_newsletter_test_cron_job()',
    'public.setup_newsletter_weekly()',
    'public.setup_newsletter_weekly_11pm()',
    'public.unschedule_job(text)',
    'public.handle_new_user()'
  ];
BEGIN
  FOREACH fn_sig IN ARRAY sensitive_functions LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn_sig);
      RAISE NOTICE 'Revoked: %', fn_sig;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped %: %', fn_sig, SQLERRM;
    END;
  END LOOP;
END $$;

-- has_role is special: keep it callable by authenticated (RLS policies need it) but block anon.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;;
