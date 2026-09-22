An AI assistant finishes the implementation plan in seconds. The vendor records time saved. The customer opens it and starts checking.

Which dates were actually agreed? Is that integration available on this plan? Who volunteered the security team for a Friday deadline?

The document is finished. The work isn't.

That's an illustrative situation, not a customer story. But it exposes a question worth putting into the next AI rollout review: **did the work disappear, or did it move to someone whose time you don't measure?**

A productivity calculation can be accurate about your team and incomplete about the customer. If CS celebrates the first number without checking the second, it can help scale a worse service.

The test shouldn't be whether people used the AI feature. It should be whether a customer got an acceptable result with a trade-off they would choose again.

## Follow the work past the send button

Consider a generated implementation plan. Producing it is only one part of the job. Someone still has to check its assumptions, reconcile it with the contract, get the right people to agree and make it usable.

Here is a deliberately simple illustration. These are invented minutes, not a benchmark or measured result.

| Same task, same acceptance standard | Previous process | AI-assisted process |
|---|---:|---:|
| Vendor preparation and checking | 12 minutes | 4 minutes |
| Customer checking and correction | 8 minutes | 18 minutes |
| Combined active work | 20 minutes | 22 minutes |

The vendor saved eight minutes. The customer picked up ten. The combined effort rose by two.

That does not prove the new process is worse overall. Perhaps the customer can now complete it immediately instead of waiting two days. Perhaps the output is substantially better. Those benefits matter.

But neither appears in a claim that the vendor saved eight minutes. They need their own evidence.

The opposite mistake is to treat all customer involvement as waste. A customer approving its own priorities isn't doing the vendor's job. A customer correcting invented priorities may be.

**Separate necessary customer judgement from avoidable customer repair.** That distinction is more useful than trying to automate every interaction.

## The evidence is not an argument against AI

Brynjolfsson, Li and Raymond's [Generative AI at Work](https://digitaleconomy.stanford.edu/publication/generative-ai-at-work/) studied an assistant used by 5,172 support agents. The researchers report a 15% average increase in issues resolved per hour, with different effects across experience and skill levels. They also report improvements in customer interaction measures, including fewer requests to speak to a manager.

Those are meaningful results. They show why an outright rejection of automation would be lazy. They do not establish the return from a different product, customer task or deployment. Nor is an agent's hourly productivity the same measure as the customer's end-to-end effort.

A separate [CHI 2025 study](https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/) surveyed 319 knowledge workers. Participants described a shift towards verifying information and integrating AI output into their work. This was self-reported research, not a timed experiment showing how many minutes your customers lose. Its relevance here is narrower: generating an answer can change the work that remains rather than eliminate it.

Even apparently clean time comparisons need care. In its [February 2026 research update](https://metr.org/blog/2026-02-24-uplift-update/), METR said selection effects and measurement problems made its newer developer-productivity estimates unreliable. This is software-development research, not CS evidence. The useful warning is methodological: the people and tasks missing from a test can change its meaning.

So don't borrow a flattering percentage from someone else's study. Find out what happens after your own AI output reaches the person expected to use it.

## Replace the adoption question with a customer decision

“How do we get more customers using this?” assumes the right answer is more use.

For a particular workflow, ask instead: **should this customer use the AI route, the existing route, or a narrower version of the AI route?**

CS can help answer that without pretending to own the product roadmap. It has access to the point where the promised benefit meets the customer's actual task.

Take one task. Not “onboarding”. Something you can watch from start to finish, such as getting an implementation plan accepted by the people who must deliver it.

Agree what counts as finished before measuring speed. For that plan, completion might require agreed owners, feasible dates and no unresolved assumptions about purchased capabilities. A plausible-looking document is not the acceptance test.

The principle comes from [task analysis](https://www.nngroup.com/articles/task-analysis/): understand the user's goal and observe how the work gets done. The Customer Work Check below is an original, lightweight application for a CS rollout decision, not a validated research instrument.

## The Customer Work Check

Keep three things on one working page.

### 1. The result the customer needs

Write the task, the person doing it and the acceptance standard. Include any consequence that makes mistakes expensive.

“Generate a plan” is too loose. “Produce a plan the delivery owners can accept without correcting scope, responsibilities or dates” gives you something to inspect.

Record the current alternative too. Compare against how the customer actually works, not an artificially slow process invented to make the demo win. If the alternative cannot deliver the new capability at all, say so. That is a capability decision, not a like-for-like time saving.

### 2. The work on both sides

For each attempt, record vendor effort and customer effort separately. Include preparing inputs, checking, correcting and recovering from mistakes. Add a note about what caused the largest repair.

Keep elapsed waiting time separate from active person-minutes. Two people checking the same plan for ten minutes is twenty person-minutes, even if only ten minutes passed. Don't add the waiting time to that total.

Record whether the result met the acceptance standard, whether someone abandoned the attempt and whether outside help was needed. A failed attempt still consumed effort. Dropping failures from the comparison would make the route look easier than it was.

Observe with permission. Use approved systems and redacted task notes; the worksheet doesn't need customer identities, transcripts or confidential plan contents.

### 3. The decision and the repair

Use the observations to choose one next move:

- **Expand this workflow** when the result meets the agreed standard and the customer values the effort, speed or capability trade-off. Confirm that judgement over further comparable attempts before making a broad savings claim.
- **Change the workflow** when the benefit depends on avoidable customer repair. Name the repair, its owner and a date to test again.
- **Keep the existing route** when the result is unacceptable or the customer rejects the trade-off. Preserve a fallback while you fix the problem.

These are proposed decision options, not numeric pass marks. An unresolved security or contractual risk can rule out expansion regardless of minutes saved.

Don't collapse the two sides into one impressive total. A vendor benefit and a customer burden can coexist. The decision needs both visible.

## The strongest objection: some learning is worth it

A new workflow can be awkward before it becomes useful. Rejecting it after one clumsy attempt would protect the old process from any serious challenge.

That's fair. Treat initial setup and learning as distinct costs. Record them, give participants reasonable training, then examine repeated use. Don't hide setup costs, but don't charge the full setup time to every later task either.

The customer may willingly accept more active work for faster access, better control or an outcome previously out of reach. CS should surface that preference, not insist that fewer minutes is the only form of value.

What matters is whether the trade-off survives explanation. “You can complete this tonight, but you'll need to verify these two fields” is an honest proposition. “We've removed the work” is not, if verification still sits with the customer.

The proposed check is for deciding what to try next. It is not enough by itself to calculate ROI, claim reduced churn or certify safety.

## Use it in one rollout review this week

Choose one AI-assisted workflow already being promoted to customers. Start with three recent or observed attempts, including a difficult or abandoned one where available. Three is a practical starting point, not a statistical evidence threshold.

Use the current process as a comparison where one exists. Note differences in task difficulty and user experience. Repeating exactly the same task can make the second attempt easier through familiarity, so don't call that a controlled experiment.

Bring the completed check to Product and CS with one decision: expand the bounded use case, change a named part of it, or retain the existing route. If the evidence is incomplete, name what you need to observe next instead of declaring success.

The most useful finding may be small: a source link that saves repeated checking, a form field that removes guessing, or a handoff that stops the customer re-entering the same information.

You don't need to win an argument about whether AI works. You need to know whether this workflow works for the customer expected to adopt it.

[Download the one-page Customer Work Check, including a copyable prompt](/pdfs/Customer_Work_Check_ChurnIsDead.pdf)

## Sources and methodology

Sources reviewed on 19 September 2026. The linked Stanford research supports the narrow support-agent productivity findings; the Microsoft-hosted CHI study describes self-reported changes in knowledge work. METR's update supplies a caution about selection and measurement, not a CS productivity estimate. Nielsen Norman Group supplies the task-analysis principle.

The Customer Work Check, decision options and fictional implementation-plan example are Churn Is Dead proposals. None of these sources validates the tool or establishes that AI generally shifts work to customers. The article proposes testing for that possibility. It makes no customer-result, employer-experience or retention claim.
