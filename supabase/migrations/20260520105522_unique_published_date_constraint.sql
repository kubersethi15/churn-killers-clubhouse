-- Prevent duplicate published_date values on newsletters (catches generator bugs at DB layer)
CREATE UNIQUE INDEX IF NOT EXISTS newsletters_published_date_unique
  ON public.newsletters (published_date);;
