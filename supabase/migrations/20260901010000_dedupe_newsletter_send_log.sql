-- Make the per-recipient newsletter send log idempotent.
--
-- send-latest-newsletter now upserts one row per (newsletter_id, subscriber_email)
-- so a partial-send retry updates the recipient's status instead of appending a
-- duplicate. That requires a unique index on those columns. Normalize historical
-- addresses first, then collapse duplicates while preferring a successful
-- delivery over any later failed retry. Keeping a failed row when a successful
-- row exists would make the next run resend an issue that was already delivered.

UPDATE public.newsletter_send_log
SET subscriber_email = lower(trim(subscriber_email));

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY newsletter_id, subscriber_email
      ORDER BY (send_status = 'sent') DESC, sent_at DESC NULLS LAST, id DESC
    ) AS duplicate_rank
  FROM public.newsletter_send_log
  WHERE newsletter_id IS NOT NULL
)
DELETE FROM public.newsletter_send_log log
USING ranked
WHERE log.id = ranked.id
  AND ranked.duplicate_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_send_log_newsletter_email_key
  ON public.newsletter_send_log (newsletter_id, subscriber_email);
