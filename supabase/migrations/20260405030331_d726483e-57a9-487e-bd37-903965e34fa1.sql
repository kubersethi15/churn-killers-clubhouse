CREATE POLICY "Allow service role to insert newsletters"
ON public.newsletters
FOR INSERT
TO service_role
WITH CHECK (true);