-- Revoke EXECUTE from anon and authenticated for sensitive SECURITY DEFINER functions.
-- These are admin/maintenance functions — they should only be callable by service_role
-- (from edge functions) or via the Supabase dashboard.

DO $$
DECLARE
  fn_name text;
  sensitive_functions text[] := ARRAY[
    'create_newsletter_invoke_function',
    'enable_pg_cron',
    'invoke_newsletter_function',
    'setup_newsletter_cron_job',
    'setup_newsletter_once(text,text)',
    'setup_newsletter_test_cron_job',
    'setup_newsletter_weekly',
    'setup_newsletter_weekly_11pm',
    'unschedule_job(text)'
  ];
BEGIN
  FOREACH fn_name IN ARRAY sensitive_functions LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM anon, authenticated', fn_name);
      RAISE NOTICE 'Revoked execute on public.%', fn_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped %: %', fn_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- handle_new_user is a trigger function — it shouldn't be callable via RPC at all.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- has_role is OK to keep accessible to authenticated (used by RLS policies) but not anon.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;;
