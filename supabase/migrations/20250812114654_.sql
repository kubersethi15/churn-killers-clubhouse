-- Trigger immediate newsletter broadcast to all subscribers by invoking the edge function now
SELECT public.invoke_newsletter_function();;
