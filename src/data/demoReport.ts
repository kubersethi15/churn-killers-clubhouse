import type { FinalReport, EvidenceAnchor } from "@/components/cs-analyzer/report-v2/types";

/**
 * A hand-crafted demo report shown on the /cs-analyzer/demo page.
 *
 * Scenario: Meridian Financial Group — Fortune 500 financial services firm,
 * SIEM renewal at risk because a new VP of Infrastructure is pushing for
 * vendor consolidation with a competitor. The kind of call enterprise CSMs
 * have all the time — surface friendly, undercurrent threatening.
 *
 * All values match the FinalReport schema so it renders through the real
 * V2ReportRenderer without any special cases.
 */

export const DEMO_EVIDENCE_ANCHORS: EvidenceAnchor[] = [
  {
    id: "a1",
    quote: "Look, we love the platform. But David's team is running the consolidation review and he's been pretty clear that two SIEMs is one too many.",
  },
  {
    id: "a2",
    quote: "The board's pushed back on infrastructure spend for FY27. Anything over five hundred K needs a fresh business case.",
  },
  {
    id: "a3",
    quote: "Our SOC is at 92% capacity. If we lose the correlation rules we built with you, we're looking at six to nine months to rebuild on whatever wins.",
  },
  {
    id: "a4",
    quote: "Honestly, I haven't seen the new dashboards your team mentioned in the last QBR. We never got the rollout plan you committed to.",
  },
  {
    id: "a5",
    quote: "David wants a side-by-side bake-off with Sentinel in the next six weeks. He's already booked time with their team.",
  },
  {
    id: "a6",
    quote: "Procurement wants the RFP responses back by April 18 to make the May exec committee.",
  },
  {
    id: "a7",
    quote: "If you can show me Tier 1 detection coverage parity with Sentinel, I can make the case internally. Without that, my hands are tied.",
  },
  {
    id: "a8",
    quote: "We've got three new business units coming online in Q3 — credit cards, wealth management, and the Singapore office. None of that is in the current contract scope.",
  },
];

export const DEMO_REPORT: FinalReport = {
  meta: {
    call_type: "customer-risk",
    transcript_quality_score_0_to_100: 88,
    generated_at_iso: new Date().toISOString(),
    customer_name: "Meridian Financial Group",
  },
  section_included: {
    executive_snapshot: true,
    evidence_backed_facts: true,
    risks_and_threats: true,
    action_plan_14_days: true,
    procurement_and_timeline: true,
    incident_impact: false,
    expansion_plays: true,
    stakeholder_power_map: true,
    value_narrative_gaps: true,
    conversational_gaps: true,
    cs_rep_effectiveness: true,
  },
  executive_snapshot: {
    one_liner:
      "Meridian's renewal is genuinely at risk: a new VP of Infrastructure is pushing for SIEM consolidation, procurement has set an April 18 RFP deadline against a Sentinel bake-off, and the champion (CISO) needs Tier 1 detection parity evidence in the next 6 weeks to defend the existing platform internally.",
    primary_threat: "displacement",
    overall_confidence: "high",
    top_3_takeaways: [
      {
        takeaway:
          "The renewal isn't a renewal anymore — it's a competitive defense. Sentinel has already been brought in by the new VP and procurement has scheduled the exec committee for early May.",
        anchor_ids: ["a1", "a5", "a6"],
        confidence: "high",
      },
      {
        takeaway:
          "The CISO is still a champion but can't defend the platform without Tier 1 detection parity evidence. She explicitly asked for this — it's a buying signal, not a complaint.",
        anchor_ids: ["a7"],
        confidence: "high",
      },
      {
        takeaway:
          "There's an unspoken expansion opportunity: three new business units come online in Q3 that aren't in the current contract scope. Nobody on either side has connected this to the renewal conversation yet.",
        anchor_ids: ["a8"],
        confidence: "medium",
      },
    ],
  },
  evidence_backed_facts: [
    {
      fact: "A new VP of Infrastructure (David) is leading a vendor consolidation review and has stated preference for reducing to a single SIEM.",
      category: "Stakeholder change",
      anchor_ids: ["a1"],
      confidence: "high",
    },
    {
      fact: "Customer's board has imposed a $500K threshold for FY27 infrastructure spend requiring fresh business case approval.",
      category: "Budget pressure",
      anchor_ids: ["a2"],
      confidence: "high",
    },
    {
      fact: "Customer's SOC is operating at 92% capacity with significant custom correlation rules built on the current platform.",
      category: "Operational lock-in",
      anchor_ids: ["a3"],
      confidence: "high",
    },
    {
      fact: "A formal RFP process is underway with responses due April 18 and exec committee decision in early May.",
      category: "Procurement timeline",
      anchor_ids: ["a5", "a6"],
      confidence: "high",
    },
    {
      fact: "Three new business units (credit cards, wealth management, Singapore office) are coming online in Q3 and are outside current contract scope.",
      category: "Expansion signal",
      anchor_ids: ["a8"],
      confidence: "medium",
    },
  ],
  risks_and_threats: {
    threat_classification: {
      primary: "displacement",
      secondary: "downsell",
      confidence: "high",
      anchor_ids: ["a1", "a5"],
    },
    risk_items: [
      {
        risk: "Sentinel bake-off has been scheduled by the new VP and is the de facto evaluation criterion. Losing the bake-off effectively loses the renewal.",
        type: "commercial",
        severity: "critical",
        observed_or_inferred: "observed",
        anchor_ids: ["a5"],
        inference_rationale: null,
        confidence: "high",
      },
      {
        risk: "The CSM team committed to a dashboard rollout plan at the last QBR that never shipped. This is being used as evidence of vendor underperformance.",
        type: "delivery",
        severity: "high",
        observed_or_inferred: "observed",
        anchor_ids: ["a4"],
        inference_rationale: null,
        confidence: "high",
      },
      {
        risk: "FY27 board mandate creates a structural ceiling on renewal value — a like-for-like renewal at current ARR may not be approvable without a fresh business case.",
        type: "commercial",
        severity: "high",
        observed_or_inferred: "observed",
        anchor_ids: ["a2"],
        inference_rationale: null,
        confidence: "high",
      },
      {
        risk: "Champion (CISO) may be losing internal political capital to the new VP. If she can't get the parity evidence she requested, she may quietly disengage.",
        type: "relationship",
        severity: "high",
        observed_or_inferred: "inferred",
        anchor_ids: ["a1", "a7"],
        inference_rationale:
          "Tone shift in how she frames the conversation — moves from collaborative ('we love the platform') to constrained ('my hands are tied') within the same call. Classic signal of a champion who's being out-positioned.",
        confidence: "medium",
      },
    ],
  },
  action_plan_14_days: [
    {
      action: "Get Tier 1 detection coverage parity matrix vs Sentinel in front of the CISO this week.",
      owner: "CSM + Solutions Engineering",
      due_in_days: 7,
      why_this_matters:
        "The CISO explicitly told us this is what she needs to defend the platform internally. This is the single highest-leverage action on the entire account.",
      expected_customer_response:
        "If parity is genuinely there, she gains the ammunition to push back in the next exec committee prep. If it isn't, we find out now rather than at the bake-off.",
      success_criteria:
        "Parity matrix delivered and reviewed live with CISO within 7 days. She confirms it's enough to defend.",
      evidence_basis_anchor_ids: ["a7"],
      confidence: "high",
    },
    {
      action: "Reach David (new VP of Infrastructure) directly — request a 30-minute introduction call.",
      owner: "Account Executive",
      due_in_days: 5,
      why_this_matters:
        "David is currently the decision-maker by proxy via the consolidation review. If we're not in his calendar before the bake-off, we're already losing.",
      expected_customer_response:
        "He'll either engage (in which case we have a shot at re-framing consolidation as multi-SIEM specialization) or refuse (in which case we know we need to escalate above him).",
      success_criteria: "Meeting on calendar within 5 days; agenda set.",
      evidence_basis_anchor_ids: ["a1", "a5"],
      confidence: "high",
    },
    {
      action: "Ship the QBR-committed dashboards. If they cannot ship in 14 days, escalate internally and tell the customer honestly.",
      owner: "CSM + Product",
      due_in_days: 14,
      why_this_matters:
        "This was an explicit commitment we missed. It's already being used as evidence against renewal. Continuing to be silent on it is worse than shipping partial.",
      expected_customer_response:
        "Visible delivery rebuilds credibility. Silence reinforces the 'they don't deliver' narrative.",
      success_criteria: "Dashboards live and the CISO has seen them in a working session.",
      evidence_basis_anchor_ids: ["a4"],
      confidence: "high",
    },
    {
      action: "Build a Q3-expansion business case proposal: credit cards, wealth management, Singapore.",
      owner: "AE + CSM",
      due_in_days: 14,
      why_this_matters:
        "Three new BUs come online in Q3 outside current scope. If we wait for the renewal conversation to surface this, it becomes price-sensitive negotiation. If we surface it first, it becomes the reason the renewal expands rather than contracts.",
      expected_customer_response:
        "Reframes the renewal from a defensive 'how much can we cut' conversation to an offensive 'how do we cover Q3 scope' conversation.",
      success_criteria:
        "Proposal in the CISO's hands within 14 days, with a clear ARR figure and tied to specific Q3 milestones.",
      evidence_basis_anchor_ids: ["a8"],
      confidence: "medium",
    },
  ],
  procurement_and_timeline: {
    timeline_items: [
      {
        event: "RFP responses due to Meridian procurement",
        when_text: "April 18",
        anchor_ids: ["a6"],
        confidence: "high",
      },
      {
        event: "Sentinel bake-off window",
        when_text: "Next 6 weeks",
        anchor_ids: ["a5"],
        confidence: "high",
      },
      {
        event: "Exec committee final decision",
        when_text: "Early May",
        anchor_ids: ["a6"],
        confidence: "high",
      },
    ],
    procurement_risks: [
      {
        risk: "A formal RFP signals procurement now controls the process — pricing and commercials will be primary decision criteria unless we change the frame.",
        anchor_ids: ["a6"],
        confidence: "high",
      },
    ],
    section_confidence: "high",
  },
  incident_impact: {
    incident_summary: [],
    customer_impact: [],
    section_confidence: "low",
  },
  expansion_plays: [
    {
      play: "Q3 multi-BU expansion proposal covering credit cards, wealth management, and Singapore office.",
      why_it_fits:
        "Three new BUs come online in Q3 and aren't in current contract scope. Customer hasn't yet connected this to the renewal — first-mover advantage.",
      observed_or_inferred: "observed",
      anchor_ids: ["a8"],
      inference_rationale: null,
      confidence: "medium",
    },
  ],
  expansion_readiness: undefined,
  stakeholder_power_map: {
    stakeholders: [
      {
        name_or_title: "Sarah Chen (CISO)",
        power: "high",
        stance: "supportive",
        role_in_decision: "champion",
        motivation_or_pressure:
          "Wants to preserve operational continuity but has lost air cover with the new VP. Asked us directly for parity evidence — buying signal.",
        engagement_level: "high",
        stakeholder_type: "customer",
        presence: "present",
        anchor_ids: ["a1", "a7"],
        confidence: "high",
      },
      {
        name_or_title: "David (VP Infrastructure)",
        power: "high",
        stance: "skeptical",
        role_in_decision: "decision_maker",
        motivation_or_pressure:
          "New to the role. Consolidation is his stated mandate. Already brought Sentinel in. Has not been engaged by our team yet.",
        engagement_level: "low",
        stakeholder_type: "customer",
        presence: "mentioned_not_present",
        anchor_ids: ["a1", "a5"],
        confidence: "high",
      },
      {
        name_or_title: "SOC Operations Lead",
        power: "medium",
        stance: "supportive",
        role_in_decision: "end_user",
        motivation_or_pressure:
          "Their team built the custom correlation rules. Switching cost falls hardest on them.",
        engagement_level: "medium",
        stakeholder_type: "customer",
        presence: "mentioned_not_present",
        anchor_ids: ["a3"],
        confidence: "medium",
      },
      {
        name_or_title: "Procurement Lead",
        power: "medium",
        stance: "neutral",
        role_in_decision: "influencer",
        motivation_or_pressure:
          "Running the formal RFP process. Driven by exec committee timeline, not by vendor preference.",
        engagement_level: "medium",
        stakeholder_type: "customer",
        presence: "mentioned_not_present",
        anchor_ids: ["a6"],
        confidence: "medium",
      },
    ],
    summary: {
      power_distribution: { high: 2, medium: 2, low: 0 },
      stance_distribution: { supportive: 2, skeptical: 1, neutral: 1, resistant: 0, unknown: 0 },
    },
    section_confidence: "high",
  },
  value_narrative_gaps: [
    {
      gap: "Customer has no current articulation of the operational cost of switching SIEMs. The CISO mentioned 6-9 months of rebuild work but it's framed as a worry, not as a number.",
      impact_on_renewal:
        "If we don't quantify switching cost in dollars and incident-exposure-days, the consolidation argument wins on simplicity.",
      observed_or_inferred: "observed",
      anchor_ids: ["a3"],
      inference_rationale: null,
      confidence: "high",
    },
    {
      gap: "No business case has been built showing renewal ROI in FY27 dollars. The customer needs this for the $500K threshold — and we should be building it for them.",
      impact_on_renewal:
        "Without a CFO-grade business case, the renewal defaults to a price negotiation against Sentinel.",
      observed_or_inferred: "observed",
      anchor_ids: ["a2"],
      inference_rationale: null,
      confidence: "high",
    },
  ],
  conversational_gaps: [
    {
      missing_topic:
        "We never asked what David specifically dislikes about running two SIEMs. We assumed it's about cost.",
      why_it_matters:
        "If it's actually about operational complexity, our positioning should be 'specialized coverage' not 'best price'. If it's about budget, we have a different play.",
      suggested_question:
        "What's driving David's consolidation push specifically — is it primarily budget pressure or operational simplification?",
      confidence: "high",
    },
    {
      missing_topic:
        "Q3 expansion scope was mentioned but never connected to the renewal conversation by either party.",
      why_it_matters:
        "If left unaddressed, the customer will treat new BUs as a separate budget conversation. If we surface it now, it becomes part of the renewal frame.",
      suggested_question:
        "How are you thinking about coverage for the Q3 business units — does that get folded into the renewal scope or treated as a separate workstream?",
      confidence: "high",
    },
  ],
  cs_rep_effectiveness: {
    included_only_if_supported: true,
    strengths: [
      {
        strength: "Active listening — let the CISO surface the David situation rather than pushing for it.",
        anchor_ids: ["a1"],
        confidence: "high",
      },
      {
        strength: "Acknowledged the missed dashboard commitment when raised — didn't deflect or excuse.",
        anchor_ids: ["a4"],
        confidence: "high",
      },
    ],
    gaps: [
      {
        gap: "Did not ask any follow-up questions about David — his background, his mandate, his timeline. This is the most important stakeholder on the deal and we left the call knowing almost nothing about him.",
        anchor_ids: ["a1"],
        confidence: "high",
      },
      {
        gap: "Did not connect the Q3 BU expansion to the renewal conversation. It was raised by the customer and left unaddressed.",
        anchor_ids: ["a8"],
        confidence: "high",
      },
    ],
    coaching_moves: [
      {
        move: "Build a 'new stakeholder' workflow: any time a customer mentions a new decision-maker, the next three questions are scripted (background, mandate, timeline).",
        why: "Missing context on David is the single largest information gap on this account. This was avoidable.",
        confidence: "high",
      },
      {
        move: "Practice the 'expansion bridge' move: when customers mention new scope mid-renewal-cycle, immediately connect it to the renewal conversation with a question, not a pitch.",
        why: "The Q3 BU mention was a gift. We left it on the floor.",
        confidence: "high",
      },
    ],
    section_confidence: "high",
  },
  qa: {
    removed_claims: [],
    notes: [
      "Demo report. Built from a synthetic transcript representative of enterprise renewal-risk calls.",
    ],
  },
};
