# LinkedIn subscribe-path activation

**Experiment:** `CID-006`

**State:** Staged. Do not activate before `CID-001` closes on 1 September 2026 at 18:14 Australia/Sydney.

## Decision

Determine whether sending a stable LinkedIn profile surface to the focused `/subscribe` page produces more acquired email subscribers than sending it to the general homepage, without weakening current-active status.

This is a destination test, not a claim that LinkedIn caused all observed subscription growth.

## Prepared destination

Use this exact URL when CID-006 activates:

`https://churnisdead.com/subscribe?utm_source=linkedin&utm_medium=profile&utm_campaign=always_on&utm_content=premium_button_subscribe`

The current control remains:

`https://churnisdead.com/?utm_source=linkedin&utm_medium=profile&utm_campaign=always_on&utm_content=premium_button`

LinkedIn may canonicalise or strip tags from a Featured link card. The Premium custom button is therefore the controlled surface. Featured remains descriptive unless its exact tags survive a live click.

## Activation sequence

1. Close the full `CID-001` window and record its aggregate result.
2. Verify `https://churnisdead.com/subscribe` renders, both forms accept a controlled test signup, the welcome email arrives, and the unsubscribe control works.
3. Capture the control's cumulative tagged visits, acquired subscribers, current-active count and Premium button engagements.
4. Change only the Premium custom-button destination to the prepared URL. Keep the button label, profile copy and Featured order unchanged.
5. Hold until at least 20 unique tagged visits reach the treatment or for 28 days, whichever occurs later.
6. Use `scripts/report_linkedin_funnel.py` to report the exact surface and first landing path. Record LinkedIn's aggregate button engagements separately.
7. Wait for the treatment cohort's day-30 active status before making a retention claim.

## Primary evidence

- unique tagged visits to `/subscribe` from `profile / always_on / premium_button_subscribe`;
- acquired subscriber records carrying the same surface and `/subscribe` landing path;
- those acquired subscribers still active after 30 days.

Supporting diagnostics are form-view sessions, form-submit sessions, signup errors and aggregate Premium button engagements. Follower growth, impressions and profile views are not acquisitions.

## Decision rule

Keep the focused destination if it produces a higher observed visit-to-signup rate after both control and treatment meet the 20-visit evidence floor, and if the treatment's mature active status does not show a material quality decline. If either side stays below the floor, describe the counts only and extend the window without changing copy.

Revert immediately if the live page, signup, welcome, reactivation or unsubscribe path fails. The revert target is the current tagged homepage URL.

## Privacy boundary

Report counts by source, campaign, variant, first landing path and form location. Never export or log email addresses, subscriber identities, LinkedIn viewers, followers or engagers.
