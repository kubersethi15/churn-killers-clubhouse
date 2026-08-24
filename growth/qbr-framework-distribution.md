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

## Launch timing: the original reason no longer holds

**Written 24 August, before PR #60 merged.** The original plan held this to
1 September so a new LinkedIn surface would not change the channel mix inside
the CID-001 window.

**That reason is now obsolete.** PR #60 reactivated the LinkedIn Newsletter and
scheduled a native edition for Wednesday 26 August at 18:15 Sydney, six days
inside the same window. CID-001 will therefore be a mixed-surface window
whatever this document does.

Holding this backlog to 1 September would now cost eight days on 342 warm
hand-raisers to protect a cleanliness that no longer exists.

**Two consistent options. Kuber decides; both PRs must be treated the same way.**

1. **Release now.** Accept that CID-001 is a mixed-surface window, label its
   readout accordingly, and stop paying for a baseline already spent. This is
   the recommended option.
2. **Hold both.** Pull the Wednesday edition and keep this at 1 September. More
   disruptive, since the manager calendar is already changed and the
   notification already sent, but it does preserve a clean single-variable read.

What must not happen is one surface shipping inside the window while the other
waits for a baseline the first one already contaminated.

**Required either way:** the CID-001 readout must be reported as a
**mixed-surface window**, not a clean single-variable baseline. That label
protects whoever reads the number later from over-reading it.

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
