-- Run after the migration inside a transaction that is rolled back.
-- Reserved .invalid addresses; no durable subscriber, event or waitlist rows.
BEGIN;
SET LOCAL ROLE anon;
INSERT INTO public.subscribers (email, source_page, signup_location)
VALUES ('rls-' || gen_random_uuid() || '@example.invalid', 'homepage', 'footer');
INSERT INTO public.waitlist (email, name, role, source)
VALUES ('rls-' || gen_random_uuid() || '@example.invalid', 'RLS test', 'CSM', 'homepage');
INSERT INTO public.growth_events (session_id, event_name, page_path)
VALUES (gen_random_uuid(), 'page_view', '/');
DO $$ BEGIN
  BEGIN
    INSERT INTO public.subscribers (email) VALUES ('not-an-email');
    RAISE EXCEPTION 'FAIL: malformed subscriber accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.subscribers (email, welcome_email_sent_at)
    VALUES ('rls-forged@example.invalid', now());
    RAISE EXCEPTION 'FAIL: browser forged delivery state';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.waitlist (email, name, role) VALUES ('bad', 'test', 'CSM');
    RAISE EXCEPTION 'FAIL: malformed waitlist accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.growth_events (session_id, event_name, page_path)
    VALUES (gen_random_uuid(), 'page_view', '/?email=private');
    RAISE EXCEPTION 'FAIL: query string accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.growth_events (session_id, event_name, page_path, created_at)
    VALUES (gen_random_uuid(), 'page_view', '/', now() - interval '1 day');
    RAISE EXCEPTION 'FAIL: browser forged event timestamp';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  IF EXISTS (SELECT 1 FROM public.newsletters WHERE published_date > now()) THEN
    RAISE EXCEPTION 'FAIL: future newsletter visible anonymously';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.newsletters WHERE published_date <= now()) THEN
    RAISE EXCEPTION 'FAIL: published newsletters unavailable';
  END IF;
END $$;
RESET ROLE;
SET LOCAL ROLE authenticated;
INSERT INTO public.subscribers (email)
VALUES ('rls-' || gen_random_uuid() || '@example.invalid');
INSERT INTO public.waitlist (email, name, role)
VALUES ('rls-' || gen_random_uuid() || '@example.invalid', 'RLS test', 'CSM');
INSERT INTO public.growth_events (session_id, event_name, page_path)
VALUES (gen_random_uuid(), 'page_view', '/');
RESET ROLE;
SELECT 'PASS: valid intake, invalid payload rejection, server fields protected, publication gate preserved' AS result;
ROLLBACK;
