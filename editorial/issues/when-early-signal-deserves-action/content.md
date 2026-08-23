**Illustrative scenario:** an enterprise account still has a green health score.

Underneath it, weekly use in the customer's priority workflow has fallen for three reporting periods. The executive sponsor has cancelled two meetings. A success-plan milestone has moved again.

None of those observations proves the customer will churn. Each may have an ordinary explanation. The usage change could be seasonal. The sponsor could be travelling. The milestone could have been unrealistic from the start.

Waiting for the aggregate score to turn red wastes the warning. Escalating every dip, cancellation and delay creates a different failure: the team spends its time chasing noise.

The operating question is not, **“Is this a leading indicator?”**

It is, **“What evidence gives this signal the right to trigger action?”**

## A score summarises; a trigger decides

A health score combines observations into a state. That can help a leader scan a portfolio, segment work or see which dimension deserves inspection.

An intervention trigger has a narrower job. It specifies the condition under which somebody must verify evidence or change the customer plan.

The distinction matters because an account can contain a consequential change before the weighted score crosses a colour boundary. It can also contain dozens of small fluctuations that should not interrupt a CSM.

GitLab's public customer-health handbook gives a useful company-specific example of this tension. It describes multiple inputs across product use, risk, outcomes, customer voice and engagement. It also records that an earlier multi-metric approach became a difficult-to-understand “black box” and was not action-oriented for its users.

That is not evidence that all composite scores fail. It is evidence that explainability and action matter to the people expected to use them.

A health score can remain the portfolio view. The trigger ledger sits underneath it and answers a different question: **what changed, compared with what, for how long, and what happens now?**

## “Leading” is not a property of a metric alone

OSHA's guidance in workplace safety describes leading indicators as proactive and preventive measures that reveal potential problems. It says leading indicators should drive change while lagging indicators measure effectiveness.

Customer Success is not workplace safety, and this issue does not transfer safety claims or thresholds into CS. The useful design principle is the relationship between signal, action and later outcome.

A metric is not useful merely because it arrives early.

Product logins can fall before renewal. They can also fall because the customer's project finished successfully, usage moved to an integration, a holiday reduced activity or the metric stopped collecting correctly.

Meeting attendance can fall before sponsor loss. It can also fall because the standing meeting no longer creates value.

A leading signal needs a named customer consequence and a plausible path between the observation and that consequence. It also needs a later outcome measure so the team can learn whether the intervention helped or the signal was misleading.

Otherwise, “leading indicator” becomes a flattering label for any data that moves before revenue does.

## Use a baseline before a universal threshold

NIST's control-chart guidance describes measurements over time, a centre line representing the expected process, and limits that distinguish expected variation from a condition worth investigating. It makes an important point: where the limits are placed changes the risk of searching for a cause when normal variation is responsible.

That principle travels better than the specific statistical thresholds.

Sparse account-level CS data may not satisfy the distribution, stability or sample assumptions required for formal statistical process control. Do not paste a three-sigma rule onto monthly usage for one customer and call it science.

Instead, record the relevant baseline explicitly:

- the customer's own expected pattern;
- the stage of the customer journey;
- the workflow or outcome the measure represents;
- known seasonality, rollout phases or data gaps;
- the cost of acting too early and the cost of acting too late.

The trigger can then describe a deviation from that context. An enterprise rollout that should add teams every fortnight needs a different rule from a stable, seasonal workflow. The baseline is part of the decision, not a footnote beneath the chart.

NIST also notes that a systematic pattern can warrant attention even when no single point crosses a limit. For CS, a sustained directional change may be more useful than one dramatic snapshot.

## Persistence filters noise, but it has a price

Google's SRE guidance on practical alerting describes rules that wait for a condition to persist before notifying a human, reducing alerts caused by transient changes. It also separates urgent pages, non-urgent tickets and information that belongs only on a dashboard.

Its SRE Workbook goes further: alert design trades precision, recall, detection time and reset time. A longer window can make an alert more credible, but it can also delay action or miss an intermittent problem.

These are software-reliability practices, not a prescription for customer health. The operating analogy is valuable: every persistence rule makes a trade-off.

If one missed milestone triggers escalation, the team will catch more potential problems and investigate more false alarms. If three consecutive misses are required, the alert becomes more credible but the customer loses more time before help arrives.

Write that choice down before the signal fires.

Severity should change the route. A possible data-quality problem can enter a verification queue. A confirmed sponsor departure near a customer decision date may justify immediate cross-functional action. A minor fluctuation can remain informational.

Not every signal deserves the same ceremony.

## The Intervention Trigger Ledger

The ledger is an original Churn Is Dead operating proposal. It gives each early signal seven fields.

### 1. Customer consequence

Name the decision, milestone or outcome that may be affected. “Usage is down” is an observation. “The implementation team may miss the agreed production milestone” is a consequence the team can investigate.

### 2. Signal and source

Define the exact measure, unit, system, collection cadence and freshness requirement. If the source is late or incomplete, the trigger should say **data unavailable**, not silently convert missing data into risk.

### 3. Baseline

Record what is expected for this customer, workflow and journey stage. Include known exceptions. Avoid a global threshold unless its relevance has been tested for the population in question.

### 4. Trigger rule

Specify the threshold, direction, window and persistence. Also specify severity. A rule such as “two consecutive weekly observations below the agreed rollout trajectory” is reviewable. “Usage feels low” is not.

### 5. Verification step

Name the evidence that must be checked before customer-facing action. Confirm data quality, recent plan changes and direct customer context. Verification is not a reason to wait indefinitely; give it an owner and deadline.

### 6. Response

Name the action, the accountable owner, the due date and the communication route. If the trigger cannot point to a different action, it may belong on a dashboard rather than in an intervention queue.

### 7. Reset and review

Define what closes the trigger, when it expires and how the team will review false positives, missed events and customer outcomes. Without a reset rule, an account can remain permanently “at risk” after the underlying condition has changed.

## Build one rule before rebuilding health

Choose one recurring risk where the team currently argues about when to act.

Write one ledger entry. Test it against three historical or illustrative account timelines. Ask:

- Would the rule have fired?
- Was the evidence available at that time?
- What action would it have created?
- Would that action have been early enough to matter?
- What normal variation would have created unnecessary work?
- What condition would have closed the intervention?

Then run the rule prospectively. Keep the aggregate health score unchanged while you learn.

The goal is not to predict churn from a clever metric. It is to make one early intervention explainable, bounded and reviewable.

[Download the Intervention Trigger Ledger](/pdfs/Intervention_Trigger_Ledger_ChurnIsDead.pdf)

## Sources and methodology

This issue proposes an original CS operating tool. It draws on the action-oriented distinction between leading and lagging measures in [OSHA's leading-indicator guidance](https://www.osha.gov/leading-indicators/), baseline and false-investigation trade-offs in [NIST's control-chart guidance](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc31.htm), persistence and routing in Google's [Practical Alerting from Time-Series Data](https://sre.google/sre-book/practical-alerting/), precision, recall, detection and reset trade-offs in Google's [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/), and a company-specific account of explainability and actionability in [GitLab's customer-health handbook](https://handbook.gitlab.com/handbook/customer-success/customer-health-scoring/). None of the source domains supplies a universal CS threshold. Sources were reviewed on 24 August 2026.
