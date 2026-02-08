// ============================================================================
// PDF Payload Utilities
// Strips the analysis report down to only the fields the PDF template uses.
// This prevents payload-too-large errors when calling cs-report-renderer.
// ============================================================================

/**
 * Recursively removes `anchor_ids` and `evidence_basis_anchor_ids` keys
 * from every object/array in the tree. The PDF template never renders these.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripAnchors(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(stripAnchors);
  if (typeof obj !== "object") return obj;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "anchor_ids" || key === "evidence_basis_anchor_ids" || key === "observed_anchor_ids" || key === "observed_support_anchor_ids") {
      continue; // skip anchor arrays entirely
    }
    out[key] = stripAnchors(value);
  }
  return out;
}

/**
 * Keys the PDF template actually reads from the report object.
 * Everything else is dead weight in the payload.
 */
const TEMPLATE_KEYS = new Set([
  "meta",
  "section_included",
  "executive_snapshot",
  "evidence_backed_facts",
  "risks_and_threats",
  "action_plan_14_days",
  "stakeholder_power_map",
  "expansion_readiness",
  "procurement_and_timeline",
  "incident_impact",
  "conversational_gaps",
  "value_narrative_gaps",
  "cs_rep_effectiveness",
]);

/**
 * Builds a minimal report payload suitable for the cs-report-renderer edge function.
 * Removes:
 *  - All anchor_ids arrays (template never renders them)
 *  - Sections the template doesn't use (qa, confidence_scores, next_call_questions, etc.)
 *  - inference_rationale strings (template doesn't render them)
 */
export function buildPdfPayload(fullReport: Record<string, unknown>): Record<string, unknown> {
  // 1. Pick only template-relevant keys
  const slim: Record<string, unknown> = {};
  for (const key of TEMPLATE_KEYS) {
    if (key in fullReport) {
      slim[key] = fullReport[key];
    }
  }

  // 2. Strip all anchor_ids recursively
  return stripAnchors(slim);
}
