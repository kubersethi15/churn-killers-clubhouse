import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------------------------------------------------------------------------
// Claude Opus 4 config
// ---------------------------------------------------------------------------
const MODEL = "claude-opus-4-20250514";
const MAX_TOKENS = 12000;
const TIMEOUT_MS = 120_000; // 2 min — HTML gen is heavy

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey)
      return jsonResp({ error: "ANTHROPIC_API_KEY not configured" }, 500);

    const body = await req.json();
    const { report, visibility, title, finalizedAt, evidenceAnchors } = body;

    if (!report)
      return jsonResp({ error: "Missing report payload" }, 400);

    // Step 1 — Prose polish + layout emphasis via Claude Opus 4
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(report, visibility, title, finalizedAt, evidenceAnchors);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS);

    let html: string;
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          temperature: 0.3,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        console.error(`Claude ${resp.status}: ${errBody.slice(0, 500)}`);
        if (resp.status === 429)
          return jsonResp({ error: "Rate limited — please try again shortly." }, 429);
        return jsonResp({ error: `Claude error: ${resp.status}` }, 500);
      }

      const data = await resp.json();
      const rawText = data.content?.[0]?.type === "text" ? data.content[0].text : "";

      // Extract HTML from potential markdown wrappers
      html = extractHtml(rawText);
      if (!html) {
        console.error("Claude returned no HTML");
        return jsonResp({ error: "Failed to generate report HTML" }, 500);
      }
    } finally {
      clearTimeout(timer);
    }

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("cs-report-renderer error:", msg);
    if (msg.includes("timeout") || msg.includes("abort"))
      return jsonResp({ error: "Report generation timed out — try again" }, 504);
    return jsonResp({ error: msg }, 500);
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResp(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractHtml(raw: string): string {
  let cleaned = raw.trim();
  // Strip markdown code blocks
  const htmlMatch = cleaned.match(/```html\s*\n?([\s\S]*?)\n?\s*```/);
  if (htmlMatch) return htmlMatch[1].trim();
  // If it starts with <!DOCTYPE or <html, use as-is
  if (cleaned.startsWith("<!") || cleaned.startsWith("<html"))
    return cleaned;
  // Last resort — use the whole text
  return cleaned;
}

// ---------------------------------------------------------------------------
// Prompt Engineering — Claude Opus 4 generates premium report HTML
// ---------------------------------------------------------------------------

function buildSystemPrompt(): string {
  return `You are an elite report designer and executive communications specialist.

Your task: transform a JSON analysis report into a premium, print-ready HTML document.

## Design Principles

1. **Executive-grade typography**: Use Playfair Display for headings, Inter for body text.
   - Section titles: 18px Playfair Display, navy (#1a1a2e)
   - Body: 13px Inter, dark slate (#334155), line-height 1.65
   - Labels: 10px Inter, uppercase tracking, muted gray (#64748b)

2. **Visual hierarchy through content intelligence**:
   - If primary_threat is "churn" or "displacement": use red accents and BOLD risk callouts
   - If primary_threat is "none" or "delay": calmer green/amber tones
   - Critical severity risks get red left-border treatment (4px solid #dc2626)
   - High severity: orange border, Medium: amber, Low: slate

3. **Layout structure**:
   - Cover page (always first, takes full page)
   - Executive Snapshot with navy gradient header bar
   - Risk Breakdown with severity-colored cards
   - Stakeholder table with colored power/stance badges
   - Evidence Facts as a clean timeline
   - 14-Day Action Plan as structured cards (Action, Owner, Day, Why, Success Criteria)
   - Conditional sections only if included in visibility map
   - QA Notes only if qa_notes is visible

4. **Print optimization**:
   - @page A4, margins 20mm/18mm
   - \`-webkit-print-color-adjust: exact\` on ALL colored elements
   - Cards use \`break-inside: avoid\`
   - Cover page: \`page-break-after: always\`

5. **Prose polish rules**:
   - Tighten all one_liner, takeaway, and risk text for executive brevity
   - Use active voice, eliminate filler words
   - Action rationales should read like CRO-level directives
   - Strategic truth should hit hard — blunt executive language
   - DO NOT invent new information — only refine existing text

6. **Strictly forbidden**:
   - No emojis
   - No interactive elements (buttons, checkboxes, inputs)
   - No JavaScript
   - No external images or resources (except Google Fonts)
   - No placeholder text

## Output format
Return ONLY the complete HTML document starting with \`<!DOCTYPE html>\`.
Include embedded <style> — no external CSS files.
Include Google Fonts import via <link>.`;
}

function buildUserPrompt(
  report: Record<string, unknown>,
  visibility: Record<string, boolean>,
  title: string,
  finalizedAt: string,
  evidenceAnchors: Array<{ id: string; quote: string }>,
): string {
  return `Generate a premium print-ready HTML report from this data.

## Report Title
${title || "Analysis Report"}

## Finalized At
${finalizedAt || new Date().toISOString()}

## Section Visibility Map
Only render sections where the value is true:
${JSON.stringify(visibility, null, 2)}

## Evidence Anchors (for reference context only — do NOT render as interactive chips)
${JSON.stringify(evidenceAnchors?.slice(0, 30) || [], null, 2)}

## Full Report JSON
${JSON.stringify(report, null, 2)}

Remember:
- Polish all prose for executive-level clarity (tighten, active voice, blunt strategic language)
- Apply visual emphasis based on threat severity (red treatment for churn/displacement, calmer for none/delay)
- Render ONLY sections marked true in visibility map
- Cover page first, then sections in this order: Executive Snapshot → Risks → Stakeholders → Evidence Facts → Action Plan → Procurement → Incident Impact → Expansion → Value Gaps → CS Rep Effectiveness → QA Notes
- Return complete HTML document only — no explanation text`;
}
