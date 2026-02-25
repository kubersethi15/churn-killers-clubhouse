-- Fix published dates: all were set to Wednesdays instead of Tuesdays
-- Newsletter schedule is Tuesday 6PM AEST (08:00 UTC)

UPDATE public.newsletters SET published_date = '2026-02-24T08:00:00+00:00' WHERE slug = 'customer-success-doesnt-deserve-to-survive';
UPDATE public.newsletters SET published_date = '2026-03-03T08:00:00+00:00' WHERE slug = 'ai-wont-save-customer-success';
UPDATE public.newsletters SET published_date = '2026-03-10T08:00:00+00:00' WHERE slug = 'the-revenue-ownership-trap';
UPDATE public.newsletters SET published_date = '2026-03-17T08:00:00+00:00' WHERE slug = 'stop-calling-yourself-strategic';
UPDATE public.newsletters SET published_date = '2026-03-24T08:00:00+00:00' WHERE slug = 'health-scores-are-astrology';

-- Also fix playbook dates to match
UPDATE public.playbooks SET published_date = '2026-02-24T08:00:00+00:00' WHERE newsletter_slug = 'customer-success-doesnt-deserve-to-survive';
UPDATE public.playbooks SET published_date = '2026-03-03T08:00:00+00:00' WHERE newsletter_slug = 'ai-wont-save-customer-success';
UPDATE public.playbooks SET published_date = '2026-03-10T08:00:00+00:00' WHERE newsletter_slug = 'the-revenue-ownership-trap';
UPDATE public.playbooks SET published_date = '2026-03-17T08:00:00+00:00' WHERE newsletter_slug = 'stop-calling-yourself-strategic';
UPDATE public.playbooks SET published_date = '2026-03-24T08:00:00+00:00' WHERE newsletter_slug = 'health-scores-are-astrology';
