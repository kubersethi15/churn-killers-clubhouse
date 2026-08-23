CREATE TABLE IF NOT EXISTS public.function_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  status text NOT NULL,
  started_at timestamptz DEFAULT now(),
  duration_ms integer,
  payload jsonb,
  result jsonb,
  error_message text,
  error_stack text
);;
