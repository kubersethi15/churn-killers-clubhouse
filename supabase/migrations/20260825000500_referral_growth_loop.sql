-- Report the subscriber-led referral loop without exposing identities. A
-- referral is attributable only when the shared URL carries the dedicated
-- subscriber_referral source; ordinary direct traffic is never inferred.

ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS acquisition_session_id uuid;

CREATE INDEX IF NOT EXISTS subscribers_acquisition_session_created_at_idx
  ON public.subscribers (acquisition_session_id, created_at DESC)
  WHERE acquisition_session_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_referral_dashboard()
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
    SELECT
      campaign,
      variant,
      count(*) AS visits
    FROM referral_visits
    GROUP BY 1, 2
  ), referral_signups AS (
    SELECT
      visits.campaign,
      visits.variant,
      count(subscriber.id) AS acquired,
      count(subscriber.id) FILTER (WHERE subscriber.subscribed = true) AS active
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
      COALESCE(signups.active, 0) AS active
    FROM referral_activity activity
    FULL OUTER JOIN referral_signups signups
      ON activity.campaign = signups.campaign
      AND activity.variant = signups.variant
  )
  SELECT jsonb_build_object(
    'share_action_sessions_30_days', (
      SELECT count(DISTINCT session_id)
      FROM public.growth_events
      WHERE created_at >= now() - interval '30 days'
        AND event_name = 'content_share'
        AND (
          resource_id LIKE 'subscriber_referral:%'
          OR resource_id IN ('subscriber_referral_linkedin', 'subscriber_referral_copy')
        )
    ),
    'referred_visits_30_days', COALESCE((SELECT sum(visits) FROM referral_rows), 0),
    'acquired_30_days', COALESCE((SELECT sum(acquired) FROM referral_rows), 0),
    'active_30_days', COALESCE((SELECT sum(active) FROM referral_rows), 0),
    'visit_to_signup_rate', CASE
      WHEN COALESCE((SELECT sum(visits) FROM referral_rows), 0) = 0 THEN NULL
      ELSE round(
        COALESCE((SELECT sum(acquired) FROM referral_rows), 0)::numeric
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
  'Returns aggregate-only subscriber referral share-path actions, unique visits, session-matched acquisitions, active subscribers, and conversion by campaign and placement to authenticated admins.';

COMMENT ON COLUMN public.subscribers.acquisition_session_id IS
  'Random first-party browser session UUID used to match an acquisition to aggregate funnel events. It contains no email or cross-session identity and is never exposed publicly.';
