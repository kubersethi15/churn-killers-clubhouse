**Illustrative scenario:** a senior CSM starts the week with five customer problems.

A support incident needs a technical answer. A roadmap request needs a product decision. A security review needs evidence from Engineering. A renewal concession needs Finance and Sales approval. A stalled onboarding needs a revised customer plan.

By Friday, all five tasks are assigned to the CSM.

The CSM can chase every owner. They can assemble the context, reassure the customer, schedule the meeting and rewrite the update. They cannot decide the product priority, resolve the incident, approve the concession or produce the security evidence.

Yet when somebody asks who owns each problem, the team points to the person closest to the customer.

That is not customer centricity. It is an authority problem disguised as ownership.

Senior CSMs should own consequential customer work. They should not become the default owner for every consequential thing a customer mentions.

The distinction is simple: **customer proximity creates responsibility for context. It does not create authority over every decision.**

## “Own the outcome” is incomplete advice

“Own the outcome” sounds decisive. It is also vague enough to load an entire company onto one role.

An outcome can depend on product priority, technical execution, contract terms, budget, security policy and customer behaviour. The CSM can influence all of them. Influence is not final authority, specialist capability or control of resources.

A useful operating model separates four things:

1. **The customer consequence:** what happens if the work is late, wrong or absent.
2. **The binding decision:** the choice that changes the state of the problem.
3. **The decision authority:** the person who can make that choice and control the required resources.
4. **The CSM contribution:** the evidence, recommendation, coordination or communication CS should provide.

Without that separation, the CSM receives accountability without authority. The task stays open, the customer keeps asking, and every delay appears to be a CS execution problem.

## Public operating models already separate the roles

GitLab's public CSM services handbook describes CSM work that includes success roadmaps, adoption milestones, executive reviews, enablement and internal advocacy. It calls the CSM a customer champion and a liaison to other teams.

The same page draws a boundary around technical implementation. For infrastructure upgrades, it says CSMs may provide high-level guidance while implementation should ideally be handled by Professional Services.

That is one company's operating model, not a universal definition of Customer Success. But the distinction is useful: a CSM can own customer continuity and still not own specialist execution.

GitLab's separate Support guidance follows the same pattern. The CSM helps establish support access, improves ticket quality, reviews tickets and relays feedback. Support processes and engineers handle the technical resolution path.

The boundary is not “CS stops caring.” The boundary specifies how CS contributes without pretending to be the technical owner.

## The person who supplies evidence is not automatically the decision owner

The Scrum Guide makes this distinction explicit in product work. It assigns the Product Owner accountability for product value and Product Backlog management, including ordering backlog items. The Product Owner may delegate work, but remains accountable. Stakeholders who want the backlog changed try to convince the Product Owner; they do not inherit backlog authority because their input is important.

Applied carefully to Customer Success, the lesson is not that every company should use Scrum. It is that customer evidence and product authority are different things.

CS should be accountable for the quality of the customer evidence it brings. Product should retain accountability for the product trade-off. Engineering should retain authority over delivery and technical quality.

GitLab's public guidance on directly responsible individuals uses a similar separation. Its DRI has final decision power, consults relevant stakeholders and remains one accountable person. The handbook gives product prioritisation and engineering delivery as examples of different ownership.

That is the missing move in many cross-functional CS workflows: name the decision, then name the person who can actually make it.

## Inspect the work before you reassign it

Not every overloaded task needs a new owner. Some work should disappear.

Google's Site Reliability Engineering guidance uses the word **toil** for operational work that tends to be manual, repetitive, automatable, tactical, without enduring value and increasingly expensive as the service grows. It warns that excessive toil can blur a team's role, slow progress and create a precedent for other teams to shift more operational work onto it.

That definition belongs to SRE. Churn Is Dead is applying its attributes as a diagnostic for CS work, not importing Google's staffing targets.

Ask whether the recurring task:

- requires a person to copy information between systems;
- repeats without improving the underlying process;
- could be automated or designed away;
- arrives as an interruption rather than part of a deliberate customer plan;
- produces another update but leaves the customer problem unchanged;
- grows in direct proportion to account count.

If several are true, assigning the task to a different function may only relocate the waste. Remove, automate or redesign it.

## The Work Ownership Decision Matrix

Use four modes instead of a binary argument about whether CS “owns” the customer.

### 1. Own

CS owns the work when the CSM has authority to make the decision, the capability to execute it and a clear customer obligation.

Examples may include the success-plan cadence, stakeholder engagement plan, adoption hypothesis, value-review preparation and the customer communication CS has explicitly committed to deliver.

Ownership still needs a boundary: the outcome, the decision the CSM can make and the point at which another function's authority begins.

### 2. Prepare

CS prepares when another function owns the binding decision but needs customer evidence or a recommendation.

For a product request, CS can define the affected user, workflow, consequence, frequency, workaround and customer decision date. Product decides priority. For a commercial exception, CS can document customer context and consequence. The authorised commercial owner decides the concession.

Preparation is not passive. Weak evidence delays decisions. But the CSM's deliverable is the decision-quality packet, not the decision itself.

### 3. Coordinate

CS coordinates when a cross-functional handoff needs temporary continuity for the customer.

Coordination must be time-bounded. Record the operational owner, decision date, customer update cadence, escalation path and a **stop rule**: the observable event after which CS no longer runs the internal workflow.

Without a stop rule, coordination becomes permanent shadow ownership.

### 4. Remove

Remove work when it is repetitive, duplicated, automatable or produces no durable improvement.

Examples may include manually copying status between systems, rebuilding the same internal report, scheduling a recurring meeting with no decision, or translating updates that could be generated from a shared record.

Do not ask which senior person should inherit it. Ask why the task still exists.

## Run one ownership review

Choose one task that lands with a senior CSM at least monthly.

Write down:

- the exact customer consequence;
- the binding decision or required execution;
- the budget, system access, specialist capability or policy authority required;
- the person who controls those resources;
- the CSM's useful contribution;
- whether the work should be owned, prepared, coordinated or removed.

If the mode is Prepare or Coordinate, create a handoff record:

**Rightful DRI. CSM input. Decision date. Customer communication owner. Escalation path. Stop rule.**

Then test the boundary at the next occurrence. Did the rightful owner decide? Did the customer receive a clear answer? Did the task quietly return to the CSM two days later?

Do not redesign the entire CS role from a workshop. Fix one recurring ownership mismatch and observe what changes.

The goal is not to make senior CSMs less accountable. It is to make their accountability credible.

[Download the Work Ownership Decision Matrix](/pdfs/Work_Ownership_Decision_Matrix_ChurnIsDead.pdf)

## Sources and methodology

This issue proposes a Churn Is Dead operating model. The four modes, authority test, handoff fields and stop rule are original proposals, not industry benchmarks. The model draws on the definition and organisational effects of toil in [Google's SRE guidance](https://sre.google/sre-book/eliminating-toil/), the separation of stakeholder input from Product Owner accountability in the [2020 Scrum Guide](https://scrumguides.org/scrum-guide.html), GitLab's public guidance on [directly responsible individuals](https://handbook.gitlab.com/handbook/people-group/directly-responsible-individuals/), and GitLab's public examples of CSM boundaries in [CSM responsibilities and services](https://handbook.gitlab.com/handbook/customer-success/csm/services/) and [CSM and Support interaction](https://handbook.gitlab.com/handbook/customer-success/csm/support/). Sources were reviewed on 24 August 2026.
