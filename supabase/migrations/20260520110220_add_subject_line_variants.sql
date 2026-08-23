ALTER TABLE public.newsletters
  ADD COLUMN IF NOT EXISTS subject_line_variants jsonb DEFAULT NULL;

COMMENT ON COLUMN public.newsletters.subject_line_variants IS
  'Array of 3 subject line variants for A/B testing. Generator populates this. NULL falls back to title.';;
