-- Make the first subscriber touchpoint idempotent and expand the private
-- aggregate dashboard from acquisition counts to activation decisions.

ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz;

ALTER TABLE public.growth_events
  DROP CONSTRAINT IF EXISTS growth_events_event_name_check;
ALTER TABLE public.growth_events
  ADD CONSTRAINT growth_events_event_name_check CHECK (event_name IN (
    'page_view', 'form_view', 'form_submit', 'signup_success',
    'signup_duplicate', 'signup_error', 'content_share', 'resource_open',
    'reader_pulse_response'
  ));

CREATE OR REPLACE FUNCTION public.get_growth_dashboard()
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

  SELECT jsonb_build_object(
    'subscribers', jsonb_build_object(
      'total', (SELECT count(*) FROM public.subscribers WHERE subscribed = true),
      'new_7_days', (SELECT count(*) FROM public.subscribers WHERE subscribed = true AND created_at >= now() - interval '7 days'),
      'new_30_days', (SELECT count(*) FROM public.subscribers WHERE subscribed = true AND created_at >= now() - interval '30 days'),
      'previous_30_days', (SELECT count(*) FROM public.subscribers WHERE subscribed = true AND created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')
    ),
    'funnel_30_days', jsonb_build_object(
      'page_views', (SELECT count(*) FROM public.growth_events WHERE event_name = 'page_view' AND created_at >= now() - interval '30 days'),
      'form_views', (SELECT count(*) FROM public.growth_events WHERE event_name = 'form_view' AND created_at >= now() - interval '30 days'),
      'form_submits', (SELECT count(*) FROM public.growth_events WHERE event_name = 'form_submit' AND created_at >= now() - interval '30 days'),
      'signup_successes', (SELECT count(*) FROM public.growth_events WHERE event_name = 'signup_success' AND created_at >= now() - interval '30 days'),
      'shares', (SELECT count(*) FROM public.growth_events WHERE event_name = 'content_share' AND created_at >= now() - interval '30 days'),
      'resource_opens', (SELECT count(*) FROM public.growth_events WHERE event_name = 'resource_open' AND created_at >= now() - interval '30 days'),
      'starter_kit_views', (SELECT count(*) FROM public.growth_events WHERE event_name = 'page_view' AND page_path = '/start' AND created_at >= now() - interval '30 days'),
      'topic_views', (SELECT count(*) FROM public.growth_events WHERE event_name = 'resource_open' AND resource_id LIKE 'topic:%' AND created_at >= now() - interval '30 days'),
      'analyzer_demo_views', (SELECT count(*) FROM public.growth_events WHERE event_name = 'page_view' AND page_path = '/cs-analyzer/demo' AND created_at >= now() - interval '30 days')
    ),
    'sources_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(source_row) ORDER BY source_row.signups DESC)
      FROM (
        SELECT CASE
          WHEN nullif(utm_source, '') IS NOT NULL THEN lower(utm_source)
          WHEN external_referrer ILIKE '%linkedin%' OR external_referrer ILIKE '%lnkd.in%' THEN 'linkedin'
          WHEN external_referrer ILIKE '%google%' THEN 'google'
          WHEN nullif(external_referrer, '') IS NULL THEN 'direct'
          ELSE 'other_referral'
        END AS source, count(*) AS signups
        FROM public.subscribers
        WHERE subscribed = true AND created_at >= now() - interval '30 days'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 8
      ) source_row
    ), '[]'::jsonb),
    'signup_pages_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(page_row) ORDER BY page_row.signups DESC)
      FROM (
        SELECT COALESCE(source_page, 'unknown') AS page, count(*) AS signups
        FROM public.subscribers
        WHERE subscribed = true AND created_at >= now() - interval '30 days'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 8
      ) page_row
    ), '[]'::jsonb),
    'top_resources_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(resource_row) ORDER BY resource_row.opens DESC)
      FROM (
        SELECT resource_id AS resource, count(*) AS opens
        FROM public.growth_events
        WHERE event_name = 'resource_open' AND created_at >= now() - interval '30 days' AND resource_id IS NOT NULL
        GROUP BY 1 ORDER BY 2 DESC LIMIT 10
      ) resource_row
    ), '[]'::jsonb),
    'reader_pulse_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(pulse_row) ORDER BY pulse_row.responses DESC)
      FROM (
        SELECT replace(resource_id, 'reader-pulse:', '') AS answer, count(*) AS responses
        FROM public.growth_events
        WHERE event_name = 'reader_pulse_response' AND created_at >= now() - interval '30 days' AND resource_id LIKE 'reader-pulse:%'
        GROUP BY 1 ORDER BY 2 DESC
      ) pulse_row
    ), '[]'::jsonb),
    'campaigns_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(campaign_row) ORDER BY campaign_row.signups DESC)
      FROM (
        SELECT COALESCE(NULLIF(utm_campaign, ''), 'none') AS campaign, count(*) AS signups
        FROM public.subscribers
        WHERE subscribed = true AND created_at >= now() - interval '30 days'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 10
      ) campaign_row
    ), '[]'::jsonb),
    'weekly_growth', COALESCE((
      SELECT jsonb_agg(row_to_json(week_row) ORDER BY week_row.week)
      FROM (
        SELECT to_char(date_trunc('week', created_at), 'YYYY-MM-DD') AS week, count(*) AS signups
        FROM public.subscribers
        WHERE subscribed = true AND created_at >= date_trunc('week', now()) - interval '7 weeks'
        GROUP BY 1
      ) week_row
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_growth_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_growth_dashboard() TO authenticated;

COMMENT ON COLUMN public.subscribers.welcome_email_sent_at IS
  'Idempotency marker for the first-party welcome email. Never exposed publicly.';

COMMENT ON FUNCTION public.get_growth_dashboard() IS
  'Returns aggregate-only acquisition and activation metrics to authenticated admins. No subscriber identities are exposed.';
