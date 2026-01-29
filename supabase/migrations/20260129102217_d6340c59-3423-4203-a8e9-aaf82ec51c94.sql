-- Fix subscribers table RLS policies to prevent data exposure and unauthorized updates
-- Drop existing flawed policies
DROP POLICY IF EXISTS "Allow read access to own subscriber record" ON public.subscribers;
DROP POLICY IF EXISTS "Allow update to own subscriber record" ON public.subscribers;

-- Create proper SELECT policy - users can only read their own subscriber record based on email
CREATE POLICY "Allow read access to own subscriber record" 
ON public.subscribers 
FOR SELECT 
USING (email = (auth.jwt() ->> 'email'));

-- Create proper UPDATE policy - users can only update their own subscriber record based on email
CREATE POLICY "Allow update to own subscriber record" 
ON public.subscribers 
FOR UPDATE 
USING (email = (auth.jwt() ->> 'email'))
WITH CHECK (email = (auth.jwt() ->> 'email'));