-- Let a previously unsubscribed reader rejoin without exposing subscriber
-- state or allowing a third party to silently reverse an unsubscribe.

CREATE TABLE IF NOT EXISTS public.subscriber_reactivation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  confirmed_at timestamptz,
  source text,
  medium text,
  campaign text,
  utm_content text,
  source_page text,
  CONSTRAINT subscriber_reactivation_expiry_after_request
    CHECK (expires_at > requested_at)
);

CREATE INDEX IF NOT EXISTS subscriber_reactivation_requests_subscriber_idx
  ON public.subscriber_reactivation_requests (subscriber_id, requested_at DESC);

CREATE INDEX IF NOT EXISTS subscriber_reactivation_requests_requested_at_idx
  ON public.subscriber_reactivation_requests (requested_at DESC);

ALTER TABLE public.subscriber_reactivation_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.subscriber_reactivation_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.subscriber_reactivation_requests TO service_role;

CREATE OR REPLACE FUNCTION public.confirm_subscriber_reactivation(_request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_row public.subscriber_reactivation_requests%ROWTYPE;
BEGIN
  SELECT *
  INTO request_row
  FROM public.subscriber_reactivation_requests
  WHERE id = _request_id
  FOR UPDATE;

  IF NOT FOUND OR request_row.expires_at < now() THEN
    RETURN false;
  END IF;

  IF request_row.confirmed_at IS NULL THEN
    UPDATE public.subscribers
    SET subscribed = true
    WHERE id = request_row.subscriber_id;

    UPDATE public.subscriber_reactivation_requests
    SET confirmed_at = now()
    WHERE id = request_row.id;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_subscriber_reactivation(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_subscriber_reactivation(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.get_reactivation_dashboard()
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
      'requested_30_days', count(*) FILTER (WHERE requested_at >= now() - interval '30 days'),
      'confirmed_30_days', count(*) FILTER (
        WHERE requested_at >= now() - interval '30 days' AND confirmed_at IS NOT NULL
      ),
      'pending_30_days', count(*) FILTER (
        WHERE requested_at >= now() - interval '30 days'
          AND confirmed_at IS NULL
          AND expires_at >= now()
      ),
      'sources_30_days', COALESCE((
        SELECT jsonb_agg(row_to_json(source_row) ORDER BY source_row.confirmed DESC, source_row.requested DESC)
        FROM (
          SELECT
            lower(COALESCE(NULLIF(source, ''), 'direct')) AS source,
            count(*) AS requested,
            count(*) FILTER (WHERE confirmed_at IS NOT NULL) AS confirmed
          FROM public.subscriber_reactivation_requests
          WHERE requested_at >= now() - interval '30 days'
          GROUP BY 1
        ) source_row
      ), '[]'::jsonb)
    )
  INTO result
  FROM public.subscriber_reactivation_requests;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_reactivation_dashboard() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_reactivation_dashboard() TO authenticated;

COMMENT ON TABLE public.subscriber_reactivation_requests IS
  'Private consent and aggregate attribution record for readers asking to rejoin after unsubscribing.';

COMMENT ON FUNCTION public.confirm_subscriber_reactivation(uuid) IS
  'Atomically restores an unsubscribed reader only after a server-verified confirmation request.';

COMMENT ON FUNCTION public.get_reactivation_dashboard() IS
  'Returns aggregate-only reactivation requests and confirmations to authenticated admins.';
