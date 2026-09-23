-- Public intake is intentional, unrestricted writable columns are not.
-- Preserve the existing forms while reserving IDs, timestamps and delivery
-- state for server defaults/service-role writers. No existing rows are changed.
BEGIN;

REVOKE INSERT ON public.subscribers FROM PUBLIC, anon, authenticated;
GRANT INSERT (email, source_page, external_referrer, signup_location,
  landing_page, utm_source, utm_medium, utm_campaign, utm_content,
  acquisition_session_id) ON public.subscribers TO anon, authenticated;

ALTER POLICY "Allow public insert access to subscribers" ON public.subscribers
  TO anon, authenticated
  WITH CHECK (
    email = lower(btrim(email))
    AND char_length(email) BETWEEN 3 AND 254
    AND email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    AND subscribed IS TRUE
    AND welcome_email_sent_at IS NULL
    AND last_subject_variant IS NULL
    AND created_at = now()
    AND (source_page IS NULL OR char_length(source_page) <= 300)
    AND (external_referrer IS NULL OR char_length(external_referrer) <= 255)
    AND (signup_location IS NULL OR char_length(signup_location) <= 80)
    AND (landing_page IS NULL OR char_length(landing_page) <= 300)
    AND (utm_source IS NULL OR char_length(utm_source) <= 120)
    AND (utm_medium IS NULL OR char_length(utm_medium) <= 120)
    AND (utm_campaign IS NULL OR char_length(utm_campaign) <= 160)
    AND (utm_content IS NULL OR char_length(utm_content) <= 160)
  );

REVOKE INSERT ON public.waitlist FROM PUBLIC, anon, authenticated;
GRANT INSERT (email, name, role, source) ON public.waitlist TO anon, authenticated;
ALTER POLICY "Anyone can join waitlist" ON public.waitlist
  TO anon, authenticated
  WITH CHECK (
    email = lower(btrim(email))
    AND char_length(email) BETWEEN 3 AND 254
    AND email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    AND char_length(btrim(name)) BETWEEN 1 AND 200
    AND char_length(btrim(role)) BETWEEN 1 AND 120
    AND (source IS NULL OR char_length(source) <= 300)
    AND created_at = now()
  );

REVOKE INSERT ON public.growth_events FROM PUBLIC, anon, authenticated;
GRANT INSERT (session_id, event_name, page_path, content_slug, signup_location,
  source, medium, campaign, utm_content, referrer_host, resource_id)
  ON public.growth_events TO anon, authenticated;
ALTER POLICY "Anyone can record privacy-safe growth events" ON public.growth_events
  TO anon, authenticated
  WITH CHECK (
    session_id IS NOT NULL
    AND page_path LIKE '/%'
    AND char_length(page_path) BETWEEN 1 AND 300
    AND position('?' in page_path) = 0
    AND position('#' in page_path) = 0
    AND created_at = now()
    AND (utm_content IS NULL OR char_length(utm_content) <= 160)
  );
-- Existing event-name and field-length CHECK constraints remain in force.
-- This constrains payloads, not bot volume. It is not proof of human consent
-- or reliable analytics provenance; rate limiting is a separate control.

-- Replace redundant always-true read rules with explicit publication rules.
-- The existing restrictive policies remain, providing defence in depth.
DROP POLICY "Allow public read access to newsletters" ON public.newsletters;
DROP POLICY "Newsletter rows are readable" ON public.newsletters;
CREATE POLICY "Published newsletters are readable anonymously"
  ON public.newsletters FOR SELECT TO anon
  USING (published_date <= now());
CREATE POLICY "Published newsletters or admin previews are readable"
  ON public.newsletters FOR SELECT TO authenticated
  USING (published_date <= now()
    OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role));

COMMIT;
