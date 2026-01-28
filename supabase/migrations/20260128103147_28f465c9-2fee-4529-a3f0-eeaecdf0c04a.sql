-- Create waitlist table for CS Analyzer early access signups
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  source TEXT DEFAULT 'homepage',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public insert (anyone can join waitlist)
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view their own waitlist entry (for checking if already signed up)
CREATE POLICY "Users can view own waitlist entry"
ON public.waitlist
FOR SELECT
USING (email = current_setting('request.jwt.claims', true)::json->>'email');