-- Enforce the publication clock at the database boundary. Client-side date
-- filters are useful for presentation, but cannot protect a future issue from
-- an anonymous REST query when its slug is known.

ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Ensure the table has an explicit permissive read policy. The restrictive
-- policies below then narrow visibility for each browser-facing role even if
-- another permissive SELECT policy already exists.
DROP POLICY IF EXISTS "Newsletter rows are readable" ON public.newsletters;
CREATE POLICY "Newsletter rows are readable"
  ON public.newsletters
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anonymous readers see published newsletters" ON public.newsletters;
CREATE POLICY "Anonymous readers see published newsletters"
  ON public.newsletters
  AS RESTRICTIVE
  FOR SELECT
  TO anon
  USING (published_date <= now());

DROP POLICY IF EXISTS "Authenticated readers see published or admin-preview newsletters" ON public.newsletters;
CREATE POLICY "Authenticated readers see published or admin-preview newsletters"
  ON public.newsletters
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (
    published_date <= now()
    OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
  );

COMMENT ON POLICY "Anonymous readers see published newsletters" ON public.newsletters IS
  'Prevents future-dated editorial rows from being retrieved through the anonymous PostgREST API.';

COMMENT ON POLICY "Authenticated readers see published or admin-preview newsletters" ON public.newsletters IS
  'Keeps future issue preview available only to authenticated admins; all other authenticated readers see published rows.';
