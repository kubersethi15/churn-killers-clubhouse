// ============================================================================
// Multi-provider AI routing: OpenAI, Gemini (Lovable AI Gateway), Claude
// ============================================================================

export type Provider = "openai" | "gemini" | "claude";

export interface ModelConfig {
  provider: Provider;
  model: string;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}

// Pinned model versions to prevent drift
export const PASS_CONFIGS: Record<string, ModelConfig> = {
  preprocessor: { provider: "openai", model: "gpt-4o-mini", maxTokens: 2000, temperature: 0.1, timeoutMs: 30_000 },
  analystA:     { provider: "openai", model: "gpt-4o-mini", maxTokens: 3500, temperature: 0.2, timeoutMs: 35_000 },
  analystB:     { provider: "gemini", model: "google/gemini-3-flash-preview", maxTokens: 3500, temperature: 0.2, timeoutMs: 35_000 },
  analystC:     { provider: "claude", model: "claude-sonnet-4-20250514", maxTokens: 3500, temperature: 0.2, timeoutMs: 35_000 },
  judge:        { provider: "claude", model: "claude-sonnet-4-20250514", maxTokens: 6000, temperature: 0.1, timeoutMs: 90_000 },
};

// ---------------------------------------------------------------------------
// Core call function — routes to the correct provider
// ---------------------------------------------------------------------------

export async function callModel(
  config: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<{ text: string; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), config.timeoutMs);

  try {
    switch (config.provider) {
      case "openai":
        return await callOpenAI(config, systemPrompt, userPrompt, controller.signal);
      case "gemini":
        return await callGemini(config, systemPrompt, userPrompt, controller.signal);
      case "claude":
        return await callClaude(config, systemPrompt, userPrompt, controller.signal);
      default:
        return { text: "", error: `Unknown provider: ${config.provider}` };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timeout") || msg.includes("abort")) {
      return { text: "", error: `${config.provider}/${config.model} timed out after ${config.timeoutMs}ms` };
    }
    return { text: "", error: `${config.provider}/${config.model} error: ${msg}` };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// OpenAI — direct API
// ---------------------------------------------------------------------------

async function callOpenAI(
  config: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal,
): Promise<{ text: string; error?: string }> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return { text: "", error: "OPENAI_API_KEY not configured" };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
    signal,
  });

  if (!resp.ok) {
    const body = await resp.text();
    return { text: "", error: `OpenAI ${resp.status}: ${body.slice(0, 200)}` };
  }

  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text };
}

// ---------------------------------------------------------------------------
// Gemini — via Lovable AI Gateway (OpenAI-compatible)
// ---------------------------------------------------------------------------

async function callGemini(
  config: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal,
): Promise<{ text: string; error?: string }> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return { text: "", error: "LOVABLE_API_KEY not configured" };

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
    signal,
  });

  if (!resp.ok) {
    const body = await resp.text();
    if (resp.status === 429) return { text: "", error: "Rate limited (Gemini)" };
    if (resp.status === 402) return { text: "", error: "Credits exhausted (Gemini)" };
    return { text: "", error: `Gemini ${resp.status}: ${body.slice(0, 200)}` };
  }

  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return { text };
}

// ---------------------------------------------------------------------------
// Claude — direct Anthropic API
// ---------------------------------------------------------------------------

async function callClaude(
  config: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
  signal: AbortSignal,
): Promise<{ text: string; error?: string }> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return { text: "", error: "ANTHROPIC_API_KEY not configured" };

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
    signal,
  });

  if (!resp.ok) {
    const body = await resp.text();
    if (resp.status === 429) return { text: "", error: "Rate limited (Claude)" };
    return { text: "", error: `Claude ${resp.status}: ${body.slice(0, 200)}` };
  }

  const data = await resp.json();
  const text = data.content?.[0]?.type === "text" ? data.content[0].text : "";
  return { text };
}

// ---------------------------------------------------------------------------
// JSON extraction + repair
// ---------------------------------------------------------------------------

/** Strip markdown wrappers and parse JSON */
export function extractJson<T>(raw: string): { data: T | null; error?: string } {
  let cleaned = raw.trim();
  // Remove markdown code blocks
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "");
  }
  try {
    return { data: JSON.parse(cleaned) as T };
  } catch (e) {
    return { data: null, error: `JSON parse failed: ${(e as Error).message}` };
  }
}

/** One-shot JSON repair: sends broken text back to the same model */
export async function repairJson<T>(
  brokenText: string,
  config: ModelConfig,
): Promise<{ data: T | null; error?: string }> {
  const repairSystem = "You are a JSON repair tool. Fix the following invalid JSON and return ONLY the corrected valid JSON. Do not add commentary.";
  const repairUser = `Fix this JSON:\n\n${brokenText}`;

  const { text, error } = await callModel(config, repairSystem, repairUser);
  if (error) return { data: null, error: `Repair call failed: ${error}` };

  return extractJson<T>(text);
}

/** Call model, extract JSON, retry with repair if needed */
export async function callModelForJson<T>(
  config: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
  passName: string,
): Promise<{ data: T | null; rawText: string; error?: string }> {
  // First attempt
  const { text, error: callError } = await callModel(config, systemPrompt, userPrompt);
  if (callError) return { data: null, rawText: "", error: callError };

  const parsed = extractJson<T>(text);
  if (parsed.data) return { data: parsed.data, rawText: text };

  // JSON repair retry
  console.log(`[${passName}] JSON parse failed, attempting repair...`);
  const repaired = await repairJson<T>(text, config);
  if (repaired.data) {
    console.log(`[${passName}] JSON repair succeeded`);
    return { data: repaired.data, rawText: text };
  }

  return { data: null, rawText: text, error: `[${passName}] JSON invalid after repair: ${repaired.error}` };
}
