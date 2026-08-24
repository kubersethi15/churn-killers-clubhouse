**Illustrative scenario:** an account moves from green to yellow on Monday morning.

The CSM opens the dashboard. Usage is down. Executive engagement is lower. Two support tickets are open. The composite score has crossed a threshold.

The alert says **Investigate account health**.

By Wednesday, the CSM has discovered that usage fell because the customer consolidated two environments, the executive sponsor missed one meeting while travelling, and both support tickets are routine. The alert created work, but it did not identify a customer consequence or a decision.

On another account, a customer-confirmed implementation milestone has slipped twice. The health score is still green because product activity remains high and the score refreshes monthly.

The dashboard noticed movement. It did not know when the team should intervene.

A metric is not a signal. A signal is not a trigger. **An intervention trigger is an observed customer condition connected to a pre-agreed response.**

If an alert cannot tell the team what became consequential, why now matters, and who can act, it is only a request for more investigation.

## Separate measurement, state, signal and trigger

CS systems often compress four different things into one colour.

**Measurement** is an observation: weekly active users, unresolved cases, stakeholder attendance, implementation tasks completed, or time since the customer last confirmed an outcome.

**State** is a summary of several observations: green, yellow, red, healthy, neutral or at risk.

**Signal** is a change that may matter: usage falls below its established range, an agreed milestone passes without evidence, a decision-maker leaves, or a commercial step remains unconfirmed near its deadline.

**Trigger** is the rule that converts that signal into action: when this condition occurs, over this window, with these exclusions checked, this owner takes this response by this time.

The distinction matters because a health score can summarise an account without specifying the intervention. A CSM still has to unpack the score, locate the movement, decide whether it is meaningful, discover the cause and invent a response.

That latency is the real measurement problem.

## Start with customer consequence, not data availability

Google's Site Reliability Engineering guidance separates symptoms from causes. In its domain, monitoring should identify what is broken for users before diagnosing why. It also argues that urgent alerts should be actionable and difficult to ignore safely.

Customer Success should borrow the distinction carefully.

“Logins fell 18%” is an observation. “The implementation team cannot complete the workflow required for the customer's 30 September launch” is a consequence. The first may help investigate the second. It does not establish it.

Start a trigger with the customer commitment or decision that could fail:

- a customer-confirmed implementation milestone;
- an outcome evidence date;
- a security or legal approval needed for deployment;
- a budget or procurement step needed for renewal;
- an executive decision the success plan depends on.

Then ask which observable change gives the team enough time to protect that commitment.

Do not start with the easiest metric in the platform. Data availability is not customer significance.

## Define movement against a baseline

NIST's guidance on control charts compares current process behaviour with an established baseline. It also makes the trade-off explicit: where a limit is placed changes the risk of investigating normal variation as though it has a special cause.

Enterprise account activity is not a manufacturing process. It is often irregular, low-volume and shaped by planned events. A CSM should not paste three-sigma limits onto five monthly observations and call the result statistical control.

The transferable discipline is simpler:

1. Record what normal looked like for this customer, use case or lifecycle stage.
2. Specify how much movement matters.
3. Specify how long the movement must persist.
4. List known conditions that make the movement benign.
5. Treat the trigger as a reason to investigate or act, not proof of a cause.

GitLab's public product-usage playbooks show one practical version of this structure. They pair particular metrics with timing or movement conditions and then give the CSM discovery questions. The same guidance notes that a usage drop may have a benign explanation, such as project consolidation.

That caveat is important. A trigger should open a bounded decision path. It should not manufacture certainty.

## Design for false positives and missed signals

Google's SRE Workbook evaluates alerts using four properties: precision, recall, detection time and reset time.

Translated into CS operations:

- **Precision:** how often did the trigger identify a condition that required the defined response?
- **Recall:** how often did a consequential condition occur without the trigger firing?
- **Detection time:** how much usable time remained between the trigger and the customer decision or consequence?
- **Reset time:** how quickly did the account leave the triggered state after the condition was resolved or disproved?

These questions expose weak alert design.

A one-day engagement dip may fire quickly but create constant false alarms. A monthly score may be quieter but detect a missed milestone after the recovery window has closed. A trigger that never resets leaves the account permanently yellow, so the team learns to ignore it.

Low-volume accounts need extra caution. One missed meeting can look like a 50% engagement collapse if only two meetings were scheduled. A single executive absence should not page an entire account team. The consequence and context determine whether it matters.

## Build the Intervention Trigger Ledger

Use one row for each intervention the team expects a CSM or cross-functional owner to run.

### 1. Customer consequence

Name the commitment, outcome or decision at risk. Include its customer-confirmed date where one exists.

Bad: adoption is declining.

Better: the security team may miss the agreed date for completing its first production scan, delaying the customer's launch decision.

### 2. Observable event

Record the smallest event that can be observed consistently. Include the source system, refresh cadence and evidence owner.

Avoid blended scores here. Preserve the raw observation so another person can inspect it.

### 3. Baseline and window

State what normal means for this account, segment, use case or lifecycle stage. Then record the comparison window.

If no credible baseline exists, label the trigger provisional. Do not hide uncertainty behind a global threshold.

### 4. Trigger rule

Write the rule as a complete sentence:

**When [observable condition] persists for [window], before [customer consequence date], and [disqualifiers] are absent, create [response class].**

Use three response classes:

- **Interrupt:** a person must respond now because delay materially reduces recovery options.
- **Next working day:** the condition matters, but does not justify disrupting current work.
- **Monitor:** collect another observation before intervening.

### 5. Action and owner

An alert is incomplete without a first action that a named role can perform.

“Investigate health” is not an action. “CSM confirms whether the milestone moved, records the customer's reason, and routes a technical blocker to the implementation owner by Thursday” is.

Name the cross-functional decision owner separately when CS cannot resolve the condition.

### 6. Disqualifiers and reset rule

List the known benign conditions: planned migration, seasonal shutdown, contractually reduced scope, test environment, data outage or a customer-confirmed schedule change.

Then define what clears the trigger. Resolution, a disproved assumption, a new customer date or an explicit decision can all reset the state.

Without a reset rule, yesterday's risk becomes permanent dashboard decoration.

### 7. Review outcome

After each trigger, record only what improves the rule:

- consequential and correctly timed;
- consequential but late;
- benign movement;
- wrong owner or response;
- missed condition discovered elsewhere.

Do not use the review to score the CSM. Use it to improve the trigger.

## Replace one vague alert

Choose one alert that currently creates work for the team.

Find its most recent five occurrences. For each one, ask:

1. What customer consequence was actually at risk?
2. What action did the alert cause?
3. Could the owner act with the information available?
4. Was the condition urgent, suitable for the next working day, or only worth monitoring?
5. What cleared the alert?

If the answers vary every time, the alert is not a trigger. It is an invitation to improvise.

Build one row in the ledger and test it on the next occurrence. Keep the original health score if leaders still need a portfolio summary. Stop pretending that its colour is an intervention design.

The goal is not to predict churn from every movement.

It is to create enough justified notice for someone to protect a customer decision.

[Download the Intervention Trigger Ledger](/pdfs/Intervention_Trigger_Ledger_ChurnIsDead.pdf)

## Sources and methodology

The Intervention Trigger Ledger, seven fields and three response classes are original Churn Is Dead proposals, not an industry standard or predictive model. The design draws on [NIST's control-chart guidance](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc31.htm) for baseline comparison and false-investigation risk, Google's SRE guidance on [symptoms, causes and actionable alerts](https://sre.google/sre-book/monitoring-distributed-systems/), the SRE Workbook's treatment of [precision, recall, detection time, reset time and low-volume alerting](https://sre.google/workbook/alerting-on-slos/), and one public company example in GitLab's [product-usage playbooks](https://handbook.gitlab.com/handbook/customer-success/product-usage-data/metrics-based-playbooks/). Reliability-engineering methods are used as design analogies; the article does not claim that customer accounts behave like software services or statistically controlled manufacturing processes. Sources were reviewed on 24 August 2026.
