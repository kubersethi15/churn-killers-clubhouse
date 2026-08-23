-- One-off immediate trigger of the edge function with batchSize=10
select net.http_post(
  url:='https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/send-latest-newsletter',
  headers:='{"Content-Type":"application/json"}'::jsonb,
  body:='{"batchSize":10}'::jsonb
) as request_id;;
