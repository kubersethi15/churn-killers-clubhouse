-- Separate acquisition from current list size and measure the north-star
-- outcome: whether an acquired subscriber is still subscribed at day 30.
-- Status history is internal, contains no email address, and is never exposed
-- to browser clients. Exact retention begins at this migration's deploy time;
-- historical cohorts are deliberately not inferred.

CREATE TABLE IF NOT EXISTS public.growth_measurement_state (
  metric text PRIMARY KEY,
  tracked_from timestamptz NOT NULL
);

INSERT INTO public.growth_measurement_state (metric, tracked_from)
VALUES ('exact_subscriber_retention', now())
ON CONFLICT (metric) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.subscriber_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  subscribed boolean NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  event_source text NOT NULL CHECK (event_source IN ('subscriber_insert', 'status_change'))
);

CREATE INDEX IF NOT EXISTS subscriber_status_events_subscriber_time_idx
  ON public.subscriber_status_events (subscriber_id, occurred_at DESC);

ALTER TABLE public.growth_measurement_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_status_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.growth_measurement_state FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.subscriber_status_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.growth_measurement_state TO service_role;
GRANT ALL ON public.subscriber_status_events TO service_role;

CREATE OR REPLACE FUNCTION public.record_subscriber_status_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.subscriber_status_events (
      subscriber_id, subscribed, occurred_at, event_source
    ) VALUES (
      NEW.id, NEW.subscribed, NEW.created_at, 'subscriber_insert'
    );
  ELSIF OLD.subscribed IS DISTINCT FROM NEW.subscribed THEN
    INSERT INTO public.subscriber_status_events (
      subscriber_id, subscribed, occurred_at, event_source
    ) VALUES (
      NEW.id, NEW.subscribed, now(), 'status_change'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS record_subscriber_status_event_trigger ON public.subscribers;
CREATE TRIGGER record_subscriber_status_event_trigger
AFTER INSERT OR UPDATE OF subscribed ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION public.record_subscriber_status_event();

REVOKE ALL ON FUNCTION public.record_subscriber_status_event() FROM PUBLIC, anon, authenticated;

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
      'acquired_7_days', (SELECT count(*) FROM public.subscribers WHERE created_at >= now() - interval '7 days'),
      'active_from_7_day_acquisitions', (SELECT count(*) FROM public.subscribers WHERE subscribed = true AND created_at >= now() - interval '7 days'),
      'acquired_30_days', (SELECT count(*) FROM public.subscribers WHERE created_at >= now() - interval '30 days'),
      'active_from_30_day_acquisitions', (SELECT count(*) FROM public.subscribers WHERE subscribed = true AND created_at >= now() - interval '30 days'),
      'acquired_previous_30_days', (SELECT count(*) FROM public.subscribers WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')
    ),
    'funnel_30_days', jsonb_build_object(
      'page_views', (SELECT count(DISTINCT session_id) FROM public.growth_events WHERE event_name = 'page_view' AND created_at >= now() - interval '30 days'),
      'form_views', (SELECT count(DISTINCT session_id) FROM public.growth_events WHERE event_name = 'form_view' AND created_at >= now() - interval '30 days'),
      'form_submits', (SELECT count(DISTINCT session_id) FROM public.growth_events WHERE event_name = 'form_submit' AND created_at >= now() - interval '30 days'),
      'signup_successes', (SELECT count(DISTINCT session_id) FROM public.growth_events WHERE event_name = 'signup_success' AND created_at >= now() - interval '30 days'),
      'shares', (SELECT count(DISTINCT session_id) FROM public.growth_events WHERE event_name = 'content_share' AND created_at >= now() - interval '30 days'),
      'resource_opens', (SELECT count(DISTINCT session_id) FROM public.growth_events WHERE event_name = 'resource_open' AND created_at >= now() - interval '30 days'),
      'starter_kit_views', (SELECT count(DISTINCT session_id) FROM public.growth_events WHERE event_name = 'page_view' AND page_path = '/start' AND created_at >= now() - interval '30 days'),
      'topic_views', (SELECT count(DISTINCT session_id) FROM public.growth_events WHERE event_name = 'resource_open' AND resource_id LIKE 'topic:%' AND created_at >= now() - interval '30 days'),
      'analyzer_demo_views', (SELECT count(DISTINCT session_id) FROM public.growth_events WHERE event_name = 'page_view' AND page_path = '/cs-analyzer/demo' AND created_at >= now() - interval '30 days')
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
        WHERE created_at >= now() - interval '30 days'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 8
      ) source_row
    ), '[]'::jsonb),
    'signup_pages_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(page_row) ORDER BY page_row.signups DESC)
      FROM (
        SELECT COALESCE(source_page, 'unknown') AS page, count(*) AS signups
        FROM public.subscribers
        WHERE created_at >= now() - interval '30 days'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 8
      ) page_row
    ), '[]'::jsonb),
    'top_resources_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(resource_row) ORDER BY resource_row.opens DESC)
      FROM (
        SELECT resource_id AS resource, count(DISTINCT session_id) AS opens
        FROM public.growth_events
        WHERE event_name = 'resource_open' AND created_at >= now() - interval '30 days' AND resource_id IS NOT NULL
        GROUP BY 1 ORDER BY 2 DESC LIMIT 10
      ) resource_row
    ), '[]'::jsonb),
    'reader_pulse_30_days', COALESCE((
      SELECT jsonb_agg(row_to_json(pulse_row) ORDER BY pulse_row.responses DESC)
      FROM (
        SELECT replace(resource_id, 'reader-pulse:', '') AS answer, count(DISTINCT session_id) AS responses
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
        WHERE created_at >= now() - interval '30 days'
        GROUP BY 1 ORDER BY 2 DESC LIMIT 10
      ) campaign_row
    ), '[]'::jsonb),
    'weekly_growth', COALESCE((
      SELECT jsonb_agg(row_to_json(week_row) ORDER BY week_row.week)
      FROM (
        SELECT to_char(date_trunc('week', created_at), 'YYYY-MM-DD') AS week, count(*) AS signups
        FROM public.subscribers
        WHERE created_at >= date_trunc('week', now()) - interval '7 weeks'
        GROUP BY 1
      ) week_row
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_growth_retention_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  tracking_start timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT tracked_from INTO tracking_start
  FROM public.growth_measurement_state
  WHERE metric = 'exact_subscriber_retention';

  WITH eligible AS (
    SELECT
      s.id,
      s.created_at,
      s.subscribed AS currently_active,
      lower(COALESCE(NULLIF(s.utm_source, ''), 'direct')) AS source,
      lower(COALESCE(NULLIF(s.utm_medium, ''), 'none')) AS medium,
      lower(COALESCE(NULLIF(s.utm_campaign, ''), 'none')) AS campaign,
      lower(COALESCE(NULLIF(s.utm_content, ''), 'none')) AS variant,
      state_at_30.subscribed AS retained_at_30
    FROM public.subscribers s
    LEFT JOIN LATERAL (
      SELECT event.subscribed
      FROM public.subscriber_status_events event
      WHERE event.subscriber_id = s.id
        AND event.occurred_at <= s.created_at + interval '30 days'
      ORDER BY event.occurred_at DESC
      LIMIT 1
    ) state_at_30 ON true
    WHERE s.created_at >= tracking_start
      AND s.created_at <= now() - interval '30 days'
  ), cohort_rows AS (
    SELECT
      to_char(date_trunc('week', created_at), 'YYYY-MM-DD') AS cohort_week,
      count(*) AS acquired,
      count(*) FILTER (WHERE retained_at_30 = true) AS retained_at_30_days,
      count(*) FILTER (WHERE currently_active = true) AS currently_active
    FROM eligible
    GROUP BY 1
  ), channel_rows AS (
    SELECT
      source,
      medium,
      campaign,
      variant,
      count(*) AS acquired,
      count(*) FILTER (WHERE retained_at_30 = true) AS retained_at_30_days,
      count(*) FILTER (WHERE currently_active = true) AS currently_active
    FROM eligible
    GROUP BY 1, 2, 3, 4
  )
  SELECT jsonb_build_object(
    'tracking_started_at', tracking_start,
    'first_eligible_at', tracking_start + interval '30 days',
    'awaiting_maturity', (
      SELECT count(*) FROM public.subscribers
      WHERE created_at >= tracking_start
        AND created_at > now() - interval '30 days'
    ),
    'eligible_acquisitions', (SELECT count(*) FROM eligible),
    'retained_at_30_days', (SELECT count(*) FROM eligible WHERE retained_at_30 = true),
    'currently_active_after_30_days', (SELECT count(*) FROM eligible WHERE currently_active = true),
    'retention_rate', (
      SELECT CASE WHEN count(*) = 0 THEN NULL
        ELSE round((count(*) FILTER (WHERE retained_at_30 = true)::numeric / count(*)) * 100, 1)
      END
      FROM eligible
    ),
    'cohorts', COALESCE((
      SELECT jsonb_agg(row_to_json(cohort_rows) ORDER BY cohort_week)
      FROM cohort_rows
    ), '[]'::jsonb),
    'channels', COALESCE((
      SELECT jsonb_agg(row_to_json(channel_rows) ORDER BY acquired DESC, retained_at_30_days DESC)
      FROM channel_rows
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_growth_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_growth_dashboard() TO authenticated;
REVOKE ALL ON FUNCTION public.get_growth_retention_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_growth_retention_dashboard() TO authenticated;

COMMENT ON TABLE public.subscriber_status_events IS
  'Private, PII-free subscription status history used for exact cohort retention measurement.';
COMMENT ON FUNCTION public.get_growth_dashboard() IS
  'Returns aggregate-only acquisition and unique-session activation metrics to authenticated admins. Acquisition counts include later unsubscribes.';
COMMENT ON FUNCTION public.get_growth_retention_dashboard() IS
  'Returns aggregate-only exact day-30 subscriber retention for cohorts acquired after retention instrumentation began.';
