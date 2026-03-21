-- Seed the last_sent_newsletter_id tracker with The Revenue Ownership Trap (already sent manually)
INSERT INTO internal_config (key, value)
VALUES ('last_sent_newsletter_id', '96e4b7ce-f08e-4d63-8716-f1df7b124b73')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;