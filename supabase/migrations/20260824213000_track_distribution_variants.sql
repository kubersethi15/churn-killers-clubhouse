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

  WITH visit_rows AS (
    SELECT
      lower(COALESCE(NULLIF(source, ''), 'direct')) AS source,
      lower(COALESCE(NULLIF(medium, ''), 'none')) AS medium,
      lower(COALESCE(NULLIF(campaign, ''), 'none')) AS campaign,
      lower(utm_content) AS variant,
      count(DISTINCT session_id) AS visits
    FROM public.growth_events
    WHERE event_name = 'page_view'
      AND created_at >= now() - interval '30 days'
      AND NULLIF(utm_content, '') IS NOT NULL
    GROUP BY 1, 2, 3, 4
  ), signup_rows AS (
    SELECT
      lower(COALESCE(NULLIF(utm_source, ''), 'direct')) AS source,
      lower(COALESCE(NULLIF(utm_medium, ''), 'none')) AS medium,
      lower(COALESCE(NULLIF(utm_campaign, ''), 'none')) AS campaign,
      lower(utm_content) AS variant,
      count(*) AS signups
    FROM public.subscribers
    WHERE subscribed = true
      AND created_at >= now() - interval '30 days'
      AND NULLIF(utm_content, '') IS NOT NULL
    GROUP BY 1, 2, 3, 4
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'source', COALESCE(visits.source, signups.source),
    'medium', COALESCE(visits.medium, signups.medium),
    'campaign', COALESCE(visits.campaign, signups.campaign),
    'variant', COALESCE(visits.variant, signups.variant),
    'visits', COALESCE(visits.visits, 0),
    'signups', COALESCE(signups.signups, 0)
  ) ORDER BY COALESCE(signups.signups, 0) DESC, COALESCE(visits.visits, 0) DESC), '[]'::jsonb)
  INTO result
  FROM visit_rows visits
  FULL OUTER JOIN signup_rows signups
    ON visits.source = signups.source
    AND visits.medium = signups.medium
    AND visits.campaign = signups.campaign
    AND visits.variant = signups.variant;

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
  'Returns aggregate-only 30-day unique sessions and signups by campaign variant to authenticated admins.';
