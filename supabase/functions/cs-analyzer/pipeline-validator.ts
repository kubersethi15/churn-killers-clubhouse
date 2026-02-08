// ============================================================================
// Code-based validator — runs between analyst passes and Judge pass
// Handles deterministic checks that should NOT be left to LLM reasoning
// ============================================================================

import type {
  PreprocessorOutput,
  AnalystEvidenceOutput,
  AnalystCommercialOutput,
  AnalystAdoptionOutput,
  ValidatedPipelineInput,
  ValidationIssue,
  RiskType,
  ObservedOrInferred,
  Confidence,
} from "./pipeline-types.ts";

// ---------------------------------------------------------------------------
// Valid enum sets
// ---------------------------------------------------------------------------

const VALID_RISK_TYPES: Set<string> = new Set([
  "commercial", "delivery", "relationship", "product_fit", "security", "other",
]);

const RISK_TYPE_MAP: Record<string, RiskType> = {
  procurement: "commercial", budget: "commercial", value_case: "commercial",
  competition: "commercial", pricing: "commercial", cost: "commercial",
  reliability: "delivery", outage: "delivery", sla: "delivery",
  implementation: "delivery", performance: "delivery", latency: "delivery",
  stakeholder: "relationship", champion: "relationship", trust: "relationship",
  engagement: "relationship", feature_gap: "product_fit", usability: "product_fit",
  integration: "product_fit", data: "security", compliance: "security", access: "security",
};

const COMPETITIVE_KEYWORDS = [
  "competitor", "alternative", "rfp", "evaluat", "vendor review",
  "crowdstrike", "datadog", "elastic", "logscale", "sentinel",
  "palo alto", "sumo logic", "new relic", "considering other",
];

// ---------------------------------------------------------------------------
// Helper: clean anchor IDs against valid registry
// ---------------------------------------------------------------------------

function cleanAnchorIds(
  anchorIds: string[],
  validSet: Set<string>,
  source: string,
  issues: ValidationIssue[]
): string[] {
  const cleaned: string[] = [];
  for (const id of anchorIds) {
    if (validSet.has(id)) {
      cleaned.push(id);
    } else {
      issues.push({
        type: "orphaned_anchor",
        source,
        detail: `Anchor "${id}" does not exist in preprocessor registry — removed`,
        action_taken: "removed_anchor",
      });
    }
  }
  return cleaned;
}

// ---------------------------------------------------------------------------
// Helper: map non-standard risk types to valid enums
// ---------------------------------------------------------------------------

function mapRiskType(raw: string): RiskType {
  const lower = raw.toLowerCase().trim();
  if (VALID_RISK_TYPES.has(lower)) return lower as RiskType;
  for (const [keyword, mapped] of Object.entries(RISK_TYPE_MAP)) {
    if (lower.includes(keyword)) return mapped;
  }
  return "other";
}

// ---------------------------------------------------------------------------
// Helper: infer speaker role from anchor (heuristic)
// ---------------------------------------------------------------------------

function inferSpeakerRoleFromAnchor(
  anchorId: string,
  preprocessor: PreprocessorOutput
): string | null {
  const anchor = preprocessor.evidence_anchors.find((a) => a.id === anchorId);
  if (!anchor) return null;
  const quote = anchor.quote.toLowerCase();
  for (const speaker of preprocessor.speakers) {
    const name = (speaker.name_if_present || "").toLowerCase();
    const label = speaker.speaker_label.toLowerCase();
    if (name && quote.includes(name)) return speaker.role_guess;
    if (quote.includes(label)) return speaker.role_guess;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helper: downgrade an observed claim to inferred
// ---------------------------------------------------------------------------

interface DowngradableItem {
  observed_or_inferred: ObservedOrInferred;
  inference_rationale: string | null;
  confidence: Confidence;
  anchor_ids: string[];
}

function downgradeIfNoAnchors(
  item: DowngradableItem,
  label: string,
  source: string,
  issues: ValidationIssue[]
): void {
  if (item.observed_or_inferred === "observed" && item.anchor_ids.length === 0) {
    item.observed_or_inferred = "inferred";
    item.inference_rationale =
      item.inference_rationale || "Downgraded: original anchors were invalid";
    if (item.confidence === "high") item.confidence = "medium";
    issues.push({
      type: "observed_without_anchor",
      source,
      detail: `"${label}" downgraded to inferred — no valid anchors`,
      action_taken: "downgraded_to_inferred",
    });
  }
}

// ---------------------------------------------------------------------------
// Main validator
// ---------------------------------------------------------------------------

export function validatePipelineOutputs(
  preprocessor: PreprocessorOutput,
  evidence: AnalystEvidenceOutput | null,
  commercial: AnalystCommercialOutput | null,
  adoption: AnalystAdoptionOutput | null,
  missingAnalysts: string[]
): ValidatedPipelineInput {
  const issues: ValidationIssue[] = [];
  const validAnchorIds = new Set(preprocessor.evidence_anchors.map((a) => a.id));
  const anchorQuotes = new Map<string, string>();
  for (const a of preprocessor.evidence_anchors) {
    anchorQuotes.set(a.id, a.quote.toLowerCase());
  }

  // ── Fix 8.1: Preprocessor self-validation (belt-and-suspenders) ──
  if (preprocessor.explicit_mentions) {
    for (const [category, data] of Object.entries(preprocessor.explicit_mentions)) {
      if (data?.anchor_ids) {
        const before = data.anchor_ids.length;
        data.anchor_ids = data.anchor_ids.filter((id: string) => validAnchorIds.has(id));
        if (data.anchor_ids.length < before) {
          issues.push({
            type: "preprocessor_self_ref",
            source: `preprocessor.explicit_mentions.${category}`,
            detail: `Removed ${before - data.anchor_ids.length} phantom anchor(s)`,
            action_taken: "removed_anchor",
          });
        }
      }
    }
  }
  if (preprocessor.stakeholders_detected) {
    for (const s of preprocessor.stakeholders_detected) {
      if (s.anchor_ids) {
        const before = s.anchor_ids.length;
        s.anchor_ids = s.anchor_ids.filter((id: string) => validAnchorIds.has(id));
        if (s.anchor_ids.length < before) {
          issues.push({
            type: "preprocessor_self_ref",
            source: `preprocessor.stakeholders_detected[${s.name_or_title}]`,
            detail: `Removed ${before - s.anchor_ids.length} phantom anchor(s)`,
            action_taken: "removed_anchor",
          });
        }
      }
    }
  }
  if (preprocessor.timeline_markers) {
    for (const m of preprocessor.timeline_markers) {
      if (m.anchor_ids) {
        const before = m.anchor_ids.length;
        m.anchor_ids = m.anchor_ids.filter((id: string) => validAnchorIds.has(id));
        if (m.anchor_ids.length < before) {
          issues.push({
            type: "preprocessor_self_ref",
            source: `preprocessor.timeline_markers[${m.topic}]`,
            detail: `Removed ${before - m.anchor_ids.length} phantom anchor(s)`,
            action_taken: "removed_anchor",
          });
        }
      }
    }
  }

  // ── Analyst A (Evidence) ───────────────────────────────────────────
  if (evidence) {
    // observed_facts: remove if no valid anchors
    evidence.observed_facts = (evidence.observed_facts || []).filter((fact, i) => {
      fact.anchor_ids = cleanAnchorIds(fact.anchor_ids, validAnchorIds, `evidence.observed_facts[${i}]`, issues);
      if (fact.anchor_ids.length === 0) {
        issues.push({ type: "observed_without_anchor", source: `evidence.observed_facts[${i}]`, detail: `Fact "${fact.fact}" removed — no valid anchors`, action_taken: "removed_claim" });
        return false;
      }
      return true;
    });

    // explicit_risks: validate anchors + enforce risk_type enum
    evidence.explicit_risks = (evidence.explicit_risks || []).filter((risk, i) => {
      risk.anchor_ids = cleanAnchorIds(risk.anchor_ids, validAnchorIds, `evidence.explicit_risks[${i}]`, issues);
      if (!VALID_RISK_TYPES.has(risk.risk_type)) {
        const mapped = mapRiskType(risk.risk_type);
        issues.push({ type: "enum_violation", source: `evidence.explicit_risks[${i}]`, detail: `risk_type "${risk.risk_type}" mapped to "${mapped}"`, action_taken: "flagged_only" });
        risk.risk_type = mapped;
      }
      if (risk.anchor_ids.length === 0) {
        issues.push({ type: "observed_without_anchor", source: `evidence.explicit_risks[${i}]`, detail: `Risk "${risk.risk_statement}" removed — no valid anchors`, action_taken: "removed_claim" });
        return false;
      }
      return true;
    });

    // explicit_opportunities
    evidence.explicit_opportunities = (evidence.explicit_opportunities || []).filter((opp, i) => {
      opp.anchor_ids = cleanAnchorIds(opp.anchor_ids, validAnchorIds, `evidence.explicit_opportunities[${i}]`, issues);
      if (opp.anchor_ids.length === 0) {
        issues.push({ type: "observed_without_anchor", source: `evidence.explicit_opportunities[${i}]`, detail: `Opportunity "${opp.opportunity_statement}" removed`, action_taken: "removed_claim" });
        return false;
      }
      return true;
    });

    // stakeholder_mentions: clean anchors but don't remove (stakeholders can exist without anchors)
    for (const sm of (evidence.stakeholder_mentions || [])) {
      sm.anchor_ids = cleanAnchorIds(sm.anchor_ids, validAnchorIds, `evidence.stakeholders[${sm.name_or_title}]`, issues);
    }

    // commitments
    for (const c of (evidence.commitments_and_next_steps || [])) {
      c.anchor_ids = cleanAnchorIds(c.anchor_ids, validAnchorIds, `evidence.commitments`, issues);
    }

    // open_questions
    evidence.open_questions_explicit = (evidence.open_questions_explicit || []).filter((q, i) => {
      q.anchor_ids = cleanAnchorIds(q.anchor_ids, validAnchorIds, `evidence.open_questions[${i}]`, issues);
      if (q.anchor_ids.length === 0) {
        issues.push({ type: "observed_without_anchor", source: `evidence.open_questions[${i}]`, detail: `Question "${q.question}" removed`, action_taken: "removed_claim" });
        return false;
      }
      return true;
    });

    // Speaker-role conflict: risks should come from customer speakers
    for (const risk of evidence.explicit_risks) {
      for (const aid of risk.anchor_ids) {
        const role = inferSpeakerRoleFromAnchor(aid, preprocessor);
        if (role === "cs" || role === "internal") {
          issues.push({ type: "role_conflict", source: `evidence.explicit_risks`, detail: `Risk "${risk.risk_statement}" anchor ${aid} from ${role} speaker, not customer`, action_taken: "flagged_only" });
        }
      }
    }

    // Speaker-role conflict: customer commitments should come from customer speakers
    for (const c of evidence.commitments_and_next_steps) {
      if (c.who === "customer") {
        for (const aid of c.anchor_ids) {
          const role = inferSpeakerRoleFromAnchor(aid, preprocessor);
          if (role === "cs" || role === "internal") {
            issues.push({ type: "role_conflict", source: `evidence.commitments`, detail: `Customer commitment "${c.commitment}" anchor ${aid} from ${role} speaker`, action_taken: "flagged_only" });
          }
        }
      }
    }
  }

  // ── Fix 8.2: Analyst B completeness check ──────────────────────────
  if (commercial) {
    const expectedKeys = [
      "threat_classification", "commercial_signals", "exec_objections_likely",
      "renewal_readiness", "expansion_readiness", "expansion_hooks",
      "commercial_next_questions",
    ];
    const missingKeys = expectedKeys.filter(k => !(k in (commercial as Record<string, unknown>)));
    if (missingKeys.length > 0) {
      issues.push({
        type: "incomplete_analyst_output",
        source: "pass1b_commercial",
        detail: `Missing keys: ${missingKeys.join(", ")}`,
        action_taken: "flagged_critical",
      });
    }
  }

  // ── Analyst B (Commercial) ─────────────────────────────────────────
  if (commercial) {
    commercial.threat_classification.observed_anchor_ids = cleanAnchorIds(
      commercial.threat_classification.observed_anchor_ids, validAnchorIds, "commercial.threat_classification", issues
    );

    for (const sig of (commercial.commercial_signals || [])) {
      sig.anchor_ids = cleanAnchorIds(sig.anchor_ids, validAnchorIds, "commercial.commercial_signals", issues);
      downgradeIfNoAnchors(sig, sig.signal, "commercial.commercial_signals", issues);
    }

    for (const obj of (commercial.exec_objections_likely || [])) {
      obj.anchor_ids = cleanAnchorIds(obj.anchor_ids, validAnchorIds, "commercial.exec_objections", issues);
    }

    if (commercial.renewal_readiness) {
      commercial.renewal_readiness.observed_anchor_ids = cleanAnchorIds(
        commercial.renewal_readiness.observed_anchor_ids, validAnchorIds, "commercial.renewal_readiness", issues
      );
    }

    if (commercial.expansion_readiness) {
      commercial.expansion_readiness.anchor_ids = cleanAnchorIds(
        commercial.expansion_readiness.anchor_ids, validAnchorIds, "commercial.expansion_readiness", issues
      );
    }

    for (const hook of (commercial.expansion_hooks || [])) {
      hook.anchor_ids = cleanAnchorIds(hook.anchor_ids, validAnchorIds, "commercial.expansion_hooks", issues);
      downgradeIfNoAnchors(hook, hook.hook, "commercial.expansion_hooks", issues);
    }

    // Displacement threat validation
    const threatPrimary = commercial.threat_classification.primary;
    const threatSecondary = commercial.threat_classification.secondary;
    if (threatPrimary === "displacement" || threatSecondary === "displacement") {
      const hasCompetitiveAnchor = commercial.threat_classification.observed_anchor_ids.some((id) => {
        const quote = anchorQuotes.get(id) || "";
        return COMPETITIVE_KEYWORDS.some((kw) => quote.includes(kw));
      });
      if (!hasCompetitiveAnchor) {
        const field = threatPrimary === "displacement" ? "primary" : "secondary";
        issues.push({
          type: "precision_mismatch",
          source: `commercial.threat_classification.${field}`,
          detail: "Displacement classified but no competitive anchor found — flagged for Judge review",
          action_taken: "flagged_only",
        });
      }
    }
  }

  // ── Analyst C (Adoption) ───────────────────────────────────────────
  if (adoption) {
    for (const gap of (adoption.value_narrative_gaps || [])) {
      gap.anchor_ids = cleanAnchorIds(gap.anchor_ids, validAnchorIds, "adoption.value_narrative_gaps", issues);
      downgradeIfNoAnchors(gap, gap.gap, "adoption.value_narrative_gaps", issues);
    }

    for (const sig of (adoption.adoption_signals || [])) {
      sig.anchor_ids = cleanAnchorIds(sig.anchor_ids, validAnchorIds, "adoption.adoption_signals", issues);
      downgradeIfNoAnchors(sig, sig.signal, "adoption.adoption_signals", issues);
    }

    for (const blocker of (adoption.delivery_blockers || [])) {
      blocker.anchor_ids = cleanAnchorIds(blocker.anchor_ids, validAnchorIds, "adoption.delivery_blockers", issues);
      downgradeIfNoAnchors(blocker, blocker.blocker, "adoption.delivery_blockers", issues);
    }

    for (const play of (adoption.recommended_plays || [])) {
      play.observed_support_anchor_ids = cleanAnchorIds(
        play.observed_support_anchor_ids, validAnchorIds, "adoption.recommended_plays", issues
      );
    }

    // conversational_gaps have no anchor_ids to validate (they're about what's MISSING)
    // No validation needed — they pass through directly
  }

  return {
    preprocessor,
    evidence,
    commercial,
    adoption,
    validation_issues: issues,
    missing_analysts: missingAnalysts,
  };
}
