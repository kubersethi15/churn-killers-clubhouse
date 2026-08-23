-- Optimize RLS policies on my new tables: wrap auth.uid() in (select ...) so it's
-- evaluated once per query, not once per row.

DROP POLICY IF EXISTS "admin_read_email_events" ON public.email_events;
CREATE POLICY "admin_read_email_events" ON public.email_events
  FOR SELECT TO authenticated
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

DROP POLICY IF EXISTS "admin_read_send_log" ON public.newsletter_send_log;
CREATE POLICY "admin_read_send_log" ON public.newsletter_send_log
  FOR SELECT TO authenticated
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Also fix the pre-existing function_logs admin policy (this is the existing pattern's lint warning)
DROP POLICY IF EXISTS "admin_read_logs" ON public.function_logs;
CREATE POLICY "admin_read_logs" ON public.function_logs
  FOR SELECT TO authenticated
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Missing FK index on cs_analyzer_feedback
CREATE INDEX IF NOT EXISTS idx_cs_analyzer_feedback_analysis_id
  ON public.cs_analyzer_feedback (analysis_id);;
