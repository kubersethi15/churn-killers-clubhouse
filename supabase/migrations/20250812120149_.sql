-- Trigger a test send of the latest newsletter to the specified email
select net.http_post(
  url:='https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/send-latest-newsletter',
  headers:='{"Content-Type":"application/json"}'::jsonb,
  body:='{"testEmail":"sethi_kuber@hotmail.com"}'::jsonb
) as request_id;;
