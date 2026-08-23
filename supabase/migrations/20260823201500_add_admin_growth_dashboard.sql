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
      'new_30_days', (SELECT count(*) FROM public.subscribers WHERE subscribed = true AND created_at >= now() - interval '30 days')
    ),
    'funnel_30_days', jsonb_build_object(
      'page_views', (SELECT count(*) FROM public.growth_events WHERE event_name = 'page_view' AND created_at >= now() - interval '30 days'),
      'form_views', (SELECT count(*) FROM public.growth_events WHERE event_name = 'form_view' AND created_at >= now() - interval '30 days'),
      'form_submits', (SELECT count(*) FROM public.growth_events WHERE event_name = 'form_submit' AND created_at >= now() - interval '30 days'),
      'signup_successes', (SELECT count(*) FROM public.growth_events WHERE event_name = 'signup_success' AND created_at >= now() - interval '30 days'),
      'shares', (SELECT count(*) FROM public.growth_events WHERE event_name = 'content_share' AND created_at >= now() - interval '30 days'),
      'resource_opens', (SELECT count(*) FROM public.growth_events WHERE event_name = 'resource_open' AND created_at >= now() - interval '30 days')
    ),
    'sources_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(source_row) ORDER BY source_row.signups DESC)
      FROM (
        SELECT
          CASE
            WHEN nullif(utm_source, '') IS NOT NULL THEN lower(utm_source)
            WHEN external_referrer ILIKE '%linkedin%' OR external_referrer ILIKE '%lnkd.in%' THEN 'linkedin'
            WHEN external_referrer ILIKE '%google%' THEN 'google'
            WHEN nullif(external_referrer, '') IS NULL THEN 'direct'
            ELSE 'other_referral'
          END AS source,
          count(*) AS signups
        FROM public.subscribers
        WHERE subscribed = true AND created_at >= now() - interval '30 days'
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 8
      ) source_row
    ), '[]'::jsonb),
    'signup_pages_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(page_row) ORDER BY page_row.signups DESC)
      FROM (
        SELECT COALESCE(source_page, 'unknown') AS page, count(*) AS signups
        FROM public.subscribers
        WHERE subscribed = true AND created_at >= now() - interval '30 days'
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 8
      ) page_row
    ), '[]'::jsonb),
    'monthly_growth', COALESCE((
      SELECT jsonb_agg(row_to_json(month_row) ORDER BY month_row.month)
      FROM (
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, count(*) AS signups
        FROM public.subscribers
        WHERE subscribed = true AND created_at >= date_trunc('month', now()) - interval '5 months'
        GROUP BY 1
      ) month_row
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_growth_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_growth_dashboard() TO authenticated;

COMMENT ON FUNCTION public.get_growth_dashboard() IS
  'Returns aggregate-only newsletter growth metrics to authenticated admins. No subscriber identities are exposed.';
