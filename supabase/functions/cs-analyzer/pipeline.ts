// ============================================================================
// 4-Pass Pipeline Orchestrator (v2 — with code-based validator)
// ============================================================================

import type {
  CallMetadata,
  PreprocessorOutput,
  AnalystEvidenceOutput,
  AnalystCommercialOutput,
  AnalystAdoptionOutput,
  FinalReport,
  PipelineResult,
  PassTiming,
} from "./pipeline-types.ts";

import { callModelForJson, PASS_CONFIGS } from "./providers.ts";

import {
  preprocessorPrompts,
  analystEvidencePrompts,
  analystCommercialPrompts,
  analystAdoptionPrompts,
  judgePrompts,
} from "./pipeline-prompts.ts";

import { validatePipelineOutputs } from "./pipeline-validator.ts";

const MAX_TRANSCRIPT_CHARS = 35_000;

interface PipelineInput {
  rawTranscript: string;
  callMetadata?: CallMetadata;
}

function clipTranscript(text: string): string {
  if (text.length <= MAX_TRANSCRIPT_CHARS) return text;
  return text.slice(0, MAX_TRANSCRIPT_CHARS) + "\n\n[TRUNCATED: input exceeded 35k chars]";
}

function timing(pass: string, start: number, config: { provider: string; model: string }, success: boolean): PassTiming {
  return { pass, durationMs: Date.now() - start, provider: config.provider, model: config.model, success };
}

// ---------------------------------------------------------------------------
// Main pipeline orchestrator
// ---------------------------------------------------------------------------

export async function runPipeline(input: PipelineInput): Promise<PipelineResult> {
  const timings: PassTiming[] = [];
  const errors: string[] = [];
  const failedPasses: string[] = [];

  const transcript = clipTranscript(input.rawTranscript);

  // Debug state
  let preprocessor: PreprocessorOutput | null = null;
  let analystEvidence: AnalystEvidenceOutput | null = null;
  let analystCommercial: AnalystCommercialOutput | null = null;
  let analystAdoption: AnalystAdoptionOutput | null = null;

  // ── PASS 0: Preprocessor (with retry) ──────────────────────────────────
  console.log("[Pipeline] Starting Pass 0: Preprocessor");
  const p0Start = Date.now();
  const p0Prompts = preprocessorPrompts(transcript, input.callMetadata);
  let p0Result = await callModelForJson<PreprocessorOutput>(
    PASS_CONFIGS.preprocessor,
    p0Prompts.system,
    p0Prompts.user,
    "Pass0-Preprocessor",
  );

  // Retry once on failure (preprocessor is critical — pipeline cannot continue without it)
  if (!p0Result.data) {
    console.log("[Pipeline] Pass 0 failed, retrying after 1s backoff...");
    await delay(1000);
    p0Result = await callModelForJson<PreprocessorOutput>(
      PASS_CONFIGS.preprocessor,
      p0Prompts.system,
      p0Prompts.user,
      "Pass0-Preprocessor-Retry",
    );
  }

  timings.push(timing("preprocessor", p0Start, PASS_CONFIGS.preprocessor, !!p0Result.data));

  if (!p0Result.data) {
    errors.push(p0Result.error || "Preprocessor returned no data after retry");
    failedPasses.push("preprocessor");
    return makeResult(false, null, null, { preprocessor: null, analystEvidence: null, analystCommercial: null, analystAdoption: null, passTimings: timings, failedPasses, errors }, "Preprocessor failed after retry — cannot continue pipeline");
  }
  preprocessor = p0Result.data;
  console.log(`[Pipeline] Pass 0 complete: ${preprocessor.evidence_anchors.length} anchors, ${preprocessor.speakers.length} speakers`);

  // ── PASS 1A: Analyst A (Evidence) — with retry ────────────────────────
  console.log("[Pipeline] Starting Pass 1A: Evidence Extractor");
  const p1aStart = Date.now();
  const p1aPrompts = analystEvidencePrompts(transcript, preprocessor);
  let p1aResult = await callModelForJson<AnalystEvidenceOutput>(
    PASS_CONFIGS.analystA,
    p1aPrompts.system,
    p1aPrompts.user,
    "Pass1A-Evidence",
  );

  // Retry once on failure (evidence base is critical — all downstream passes depend on it)
  if (!p1aResult.data) {
    console.log("[Pipeline] Pass 1A failed, retrying after 1s backoff...");
    await delay(1000);
    p1aResult = await callModelForJson<AnalystEvidenceOutput>(
      PASS_CONFIGS.analystA,
      p1aPrompts.system,
      p1aPrompts.user,
      "Pass1A-Evidence-Retry",
    );
  }

  timings.push(timing("analystA", p1aStart, PASS_CONFIGS.analystA, !!p1aResult.data));

  if (!p1aResult.data) {
    errors.push(p1aResult.error || "Analyst A returned no data after retry");
    failedPasses.push("analystA");
    return makeResult(false, null, preprocessor.evidence_anchors, { preprocessor, analystEvidence: null, analystCommercial: null, analystAdoption: null, passTimings: timings, failedPasses, errors }, "Analyst A (Evidence) failed after retry — cannot continue without evidence base");
  }
  analystEvidence = p1aResult.data;
  console.log(`[Pipeline] Pass 1A complete: ${analystEvidence.observed_facts.length} facts, ${analystEvidence.explicit_risks.length} risks`);

  // ── PASS 1B + 1C: Parallel (Commercial + Adoption) ───────────────────
  console.log("[Pipeline] Starting Pass 1B + 1C in parallel");

  const [p1bResult, p1cResult] = await Promise.allSettled([
    runAnalystB(transcript, preprocessor, analystEvidence, timings),
    runAnalystC(transcript, preprocessor, analystEvidence, timings),
  ]);

  // Process 1B result
  if (p1bResult.status === "fulfilled" && p1bResult.value.data) {
    analystCommercial = p1bResult.value.data;
    console.log(`[Pipeline] Pass 1B complete: threat=${analystCommercial.threat_classification.primary}`);
  } else {
    const err = p1bResult.status === "rejected" ? String(p1bResult.reason) : p1bResult.value.error;
    errors.push(`Analyst B failed: ${err}`);
    failedPasses.push("analystB");
    console.log(`[Pipeline] Pass 1B FAILED: ${err}`);
  }

  // Process 1C result
  if (p1cResult.status === "fulfilled" && p1cResult.value.data) {
    analystAdoption = p1cResult.value.data;
    console.log(`[Pipeline] Pass 1C complete: ${analystAdoption.value_narrative_gaps.length} gaps, ${analystAdoption.adoption_signals.length} signals`);
  } else {
    const err = p1cResult.status === "rejected" ? String(p1cResult.reason) : p1cResult.value.error;
    errors.push(`Analyst C failed: ${err}`);
    failedPasses.push("analystC");
    console.log(`[Pipeline] Pass 1C FAILED: ${err}`);
  }

  // Count successful analysts (A always succeeded if we reached here)
  const successfulAnalysts = 1 + (analystCommercial ? 1 : 0) + (analystAdoption ? 1 : 0);
  if (successfulAnalysts < 2) {
    return makeResult(false, null, preprocessor.evidence_anchors, { preprocessor, analystEvidence, analystCommercial, analystAdoption, passTimings: timings, failedPasses, errors }, `Only ${successfulAnalysts}/3 analysts succeeded — aborting Judge pass (minimum 2 required)`);
  }

  // ── CODE VALIDATOR — deterministic checks before Judge ─────────────────
  console.log("[Pipeline] Running code-based validator...");
  const missingAnalysts = failedPasses.filter(p => p.startsWith("analyst")).map(p => p.replace("analyst", "Analyst "));
  const validated = validatePipelineOutputs(
    preprocessor,
    analystEvidence,
    analystCommercial,
    analystAdoption,
    missingAnalysts,
  );
  console.log(`[Pipeline] Validator complete: ${validated.validation_issues.length} issues found`);

  // ── PASS 2: Judge / Enforcer ──────────────────────────────────────────
  console.log("[Pipeline] Starting Pass 2: Judge/Enforcer");
  const p2Start = Date.now();
  const p2Prompts = judgePrompts(validated);
  const p2Result = await callModelForJson<FinalReport>(
    PASS_CONFIGS.judge,
    p2Prompts.system,
    p2Prompts.user,
    "Pass2-Judge",
  );
  timings.push(timing("judge", p2Start, PASS_CONFIGS.judge, !!p2Result.data));

  if (!p2Result.data) {
    const judgeError = p2Result.error || "Judge returned no data";
    console.error(`[Pipeline] Judge FAILED: ${judgeError}`);
    if (p2Result.rawText) {
      console.error(`[Pipeline] Judge raw output (first 500 chars): ${p2Result.rawText.slice(0, 500)}`);
    }
    errors.push(judgeError);
    failedPasses.push("judge");
    return makeResult(false, null, preprocessor.evidence_anchors, { preprocessor, analystEvidence, analystCommercial, analystAdoption, passTimings: timings, failedPasses, errors }, "Judge/Enforcer failed — returning partial outputs for debugging");
  }

  const finalReport = p2Result.data;

  // Override generated_at_iso with backend timestamp (models hallucinate timestamps)
  if (finalReport.meta) {
    finalReport.meta.generated_at_iso = new Date().toISOString();
  }

  // Inject code-validator issues into QA section if Judge didn't include them
  if (finalReport.qa && validated.validation_issues.length > 0) {
    if (!finalReport.qa.validation_issues_from_code || finalReport.qa.validation_issues_from_code.length === 0) {
      finalReport.qa.validation_issues_from_code = validated.validation_issues;
    }
  }

  console.log(`[Pipeline] Pass 2 complete: threat=${finalReport.executive_snapshot.primary_threat}, sections=${Object.entries(finalReport.section_included).filter(([,v]) => v).length}`);

  const totalMs = timings.reduce((sum, t) => sum + t.durationMs, 0);
  console.log(`[Pipeline] Total pipeline time: ${totalMs}ms across ${timings.length} passes`);

  return makeResult(true, finalReport, preprocessor.evidence_anchors, { preprocessor, analystEvidence, analystCommercial, analystAdoption, passTimings: timings, failedPasses, errors });
}

// ---------------------------------------------------------------------------
// Analyst B runner (with retry on failure)
// ---------------------------------------------------------------------------

async function runAnalystB(
  transcript: string,
  preprocessor: PreprocessorOutput,
  evidence: AnalystEvidenceOutput,
  timings: PassTiming[],
): Promise<{ data: AnalystCommercialOutput | null; error?: string }> {
  const start = Date.now();
  const prompts = analystCommercialPrompts(transcript, preprocessor, evidence);

  let result = await callModelForJson<AnalystCommercialOutput>(
    PASS_CONFIGS.analystB,
    prompts.system,
    prompts.user,
    "Pass1B-Commercial",
  );

  // Retry once on failure
  if (!result.data) {
    console.log("[Pipeline] Retrying Pass 1B...");
    await delay(1000);
    result = await callModelForJson<AnalystCommercialOutput>(
      PASS_CONFIGS.analystB,
      prompts.system,
      prompts.user,
      "Pass1B-Commercial-Retry",
    );
  }

  timings.push(timing("analystB", start, PASS_CONFIGS.analystB, !!result.data));
  return { data: result.data, error: result.error };
}

// ---------------------------------------------------------------------------
// Analyst C runner (with retry on failure)
// ---------------------------------------------------------------------------

async function runAnalystC(
  transcript: string,
  preprocessor: PreprocessorOutput,
  evidence: AnalystEvidenceOutput,
  timings: PassTiming[],
): Promise<{ data: AnalystAdoptionOutput | null; error?: string }> {
  const start = Date.now();
  const prompts = analystAdoptionPrompts(transcript, preprocessor, evidence);

  let result = await callModelForJson<AnalystAdoptionOutput>(
    PASS_CONFIGS.analystC,
    prompts.system,
    prompts.user,
    "Pass1C-Adoption",
  );

  // Retry once on failure
  if (!result.data) {
    console.log("[Pipeline] Retrying Pass 1C...");
    await delay(1000);
    result = await callModelForJson<AnalystAdoptionOutput>(
      PASS_CONFIGS.analystC,
      prompts.system,
      prompts.user,
      "Pass1C-Adoption-Retry",
    );
  }

  timings.push(timing("analystC", start, PASS_CONFIGS.analystC, !!result.data));
  return { data: result.data, error: result.error };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeResult(
  success: boolean,
  finalReport: FinalReport | null,
  evidenceAnchors: { id: string; quote: string }[] | null,
  debug: PipelineResult["debug"],
  error?: string,
): PipelineResult {
  return {
    success,
    reportVersion: "v2_panel",
    finalReport,
    evidenceAnchors: evidenceAnchors || null,
    debug,
    error,
  };
}
