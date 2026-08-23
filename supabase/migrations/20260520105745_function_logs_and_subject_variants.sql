-- 1. Function execution logs for observability (silent-failure protection)
CREATE TABLE IF NOT EXISTS public.function_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  status      text NOT NULL CHECK (status IN ('success', 'failure', 'partial', 'info')),
  message     text,
  metadata    jsonb DEFAULT '{}'::jsonb,
  duration_ms integer,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_function_logs_fn_date
  ON public.function_logs (function_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_function_logs_status_date
  ON public.function_logs (status, created_at DESC) WHERE status IN ('failure', 'partial');

COMMENT ON TABLE public.function_logs IS
  'Edge function execution logs. Use to detect silent failures (e.g., Tuesday send not happening).';

-- Allow service role full access; restrict everyone else
ALTER TABLE public.function_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access_logs" ON public.function_logs;
CREATE POLICY "service_role_full_access_logs" ON public.function_logs
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_logs" ON public.function_logs;
CREATE POLICY "admin_read_logs" ON public.function_logs
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Subject line A/B variants on newsletters
ALTER TABLE public.newsletters
  ADD COLUMN IF NOT EXISTS subject_variants jsonb DEFAULT NULL;

COMMENT ON COLUMN public.newsletters.subject_variants IS
  'Array of subject line variants for A/B testing. Format: [{"label":"hook","subject":"..."}]. Edge function picks one per subscriber.';

-- 3. Track which subject variant was sent to which subscriber
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS last_subject_variant text;

-- 4. Helper view: function health over last 24h
CREATE OR REPLACE VIEW public.function_health_24h AS
SELECT
  function_name,
  COUNT(*) AS runs,
  COUNT(*) FILTER (WHERE status = 'success') AS successes,
  COUNT(*) FILTER (WHERE status = 'failure') AS failures,
  COUNT(*) FILTER (WHERE status = 'partial') AS partial,
  MAX(created_at) AS last_run,
  ROUND(AVG(duration_ms)::numeric, 1) AS avg_duration_ms
FROM public.function_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY function_name
ORDER BY function_name;

COMMENT ON VIEW public.function_health_24h IS
  '24-hour summary of edge function health. Query daily to catch silent failures.';

-- 5. Helper view: subscriber growth by week
CREATE OR REPLACE VIEW public.subscriber_growth_weekly AS
SELECT
  DATE_TRUNC('week', created_at) AS week,
  COUNT(*) AS new_subscribers,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)) AS total_subscribers
FROM public.subscribers
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;

COMMENT ON VIEW public.subscriber_growth_weekly IS
  'Weekly subscriber growth and running total. Quick health check on growth velocity.';;
