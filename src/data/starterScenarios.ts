/**
 * Starter scenarios for first-run users of the CS Analyzer.
 *
 * Picked to cover ~80% of enterprise CSM weekly workload:
 *  - Defensive: renewal_risk, qbr_challenge
 *  - Offensive: expansion_signal
 *  - Operational: onboarding_rescue
 *
 * Each scenario is a realistic synthetic transcript. Clicking a starter
 * card pre-fills the textarea with this transcript and lets the user run
 * the real analysis pipeline.
 *
 * Tone, length (~2-3 minute calls compressed to readable transcripts), and
 * stakeholder dynamics are calibrated so each one produces an interestingly
 * different report — different threat profiles, different stakeholder mixes,
 * different action-plan emphases.
 */

export type StarterScenarioId =
  | "renewal_risk"
  | "qbr_challenge"
  | "expansion_signal"
  | "onboarding_rescue";

export interface StarterScenario {
  id: StarterScenarioId;
  label: string;
  description: string;
  customer: string;
  transcript: string;
}

export const STARTER_SCENARIOS: StarterScenario[] = [
  {
    id: "renewal_risk",
    label: "Renewal at risk",
    description: "New stakeholder pushing for vendor consolidation. Champion losing internal air cover.",
    customer: "Meridian Financial Group",
    transcript: `[Renewal Discussion Call]
Date: March 4, 2026
Duration: 32 minutes
Customer: Meridian Financial Group (Fortune 500 financial services)
Participants:
- Daniel Park (Senior CSM, our team)
- Sarah Chen (CISO, Meridian — champion for 3 years)

---

Daniel: Sarah, thanks for making time. I know you're heads-down on the FY27 planning. I wanted to talk through where we are on the renewal — we've got 90 days.

Sarah: Yeah, I'm glad you reached out. I'm going to be direct with you, Daniel. We need to talk about David.

Daniel: David — your new VP of Infrastructure?

Sarah: Right. He started in January. Look, we love the platform. But David's team is running the consolidation review and he's been pretty clear that two SIEMs is one too many. He's been talking to Sentinel.

Daniel: How serious is the Sentinel conversation?

Sarah: Serious. He wants a side-by-side bake-off in the next six weeks. He's already booked time with their team.

Daniel: And you?

Sarah: I'm trying to hold the line. But the board's pushed back on infrastructure spend for FY27. Anything over five hundred K needs a fresh business case. We're at six twenty.

Daniel: I hear you. What would help you defend it internally?

Sarah: Honestly? Tier 1 detection coverage parity with Sentinel. If you can show me we're at parity or better on the actual detection capabilities, I can make the case. Without that, my hands are tied.

Daniel: I can have that to you this week. What else?

Sarah: There's something else you should know. Our SOC is at 92% capacity. If we lose the correlation rules we built with you, we're looking at six to nine months to rebuild on whatever wins. I don't think David fully appreciates that.

Daniel: That's a switching cost story we haven't put dollars on.

Sarah: Right. And one more thing — and this is the part I haven't told David yet — we've got three new business units coming online in Q3. Credit cards, wealth management, the Singapore office. None of that is in current scope.

Daniel: That's significant.

Sarah: Procurement wants the RFP responses back by April 18 to make the May exec committee.

Daniel: Okay. So I'm hearing — parity matrix this week, switching-cost analysis with real dollars, and a Q3 expansion proposal that reframes the renewal. Anything else I should know about David specifically?

Sarah: He came from a place that ran a single tool. Sentinel was that tool there. He's not anti-us — he's pro-simplification.

Daniel: That's actually useful. Thanks for being straight with me.

Sarah: Of course. I want this to work, Daniel. I'm just being honest about what I can and can't carry alone right now.

---

[End of call]`,
  },

  {
    id: "qbr_challenge",
    label: "Executive QBR challenged",
    description: "CFO questioning ROI at quarterly business review. Champion silent.",
    customer: "Northstar Logistics",
    transcript: `[Quarterly Business Review — Q1 2026]
Date: March 12, 2026
Duration: 41 minutes
Customer: Northstar Logistics (mid-market, 3,000 employees)
Participants:
- Maya Okafor (Senior CSM, our team)
- Carlos Reyes (VP of Operations, Northstar — primary champion)
- Janet Liu (CFO, Northstar — joined for the second half)
- Tom Bradshaw (IT Director, Northstar)

---

Maya: Thanks everyone for joining. I'll walk through Q1 outcomes, what's coming in Q2, and we'll leave time for discussion. Tom, did you get a chance to review the deck I sent?

Tom: I did, thanks. Carlos hasn't, I don't think.

Carlos: I got pulled into board prep. Sorry, Maya — walk us through it.

Maya: No problem. Q1 highlights — we hit 89% adoption across the dispatcher team, which is above the 75% target we set at kickoff. Response time on the analytics queries dropped from 4.2 seconds to 1.6. And we shipped the warehouse routing module two weeks ahead of plan.

Tom: Those numbers look good.

Maya: Q2, we've got the integration with your TMS scheduled, plus the multi-site rollout to Phoenix and Denver.

[Janet joins the call at the 22-minute mark]

Janet: Sorry I'm late. Carlos, fill me in on where we are.

Carlos: Maya just walked through Q1 results. Adoption looks strong.

Janet: Adoption. Right. Maya, can I ask you something direct?

Maya: Please.

Janet: We're paying 340K a year for this. When I look at the budget for renewal in October, I need to be able to tell the board: this saved us X dollars or made us Y dollars. Adoption doesn't get me there. What's the dollar number?

Maya: That's a fair question. The dispatchers are saving roughly 90 minutes a day on route planning, which we can convert at a fully-loaded rate. The warehouse routing reduced dock turnaround by —

Janet: I'm going to stop you. Time savings is not money saved unless we cut headcount or take on more volume. Did we do either?

Maya: We haven't cut headcount, no.

Janet: And the volume?

Carlos: Volume's up 11% YoY but that's mostly the new customer wins, not the tool.

Janet: Right. So I'm sitting here thinking — what's the renewal conversation in October going to look like?

Carlos: Janet, we'd be in real trouble without this. The dispatchers —

Janet: I'm not saying we don't need a dispatcher tool. I'm saying I don't know if I need this dispatcher tool at this price. Tom, what's the market look like?

Tom: There are three other vendors in this space. Two are about 40% cheaper.

Janet: That's what I thought.

Maya: Janet, I think there's a stronger value story here than what I just walked through. Would it help if we put together a CFO-grade business case before the next QBR? Real dollars, not minutes.

Janet: Yes. That would help.

Maya: I'll have a draft to you in two weeks.

Janet: Good. Carlos, I want to see that with you before it hits my desk.

Carlos: Understood.

---

[End of call]`,
  },

  {
    id: "expansion_signal",
    label: "Expansion signal in adoption call",
    description: "Mid-cycle conversation reveals new business unit + adjacent use case.",
    customer: "Westwood Healthcare",
    transcript: `[Monthly Adoption Check-in]
Date: March 18, 2026
Duration: 28 minutes
Customer: Westwood Healthcare (regional health system, 9 hospitals)
Participants:
- Priya Reddy (CSM, our team)
- Marcus Williams (Director of Clinical Operations, Westwood)

---

Priya: Hey Marcus, good to see you. Quick check-in — anything urgent before we go through the dashboard?

Marcus: Nothing urgent, but I want to pick your brain on something at the end. Walk me through the numbers first.

Priya: Sure. Adoption across the clinical staff hit 94% in February — way ahead of plan. The protocol-compliance flags are catching about 60 incidents a month, which is exactly where we projected.

Marcus: That's been the big win for us. The Chief Medical Officer mentioned it in the board meeting.

Priya: Glad to hear. Anything you want me to brief the team on?

Marcus: No, the team's doing great. So the thing I wanted to ask you about — we just closed on the Riverdale acquisition. Three hospitals on the south side. They go live as part of Westwood on July 1.

Priya: Congratulations. That's a big add.

Marcus: It is. And here's the thing — they're on a competing platform. End of life next year. CMO wants everyone on one system by Q4 2027. Aggressive but he's serious.

Priya: That's roughly 1,200 clinical users at Riverdale, right?

Marcus: 1,340. We did a count last week.

Priya: That's a significant expansion. Has it come up in your IT discussions yet?

Marcus: Not formally. I mentioned it to my CFO last week, she said "let's wait until after integration." But honestly, I think the CMO will push to do it sooner — he loved the compliance flags and wants Riverdale to have the same coverage from day one.

Priya: There's also something we haven't talked about — the lab integration module. We launched it in Q4 and a few health systems your size are using it for the lab-results-to-orders workflow. Given how heavy Riverdale's lab volume is, that might be worth a separate conversation.

Marcus: Hmm. Tell me more about that.

Priya: It's about a 6-week implementation, integrates with most of the major LIS vendors. Roughly cuts lab-to-order time in half. The Riverdale labs are running on Sunquest, right?

Marcus: Two of the three are. Third is on Cerner.

Priya: We support both.

Marcus: Interesting. So if I'm thinking about this — we've got an expansion conversation around Riverdale users, and possibly a new module on top.

Priya: Right. I'd recommend we get ahead of the IT planning. If we wait until after integration, you're going to be having that conversation under timeline pressure.

Marcus: Can you put something together that I can take to my CFO and CMO?

Priya: Yes. Give me a week. I want to do the math right on both pieces — the user expansion and the lab module — and frame it as the combined Riverdale rollout.

Marcus: Perfect. Send it before the 28th, that's when we have our integration planning meeting.

Priya: Got it. One more thing — would it be useful if I joined that meeting? Even just as a listen-in to understand the IT constraints?

Marcus: Actually, yes. Let me check with my COO but I think he'd be open to it.

---

[End of call]`,
  },

  {
    id: "onboarding_rescue",
    label: "Onboarding rescue at 60 days",
    description: "Implementation at the 60-day mark, adoption flat, kickoff goals slipping.",
    customer: "Veritas Logistics",
    transcript: `[Onboarding Status Call — Day 62 of Implementation]
Date: March 7, 2026
Duration: 35 minutes
Customer: Veritas Logistics (mid-market, ~600 employees)
Participants:
- Jordan Kim (Implementation CSM, our team)
- Rachel Tanaka (Director of Operations, Veritas — exec sponsor)
- Brian Hassan (IT Project Manager, Veritas)
- Lisa Park (Operations Manager, Veritas — day-to-day owner)

---

Jordan: Thanks all. So we're at day 62 of a 90-day onboarding plan. I want to be honest about where we are. We're behind.

Rachel: Okay, walk us through it.

Jordan: We set three milestones at kickoff. Milestone one — system configured and integrated with your ERP — we hit that on day 30, on time. Milestone two — pilot team of 25 users trained and using daily — we set that for day 60. We're at 11 users, 5 of whom use it daily.

Brian: 11 of 25. Yeah.

Jordan: Milestone three — full rollout to operations team of 180 — that's day 90. With where we are on milestone two, we're not going to hit it.

Rachel: Lisa, what's happening on the ground?

Lisa: Honestly? My team is overwhelmed. Q1 is our peak — we did 40% more volume than the same quarter last year. People don't have time to learn a new system right now. They're keeping the lights on.

Rachel: Why is that the first time I'm hearing this?

Lisa: I've been telling Brian.

Brian: She has. I should have escalated. I thought we'd catch up.

Jordan: Let me say a few things. First — this is fixable. Second — if we push through and try to hit day 90, we're going to do a bad job on rollout and your team is going to hate the tool. Third — every implementation I've done where Q1 volume slammed the pilot team, the right move was to pause and restart.

Rachel: What does pause and restart mean?

Jordan: It means we declare onboarding paused for 30 days. Your team focuses on Q1. On April 8, we restart with the lessons from this round — smaller pilot cohort, dedicated training time, exec sponsor checkpoint every two weeks.

Rachel: Does that delay value?

Jordan: It delays go-live by about 5 weeks. But it gives you a successful rollout instead of a failed one. The cost of a failed rollout is much higher.

Rachel: What's the contract say about timeline?

Jordan: We have flexibility — the contract is annual, not tied to specific milestones. We've got room.

Brian: I think Jordan is right. We tried to muscle through and we're paying for it.

Lisa: Agree. Honestly, I'm relieved you're proposing this.

Rachel: Alright. Jordan, I want a written plan by Friday with the new milestones, the exec checkpoint cadence, and what specifically changes about how we run the next 30 days.

Jordan: You'll have it Thursday.

Rachel: And Brian — I want to hear about these blockers earlier next time.

Brian: Understood.

Jordan: One more thing. I'd recommend we book a quick stakeholder call with your CFO before the restart. Just to reset expectations on timeline.

Rachel: Good call. I'll set that up.

---

[End of call]`,
  },
];

/**
 * Look up a starter scenario by id. Useful when wiring a deep link from
 * elsewhere in the app.
 */
export const getStarterScenario = (id: StarterScenarioId): StarterScenario | undefined =>
  STARTER_SCENARIOS.find((s) => s.id === id);
