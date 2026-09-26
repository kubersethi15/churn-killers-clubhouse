# Subscriber email draft

Status: approved as part of the revised issue package. Send only through the normal release gates; this file is not an executable schedule.

Subject: They want to buy more. Should you let them?

Preheader: The buyer is ready. The delivery team isn't. What CS should do next.

The sender derives this teaser from the opening article paragraphs. This file documents that output; it is not a separate body override.

The customer wants to buy more. The paperwork can be signed this month. Sales is happy.

Then someone asks who will get it up and running.

The person who manages the system is still busy setting up the last purchase. The new department hasn't agreed to change how it works. The person who approved the budget thinks all of that is sorted.

This is a made-up example, not a customer story. But it raises a real question for Customer Success (CS): **when should you slow down a deal the customer is willing to sign?**

[Read the issue and get the playbook](https://churnisdead.com/newsletter/expansion-before-readiness?utm_source=newsletter&utm_medium=email&utm_campaign=expansion-before-readiness&utm_content=read_issue)

Kuber

---

Release requirements: render through the existing sender with its verified sender identity, postal footer, working unsubscribe and plain-text equivalent. Do not substitute a Gmail send or a new mailer. Confirm live article/PDF first; preserve per-recipient idempotency, active eligibility and provider suppressions. Recheck current sender health and signed webhooks at send time. The URL above is a future route, not verified live.
