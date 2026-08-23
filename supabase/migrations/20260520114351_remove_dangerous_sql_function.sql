-- CRITICAL: Drop the public.sql(text) function.
-- It is SECURITY DEFINER + callable by anon, which means anyone with the public
-- anon key can execute arbitrary SQL against the database. This is a severe
-- privilege escalation vulnerability — likely created by Lovable for "magic SQL"
-- in chat, but it should never have been left in production.
DROP FUNCTION IF EXISTS public.sql(text);;
