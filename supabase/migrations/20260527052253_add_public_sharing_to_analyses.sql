-- Add sharing columns
ALTER TABLE public.analyses 
  ADD COLUMN public_share_id UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL;

ALTER TABLE public.analyses 
  ADD COLUMN is_public BOOLEAN DEFAULT false NOT NULL;

-- Partial index for fast public lookups
CREATE INDEX IF NOT EXISTS idx_analyses_public_share 
  ON public.analyses(public_share_id) 
  WHERE is_public = true;

-- Public-read policy: anon + authenticated can read rows where is_public = true
CREATE POLICY "Public reports readable by share id"
  ON public.analyses
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);;
