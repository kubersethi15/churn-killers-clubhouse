-- Separate a LinkedIn composer open from a completed share path, and calculate
-- referral conversion from session-matched visits rather than independent
-- rolling-window counts. Exact share semantics begin with this migration;
-- historical intent clicks logged as content_share are not reclassified.

ALTER TABLE public.growth_events
  DROP CONSTRAINT IF EXISTS growth_events_event_name_check;
ALTER TABLE public.growth_events
  ADD CONSTRAINT growth_events_event_name_check CHECK (event_name IN (
    'page_view', 'form_view', 'form_submit', 'signup_success',
    'signup_duplicate', 'signup_error', 'share_intent', 'content_share',
    'resource_open', 'reader_pulse_response'
  ));

INSERT INTO public.growth_measurement_state (metric, tracked_from)
VALUES ('exact_referral_share_semantics', now())
ON CONFLICT (metric) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_referral_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  share_tracking_start timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT tracked_from INTO share_tracking_start
  FROM public.growth_measurement_state
  WHERE metric = 'exact_referral_share_semantics';

  WITH referral_visits AS (
    SELECT
      session_id,
      lower(COALESCE(NULLIF(campaign, ''), 'unknown')) AS campaign,
      lower(COALESCE(NULLIF(utm_content, ''), 'unknown')) AS variant,
      min(created_at) AS first_visit_at
    FROM public.growth_events
    WHERE created_at >= now() - interval '30 days'
      AND lower(COALESCE(source, '')) = 'subscriber_referral'
      AND event_name = 'page_view'
    GROUP BY 1, 2, 3
  ), referral_activity AS (
    SELECT campaign, variant, count(*) AS visits
    FROM referral_visits
    GROUP BY 1, 2
  ), referral_signups AS (
    SELECT
      visits.campaign,
      visits.variant,
      count(subscriber.id) AS acquired,
      count(subscriber.id) FILTER (WHERE subscriber.subscribed = true) AS active,
      count(DISTINCT visits.session_id) AS converted_visit_sessions
    FROM referral_visits visits
    JOIN public.subscribers subscriber
      ON subscriber.acquisition_session_id = visits.session_id
      AND subscriber.created_at >= visits.first_visit_at
      AND lower(COALESCE(subscriber.utm_source, '')) = 'subscriber_referral'
    GROUP BY 1, 2
  ), referral_rows AS (
    SELECT
      COALESCE(activity.campaign, signups.campaign) AS campaign,
      COALESCE(activity.variant, signups.variant) AS variant,
      COALESCE(activity.visits, 0) AS visits,
      COALESCE(signups.acquired, 0) AS acquired,
      COALESCE(signups.active, 0) AS active,
      COALESCE(signups.converted_visit_sessions, 0) AS converted_visit_sessions
    FROM referral_activity activity
    FULL OUTER JOIN referral_signups signups
      ON activity.campaign = signups.campaign
      AND activity.variant = signups.variant
  )
  SELECT jsonb_build_object(
    'share_tracking_started_at', share_tracking_start,
    'share_intent_sessions_30_days', (
      SELECT count(DISTINCT session_id)
      FROM public.growth_events
      WHERE created_at >= GREATEST(now() - interval '30 days', share_tracking_start)
        AND event_name = 'share_intent'
        AND resource_id LIKE 'subscriber_referral:%'
    ),
    'share_action_sessions_30_days', (
      SELECT count(DISTINCT session_id)
      FROM public.growth_events
      WHERE created_at >= GREATEST(now() - interval '30 days', share_tracking_start)
        AND event_name = 'content_share'
        AND resource_id LIKE 'subscriber_referral:%'
    ),
    'referred_visits_30_days', COALESCE((SELECT sum(visits) FROM referral_rows), 0),
    'acquired_30_days', COALESCE((SELECT sum(acquired) FROM referral_rows), 0),
    'active_30_days', COALESCE((SELECT sum(active) FROM referral_rows), 0),
    'visit_to_signup_rate', CASE
      WHEN COALESCE((SELECT sum(visits) FROM referral_rows), 0) = 0 THEN NULL
      ELSE round(
        COALESCE((SELECT sum(converted_visit_sessions) FROM referral_rows), 0)::numeric
        / (SELECT sum(visits) FROM referral_rows) * 100,
        1
      )
    END,
    'rows', COALESCE((
      SELECT jsonb_agg(row_to_json(referral_rows) ORDER BY acquired DESC, visits DESC)
      FROM referral_rows
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_referral_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_referral_dashboard() TO authenticated;

COMMENT ON FUNCTION public.get_referral_dashboard() IS
  'Returns admin-only aggregate referral intents, completed share paths, unique visits, session-matched acquisitions, active subscribers, and converted-visit rate. No identities are exposed.';
