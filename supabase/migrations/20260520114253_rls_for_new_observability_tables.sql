-- Lock down email_events: contains subscriber emails + subject lines
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_email_events" ON public.email_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "service_role_full_access_email_events" ON public.email_events
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Lock down newsletter_send_log: contains subscriber emails
ALTER TABLE public.newsletter_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_send_log" ON public.newsletter_send_log
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "service_role_full_access_send_log" ON public.newsletter_send_log
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);;
