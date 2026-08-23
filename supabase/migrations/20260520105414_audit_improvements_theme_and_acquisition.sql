-- Audit improvements: theme rotation + subscriber source tracking

-- 1. theme column on newsletters
ALTER TABLE public.newsletters
  ADD COLUMN IF NOT EXISTS theme text;

CREATE INDEX IF NOT EXISTS idx_newsletters_theme_date
  ON public.newsletters (theme, published_date DESC);

COMMENT ON COLUMN public.newsletters.theme IS
  'Topic theme for rotation enforcement (e.g. qbrs, health_scores, ai_replacement). Set by generator.';

-- 2. source tracking on subscribers
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS source_page text,
  ADD COLUMN IF NOT EXISTS external_referrer text;

CREATE INDEX IF NOT EXISTS idx_subscribers_source_page
  ON public.subscribers (source_page);

COMMENT ON COLUMN public.subscribers.source_page IS
  'Internal page slug or "homepage" — which page they subscribed from.';
COMMENT ON COLUMN public.subscribers.external_referrer IS
  'document.referrer if they came from an external site (LinkedIn, Twitter, etc).';

-- 3. acquisition summary view
CREATE OR REPLACE VIEW public.subscriber_acquisition_summary AS
SELECT
  COALESCE(source_page, 'unknown') AS source,
  COUNT(*) AS subscribers,
  MIN(created_at) AS first_seen,
  MAX(created_at) AS last_seen
FROM public.subscribers
GROUP BY COALESCE(source_page, 'unknown')
ORDER BY subscribers DESC;

COMMENT ON VIEW public.subscriber_acquisition_summary IS
  'Quick view of which pages drive the most subscriber signups.';;
