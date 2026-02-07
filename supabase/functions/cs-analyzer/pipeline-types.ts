// ============================================================================
// Pipeline TypeScript types matching all JSON schemas
// ============================================================================

export interface CallMetadata {
  account_name?: string;
  date?: string;
  product?: string;
  renewal_date?: string;
  ARR?: string;
  region?: string;
  attendees_known?: string[];
}

// --- PASS 0: Preprocessor Output ---

export interface TranscriptQuality {
  score_0_to_100: number;
  issues: string[];
}

export interface Speaker {
  speaker_label: string;
  name_if_present: string | null;
  role_guess: "customer" | "cs" | "internal" | "partner" | "unknown";
  role_title: string | null;
  confidence: "high" | "medium" | "low";
}

export interface ExplicitMention {
  mentioned: boolean;
  anchor_ids: string[];
}

export interface StakeholderDetected {
  name_or_title: string;
  type: "person" | "role" | "team" | "vendor";
  anchor_ids: string[];
}

export interface TimelineMarker {
  topic: "renewal" | "procurement" | "delivery" | "adoption" | "other";
  when_text: string;
  anchor_ids: string[];
}

export interface EvidenceAnchor {
  id: string;
  quote: string;
}

export interface PreprocessorOutput {
  transcript_quality: TranscriptQuality;
  speakers: Speaker[];
  call_type_candidates: string[];
  explicit_mentions: {
    renewal: ExplicitMention;
    budget: ExplicitMention;
    procurement: ExplicitMention;
    incident_sla_outage: ExplicitMention;
    competitor: ExplicitMention;
    executive_stakeholders: ExplicitMention;
  };
  stakeholders_detected: StakeholderDetected[];
  timeline_markers: TimelineMarker[];
  evidence_anchors: EvidenceAnchor[];
}

// --- PASS 1A: Analyst Evidence Output ---

export interface ObservedFact {
  fact: string;
  category: string;
  anchor_ids: string[];
}

export interface ExplicitRisk {
  risk_statement: string;
  anchor_ids: string[];
  risk_type: string;
}

export interface ExplicitOpportunity {
  opportunity_statement: string;
  anchor_ids: string[];
  opportunity_type: string;
}

export interface StakeholderMention {
  name_or_title: string;
  presence: "present" | "mentioned_not_present" | "unclear";
  stance_if_explicit: "supportive" | "skeptical" | "neutral" | "unknown";
  anchor_ids: string[];
}

export interface Commitment {
  who: "customer" | "cs" | "internal" | "unknown";
  commitment: string;
  due_when_text: string;
  anchor_ids: string[];
}

export interface AnalystEvidenceOutput {
  observed_facts: ObservedFact[];
  explicit_risks: ExplicitRisk[];
  explicit_opportunities: ExplicitOpportunity[];
  stakeholder_mentions: StakeholderMention[];
  commitments_and_next_steps: Commitment[];
  open_questions_explicit: { question: string; anchor_ids: string[] }[];
}

// --- PASS 1B: Analyst Commercial Output ---

export interface ThreatClassification {
  primary: string;
  secondary: string;
  rationale: string;
  observed_anchor_ids: string[];
  confidence: "high" | "medium" | "low";
}

export interface CommercialSignal {
  signal: string;
  type: string;
  observed_or_inferred: "observed" | "inferred";
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: "high" | "medium" | "low";
}

export interface ExecObjection {
  objection: string;
  observed_or_inferred: "observed" | "inferred";
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: "high" | "medium" | "low";
}

export interface RenewalReadiness {
  stage: string;
  what_is_missing: string[];
  observed_anchor_ids: string[];
  confidence: "high" | "medium" | "low";
}

export interface ExpansionHook {
  hook: string;
  observed_or_inferred: "observed" | "inferred";
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: "high" | "medium" | "low";
}

export interface AnalystCommercialOutput {
  threat_classification: ThreatClassification;
  commercial_signals: CommercialSignal[];
  exec_objections_likely: ExecObjection[];
  renewal_readiness: RenewalReadiness;
  expansion_hooks: ExpansionHook[];
  commercial_next_questions: {
    question: string;
    why_it_matters: string;
    priority: "high" | "medium" | "low";
  }[];
}

// --- PASS 1C: Analyst Adoption Output ---

export interface ValueNarrativeGap {
  gap: string;
  observed_or_inferred: "observed" | "inferred";
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: "high" | "medium" | "low";
}

export interface AdoptionSignal {
  signal: string;
  observed_or_inferred: "observed" | "inferred";
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: "high" | "medium" | "low";
}

export interface DeliveryBlocker {
  blocker: string;
  observed_or_inferred: "observed" | "inferred";
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: "high" | "medium" | "low";
}

export interface RecommendedPlay {
  play: string;
  objective: string;
  time_horizon: "7_days" | "14_days" | "30_days";
  why_now: string;
  observed_support_anchor_ids: string[];
  confidence: "high" | "medium" | "low";
}

export interface AnalystAdoptionOutput {
  value_narrative_gaps: ValueNarrativeGap[];
  adoption_signals: AdoptionSignal[];
  delivery_blockers: DeliveryBlocker[];
  recommended_plays: RecommendedPlay[];
  adoption_next_questions: {
    question: string;
    why_it_matters: string;
    priority: "high" | "medium" | "low";
  }[];
}

// --- PASS 2: Final Report (Judge) Output ---

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
  cs_rep_effectiveness: boolean;
}

export interface Takeaway {
  takeaway: string;
  anchor_ids: string[];
  confidence: "high" | "medium" | "low";
}

export interface ExecutiveSnapshot {
  one_liner: string;
  primary_threat: string;
  top_3_takeaways: Takeaway[];
  overall_confidence: "high" | "medium" | "low";
}

export interface EvidenceBackedFact {
  fact: string;
  category: string;
  anchor_ids: string[];
  confidence: "high" | "medium" | "low";
}

export interface RiskItem {
  risk: string;
  type: "commercial" | "delivery" | "relationship" | "product_fit" | "security" | "other";
  severity: "critical" | "high" | "medium" | "low";
  observed_or_inferred: "observed" | "inferred";
  anchor_ids: string[];
  inference_rationale: string | null;
  confidence: "high" | "medium" | "low";
}

export interface ActionPlanItem {
  action: string;
  owner: string;
  due_in_days: number;
  why_this_matters: string;
  expected_customer_response: string;
  success_criteria: string;
  evidence_basis_anchor_ids: string[];
  confidence: "high" | "medium" | "low";
}

export interface StakeholderEntry {
  name_or_title: string;
  power: "high" | "medium" | "low";
  stance: "supportive" | "skeptical" | "neutral" | "unknown";
  engagement: "high" | "medium" | "low";
  presence: "present" | "mentioned_not_present" | "unclear";
  anchor_ids: string[];
  confidence: "high" | "medium" | "low";
}

export interface RemovedClaim {
  claim: string;
  reason: "no_evidence" | "contradiction" | "too_speculative" | "schema_violation";
}

export interface FinalReportOutput {
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
      confidence: "high" | "medium" | "low";
      anchor_ids: string[];
    };
    risk_items: RiskItem[];
  };
  action_plan_14_days: ActionPlanItem[];
  procurement_and_timeline: {
    timeline_items: { topic: string; when_text: string; anchor_ids: string[]; confidence: string }[];
    procurement_risks: { risk: string; anchor_ids: string[]; confidence: string }[];
    section_confidence: string;
  };
  incident_impact: {
    incident_summary: { summary: string; anchor_ids: string[]; confidence: string }[];
    customer_impact: { impact: string; anchor_ids: string[]; confidence: string }[];
    section_confidence: string;
  };
  expansion_plays: {
    play: string;
    why_it_fits: string;
    observed_or_inferred: "observed" | "inferred";
    anchor_ids: string[];
    inference_rationale: string | null;
    confidence: string;
  }[];
  stakeholder_power_map: {
    stakeholders: StakeholderEntry[];
    summary: {
      power_distribution: { high: number; medium: number; low: number };
      stance_distribution: { supportive: number; skeptical: number; neutral: number; unknown: number };
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
  cs_rep_effectiveness: {
    included_only_if_supported: boolean;
    strengths: { strength: string; anchor_ids: string[]; confidence: string }[];
    gaps: { gap: string; anchor_ids: string[]; confidence: string }[];
    coaching_moves: { move: string; why: string; anchor_ids: string[]; confidence: string }[];
    section_confidence: string;
  };
  qa: {
    removed_claims: RemovedClaim[];
    notes: string[];
  };
}

// --- Pipeline Result ---

export interface PassTiming {
  pass: string;
  durationMs: number;
  provider: string;
  model: string;
  success: boolean;
}

export interface PipelineResult {
  success: boolean;
  reportVersion: "v2_panel";
  finalReport: FinalReportOutput | null;
  evidenceAnchors: EvidenceAnchor[] | null;
  debug: {
    preprocessor: PreprocessorOutput | null;
    analystEvidence: AnalystEvidenceOutput | null;
    analystCommercial: AnalystCommercialOutput | null;
    analystAdoption: AnalystAdoptionOutput | null;
    passTimings: PassTiming[];
    failedPasses: string[];
    errors: string[];
  };
  error?: string;
}
