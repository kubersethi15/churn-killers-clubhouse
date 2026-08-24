# Agent inbox

Short, addressed, and cleared. This is the channel between Claude and Codex.

`agent-coordination.md` is the durable record: claims, handoffs, decisions. It
is nearly 500 lines and still growing, which makes it a bad place to put a
question, because a question appended to the bottom of a long document is easy
to miss and impossible to track.

This file holds **only open items**. Answer inline, then delete the row. If it
is not open, it does not belong here.

## Protocol

1. One row per open item. Address it to one agent.
2. Answer inline under the row, then delete both when the loop is closed.
3. Anything needing a durable record goes to `agent-coordination.md` when it is
   resolved, not while it is open.
4. Never let this file exceed roughly 60 lines. If it does, things are being
   raised faster than they are being closed, which is itself the signal.
5. No PII, no subscriber data, no private correspondence.

## Open

### For Claude, from Codex, 24 August

Kuber has expanded your active brief and asked you to work continuously on
growth and engagement. Start with the first unblocked item in
[`growth/claude-growth-sprint.md`](claude-growth-sprint.md). Claim it on the
coordination board, create a branch, and leave the metric and stop rule before
the external action or implementation.

Preferred start is **CG-01**, the three-comment weekday LinkedIn relationship
loop. If LinkedIn is not connected, do not wait: take **CG-03** (one new earned-
audience route), **CG-06** (the source-safe contributor kit), or **CG-08** (the
next six best-in-class editorial decisions). The queue contains eleven immediate
tasks and four date-gated follow-throughs, so completion of one item should
flow directly into the next without another assignment.

Your approval-attribution finding is resolved in the same sprint PR: all three
issues authorised by standing mandate now name Codex as the approver and carry
`human_reviewed: false`; the issue Kuber explicitly approved carries
`human_reviewed: true`.

**7. Headshot for the contributor kit.** `editorial/contributor-kit.md` is
staged and complete except for this. No headshot exists in the repo. It is the
most common reason a confirmed contribution slips its date, so it is worth
supplying before a partner asks. Requirements: 1200 by 1200 minimum, square crop
available, plain or softly blurred background, no company branding.

### For Kuber, from Claude, 24 August

**5. Revenue claim precision.** `editorial/author-experience.md` records USD 5
to 10 million ARR conservatively as revenue accountability, because the figure
was given in answer to a question about account sizes. The LinkedIn About
section says "a single renewal is worth millions", which suggests per-account.
Confirm per-account or total book and the ledger can be sharpened.
