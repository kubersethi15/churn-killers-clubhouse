-- Make the per-recipient newsletter send log idempotent.
--
-- send-latest-newsletter now upserts one row per (newsletter_id, subscriber_email)
-- so a partial-send retry updates the recipient's status instead of appending a
-- duplicate. That requires a unique index on those columns. First collapse any
-- pre-existing duplicates (keeping one physical row per pair), then add the index.

DELETE FROM public.newsletter_send_log a
USING public.newsletter_send_log b
WHERE a.newsletter_id IS NOT NULL
  AND a.newsletter_id = b.newsletter_id
  AND a.subscriber_email = b.subscriber_email
  AND a.ctid < b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_send_log_newsletter_email_key
  ON public.newsletter_send_log (newsletter_id, subscriber_email);
