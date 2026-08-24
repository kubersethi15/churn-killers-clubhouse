-- Record when growth_events becomes trustworthy for inference.
--
-- Before PR #90, trackGrowthEvent wrote from any production build including
-- localhost `vite preview`, so agent traffic entered the table with no field to
-- separate it from real readers. The pre-guard window is dominated by that
-- traffic (the table grew 353 -> 572 rows in one agent session, against 18
-- Search Console clicks in three months), so it is set aside wholesale rather
-- than labelled row by row, which is impossible.
--
-- This timestamp is the #90 merge instant, used as a conservative floor. The
-- last observed contaminated event was 04:50:52Z; #90 merged at 05:09:50Z.
-- Advance this value to the confirmed production-deploy time if it is later.
-- Reports additionally require seven elapsed days past this point before
-- stating any rate, so the first trustworthy read is 31 August 2026 at earliest.

insert into public.growth_measurement_state (metric, tracked_from)
values ('growth_events_clean_from', '2026-08-24T05:10:00Z')
on conflict (metric) do update set tracked_from = excluded.tracked_from;
