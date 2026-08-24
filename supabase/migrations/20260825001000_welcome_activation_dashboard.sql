-- Give LOOP-03 an exact, privacy-safe view of the first welcome-email journey.
-- The function exposes only aggregate counts to authenticated admins. It never
-- returns subscriber ids, email addresses, session ids, or free-text replies.

CREATE OR REPLACE FUNCTION public.get_welcome_activation_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  WITH welcome_events AS (
    SELECT event_name, session_id, page_path, resource_id, created_at
    FROM public.growth_events
    WHERE created_at >= now() - interval '30 days'
      AND lower(COALESCE(source, '')) = 'welcome'
      AND lower(COALESCE(medium, '')) = 'email'
      AND lower(COALESCE(campaign, '')) = 'starter_kit'
  ), first_pages AS (
    SELECT DISTINCT ON (session_id)
      session_id,
      CASE
        WHEN page_path = '/start' THEN 'start'
        WHEN page_path = '/playbook' THEN 'vault'
        WHEN page_path = '/ai-exposure-score' THEN 'diagnostic'
        ELSE 'other'
      END AS path
    FROM welcome_events
    WHERE event_name = 'page_view'
      AND NULLIF(session_id, '') IS NOT NULL
    ORDER BY session_id, created_at
  ), qualified_sessions AS (
    SELECT DISTINCT session_id
    FROM welcome_events
    WHERE NULLIF(session_id, '') IS NOT NULL
      AND (
        event_name IN ('resource_open', 'content_share', 'reader_pulse_response')
        OR (event_name = 'page_view' AND page_path = '/cs-analyzer/demo')
      )
  ), path_rows AS (
    SELECT
      first_pages.path,
      count(*) AS sessions,
      count(qualified_sessions.session_id) AS qualified_action_sessions
    FROM first_pages
    LEFT JOIN qualified_sessions USING (session_id)
    GROUP BY first_pages.path
  )
  SELECT jsonb_build_object(
    'welcome_emails_accepted_30_days', (
      SELECT count(*)
      FROM public.subscribers
      WHERE welcome_email_sent_at >= now() - interval '30 days'
    ),
    'tagged_click_sessions_30_days', (SELECT count(*) FROM first_pages),
    'qualified_action_sessions_30_days', (
      SELECT count(*)
      FROM first_pages
      JOIN qualified_sessions USING (session_id)
    ),
    'no_qualified_action_sessions_30_days', (
      SELECT count(*)
      FROM first_pages
      LEFT JOIN qualified_sessions USING (session_id)
      WHERE qualified_sessions.session_id IS NULL
    ),
    'paths_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(path_rows) ORDER BY sessions DESC, path)
      FROM path_rows
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_welcome_activation_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_welcome_activation_dashboard() TO authenticated;

COMMENT ON FUNCTION public.get_welcome_activation_dashboard() IS
  'Returns aggregate-only welcome-email click and qualified-action sessions for LOOP-03. No subscriber, session, or reply identities are exposed.';
