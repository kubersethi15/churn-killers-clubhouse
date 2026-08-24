# The 30-Minute QBR Framework: converting the comment backlog

**Written:** 24 August 2026
**Launch:** 1 September 2026, after CID-001 closes at 18:14 Sydney
**Attribution label:** `linkedin/comment/qbr_framework`

## The finding

Kuber's featured LinkedIn post asking readers to comment "FRAMEWORK" for the
30-Minute QBR structure has **342 comments**. Churn Is Dead has **325
subscribers**.

One post produced more hand-raises than the entire subscriber list, and Churn Is
Dead was not promoted to any of them.

## What already exists

Nothing needs building. The asset and the plumbing are live:

| Piece | State |
|---|---|
| `The 30-Minute QBR Framework` PDF | Live at `/pdfs/30-Minute-QBR-Framework-ChurnIsDead.pdf` |
| Playbook Vault listing | Live, and the QBR framework is the **first card** on `/playbook` |
| Download tracking | `resource_open` growth event already fires on click |
| Newsletter capture | `NewsletterForm` already on the Playbook page |
| URL parameter support | `?kit=` already supported on `/playbook` |

This is a routing problem. The people who asked were never pointed at the thing
they asked for.

## Deliberately not gating the download

Every other playbook is a free download. Gating this one to force signups would
be inconsistent with the vault, and it clashes with a brand whose whole position
is against theatre. The conversion mechanism is the newsletter form on a page
they arrive at wanting something, not a wall in front of it.

Revisit only if tagged visits are high and signups are near zero. That is a
measured decision, not an assumption.

## Tracked entry point

```
https://churnisdead.com/playbook?utm_source=linkedin&utm_medium=comment&utm_campaign=qbr_framework
```

Reported separately from the CID-001 Tuesday link and from the always-on Premium
profile button, per the channel-discipline rule.

## Launch: released by Kuber, 24 August 2026

**Kuber approved immediate release.** The original 1 September hold is void.

It was written to keep a new LinkedIn surface out of the CID-001 window. PR #60
then scheduled a native LinkedIn Newsletter edition for 26 August, inside that
same window, so the baseline is mixed regardless. Holding this any longer would
cost eight days on 342 warm hand-raisers to protect a cleanliness already spent.

**Binding condition, not optional.** The CID-001 readout must be reported as a
**mixed-surface window**, not a clean single-variable baseline. Two LinkedIn
surfaces moved inside it. Anyone reading that number later must be able to see
that before drawing a conclusion about the Tuesday post.

## Dispatch instruction for Codex

Kuber has approved posting. Per the operating plan the shared manager sheet is
the execution source of truth, so this does not bypass it.

1. Add the post copy below to the manager sheet as an approved row, with
   Kuber's 24 August approval recorded in the approval column. Name the date
   and time affected so nobody schedules from stale copy.
2. Notify the manager that a row changed, per the standing handoff rule.
3. Publish the reply on the original QBR post the same day the new post goes
   live, so commenters who only watch that thread are covered.
4. Register the tracked URL exactly as written below. Do not shorten it or
   strip parameters, or the campaign cannot be separated from `tuesday_launch`
   or the always-on profile button.
5. Log the send in `growth/action-log.md`: route, date, status. No PII.

**Timing recommendation.** Not Tuesday and not Wednesday. The Tuesday post and
the 26 August newsletter edition already occupy those. Thursday 27 or Friday
28 August keeps this a third distinguishable surface rather than a third thing
competing in the same 48 hours. Codex owns the calendar and should overrule this
if the manager sheet says otherwise.

## Questions for Codex

1. Can you post to LinkedIn directly, or does everything route through the
   manager sheet and the social manager? The dispatch steps assume the sheet.
   Correct them if that is wrong.
2. Do you agree the CID-001 readout should carry a mixed-surface label? If you
   disagree, say why on the board rather than reverting it silently.
3. ACQ-04's recorded earliest start is "after opening test", which is after
   CID-001 closes, and #60 shipped it inside the window. Should the backlog
   sequencing be corrected to match what we now actually do, or should the
   window rule be enforced more strictly next time? Either answer is fine, but
   the written rule and the practice should agree. Right now they do not.
4. Is there an existing tagged route from the LinkedIn Newsletter's 680
   subscribers to the Playbook Vault? If not, that is the same leak as this one
   on a larger audience, and it is worth a separate claim.

## Staged copy

### A. New post, 1 September

Not a mass direct message. 342 individual DMs is slow, looks like automation,
and risks the account. A single post reaches every commenter through their
thread notification plus the full follower base.

> A while back I asked people to comment if they wanted the 30-minute QBR
> framework. Hundreds of you did. I sent it to some of you and then lost the
> thread completely, which is on me.
>
> So here it is properly, and it is not going behind anything.
>
> Three blocks. A pre-wire playbook so the meeting is not the first time anyone
> hears the hard part. A strategic versus operational calibration so you stop
> running one meeting for two audiences. And a one-page success plan that is not
> an attachment to the meeting, it is the meeting.
>
> It sits with about thirty other audits and playbooks I have written. All free,
> no form.
>
> [tracked link]
>
> If you commented and never got it, sorry it took this long.

### B. Reply on the original post, same day

> Reposting this properly since a lot of people commented and never got it. The
> framework is here, free, no form: [tracked link]

### C. Website

No change required. The QBR framework is already the first card on `/playbook`.

### D. Newsletter

Reference the vault in a future issue. Do not alter the Tuesday CID-001 issue.
325 existing subscribers have also never been pointed at this specific playbook.

## Measurement

| Measure | Source |
|---|---|
| Tagged visits on the campaign URL | `growth_events`, campaign `qbr_framework` |
| `resource_open` for the QBR playbook | `growth_events`, resource id 8 |
| Signups from those sessions | `growth_events` |
| Post engagement | LinkedIn Premium, aggregate only |

**Minimum evidence:** 20 tagged visits before any rate is stated, consistent
with the rule already applied to CID-001 and LI-04.

**Stop rule:** if tagged visits are high and both `resource_open` and signups
stay near zero, the problem is the landing experience, not the traffic. Fix the
page before repeating the post.

## The repeatable part

The real fix is not this one backlog. Every future "comment X" post should route
to a tracked vault URL from the start, rather than relying on manual replies that
do not scale and are not measurable. That turns each engagement post into a
measured acquisition surface instead of a spike in comments that goes nowhere.
