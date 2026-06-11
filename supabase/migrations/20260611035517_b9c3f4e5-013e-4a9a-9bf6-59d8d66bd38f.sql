
-- 1) Tighten analyses public SELECT: drop the enumerable policy and expose a SECURITY DEFINER RPC instead

DROP POLICY IF EXISTS "Public reports readable by share id" ON public.analyses;

CREATE OR REPLACE FUNCTION public.get_shared_analysis(_share_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  results jsonb,
  created_at timestamptz,
  public_share_id uuid,
  is_public boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.title, a.results, a.created_at, a.public_share_id, a.is_public
  FROM public.analyses a
  WHERE a.public_share_id = _share_id
    AND a.is_public = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_shared_analysis(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_analysis(uuid) TO anon, authenticated;

-- 2) Subscribers: require verified email claim

DROP POLICY IF EXISTS "Allow read access to own subscriber record" ON public.subscribers;
DROP POLICY IF EXISTS "Allow update to own subscriber record" ON public.subscribers;

CREATE POLICY "Allow read access to own verified subscriber record"
ON public.subscribers
FOR SELECT
TO authenticated
USING (
  email = (auth.jwt() ->> 'email')
  AND COALESCE((auth.jwt() ->> 'email_verified')::boolean, false) = true
);

CREATE POLICY "Allow update to own verified subscriber record"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (
  email = (auth.jwt() ->> 'email')
  AND COALESCE((auth.jwt() ->> 'email_verified')::boolean, false) = true
)
WITH CHECK (
  email = (auth.jwt() ->> 'email')
  AND COALESCE((auth.jwt() ->> 'email_verified')::boolean, false) = true
);

-- 3) Internal config: explicit deny + revoke privileges (only service_role / SECURITY DEFINER funcs read it)

REVOKE ALL ON TABLE public.internal_config FROM anon, authenticated;
GRANT ALL ON TABLE public.internal_config TO service_role;

CREATE POLICY "Deny all client access to internal_config"
ON public.internal_config
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

COMMENT ON TABLE public.internal_config IS
  'Server-only configuration (e.g. cron keys). Intentionally unreadable via the Data API. Access only via SECURITY DEFINER functions or the service role.';

-- 4) Lock down admin-only SECURITY DEFINER functions from signed-in user execution

REVOKE EXECUTE ON FUNCTION public.enable_pg_cron() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.invoke_newsletter_function() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.setup_newsletter_cron_job() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.setup_newsletter_once(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.setup_newsletter_test_cron_job() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.setup_newsletter_weekly() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.setup_newsletter_weekly_11pm() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.unschedule_job(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_newsletter_invoke_function() FROM PUBLIC, anon, authenticated;
