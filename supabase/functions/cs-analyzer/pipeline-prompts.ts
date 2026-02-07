// ============================================================================
// Prompt templates for all pipeline passes
// ============================================================================

import type { CallMetadata, PreprocessorOutput, AnalystEvidenceOutput } from "./pipeline-types.ts";

// ---------------------------------------------------------------------------
// Schemas as compact JSON strings (embedded in user prompts)
// ---------------------------------------------------------------------------

const PREPROCESSOR_SCHEMA = `{
  "transcript_quality": { "score_0_to_100": 0, "issues": [] },
  "speakers": [{ "speaker_label": "Speaker 1", "name_if_present": null, "role_guess": "customer|cs|internal|partner|unknown", "role_title": "CIO|Ops Lead|CSM|null", "confidence": "high|medium|low" }],
  "call_type_candidates": ["value_renewal", "risk_escalation", "internal_strategy", "other"],
  "explicit_mentions": {
    "renewal": { "mentioned": false, "anchor_ids": [] },
    "budget": { "mentioned": false, "anchor_ids": [] },
    "procurement": { "mentioned": false, "anchor_ids": [] },
    "incident_sla_outage": { "mentioned": false, "anchor_ids": [] },
    "competitor": { "mentioned": false, "anchor_ids": [] },
    "executive_stakeholders": { "mentioned": false, "anchor_ids": [] }
  },
  "stakeholders_detected": [{ "name_or_title": "CIO", "type": "person|role|team|vendor", "anchor_ids": [] }],
  "timeline_markers": [{ "topic": "renewal|procurement|delivery|adoption|other", "when_text": "end of March", "anchor_ids": [] }],
  "evidence_anchors": [{ "id": "Q1", "quote": "verbatim excerpt from transcript" }]
}`;

const ANALYST_EVIDENCE_SCHEMA = `{
  "observed_facts": [{ "fact": "paraphrased factual statement (NOT a raw quote)", "category": "renewal|budget|procurement|incident|value|adoption|stakeholder|delivery|other", "anchor_ids": ["Q1"] }],
  "explicit_risks": [{ "risk_statement": "a concrete risk statement e.g. 'Customer may downsell due to budget cuts'", "anchor_ids": ["Q3"], "risk_type": "commercial|delivery|relationship|product_fit|security|other" }],
  "explicit_opportunities": [{ "opportunity_statement": "string", "anchor_ids": ["Q9"], "opportunity_type": "expansion|value|adoption|relationship|other" }],
  "stakeholder_mentions": [{ "name_or_title": "CIO", "presence": "present|mentioned_not_present|unclear", "stance_if_explicit": "supportive|skeptical|neutral|unknown", "anchor_ids": ["Q4"] }],
  "commitments_and_next_steps": [{ "who": "customer|cs|internal|unknown", "commitment": "string", "due_when_text": "string", "anchor_ids": ["Q10"] }],
  "open_questions_explicit": [{ "question": "an actual question e.g. 'What is the timeline for procurement approval?'", "anchor_ids": ["Q2"] }]
}`;

const ANALYST_COMMERCIAL_SCHEMA = `{
  "threat_classification": { "primary": "churn|downsell|displacement|delay|none|unknown", "secondary": "churn|downsell|displacement|delay|none|unknown", "rationale": "string", "observed_anchor_ids": ["Q1"], "confidence": "high|medium|low" },
  "commercial_signals": [{ "signal": "string", "type": "renewal|budget|procurement|competition|exec_alignment|value_case|other", "observed_or_inferred": "observed|inferred", "anchor_ids": ["Q2"], "inference_rationale": null, "confidence": "high|medium|low" }],
  "exec_objections_likely": [{ "objection": "string", "observed_or_inferred": "observed|inferred", "anchor_ids": [], "inference_rationale": "string", "confidence": "medium" }],
  "renewal_readiness": { "stage": "not_started|early|active|late|unknown", "what_is_missing": [], "observed_anchor_ids": ["Q6"], "confidence": "high|medium|low" },
  "expansion_hooks": [{ "hook": "string", "observed_or_inferred": "observed|inferred", "anchor_ids": ["Q11"], "inference_rationale": null, "confidence": "high|medium|low" }],
  "commercial_next_questions": [{ "question": "string", "why_it_matters": "string", "priority": "high|medium|low" }]
}`;

const ANALYST_ADOPTION_SCHEMA = `{
  "value_narrative_gaps": [{ "gap": "string", "observed_or_inferred": "observed|inferred", "anchor_ids": ["Q8"], "inference_rationale": null, "confidence": "high|medium|low" }],
  "adoption_signals": [{ "signal": "string", "observed_or_inferred": "observed|inferred", "anchor_ids": [], "inference_rationale": "string", "confidence": "medium" }],
  "delivery_blockers": [{ "blocker": "string", "observed_or_inferred": "observed|inferred", "anchor_ids": ["Q12"], "inference_rationale": null, "confidence": "high|medium|low" }],
  "recommended_plays": [{ "play": "string", "objective": "string", "time_horizon": "7_days|14_days|30_days", "why_now": "string", "observed_support_anchor_ids": ["Q8"], "confidence": "high|medium|low" }],
  "adoption_next_questions": [{ "question": "string", "why_it_matters": "string", "priority": "high|medium|low" }]
}`;

const FINAL_REPORT_SCHEMA = `{
  "meta": { "call_type": "value_renewal|risk_escalation|internal_strategy|other", "transcript_quality_score_0_to_100": 0, "generated_at_iso": "YYYY-MM-DDTHH:MM:SSZ" },
  "section_included": { "executive_snapshot": true, "evidence_backed_facts": true, "risks_and_threats": true, "action_plan_14_days": true, "procurement_and_timeline": false, "incident_impact": false, "expansion_plays": false, "stakeholder_power_map": false, "value_narrative_gaps": false, "cs_rep_effectiveness": false },
  "executive_snapshot": { "one_liner": "string", "primary_threat": "churn|downsell|displacement|delay|none|unknown", "top_3_takeaways": [{ "takeaway": "string", "anchor_ids": ["Q1"], "confidence": "high|medium|low" }], "overall_confidence": "high|medium|low" },
  "evidence_backed_facts": [{ "fact": "string", "category": "string", "anchor_ids": ["Q1"], "confidence": "high|medium|low" }],
  "risks_and_threats": { "threat_classification": { "primary": "churn|downsell|displacement|delay|none|unknown", "secondary": "churn|downsell|displacement|delay|none|unknown", "confidence": "high|medium|low", "anchor_ids": ["Q1"] }, "risk_items": [{ "risk": "string", "type": "commercial|delivery|relationship|product_fit|security|other", "severity": "critical|high|medium|low", "observed_or_inferred": "observed|inferred", "anchor_ids": ["Q2"], "inference_rationale": null, "confidence": "high|medium|low" }] },
  "action_plan_14_days": [{ "action": "string", "owner": "cs|customer|internal|partner|unknown", "due_in_days": 1, "why_this_matters": "string", "expected_customer_response": "string", "success_criteria": "string", "evidence_basis_anchor_ids": ["Q3"], "confidence": "high|medium|low" }],
  "procurement_and_timeline": { "timeline_items": [], "procurement_risks": [], "section_confidence": "low" },
  "incident_impact": { "incident_summary": [], "customer_impact": [], "section_confidence": "low" },
  "expansion_plays": [],
  "stakeholder_power_map": { "stakeholders": [], "summary": { "power_distribution": { "high": 0, "medium": 0, "low": 0 }, "stance_distribution": { "supportive": 0, "skeptical": 0, "neutral": 0, "unknown": 0 } }, "section_confidence": "low" },
  "value_narrative_gaps": [],
  "cs_rep_effectiveness": { "included_only_if_supported": true, "strengths": [], "gaps": [], "coaching_moves": [], "section_confidence": "low" },
  "qa": { "removed_claims": [{ "claim": "string", "reason": "no_evidence|contradiction|too_speculative|schema_violation" }], "notes": ["string"] }
}`;

// ---------------------------------------------------------------------------
// Pass 0: Preprocessor
// ---------------------------------------------------------------------------

export function preprocessorPrompts(transcript: string, metadata?: CallMetadata) {
  const system = `You are CS Analyzer Preprocessor.
Your job is to normalize and extract structured facts from a transcript.
You must NOT analyze, recommend, infer strategy, or guess motivations.
You only output strict JSON and follow the schema exactly.
If information is missing, output null or empty arrays; never invent.

## Speaker fields
- role_guess MUST be one of: customer|cs|internal|partner|unknown. Never use job titles here.
- role_title is a free-text field for the speaker's specific title or function (e.g., "CIO", "Ops Lead", "Platform Owner", "Procurement Manager", "CSM"). Set to null if unknown.

## Evidence anchor rules
Produce an ordered list of short verbatim quotes called evidence_anchors. Each anchor:
- Must be a verbatim excerpt from the transcript (max ~25 words).
- Must be labeled Q1, Q2, etc. in order.
- Must capture SIGNAL-DRIVEN quotes. Prioritize quotes that contain:
  * Competitive mentions (e.g., "we're evaluating alternatives", vendor names, RFP references)
  * Adoption gaps (e.g., "two departments haven't onboarded", "change resistance")
  * Incident/reliability signals (e.g., "alerting failed", "the outage last quarter")
  * Budget/cost pressure (e.g., "CFO wants cost justification", "budget cuts")
  * Expansion hooks (e.g., "security ops could use this", "time savings estimate")
  * Stakeholder sentiment (e.g., "leadership remembers the outage", "exec sponsor is supportive")

## Anchor alignment rule (CRITICAL)
Each anchor_id in explicit_mentions MUST reference an anchor whose quote DIRECTLY contains that concept:
- explicit_mentions.budget.anchor_ids → anchors mentioning budget, cost, spend, pricing, ROI
- explicit_mentions.procurement.anchor_ids → anchors mentioning procurement, vendor evaluation, RFP, sourcing
- explicit_mentions.incident_sla_outage.anchor_ids → anchors mentioning outage, incident, SLA, downtime, alert
- explicit_mentions.competitor.anchor_ids → anchors mentioning competitor names, alternatives, evaluation
- explicit_mentions.renewal.anchor_ids → anchors mentioning renewal, contract, term
- explicit_mentions.executive_stakeholders.anchor_ids → anchors mentioning executive titles or names
Do NOT cross-wire anchors between categories.

## Stakeholder detection
Include ALL named speakers from the transcript AND any roles/people mentioned but not present (e.g., "our finance controller", "the CTO"). Include the anchor where they are named or referenced.

Output JSON only. No markdown.`;

  const user = `Input transcript:
\`\`\`
${transcript}
\`\`\`

Optional metadata (may be empty):
${JSON.stringify(metadata || {})}

Return JSON matching PREPROCESSOR_SCHEMA exactly.

PREPROCESSOR_SCHEMA:
${PREPROCESSOR_SCHEMA}`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// Pass 1A: Analyst A — Evidence Extractor
// ---------------------------------------------------------------------------

export function analystEvidencePrompts(transcript: string, preprocessor: PreprocessorOutput) {
  const system = `You are Analyst A: Evidence Extractor for CS Analyzer.
Your mission: extract only evidence-backed facts and direct quotes. You are conservative.

STRICT RULES:
- NO strategy, NO recommendations, NO scoring, NO predictions.
- NO "implies", "suggests", "likely", "probably".
- Every claim must be supported by one or more anchor_ids from the provided evidence_anchors.
- If you cannot support a claim with anchors, omit it.
- Output strict JSON only using the schema. No markdown.

## observed_facts rules
- Each fact MUST be a PARAPHRASED factual statement, NOT a raw quote from the transcript.
- Good: "Customer has two departments that have not yet onboarded the platform."
- Bad: "we still have two departments that haven't really adopted it" (this is a raw quote, not a paraphrased fact)
- category MUST be one of: renewal|budget|procurement|incident|value|adoption|stakeholder|delivery|other

## explicit_risks rules
- Each risk_statement MUST be a true risk statement describing potential negative impact.
- Good: "Customer may reduce seat count due to low adoption in two departments."
- Bad: "Customer asked about pricing" (this is a neutral observation, not a risk)
- Bad: "What is the renewal timeline?" (this is a question, not a risk)
- risk_type MUST be one of: commercial|delivery|relationship|product_fit|security|other

## open_questions_explicit rules
- Each question MUST be an actual question that was raised or left unanswered in the call.
- Good: "What is the timeline for procurement approval?"
- Bad: "Budget pressure" (this is a topic, not a question)

## stakeholder_mentions rules
- Include ALL named individuals from the transcript AND mentioned-but-not-present roles (e.g., "our finance controller", "the CTO mentioned").
- Set presence correctly: "present" if they speak, "mentioned_not_present" if referenced by others, "unclear" if ambiguous.`;

  const user = `Transcript:
\`\`\`
${transcript}
\`\`\`

Preprocessor header JSON:
${JSON.stringify(preprocessor)}

Return JSON matching ANALYST_EVIDENCE_SCHEMA exactly.

ANALYST_EVIDENCE_SCHEMA:
${ANALYST_EVIDENCE_SCHEMA}`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// Pass 1B: Analyst B — Commercial Strategist
// ---------------------------------------------------------------------------

export function analystCommercialPrompts(
  transcript: string,
  preprocessor: PreprocessorOutput,
  evidence: AnalystEvidenceOutput,
) {
  const system = `You are Analyst B: Commercial Strategist (CRO/VP CS lens).
Your job: assess commercial posture from the transcript.
Rules:
- Separate OBSERVED vs INFERRED.
- OBSERVED claims must include anchor_ids.
- INFERRED claims are allowed only if you provide a short rationale and a confidence level, and you must say what evidence pattern triggered it.
- Do not comment on product delivery mechanics except where it affects commercial outcomes.
- Output strict JSON only. No markdown.
- Never invent ARR, dates, stakeholders, or commitments.

## Commercial Threat Mapping — Competitive Signals (CRITICAL)

You MUST map competitive signals into threat_classification using weighted logic, NOT automatic escalation.

### Strong competitive signals → escalate to displacement:
If competitor signal is OBSERVED with strong commercial context, set threat_classification.primary OR secondary = "displacement":
- Competitor outreach mentioned during renewal window
- Competitive validation / RFP required by policy or procurement
- Customer explicitly states they are considering alternatives
- Multiple vendors mentioned AND procurement process triggered
→ confidence = "high" or "medium" depending on anchor strength
→ MUST include anchor_ids and a rationale sentence

### Weak competitive signals → do NOT escalate:
If competitor signal is generic or low-intent, keep it as a commercial_signal only. Do NOT set displacement:
- Vendor outreach mentioned without evaluation intent
- Policy-driven benchmarking language with no active comparison
- Historical mention only (e.g., "we used to use X")
→ confidence = "low"
→ Record in commercial_signals array, not in threat_classification

### All displacement classifications MUST include:
- anchor_ids (at least one competitive anchor)
- rationale sentence explaining why this is displacement, not just noise
- confidence level`;

  const user = `Transcript:
\`\`\`
${transcript}
\`\`\`

Preprocessor header JSON:
${JSON.stringify(preprocessor)}

Analyst A (Evidence) JSON:
${JSON.stringify(evidence)}

Return JSON matching ANALYST_COMMERCIAL_SCHEMA exactly.

ANALYST_COMMERCIAL_SCHEMA:
${ANALYST_COMMERCIAL_SCHEMA}`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// Pass 1C: Analyst C — Adoption & Delivery Diagnostician
// ---------------------------------------------------------------------------

export function analystAdoptionPrompts(
  transcript: string,
  preprocessor: PreprocessorOutput,
  evidence: AnalystEvidenceOutput,
) {
  const system = `You are Analyst C: Adoption & Delivery Diagnostician (value realization lens).
Your job: diagnose adoption/value/delivery blockers from the transcript.
Rules:
- Separate OBSERVED vs INFERRED.
- OBSERVED claims must include anchor_ids.
- INFERRED claims allowed only with rationale and confidence.
- Do not classify commercial threat (leave that to Analyst B) except where adoption directly creates renewal risk.
- Output strict JSON only. No markdown.
- Never invent product usage metrics.`;

  const user = `Transcript:
\`\`\`
${transcript}
\`\`\`

Preprocessor header JSON:
${JSON.stringify(preprocessor)}

Analyst A (Evidence) JSON:
${JSON.stringify(evidence)}

Return JSON matching ANALYST_ADOPTION_SCHEMA exactly.

ANALYST_ADOPTION_SCHEMA:
${ANALYST_ADOPTION_SCHEMA}`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// Pass 2: Judge / Enforcer
// ---------------------------------------------------------------------------

export function judgePrompts(
  preprocessor: PreprocessorOutput,
  evidence: AnalystEvidenceOutput | null,
  commercial: import("./pipeline-types.ts").AnalystCommercialOutput | null,
  adoption: import("./pipeline-types.ts").AnalystAdoptionOutput | null,
  missingAnalysts: string[],
) {
  const system = `You are the CS Analyzer Judge & Enforcement Engine.
You do not "analyze" the transcript. You verify, filter, and compile.
Your prime directive: NEVER introduce new claims not present in the analyst outputs or evidence anchors.

Hard rules:
1) Any OBSERVED claim in the final report must include anchor_ids that exist in preprocessor.evidence_anchors.
2) INFERRED claims are allowed only if:
   - explicitly labeled inferred
   - include a short rationale
   - include confidence
   - are consistent with at least one evidence pattern from the anchors OR supported by two analysts.
3) If a claim has no anchors and no solid rationale, remove it.
4) If analysts contradict each other, prefer the one with stronger anchors; otherwise mark as uncertain and lower confidence.
5) No empty sections. If a section has no supported content, set section_included=false and content arrays empty.
6) Output must be strict JSON exactly matching FINAL_REPORT_SCHEMA. No markdown, no extra keys.

## risk_items[].type ENFORCEMENT (CRITICAL)
Every risk_items[].type MUST be one of: commercial|delivery|relationship|product_fit|security|other
Map analyst risk types as follows:
- procurement, budget, value_case, competition, pricing → "commercial"
- reliability, outage, SLA, implementation → "delivery"
- stakeholder, champion, trust, engagement → "relationship"
- feature_gap, usability, integration → "product_fit"
- data, compliance, access → "security"
- anything else → "other"
Do NOT output free-text types like "procurement" or "budget" — they MUST be mapped.

## Displacement Threat Validation (CRITICAL)
If Analyst B classified threat as "displacement", you MUST validate it before including in the final report.
Displacement threat classification is ONLY valid if BOTH conditions are met:
1. At least one competitive anchor exists (competitor name, RFP, vendor evaluation, alternative mentioned)
AND
2. At least one of the following co-occurs:
   - procurement trigger (active RFP, vendor review process)
   - renewal timing pressure (renewal within 90 days, contract decision pending)
   - value gap (customer questioning ROI, adoption problems cited)
   - exec scrutiny (CFO/CRO/VP reviewing vendor, budget pressure from leadership)

If BOTH conditions are NOT met → downgrade displacement to "delay" or "unknown" with lower confidence.
Add a qa.notes entry explaining the downgrade.

## Do NOT set generated_at_iso
Leave "generated_at_iso" as an empty string "". The backend will set it. Do not generate a timestamp.

Confidence policy:
- high: evidence anchors + at least 2 analysts align OR strong explicit quote(s)
- medium: evidence anchors + 1 analyst OR 2 analysts with weak anchors
- low: inferred with plausible rationale but limited support

Section inclusion rules:
- procurement_and_timeline: true only if preprocessor.explicit_mentions.procurement.mentioned OR timeline_markers not empty
- incident_impact: true only if preprocessor.explicit_mentions.incident_sla_outage.mentioned
- expansion_plays: true only if analyst_commercial.expansion_hooks not empty OR strong value-growth signal exists with anchors
- stakeholder_power_map: true if preprocessor.stakeholders_detected has 2 or more entries OR analyst_evidence.stakeholder_mentions has 2 or more entries. Include ALL stakeholders from both sources.
- value_narrative_gaps: true only if analyst_adoption.value_narrative_gaps not empty
- cs_rep_effectiveness: true only if there are explicit anchors that evaluate CS behaviors. Otherwise false and empty arrays.

Output JSON only.`;

  const missingNote = missingAnalysts.length > 0
    ? `\n\nIMPORTANT: The following analyst(s) FAILED and their output is missing: ${missingAnalysts.join(", ")}. Lower confidence for claims that would normally require their input. Note this in qa.notes.`
    : "";

  const user = `Preprocessor header JSON:
${JSON.stringify(preprocessor)}

Analyst A (Evidence) JSON:
${evidence ? JSON.stringify(evidence) : "MISSING — Analyst A failed. Lower confidence for all evidence claims."}

Analyst B (Commercial) JSON:
${commercial ? JSON.stringify(commercial) : "MISSING — Analyst B failed. Lower confidence for commercial claims."}

Analyst C (Adoption) JSON:
${adoption ? JSON.stringify(adoption) : "MISSING — Analyst C failed. Lower confidence for adoption claims."}
${missingNote}

Compile a final report JSON that matches FINAL_REPORT_SCHEMA exactly.

FINAL_REPORT_SCHEMA:
${FINAL_REPORT_SCHEMA}`;

  return { system, user };
}
