// ============================================================================
// Pipeline type definitions — v2
// ============================================================================

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export type RoleGuess = "customer" | "cs" | "internal" | "partner" | "unknown";

export type CallType =
  | "qbr"
  | "renewal_negotiation"
  | "risk_escalation"
  | "churn_save"
  | "onboarding_kickoff"
  | "internal_strategy"
  | "expansion_discussion"
  | "other";

export type Confidence = "high" | "medium" | "low";
export type ObservedOrInferred = "observed" | "inferred";

export type ThreatType =
  | "churn"
  | "downsell"
  | "displacement"
  | "delay"
  | "none"
  | "unknown";

export type RiskType =
  | "commercial"
  | "delivery"
  | "relationship"
  | "product_fit"
  | "security"
  | "other";

export type Severity = "critical" | "high" | "medium" | "low";

export type StakeholderPresence =
  | "present"
  | "mentioned_not_present"
  | "unclear";

export type StakeholderStance =
  | "supportive"
  | "skeptical"
  | "neutral"
  | "resistant"
  | "unknown";

export type StakeholderPower = "high" | "medium" | "low";

export type StakeholderDecisionRole =
  | "decision_maker"
  | "influencer"
  | "champion"
  | "blocker"
  | "end_user"
  | "internal_champion"
  | "internal_owner"
  | "unknown";

// ---------------------------------------------------------------------------
// Call metadata (optional user-provided context)
// ---------------------------------------------------------------------------

export interface CallMetadata {
  customer_name?: string;
  arr?: string;
  renewal_date?: string;
  account_tier?: string;
  platform?: string;
  csm_name?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Evidence anchor (shared across all passes)
// ---------------------------------------------------------------------------

export interface EvidenceAnchor {
  id: string; // Q1, Q2, ...
  quote: string; // verbatim excerpt, max ~30 words
}

// ---------------------------------------------------------------------------
// Pass 0: Preprocessor output
// ---------------------------------------------------------------------------

export interface PreprocessorSpeaker {
  speaker_label: string;
  name_if_present: string | null;
  role_guess: RoleGuess;
  role_title: string | null;
  confidence: Confidence;
}

export interface ExplicitMentionEntry {
  mentioned: boolean;
  anchor_ids: string[];
}

export interface StakeholderDetected {
  name_or_title: string;
  type: "person" | "role" | "team" | "vendor";
  anchor_ids: string[];
}

export interface TimelineMarker {
  topic: "renewal" | "procurement" | "delivery" | "adoption" | "governance" | "expansion" | "other";
  when_text: string;
  anchor_ids: string[];
}

export interface PreprocessorOutput {
  customer_name_if_detected: string | null;
  transcript_quality: { score_0_to_100: number; issues: string[] };
  speakers: PreprocessorSpeaker[];
  call_type_candidates: CallType[];
  explicit_mentions: {
    renewal: ExplicitMentionEntry;
    budget: ExplicitMentionEntry;
    procurement: ExplicitMentionEntry;
    incident_sla_outage: ExplicitMentionEntry;
    competitor: ExplicitMentionEntry;
    executive_stakeholders: ExplicitMentionEntry;
    political_dynamics: ExplicitMentionEntry;
    expansion: ExplicitMentionEntry;
  };
  stakeholders_detected: StakeholderDetected[];
  timeline_markers: TimelineMarker[];
  evidence_anchors: EvidenceAnchor[];
}

// ---------------------------------------------------------------------------
// Pass 1A: Analyst A — Evidence Extractor output
// ---------------------------------------------------------------------------

export interface ObservedFact {
  fact: string;
  category:
    | "renewal"
    | "budget"
    | "procurement"
    | "incident"
    | "value"
    | "adoption"
    | "stakeholder"
    | "delivery"
    | "political"
    | "other";
  anchor_ids: string[];
}

export interface ExplicitRisk {
  risk_statement: string;
  anchor_ids: string[];
  risk_type: RiskType;
}

export interface ExplicitOpportunity {
  opportunity_statement: string;
  anchor_ids: string[];
  opportunity_type:
    | "expansion"
    | "value"
    | "adoption"
    | "relationship"
    | "other";
}

export type StakeholderType = "customer" | "internal" | "partner";

export interface StakeholderMention {
  name_or_title: string;
  presence: StakeholderPresence;
  stance_if_explicit: StakeholderStance;
  power_level: StakeholderPower;
  motivation_or_pressure: string | null;
  role_in_decision: StakeholderDecisionRole;
  relationships: string | null; // e.g., "Reports to CIO", "Gates finance approval"
  stakeholder_type?: StakeholderType;
  anchor_ids: string[];
}

export interface Commitment {
  who: "customer" | "cs" | "internal" | "unknown";
  commitment: string;
  due_when_text: string;
  anchor_ids: string[];
}

export interface OpenQuestion {
  question: string;
  anchor_ids: string[];
}

export interface AnalystEvidenceOutput {
  observed_facts: ObservedFact[];
  explicit_risks: ExplicitRisk[];
  explicit_opportunities: ExplicitOpportunity[];
  stakeholder_mentions: StakeholderMention[];
  commitments_and_next_steps: Commitment[];
  open_questions_explicit: OpenQuestion[];
}

// ---------------------------------------------------------------------------
// Pass 1B: Analyst B — Commercial Strategist output
// ---------------------------------------------------------------------------

export interface ThreatClassification {
  primary: ThreatType;
  secondary: ThreatType;
  rationale: string;
  observed_anchor_ids: string[];
  confidence: Confidence;
}

export interface CommercialSignal {
  signal: string;
  type:
    | "renewal"
    | "budget"
    | "procurement"
    | "competition"
    | "exec_alignment"
    | "value_case"
    | "other";
  observed_or_inferred: ObservedOrInferred;
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: Confidence;
}

export interface ExecObjection {
  objection: string;
  observed_or_inferred: ObservedOrInferred;
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: Confidence;
}

export interface RenewalReadiness {
  stage: "not_started" | "early" | "active" | "late" | "unknown";
  what_is_missing: string[];
  observed_anchor_ids: string[];
  confidence: Confidence;
}

export interface ExpansionReadiness {
  stage:
    | "no_signal"
    | "interest"
    | "evaluation"
    | "negotiation"
    | "commitment";
  gate_conditions: string[];
  decision_makers: string[];
  blockers: string[];
  anchor_ids: string[];
  confidence: Confidence;
}

export interface ExpansionHook {
  hook: string;
  observed_or_inferred: ObservedOrInferred;
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: Confidence;
}

export interface CommercialNextQuestion {
  question: string;
  why_it_matters: string;
  priority: "high" | "medium" | "low";
}

export interface AnalystCommercialOutput {
  threat_classification: ThreatClassification;
  commercial_signals: CommercialSignal[];
  exec_objections_likely: ExecObjection[];
  renewal_readiness: RenewalReadiness;
  expansion_readiness: ExpansionReadiness;
  expansion_hooks: ExpansionHook[];
  commercial_next_questions: CommercialNextQuestion[];
}

// ---------------------------------------------------------------------------
// Pass 1C: Analyst C — Adoption & Delivery Diagnostician output
// ---------------------------------------------------------------------------

export interface ValueNarrativeGap {
  gap: string;
  observed_or_inferred: ObservedOrInferred;
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: Confidence;
}

export interface AdoptionSignal {
  signal: string;
  observed_or_inferred: ObservedOrInferred;
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: Confidence;
}

export interface DeliveryBlocker {
  blocker: string;
  observed_or_inferred: ObservedOrInferred;
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: Confidence;
}

export interface RecommendedPlay {
  play: string;
  objective: string;
  time_horizon: "7_days" | "14_days" | "30_days";
  why_now: string;
  observed_support_anchor_ids: string[];
  confidence: Confidence;
}

export interface ConversationalGap {
  missing_topic: string;
  why_it_matters: string;
  suggested_question: string;
  confidence: Confidence;
}

export interface AdoptionNextQuestion {
  question: string;
  why_it_matters: string;
  priority: "high" | "medium" | "low";
}

export interface AnalystAdoptionOutput {
  value_narrative_gaps: ValueNarrativeGap[];
  adoption_signals: AdoptionSignal[];
  delivery_blockers: DeliveryBlocker[];
  recommended_plays: RecommendedPlay[];
  conversational_gaps: ConversationalGap[];
  adoption_next_questions: AdoptionNextQuestion[];
}

// ---------------------------------------------------------------------------
// Validated intermediate (output of code-based validator, input to Judge)
// ---------------------------------------------------------------------------

export interface ValidationIssue {
  type:
    | "orphaned_anchor"
    | "role_conflict"
    | "enum_violation"
    | "observed_without_anchor"
    | "precision_mismatch"
    | "incomplete_analyst_output"
    | "preprocessor_self_ref";
  source: string; // e.g., "analyst_evidence.observed_facts[2]"
  detail: string;
  action_taken: "removed_anchor" | "downgraded_to_inferred" | "removed_claim" | "flagged_only" | "flagged_critical";
}

export interface ValidatedPipelineInput {
  preprocessor: PreprocessorOutput;
  evidence: AnalystEvidenceOutput | null;
  commercial: AnalystCommercialOutput | null;
  adoption: AnalystAdoptionOutput | null;
  validation_issues: ValidationIssue[];
  missing_analysts: string[];
}

// ---------------------------------------------------------------------------
// Pass 2: Final Report (Judge output)
// ---------------------------------------------------------------------------

export interface FinalReportStakeholder {
  name_or_title: string;
  power: StakeholderPower;
  stance: StakeholderStance;
  role_in_decision: StakeholderDecisionRole;
  motivation_or_pressure: string | null;
  relationships: string | null;
  engagement_level: "high" | "medium" | "low";
  stakeholder_type?: "customer" | "internal" | "partner";
  anchor_ids: string[];
  confidence: Confidence;
}

export interface FinalReportActionItem {
  action: string;
  owner: "cs" | "customer" | "internal" | "partner" | "unknown";
  due_in_days: number;
  why_this_matters: string;
  expected_customer_response: string;
  success_criteria: string;
  evidence_basis_anchor_ids: string[];
  confidence: Confidence;
}

export interface FinalReportRiskItem {
  risk: string;
  type: RiskType;
  severity: Severity;
  observed_or_inferred: ObservedOrInferred;
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: Confidence;
}

export interface FinalReportExpansionPlay {
  play: string;
  observed_or_inferred: ObservedOrInferred;
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: Confidence;
}

export interface FinalReportValueGap {
  gap: string;
  impact_on_renewal: Confidence;
  observed_or_inferred: ObservedOrInferred;
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: Confidence;
}

export interface FinalReportConversationalGap {
  missing_topic: string;
  why_it_matters: string;
  suggested_question: string;
  confidence: Confidence;
}

export interface FinalReport {
  meta: {
    call_type: CallType;
    transcript_quality_score_0_to_100: number;
    generated_at_iso: string;
    customer_name: string | null;
  };
  section_included: {
    executive_snapshot: boolean;
    evidence_backed_facts: boolean;
    risks_and_threats: boolean;
    action_plan_14_days: boolean;
    procurement_and_timeline: boolean;
    incident_impact: boolean;
    expansion_plays: boolean;
    stakeholder_power_map: boolean;
    value_narrative_gaps: boolean;
    conversational_gaps: boolean;
    cs_rep_effectiveness: boolean;
  };
  executive_snapshot: {
    one_liner: string;
    primary_threat: ThreatType;
    top_3_takeaways: Array<{
      takeaway: string;
      anchor_ids: string[];
      confidence: Confidence;
    }>;
    overall_confidence: Confidence;
  };
  evidence_backed_facts: Array<{
    fact: string;
    category: string;
    anchor_ids: string[];
    confidence: Confidence;
  }>;
  risks_and_threats: {
    threat_classification: {
      primary: ThreatType;
      secondary: ThreatType;
      confidence: Confidence;
      anchor_ids: string[];
    };
    risk_items: FinalReportRiskItem[];
  };
  action_plan_14_days: FinalReportActionItem[];
  procurement_and_timeline: {
    timeline_items: Array<{
      event: string;
      when_text: string;
      anchor_ids: string[];
      confidence: Confidence;
    }>;
    procurement_risks: Array<{
      risk: string;
      anchor_ids: string[];
      confidence: Confidence;
    }>;
    section_confidence: Confidence;
  };
  incident_impact: {
    incident_summary: Array<{
      incident: string;
      anchor_ids: string[];
      confidence: Confidence;
    }>;
    customer_impact: Array<{
      impact: string;
      anchor_ids: string[];
      confidence: Confidence;
    }>;
    section_confidence: Confidence;
  };
  expansion_plays: FinalReportExpansionPlay[];
  expansion_readiness: {
    stage: string;
    gate_conditions: string[];
    decision_makers: string[];
    blockers: string[];
    anchor_ids: string[];
    confidence: Confidence;
  };
  stakeholder_power_map: {
    stakeholders: FinalReportStakeholder[];
    summary: {
      power_distribution: { high: number; medium: number; low: number };
      stance_distribution: {
        supportive: number;
        skeptical: number;
        neutral: number;
        resistant: number;
        unknown: number;
      };
    };
    section_confidence: Confidence;
  };
  value_narrative_gaps: FinalReportValueGap[];
  conversational_gaps: FinalReportConversationalGap[];
  cs_rep_effectiveness: {
    title_override?: string;
    included_only_if_supported: boolean;
    strengths: Array<{
      strength: string;
      anchor_ids: string[];
      confidence: Confidence;
    }>;
    gaps: Array<{
      gap: string;
      anchor_ids: string[];
      confidence: Confidence;
    }>;
    coaching_moves: Array<{
      move: string;
      why: string;
      confidence: Confidence;
    }>;
    section_confidence: Confidence;
  };
  qa: {
    removed_claims: Array<{
      claim: string;
      reason:
        | "no_evidence"
        | "contradiction"
        | "too_speculative"
        | "schema_violation"
        | "role_conflict";
    }>;
    validation_issues_from_code: ValidationIssue[];
    notes: string[];
  };
}
