// Frontend mirror of pipeline JSON schemas for the v2 report renderer

export interface EvidenceAnchor {
  id: string;
  quote: string;
}

export type ConfidenceLevel = "high" | "medium" | "low";
export type SeverityLevel = "critical" | "high" | "medium" | "low";
export type ThreatType = "churn" | "downsell" | "displacement" | "delay" | "none" | "unknown";
export type StakeholderStance = "supportive" | "skeptical" | "neutral" | "resistant" | "unknown";
export type StakeholderDecisionRole =
  | "decision_maker"
  | "influencer"
  | "champion"
  | "blocker"
  | "end_user"
  | "unknown";

export interface SectionIncluded {
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
}

export interface Takeaway {
  takeaway: string;
  anchor_ids: string[];
  confidence: ConfidenceLevel;
}

export interface ExecutiveSnapshot {
  one_liner: string;
  primary_threat: ThreatType;
  top_3_takeaways: Takeaway[];
  overall_confidence: ConfidenceLevel;
}

export interface EvidenceBackedFact {
  fact: string;
  category: string;
  anchor_ids: string[];
  confidence: ConfidenceLevel;
}

export interface RiskItem {
  risk: string;
  type: "commercial" | "delivery" | "relationship" | "product_fit" | "security" | "other";
  severity: SeverityLevel;
  observed_or_inferred: "observed" | "inferred";
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: ConfidenceLevel;
}

export interface ActionPlanItem {
  action: string;
  owner: string;
  due_in_days: number;
  why_this_matters: string;
  expected_customer_response: string;
  success_criteria: string;
  evidence_basis_anchor_ids: string[];
  confidence: ConfidenceLevel;
}

export interface StakeholderEntry {
  name_or_title: string;
  power: "high" | "medium" | "low";
  stance: StakeholderStance;
  role_in_decision?: StakeholderDecisionRole;
  motivation_or_pressure?: string | null;
  relationships?: string | null;
  engagement_level?: "high" | "medium" | "low";
  // Legacy field fallback
  engagement?: "high" | "medium" | "low";
  presence?: "present" | "mentioned_not_present" | "unclear";
  anchor_ids: string[];
  confidence: ConfidenceLevel;
}

export interface ExpansionReadiness {
  stage: string;
  gate_conditions: string[];
  decision_makers: string[];
  blockers: string[];
  anchor_ids: string[];
  confidence: ConfidenceLevel;
}

export interface ConversationalGap {
  missing_topic: string;
  why_it_matters: string;
  suggested_question: string;
  confidence: ConfidenceLevel;
}

export interface ValidationIssue {
  type: string;
  source: string;
  detail: string;
  action_taken: string;
}

export interface FinalReport {
  meta: {
    call_type: string;
    transcript_quality_score_0_to_100: number;
    generated_at_iso: string;
  };
  section_included: SectionIncluded;
  executive_snapshot: ExecutiveSnapshot;
  evidence_backed_facts: EvidenceBackedFact[];
  risks_and_threats: {
    threat_classification: {
      primary: string;
      secondary: string;
      confidence: ConfidenceLevel;
      anchor_ids: string[];
    };
    risk_items: RiskItem[];
  };
  action_plan_14_days: ActionPlanItem[];
  procurement_and_timeline: {
    timeline_items: { topic?: string; event?: string; when_text: string; anchor_ids: string[]; confidence: string }[];
    procurement_risks: { risk: string; anchor_ids: string[]; confidence: string }[];
    section_confidence: string;
  };
  incident_impact: {
    incident_summary: { summary?: string; incident?: string; anchor_ids: string[]; confidence: string }[];
    customer_impact: { impact: string; anchor_ids: string[]; confidence: string }[];
    section_confidence: string;
  };
  expansion_plays: {
    play: string;
    why_it_fits?: string;
    observed_or_inferred: "observed" | "inferred";
    anchor_ids: string[];
    inference_rationale: string | null;
    confidence: string;
  }[];
  expansion_readiness?: ExpansionReadiness;
  stakeholder_power_map: {
    stakeholders: StakeholderEntry[];
    summary: {
      power_distribution: { high: number; medium: number; low: number };
      stance_distribution: { supportive: number; skeptical: number; neutral: number; resistant?: number; unknown: number };
    };
    section_confidence: string;
  };
  value_narrative_gaps: {
    gap: string;
    impact_on_renewal: string;
    observed_or_inferred: "observed" | "inferred";
    anchor_ids: string[];
    inference_rationale: string | null;
    confidence: string;
  }[];
  conversational_gaps?: ConversationalGap[];
  cs_rep_effectiveness: {
    included_only_if_supported: boolean;
    strengths: { strength: string; anchor_ids: string[]; confidence: string }[];
    gaps: { gap: string; anchor_ids: string[]; confidence: string }[];
    coaching_moves: { move: string; why: string; anchor_ids?: string[]; confidence: string }[];
    section_confidence: string;
  };
  qa: {
    removed_claims: { claim: string; reason: string }[];
    validation_issues_from_code?: ValidationIssue[];
    notes: string[];
  };
}

export interface PipelineResult {
  success: boolean;
  reportVersion: "v2_panel";
  finalReport: FinalReport | null;
  evidenceAnchors: EvidenceAnchor[] | null;
  debug: {
    preprocessor: unknown;
    analystEvidence: unknown;
    analystCommercial: unknown;
    analystAdoption: unknown;
    passTimings: { pass: string; durationMs: number; provider: string; model: string; success: boolean }[];
    failedPasses: string[];
    errors: string[];
  };
  error?: string;
}
