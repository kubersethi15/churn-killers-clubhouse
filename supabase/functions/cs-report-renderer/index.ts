import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------------------------------------------------------------------------
// Lovable AI Gateway config — fast and reliable for HTML generation
// ---------------------------------------------------------------------------
const MODEL = "google/gemini-2.5-flash";
const TIMEOUT_MS = 55_000; // 55s — within edge function wall-clock limit

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey)
      return jsonResp({ error: "LOVABLE_API_KEY not configured" }, 500);

    const body = await req.json();
    const { report, visibility, title, finalizedAt, evidenceAnchors } = body;

    if (!report)
      return jsonResp({ error: "Missing report payload" }, 400);

    console.log("[cs-report-renderer] Starting HTML generation...");

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(report, visibility, title, finalizedAt, evidenceAnchors);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS);

    let html: string;
    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.25,
          max_tokens: 16000,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        console.error(`AI Gateway ${resp.status}: ${errBody.slice(0, 500)}`);
        if (resp.status === 429)
          return jsonResp({ error: "Rate limited — please try again shortly." }, 429);
        if (resp.status === 402)
          return jsonResp({ error: "AI credits exhausted — please add credits in workspace settings." }, 402);
        return jsonResp({ error: `AI gateway error: ${resp.status}` }, 500);
      }

      const data = await resp.json();
      const rawText = data.choices?.[0]?.message?.content ?? "";

      console.log(`[cs-report-renderer] Got ${rawText.length} chars from AI`);

      html = extractHtml(rawText);
      if (!html) {
        console.error("[cs-report-renderer] No HTML found in response");
        return jsonResp({ error: "Failed to generate report HTML" }, 500);
      }

      console.log(`[cs-report-renderer] HTML extracted: ${html.length} chars`);
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
  const htmlMatch = cleaned.match(/```html\s*\n?([\s\S]*?)\n?\s*```/);
  if (htmlMatch) return htmlMatch[1].trim();
  if (cleaned.startsWith("<!") || cleaned.startsWith("<html"))
    return cleaned;
  return cleaned;
}

// ---------------------------------------------------------------------------
// PROMPT ENGINEERING — Executive-Grade Report Design
// ---------------------------------------------------------------------------

function buildSystemPrompt(): string {
  return `You are an elite document designer who creates Fortune 500-quality executive intelligence reports. Your reports are used in boardrooms, shared with CROs, and read by VPs of Customer Success.

## DESIGN PHILOSOPHY

You create reports that feel like they came from McKinsey or Bain — not a SaaS dashboard printout. Every pixel matters. The report should command authority and make the reader feel they are holding a premium deliverable.

## TYPOGRAPHY SYSTEM

- **Display headings** (report title, major section names): Playfair Display, 700 weight
- **Section labels**: Inter, 600 weight, 10px, uppercase, letter-spacing 2px, muted gray (#94a3b8)
- **Body text**: Inter, 400 weight, 13px, color #334155, line-height 1.7
- **Data labels**: Inter, 500 weight, 11px
- **Emphasis text**: Inter, 600 weight, navy (#1a1a2e)
- All heading sizes should feel proportional: H1 28px, H2 20px, H3 16px

## COLOR SYSTEM — THREAT-ADAPTIVE

Analyze the report's primary_threat and overall_confidence to set the document's emotional tone:

**Critical/Churn threat:** Dominant accent is deep red (#b91c1c). Red left-borders on risk cards. Red severity pills. The cover page accent stripe uses red gradient.

**Delay/Moderate threat:** Dominant accent is amber (#d97706). Warmer, cautious tone. Cover accent uses amber-to-navy gradient.

**None/Low threat:** Dominant accent is emerald (#059669). Confident, positive tone. Cover accent uses emerald-to-navy gradient.

Base palette always includes:
- Navy: #1a1a2e (primary brand, headings, dark backgrounds)
- Slate 700: #334155 (body text)
- Slate 400: #94a3b8 (labels, metadata)
- Slate 100: #f1f5f9 (card backgrounds, table headers)
- White: #ffffff (page background)
- Report accent (determined by threat level above)

## LAYOUT ARCHITECTURE

### Cover Page (full page, page-break-after: always)
- Clean white background with a 5px gradient stripe at the very top (navy → accent color)
- Brand line: "CHURN IS DEAD" in 10px uppercase tracking-widest, slate-400
- Sub-brand: "CS Intelligence" below brand line, slightly larger
- Report title: Large Playfair Display, navy, below brand
- A thin 3px accent-colored divider line (48px wide)
- Metadata: "Executive Diagnostic Report" + date, in slate-400
- Bottom of page: "Confidential — Internal Use Only" left, "Generated by CS Analyzer" right
- Lots of white space — the cover should breathe

### Executive Snapshot Section
- Full-width card with navy gradient background (#1a1a2e → #2d3a6e)
- White text for the one-liner summary
- Threat level displayed as a large colored pill/badge
- Key takeaways as numbered items below, each with a small severity dot
- Strategic truth in a distinct callout box with left accent border
- Section confidence shown as a subtle badge

### Risk & Threat Classification
- Section header with "RISKS & THREATS" label and confidence badge
- Primary/secondary threat shown as large semantic badges
- Each risk rendered as a card with:
  - Left border colored by severity (4px): red for HIGH, amber for MEDIUM, slate for LOW
  - Severity pill in top-left
  - Risk text as the main content
  - Category tag (e.g., "Observed - delivery") and confidence as small badges below
  - If risk has rationale/detail, show in lighter italic text

### Stakeholder Power Map (if visible)
- Clean table with alternating row backgrounds
- Column headers: Name, Title/Role, Power Level, Stance, Engagement, Key Quote
- Power level shown as colored badges (High=navy, Medium=slate, Low=light)
- Stance shown as colored text (Champion=emerald, Neutral=slate, Skeptic=amber, Blocker=red)
- Each row should have generous padding

### Evidence-Backed Facts (if visible)
- Vertical timeline layout with a thin navy line on the left
- Each fact as a card connected to the timeline with a small dot
- Timestamp/order indicator on the timeline dot
- Category badge and confidence badge inline

### 14-Day Action Plan
- Each action as a structured card with:
  - Action title as the card heading
  - A row of metadata pills: Owner type (INTERNAL/CUSTOMER), Day number, Priority
  - Three-column detail grid below: Why | Expected Response | Success Criteria
  - Each column with its own subtle label header
  - Cards separated with generous spacing

### Conditional Sections (Procurement, Incident, Expansion, Value Gaps, CS Rep)
- Each gets a section header with icon-style label
- Content rendered as clean cards or bullet lists
- Respect the same card styling patterns as above

## PRINT OPTIMIZATION (CRITICAL)

- @page: A4, margins 22mm top/bottom, 20mm sides
- ALL colored backgrounds must include: \`-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;\`
- Cards: \`break-inside: avoid; page-break-inside: avoid;\`
- Cover page: \`page-break-after: always;\`
- Section headers: \`page-break-after: avoid;\` (keep with content)
- Remove ALL default browser URL/date footers by setting title to the report title

## PROSE POLISH RULES

- Tighten all text for executive brevity — every word must earn its place
- Use active voice exclusively
- Strategic truth should be blunt, CRO-level language — no hedging
- Action rationales should read as executive directives, not suggestions
- Risk descriptions should be crisp and impact-focused
- DO NOT invent information — only refine existing text for clarity and punch
- NO emojis anywhere in the document
- NO placeholder text — if data is missing, omit the element entirely

## STRICTLY FORBIDDEN

- No interactive elements (buttons, checkboxes, inputs, links)
- No JavaScript
- No external images or resources (except Google Fonts CDN)
- No "about:blank" references or URLs visible anywhere
- No lorem ipsum or placeholder content
- No emojis
- No generic/template language like "Insert here" or "TBD"

## OUTPUT FORMAT

Return ONLY the complete HTML document starting with \`<!DOCTYPE html>\`.
All CSS must be embedded in a single \`<style>\` tag in \`<head>\`.
Include Google Fonts via \`<link>\` tags.
The document title should be the report title (not "about:blank").`;
}

function buildUserPrompt(
  report: Record<string, unknown>,
  visibility: Record<string, boolean>,
  title: string,
  finalizedAt: string,
  evidenceAnchors: Array<{ id: string; quote: string }>,
): string {
  return `Generate a premium, executive-grade print-ready HTML report from this data. This report will be saved as PDF and shared in executive meetings — make it visually stunning.

## Report Title
${title || "Analysis Report"}

## Finalized At
${finalizedAt || new Date().toISOString()}

## Section Visibility Map
Only render sections where the value is true. Always render: executive_snapshot, risks_and_threats, action_plan_14_days.
\`\`\`json
${JSON.stringify(visibility, null, 2)}
\`\`\`

## Evidence Anchors (for reference context — render as inline quoted evidence, NOT as interactive chips)
\`\`\`json
${JSON.stringify(evidenceAnchors?.slice(0, 30) || [], null, 2)}
\`\`\`

## Full Report JSON
\`\`\`json
${JSON.stringify(report, null, 2)}
\`\`\`

## Rendering Instructions
1. Start with the cover page (always included)
2. Section order: Executive Snapshot -> Risks & Threats -> Stakeholder Map -> Evidence Facts -> 14-Day Action Plan -> Procurement & Timeline -> Incident Impact -> Expansion Plays -> Value Gaps -> CS Rep Effectiveness -> QA Notes
3. Skip sections not marked true in visibility map (except the 3 always-visible ones)
4. Analyze primary_threat to set the document's color accent (red for churn/displacement, amber for delay, emerald for none)
5. Polish ALL prose text — tighten for executive brevity, active voice, blunt strategic language
6. Make tables, cards, and badges print beautifully with proper color-adjust rules
7. Ensure generous white space between sections
8. Return ONLY the complete HTML document — no explanation, no markdown wrapping`;
}
