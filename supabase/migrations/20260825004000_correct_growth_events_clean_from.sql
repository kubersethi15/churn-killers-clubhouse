-- Correct the growth-event measurement boundary after verifying when the
-- production-host guard actually reached the live site.
--
-- PR #90 merged at 05:09:50Z, but deployment 453bc5f7 did not complete until
-- 05:29:38Z. The interval between those events still served the unguarded
-- build, so 05:30Z is the earliest defensible clean-data boundary.

insert into public.growth_measurement_state (metric, tracked_from)
values ('growth_events_clean_from', '2026-08-24T05:30:00Z')
on conflict (metric) do update set tracked_from = excluded.tracked_from;
