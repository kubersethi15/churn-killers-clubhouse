-- Preserve the creative or placement variant attached to a campaign so the
-- growth operator can compare qualified outcomes without collecting PII.

ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS utm_content text;

ALTER TABLE public.growth_events
  ADD COLUMN IF NOT EXISTS utm_content text;

CREATE INDEX IF NOT EXISTS subscribers_utm_content_created_at_idx
  ON public.subscribers (utm_content, created_at DESC)
  WHERE utm_content IS NOT NULL;

CREATE INDEX IF NOT EXISTS growth_events_utm_content_created_at_idx
  ON public.growth_events (utm_content, created_at DESC)
  WHERE utm_content IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_growth_variant_dashboard()
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

  WITH activity_rows AS (
    SELECT
      lower(COALESCE(NULLIF(source, ''), 'direct')) AS source,
      lower(COALESCE(NULLIF(medium, ''), 'none')) AS medium,
      lower(COALESCE(NULLIF(campaign, ''), 'none')) AS campaign,
      lower(utm_content) AS variant,
      count(DISTINCT session_id) FILTER (
        WHERE event_name = 'page_view'
      ) AS visits,
      count(DISTINCT session_id) FILTER (
        WHERE event_name = 'form_view'
      ) AS form_view_sessions,
      count(DISTINCT session_id) FILTER (
        WHERE event_name = 'form_submit'
      ) AS form_submit_sessions,
      count(DISTINCT session_id) FILTER (
        WHERE event_name IN ('resource_open', 'content_share', 'reader_pulse_response')
          OR (event_name = 'page_view' AND page_path = '/cs-analyzer/demo')
      ) AS qualified_action_sessions
    FROM public.growth_events
    WHERE created_at >= now() - interval '30 days'
      AND NULLIF(utm_content, '') IS NOT NULL
    GROUP BY 1, 2, 3, 4
  ), signup_rows AS (
    SELECT
      lower(COALESCE(NULLIF(utm_source, ''), 'direct')) AS source,
      lower(COALESCE(NULLIF(utm_medium, ''), 'none')) AS medium,
      lower(COALESCE(NULLIF(utm_campaign, ''), 'none')) AS campaign,
      lower(utm_content) AS variant,
      count(*) AS signups,
      count(*) FILTER (WHERE subscribed = true) AS active_subscribers
    FROM public.subscribers
    WHERE created_at >= now() - interval '30 days'
      AND NULLIF(utm_content, '') IS NOT NULL
    GROUP BY 1, 2, 3, 4
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'source', COALESCE(activity.source, signups.source),
    'medium', COALESCE(activity.medium, signups.medium),
    'campaign', COALESCE(activity.campaign, signups.campaign),
    'variant', COALESCE(activity.variant, signups.variant),
    'visits', COALESCE(activity.visits, 0),
    'form_view_sessions', COALESCE(activity.form_view_sessions, 0),
    'form_submit_sessions', COALESCE(activity.form_submit_sessions, 0),
    'qualified_action_sessions', COALESCE(activity.qualified_action_sessions, 0),
    'signups', COALESCE(signups.signups, 0),
    'active_subscribers', COALESCE(signups.active_subscribers, 0)
  ) ORDER BY COALESCE(signups.signups, 0) DESC, COALESCE(activity.qualified_action_sessions, 0) DESC, COALESCE(activity.visits, 0) DESC), '[]'::jsonb)
  INTO result
  FROM activity_rows activity
  FULL OUTER JOIN signup_rows signups
    ON activity.source = signups.source
    AND activity.medium = signups.medium
    AND activity.campaign = signups.campaign
    AND activity.variant = signups.variant;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_growth_variant_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_growth_variant_dashboard() TO authenticated;

COMMENT ON COLUMN public.subscribers.utm_content IS
  'Campaign creative or placement variant. UTM values must never contain PII.';
COMMENT ON COLUMN public.growth_events.utm_content IS
  'Campaign creative or placement variant. UTM values must never contain PII.';
COMMENT ON FUNCTION public.get_growth_variant_dashboard() IS
  'Returns aggregate-only 30-day visits, funnel sessions, qualified-action sessions, acquired signups, and currently active subscribers by campaign variant to authenticated admins.';
