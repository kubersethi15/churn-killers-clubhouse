Product friction rarely enters the roadmap as a clean decision.

It arrives as a screenshot in Slack. A CSM says a renewal is at risk. Sales adds another logo to the thread. Product asks for evidence. CS hears delay. Product hears pressure.

Then the request joins a backlog with no agreed decision, no owner, and no honest expectation for the customer.

The problem is not that Product has never heard the voice of the customer. The problem is that hearing a complaint and making a product decision are different jobs.

Customer Success needs a better operating system between those two jobs.

Not a louder escalation channel. Not a fake promise that every renewal risk gets roadmap priority. A review that converts customer friction into evidence Product can decide on.

Call it the **Product Friction Review**.

It borrows one useful principle from sprint planning: a team should enter a planning conversation with a goal, prepared work, and an honest view of capacity. It does not turn CS into a product owner. It makes CS responsible for the quality of the customer evidence it brings.

## What sprint planning actually contributes

The official [Scrum Guide](https://scrumguides.org/scrum-guide.html) describes Sprint Planning around three questions: why the sprint is valuable, what can be done, and how the chosen work will get done. The resulting Sprint Backlog contains a goal, selected backlog items, and a delivery plan. Developers use what they know about past performance and upcoming capacity to make a forecast.

That is useful because it separates a backlog from a commitment.

A product backlog can contain thousands of reasonable ideas. A sprint forecast contains the work a team has selected against a goal and its available capacity. Selection changes the status of the work.

CS often collapses those states. A request is logged, so the customer assumes it is being considered. A Product manager acknowledges it, so the account team hears momentum. A target quarter appears in conversation, so it becomes a commitment.

Nothing was actually decided.

The lesson is not “give CS ten percent of every sprint.” That would be a universal capacity rule with no universal evidence behind it. The lesson is simpler: define what makes customer friction ready for a decision, then record the decision Product actually made.

## Product keeps roadmap authority

This only works if Product retains the right to say no.

GitLab offers a useful public example. Its [customer issues prioritisation framework](https://handbook.gitlab.com/handbook/product/product-processes/customer-issues-prioritization-framework/) gives customer-facing teams a structured way to signal blockers, retention concerns, and commitments. The same page is explicit that those signals are inputs to planning, not strict ordering instructions. Product teams keep final prioritisation autonomy.

That boundary matters.

CS sees the customer consequence. Product sees dependencies, strategy, architecture, opportunity cost, and demand across the market. Neither view is complete on its own.

The Product Friction Review is not a transfer of control. It is a contract about inputs and decisions:

- CS owns the customer evidence.
- Product owns the product decision.
- Both own the expectation that leaves the room.

Without that contract, CS tries to win with commercial intensity. Product defends itself with backlog language. The customer gets ambiguity.

## The decision packet

A request enters the review only when it has a complete decision packet.

The packet has five fields.

### 1. The user consequence

Describe the workflow that is blocked or degraded. Name the user role, the action they are trying to complete, and what happens instead.

“The customer needs SSO improvements” is not ready.

“An administrator cannot apply access rules at the group level, so each user is maintained manually” is closer. It identifies a user, an action, and a consequence.

### 2. The evidence

Include reproducible steps, relevant screenshots or logs, affected product area, frequency, and the current behaviour. Separate what the customer said from what the account team inferred.

If the request cannot be reproduced, say that. Uncertainty is allowed. Hidden uncertainty is not.

### 3. The commercial timing

Record the next decision the customer will make and when. That may be a renewal, rollout, security review, expansion, or executive checkpoint.

Keep sensitive account information in the systems and notes designed for it. GitLab's public guidance is a useful reminder here: customer-sensitive context belongs in internal notes, and a customer label is not a delivery promise. The review needs enough commercial context to understand urgency without copying customer names or contract values into broad product channels.

### 4. The workaround reality

Document the current workaround, who performs it, how often it is required, and why it is acceptable or unacceptable.

Workarounds change priority. A painful workaround is not the same as no workaround. A workaround that violates a security policy is not the same as an inconvenient manual step.

### 5. The decision requested

Ask for one of four outcomes:

- commit to a defined next step;
- investigate before deciding;
- decline with a reason;
- return the packet for missing evidence.

“Please prioritise” is not a decision request. It is an invitation to continue arguing.

## The 30-minute review

The following cadence is a proposal, not an industry benchmark. Start weekly if the volume justifies it. Run it less often if it does not.

Use thirty minutes:

- Five minutes to close overdue decisions.
- Ten minutes to accept or reject new decision packets.
- Ten minutes to discuss the few items that require a trade-off.
- Five minutes to confirm owners, dates, and customer communication.

Do not read every open request. Do not let the meeting become product discovery theatre. Prepared packets are reviewed. Unprepared requests go back to the owner.

Every accepted packet leaves with one decision state:

- **Committed:** a defined next step has an owner and date.
- **Investigating:** a named person will answer a specific unknown by a date.
- **Declined:** Product has made a decision and recorded the reason.
- **Evidence needed:** CS knows exactly what is missing.

Declined is a valid state. Silence is not.

## Measure decision latency, not fantasy delivery dates

The first useful metric is **decision latency**: the time between a complete packet entering the review and an explicit decision being recorded.

It is not time to ship. It is not a promise to fix every issue quickly. It measures how long the organisation leaves a qualified customer problem in ambiguity.

Start by measuring your baseline. Do not borrow a target from another company. Look at the distribution, not just the average. A small number of very old unresolved decisions can create more customer damage than a healthy median suggests.

Then inspect the causes:

- packets arrive without evidence;
- no Product owner exists for the affected area;
- the decision maker misses the review;
- commercial urgency is asserted but not explained;
- investigations begin without an answer date;
- declined requests are kept alive because nobody wants to tell the customer.

The metric is useful only if it changes those behaviours.

Google SRE's [error-budget policy](https://sre.google/workbook/error-budget-policy/) illustrates the broader principle. A written policy turns a recurring cross-functional conflict into a repeatable decision process with agreed actions and escalation. The Product Friction Review uses that principle, not Google's thresholds. Your organisation must choose its own decision rules.

## An illustrative example

This is a constructed example, not a reported customer case.

A customer says a permissions limitation will block a wider rollout. The original request asks Product to “fix permissions before renewal.”

The decision packet changes the conversation. It identifies the administrator workflow, shows the manual workaround, records the security review date, and asks whether Product will investigate a narrower group-level control.

Product declines a broad permissions redesign. It accepts a short investigation into the narrower control and names the decision date. CS tells the customer what is being evaluated, what is not committed, and when the next answer will arrive.

The customer did not get an instant roadmap promise. They got a credible process.

That is the point.

## Where this model fails

The Product Friction Review will not repair a product strategy that ignores its market. It will not create engineering capacity. It will not make every high-value customer request correct.

It also fails when leaders corrupt the inputs:

- CS inflates risk to force priority.
- Product uses “need more evidence” as permanent deferral.
- Sales commitments appear after the commercial decision has already been made.
- Revenue amounts are stacked as if the largest account automatically has the best product argument.
- The meeting records activity but not decisions.

The review depends on disciplined disagreement. CS must be able to say, “This is the customer consequence.” Product must be able to say, “This is the product trade-off.” Leadership must be able to resolve the small number of conflicts that neither side owns alone.

## Start this week

Pick the ten oldest product requests attached to active customer conversations.

Do not ask Product to rank them yet.

For each one, complete the five-field decision packet. Remove the requests that have no clear user consequence. Mark the ones with missing evidence. Identify the requests that already have an answer nobody communicated.

Then run one Product Friction Review.

The goal is not to win more roadmap slots. The goal is to replace backlog ambiguity with decisions your customer team can stand behind.

[Download the Product Friction Review playbook](/pdfs/Product_Friction_Review_ChurnIsDead.pdf)

## Sources and methodology

This issue proposes a Churn Is Dead operating model. It does not claim that the cadence or metric is a universal benchmark. The model draws on the planning boundaries in the [official Scrum Guide](https://scrumguides.org/scrum-guide.html), the separation of customer input from Product autonomy in [GitLab's customer issues framework](https://handbook.gitlab.com/handbook/product/product-processes/customer-issues-prioritization-framework/) and [product process](https://handbook.gitlab.com/handbook/product/product-processes/), and the use of written cross-functional decision policies in [Google SRE](https://sre.google/workbook/error-budget-policy/). Sources were reviewed on 23 August 2026.
