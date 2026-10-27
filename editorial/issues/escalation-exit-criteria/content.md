Support closes the ticket. The fix is live. The internal escalation channel goes quiet.

The customer still cannot run the workflow that started the escalation. Or they can, but nobody has told them who owns the remaining work.

The support incident and the account escalation can have different end dates. Treating one green status as proof of the other is where the follow-through gets lost.

**An escalation is over when the customer impact and the next obligation are clear. A closed ticket alone does not tell you that.**

This is not a call to leave every case open until the customer is delighted. It is a way to decide what can close, what needs a named handoff, and what is still unresolved.

## Two clocks can be running

One clock measures the urgent problem. Is the service restored? Has the broken process been repaired? Can the immediate impact be reduced? Support and Engineering may own that work.

The other clock measures the account commitment. Can the customer do what they were trying to do? Has someone explained what changed? Is a workaround still needed? Does a Product decision, implementation step or commercial conversation remain open? Customer Success (CS) may coordinate that work, but it cannot decide every part of it.

[Atlassian's incident handbook](https://www.atlassian.com/incident-management/handbook/incident-response) draws a useful boundary for the first clock. A technical incident is resolved when its current or imminent business impact has ended. Cleanup tasks can then be tracked separately. Atlassian also describes a final customer update and a later review. This is Atlassian's incident practice, not a universal rule for account escalations.

An account escalation needs its own exit test. A restored service may still leave the customer unable to complete their rollout. Equally, an account escalation should not stay at emergency status because a low-risk cleanup item remains. The two clocks need separate owners and separate evidence.

## Start with the impact, not the case status

The first question at closure is not “Did Support mark it done?” It is “What was the customer unable to do, and can they do it now?”

That answer should be concrete. “Performance improved” may be enough for a technical review, but the customer may have escalated because a daily reporting job could not finish before their own deadline. The close test is whether the reporting job now finishes, whether a workaround is acceptable, or whether the customer has agreed to a different plan.

Do not promise a test you cannot perform. If the customer has not yet tried the affected workflow, record that as unknown. If the fix works in your environment but not theirs, that distinction matters. If the customer says the original impact remains, their disagreement cannot be tidied away with a change to the case label.

This does not give CS the power to overrule a technical incident commander. It gives the account lead a reason to keep the account conversation open while the technical team closes its own work.

## Put the exit condition in writing early

The best time to agree how an escalation ends is near the start, before “close this” becomes a pressure to clear a queue.

What would the customer accept as an answer? It might be a working service, a tested workaround, a dated Product decision, a revised rollout plan, or a clear explanation that a requested change will not happen. Some of those are resolutions. Others are honest changes in plan. Neither is the same as silence.

[GitLab's public CS escalation process](https://handbook.gitlab.com/handbook/customer-experience/csm/escalations/) provides a direct example. It asks teams to keep exit criteria and the directly responsible individual current as the escalation moves. For closure, it calls for documented alignment between GitLab stakeholders and the customer, and asks whether the defined exit criteria were met. That is one company's practice. Its systems and meeting cadence are not a template every CS team should copy.

The part worth borrowing is the question: **what must be true before we call this done?**

Write the condition in plain language. “Customer can complete the weekly export by Tuesday” is useful. “Improve adoption experience” is not an exit condition. It has no test, owner or finish line.

If the condition changes, record who agreed to the change and why. That prevents a quiet downgrade from “the customer can use the feature” to “we sent an update.”

## A handoff is a decision, not a disappearance

The hard cases sit between fixed and broken. Immediate impact has ended, but work remains.

Suppose a service is restored and the customer can operate again. There is still a workaround to remove, an explanation to provide, and a decision about whether Product will change the underlying behaviour. Keeping the whole account in emergency mode may waste attention. Closing everything may make those commitments disappear.

Choose an explicit handoff. Record each open item, who can decide it, the next date and how the customer will hear about it. The account escalation can move to a lower state or close only if the customer understands that arrangement and the remaining work has somewhere real to live.

The person who sends the update is not automatically the person who can make the decision. A CSM can coordinate the customer conversation without pretending to own the release plan, support fix or contract change. If the actual decision owner is absent, “we'll follow up internally” is not a handoff. It is a gap.

[Google's incident response guidance](https://sre.google/workbook/incident-response/) separates coordination, operational response and communications roles. Those are technical incident roles, not a prescribed CS org chart. The useful principle is that a person responsible for telling the customer what is happening should know who owns the work and who can decide the next move.

## Make one of three calls

Before changing the account escalation status, the account lead and the relevant work owners can make one of three calls.

**Close.** The agreed exit condition has been met. The customer has received the outcome, or the team has documented their response. There is no unresolved promise hiding under the closed status. Follow-up learning can continue without keeping an emergency open.

**Handoff.** The urgent impact ended, but residual work remains. Every open item has a real owner, a next date and a customer-facing update plan. The customer knows the escalation is changing state and what will happen next. A handoff is not a claim that the problem never existed.

**Keep open.** The original customer impact persists, the exit condition cannot be tested, the customer disputes the claimed resolution, or the next decision has no owner. The next step is to name the decision and bring in the person who can make it. Another status meeting does not substitute for that choice.

Do this in the case and account record you already use. The [Escalation Exit Note](/pdfs/Escalation_Exit_Note_ChurnIsDead.pdf) is a one-page prompt, not a new dashboard. It asks for the original impact, evidence that it ended, the customer's response, open work, the decision owner and the next update.

## A made-up example

Imagine that a customer escalates because an integration failure stops its team from completing a daily reporting workflow. Support fixes the connection and closes the technical ticket. The team can see successful transactions in its logs.

This is an illustrative situation, not a customer story or a claimed result.

At the account level, the customer has not run the full reporting workflow since the fix. The CSM should not claim the account escalation is resolved on the strength of the support log alone. The first exit question is whether the customer can complete the work that failed.

If the next run succeeds, the customer agrees the urgent impact ended, and nothing consequential remains, close the account escalation. Send a plain final update.

If the next run succeeds but a temporary manual check must continue for two weeks, hand that work to a named person with a review date. Explain the state change to the customer. There is no need to keep an emergency bridge open just to remember the manual check.

If the next run fails, or nobody can say who will test it, keep the account escalation open. The technical ticket may still stay closed if the restored component is working. Reopening the wrong record to make the dashboard look consistent helps nobody.

The same logic applies beyond outages. An onboarding escalation might end with a revised, accepted launch plan. A commercial escalation might end with a decision and a clear no. The exit condition should match the customer's actual problem, not a generic status field.

## Try it on one live escalation

Pick one account escalation that someone wants to close this week. Ask the account lead to state the original customer impact in one sentence. Ask the people who own the fix or decision for the evidence that the impact ended. Then ask what the customer has actually heard or tested.

If work remains, name each owner and the next date. Choose close, handoff or keep open. Tell the customer which choice you made and what it means for them.

This will not, by itself, prove that you reduced churn or improved trust. It can reveal a simpler failure: a ticket can be complete while the customer's question is still unanswered.

**The status should follow the decision. The decision should follow the customer's actual situation.**

## Sources and methodology

- [GitLab: Customer Success Escalations Process](https://handbook.gitlab.com/handbook/customer-experience/csm/escalations/). Public CS operating guidance on accountable owners, exit criteria, customer alignment and closure. One company's process, not an industry benchmark.
- [Atlassian: How we respond to an incident](https://www.atlassian.com/incident-management/handbook/incident-response). First-party technical incident guidance on when urgent impact ends and how follow-up work is tracked. Used as an analogy; account escalations need their own close decision.
- [Google SRE: Incident Response](https://sre.google/workbook/incident-response/). First-party technical incident guidance on distinct coordination, operations and communications responsibilities. Used as a role-design analogy, not outcome research.

Accessed 26 October 2026. The reporting example is fictional. The three-way close, handoff or keep-open test and the Escalation Exit Note are original editorial proposals. No empirical claim about renewal, retention or incident speed is made.
