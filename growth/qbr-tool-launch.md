# QBR Score tool: launch copy for the social team

**Staged by Claude, 24 August 2026.** For Codex / the social manager to schedule.
The tool is `https://churnisdead.com/qbr-score`, shipped in PR #100.

**Tracked link to use everywhere:**
`https://churnisdead.com/qbr-score?utm_source=linkedin&utm_medium=post&utm_campaign=qbr_score_launch`

Reported separately from CID-001's `tuesday_launch` and the always-on profile
button, per channel discipline. Do not schedule inside a slot that collides with
the Tuesday issue or the Wednesday newsletter edition.

## Why this post can work where a normal post cannot

It does not ask the reader to read. It asks them to find out something about
their own work in two minutes, then hands them a number they will want to argue
with or share. The QBR post that drew 342 comments proved the appetite. This
gives that appetite somewhere to go.

## Post A: the primary launch (recommended)

> Most QBRs are theater. You already know this.
>
> Stakeholders show up. Slides get presented. Everyone agrees things look good or
> concerning. The call ends. Nothing changes.
>
> I built a 2-minute diagnostic that scores how much of your QBR is theater and
> how much actually forces a decision. Eight questions about the last review you
> ran. No email needed for the result.
>
> Most people score worse than they expect. The gap between "we had a good QBR"
> and "the customer decided something" is the whole game.
>
> Score yours: [tracked link]
>
> Then tell me the number you got. I want to see the spread.

## Post B: the personal-take variant

> I stopped running the standard QBR a long time ago. Thirty minutes, three
> slides, one decision the customer has to make. That was the whole meeting.
>
> The hard part was admitting how much of the old QBR existed just to be held.
>
> So I turned the test into something you can run on yourself. Eight questions,
> two minutes, a score for how much of your QBR is theater versus decision.
>
> [tracked link]
>
> Curious where people land. Drop your score below.

## First-comment (either post)

> The three blocks, if you want them before the full playbook: the customer's
> goal and whether the quarter aligned to it, what was achieved, and what is next
> including where you need support. Everything else is optional.

## Rules carried from the brand

- No hashtags, no emojis, no arrow-bullet lists.
- The result page already links the free 30-Minute QBR playbook and the
  newsletter, so the post itself stays non-promotional. One tracked link only.
- If it runs well, the same shape launches the next tool. Do not post more than
  one tool launch per week or the mechanic wears out.

## What to measure

Tagged visits on the `qbr_score_launch` campaign, `tool:qbr-score` completions,
`tool-share:qbr-score` shares, and subscribes from those sessions. PR #90 blocks
localhost and preview builds, but it does not identify a live-domain visit made
during production QA. Verify the tracked route with a non-JavaScript HTTP check
rather than opening it in an automated browser, and treat any known team-seeded
activity separately. Minimum 20 tagged visits before any rate.
