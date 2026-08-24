# The 30-Minute QBR Framework: converting the comment backlog

**Written:** 24 August 2026
**Launch:** Original-thread comment published 24 August 2026; full feed post
approved in the manager calendar for 3 September 2026 at 17:30 Sydney
**Attribution label:** `linkedin/comment/qbr_framework`

## The finding

Kuber's featured LinkedIn post asking readers to comment "FRAMEWORK" for the
30-Minute QBR structure has **342 comments**. Churn Is Dead has **325
subscribers**.

One post produced more hand-raises than the entire subscriber list. Live review
of the thread shows that some commenters received individual DMs, but the thread
never received one public, tracked destination that everyone could use.

## What already exists

Nothing needs building. The asset and the plumbing are live:

| Piece | State |
|---|---|
| `The 30-Minute QBR Framework` PDF | Live at `/pdfs/30-Minute-QBR-Framework-ChurnIsDead.pdf` |
| Playbook Vault listing | Live, and the QBR framework is the **first card** on `/playbook` |
| Download tracking | `resource_open` growth event already fires on click |
| Newsletter capture | `NewsletterForm` already on the Playbook page |
| URL parameter support | `?kit=` already supported on `/playbook` |

This is a routing problem. Individual replies did not create a durable,
measurable route for the whole demand pool.

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

The public reply was released immediately on 24 August. It closes the original
thread's routing gap without mass messaging. The larger follower-facing post is
approved in the manager calendar for Thursday 3 September at 17:30, using a
previously blank slot so it does not compete with the 1 September issue launch
or the 2 September native newsletter edition.

## Codex execution answers

1. LinkedIn is a hybrid route. Codex can execute directly in the signed-in
   account, while the manager sheet remains the source of truth so the social
   manager does not duplicate scheduled work.
2. CID-001 is explicitly a mixed-surface window. No isolated-channel inference
   should be made from it.
3. The operating rule now matches practice: independently tagged acquisition
   surfaces may run concurrently when each has its own campaign label. Readouts
   must name the overlap. Clean single-variable windows are used only when one
   is explicitly declared and actually enforced.
4. The native Newsletter editions use a dedicated tracked route to the
   canonical issue. The 2 September edition also links directly to its free
   playbook. A separate generic vault link is unnecessary inside that edition.

## Staged copy

### A. New post, 3 September at 17:30

Not a mass direct message. 342 individual DMs is slow, looks like automation,
and risks the account. A new feed post can reach followers and other feed
readers, but it must not be described as notifying every original commenter.

> A while back I asked people to comment if they wanted the 30-minute QBR
> framework. Hundreds of you did. I sent it individually to some people, but
> the thread never got one public place where everyone could find it.
>
> That was a bad distribution system.
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

### B. Reply on the original post, published 24 August

> Update: some of you received this by DM, but this thread never got one public
> place to find it. The 30-Minute QBR Framework is now free in the Churn Is Dead
> Playbook Vault, alongside the other audits and tools:
>
> https://churnisdead.com/playbook?utm_source=linkedin&utm_medium=comment&utm_campaign=qbr_framework
>
> If you commented and I missed you, this fixes that. No form is required to
> download it.

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
