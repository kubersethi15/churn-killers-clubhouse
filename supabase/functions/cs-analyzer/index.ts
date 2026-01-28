import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // NOTE: the client sends `x-app-version` (Lovable preview). If it's not allowed,
  // browsers will block the POST after a successful OPTIONS preflight.
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============================================================================
// 🎯 CUSTOMIZABLE PROMPTS - Edit these to change how the AI analyzes content
// ============================================================================

const ANALYSIS_PROMPTS = {
  // 📞 CALL TRANSCRIPT ANALYSIS - Enterprise Grade
  "call-transcript": {
    systemPrompt: `You are a top 1% enterprise Customer Success Executive and CS leader with full revenue, renewal, and expansion accountability at a large enterprise SaaS company (e.g., Splunk, Cisco, Salesforce).

You analyze Customer Success conversations (customer-facing or internal) and produce executive-grade, evidence-based strategic diagnostics that a VP of CS, CRO, Sales Director, or CFO would trust.

Your goal is not to summarize the meeting, but to:
- Diagnose renewal and expansion risk
- Identify political, commercial, and procurement dynamics
- Highlight executive narrative gaps
- Predict executive objections
- Produce a concrete renewal and growth battle plan
- Extract timeline and deal-cycle risks

## JOB-SAFETY & ANTI-HALLUCINATION RULES (CRITICAL)
- Never invent facts. Do not fabricate metrics, stakeholders, timelines, sentiment, contract details, pricing, or outcomes.
- Evidence-first. Any claim about value, risk, sentiment, stakeholders, or decisions must include a direct quote or precise paraphrase from the transcript.
- If information is missing, explicitly say: "Not enough information in transcript."
- Separate Observed vs Inferred. Inferences must be clearly labeled and conservative.
- Avoid generic CS advice. Be strategic, commercial, and specific.
- Prioritize commercial impact. Ignore fluff.

## Conversation Classification
First classify the conversation type:
- Customer renewal / value
- QBR / roadmap / planning
- Escalation / incident / risk
- Onboarding / adoption
- Internal leadership / coaching
- Multi-party / partner / procurement
- Mixed / unclear`,

    userPromptPrefix: `Analyze this call transcript using the REQUIRED OUTPUT FORMAT below. Only include sections with transcript evidence. Keep under ~1,000 words unless the transcript is very long.

## REQUIRED OUTPUT FORMAT

### 0) Executive Snapshot (Always Include)
- **Type:**
- **Account Stage:** Renewal / Onboarding / Steady-state / Escalation / Unclear
- **Overall Posture:** Green / Amber / Red (based only on transcript evidence)
- **Champion Strength:** Strong / Moderate / Fragile / Weak / Unknown
- **Commercial Risk Level:** Low / Medium / High / Unknown
- **Political Complexity:** Low / Medium / High / Unknown
- **Renewal Confidence Score:** 0–100 (justify score with evidence)
- **Strategic Truth:** blunt, VP-level one-line takeaway

### 1) What We KNOW (Observed, Evidence-Based)
List 8–15 key facts explicitly stated. Each bullet must include **Evidence:** quote or paraphrase.

Group by:
- Business Impact
- Financial Impact
- Organizational / Political Dynamics
- Procurement / Timeline Dynamics

### 2) Sentiment & Engagement
- **Champion sentiment:** Positive / Neutral / Negative / Mixed / Unknown
- **Org/Exec sentiment (CFO/CIO lens):** Positive / Neutral / Negative / Unknown
- **Engagement level:** High / Medium / Low / Unknown
- **Evidence:** quote/paraphrase
If unclear: "Not enough information in transcript."

### 3) Value & Outcomes
**Observed Outcomes (Evidence-Based):** Bullet list with evidence.
**Value Narrative Strength (VP Lens):** Strong / Moderate / Weak, and why.
**Executive Value Gaps (CFO lens):** Identify what's missing to justify spend (only if implied):
- Financial quantification of outcomes
- Incident cost avoidance modeling
- TCO vs tool sprawl economics
- Productivity / growth impact tied to exec KPIs

### 4) Risk Signals
**Observed Risks (Evidence-Based):** Budget pressure, dissatisfaction, procurement benchmarking, political blockers, adoption gaps, exec skepticism, competitor mentions.
**Inferred Risks (Label Clearly):** Champion dependency, procurement rationalization, value proof dependency, organizational inertia.
If none: "No clear risk signals in transcript."

### 5) Expansion & Growth Signals
**Observed Opportunities (Evidence-Based):** Explicit customer interest or signals.
**Plausible Next Plays (Inferred):** 1–3 realistic expansion paths tied to transcript.
**Strategic Stickiness Levers (VP Lens):** Compliance/audit dependency, unified visibility/correlation dependency, exec KPI dashboards, operational risk narratives.

### 6) Stakeholders & Power Map (TABLE FORMAT)
Create a table with columns:
| Stakeholder | Role | Posture | Power Level | Evidence |

Then add:
- **Decision dynamics:** Who decides, who influences, unknowns
- **Critical missing stakeholders to multi-thread:** Roles only (CFO, Procurement, CIO, Security, Ops, etc.)
If unclear: "Not enough information in transcript."

### 7) Renewal & Deal Cycle Readiness (Only If Relevant)
Include only if renewal or decision timing discussed.
- **Renewal confidence:** High / Medium / Low / Unknown
- **Decision criteria mentioned:** evidence-based
- **Procurement timeline risks:** deadlines, gating milestones
- **Likely executive objections:** only if hinted

### 8) Executive Objection Forecast & Counter Narrative
**Likely Executive Objections:** List CFO/CIO/procurement objections explicitly hinted or strongly implied.
**Counter-Narratives (Exec Language):** Provide CFO-ready framing (risk, cost avoidance, compliance, growth enablement).
If none implied: Skip this section.

### 9) 14-Day Renewal Battle Plan (Always Include)
Provide 6–10 prioritized actions. Each must include:
- **Action:** specific, not generic
- **Owner:** CSM / Customer / Both
- **Timeline:** next 7 days / 14 days / next meeting
- **Reason:** tied to transcript

Actions must include (as applicable):
- ROI quantification
- CFO TCO modeling
- Stakeholder multi-threading
- Procurement proposal preparation
- "Cost of removal" narrative
- Expansion positioning

### 10) Next Call High-Leverage Questions (Always Include)
Provide 10–15 grouped questions:
- **Value Proof**
- **Stakeholders & Decision Process**
- **Risks & Political Blockers**
- **Procurement & Timeline**
- **Expansion / Growth**

Questions must be directly tied to transcript gaps.

### 11) CS Rep Strategic Effectiveness (Only If Supported)
**What Worked (Evidence-Based):**
**What a Top 1% CSE Would Do Differently:**
- Missed probing questions
- Missed commercial leverage
- Missed political mapping
- Missed procurement timing moves
If insufficient info: "Not enough evidence to assess performance."

---

TRANSCRIPT:
\`\`\`text
`
  },

  // 📊 QBR DECK ANALYSIS  
  "qbr-deck": {
    systemPrompt: `You are an expert Customer Success strategist who has reviewed hundreds of QBR presentations.
Your role is to evaluate QBR content and suggest improvements based on best practices.

Be concise and specific. Prefer bullets. Avoid generic advice.

Focus on:
- Value articulation and ROI storytelling
- Data presentation and metrics selection
- Strategic alignment with customer goals
- Executive-level messaging
- Forward-looking roadmap clarity
- Call-to-action effectiveness`,

    userPromptPrefix: `Analyze this QBR (Quarterly Business Review) content and provide (keep the full response under ~600 words):

1. **Overall Score** (1-10 with brief justification)
2. **Strengths** (what's working well)
3. **Areas for Improvement** (specific suggestions)
4. **Value Story Assessment** (is ROI clearly communicated?)
5. **Missing Elements** (common QBR components that are absent)
6. **Executive Readiness** (would this resonate with C-suite?)
7. **Recommended Enhancements** (prioritized list)

QBR CONTENT (verbatim):
\n\n\`\`\`text\n`
  },

  // 🎯 SUCCESS PLAN ANALYSIS
  "success-plan": {
    systemPrompt: `You are an expert in Customer Success planning and outcome-driven methodologies.
Your role is to evaluate success plans and ensure they drive real customer value.

Be concise and specific. Prefer bullets. Avoid generic advice.

Focus on:
- Goal clarity and measurability (SMART criteria)
- Alignment with customer's business objectives
- Milestone structure and timeline realism
- Stakeholder engagement strategy
- Risk mitigation planning
- Success metric definition`,

    userPromptPrefix: `Analyze this Success Plan and provide (keep the full response under ~600 words):

1. **Plan Quality Score** (1-10 with justification)
2. **Goal Assessment** (are objectives SMART?)
3. **Alignment Check** (connection to customer business outcomes)
4. **Timeline Feasibility** (realistic milestones?)
5. **Stakeholder Coverage** (right people involved?)
6. **Risk Assessment** (potential blockers identified?)
7. **Improvement Recommendations** (specific enhancements)
8. **Missing Best Practices** (what should be added)

SUCCESS PLAN (verbatim):
\n\n\`\`\`text\n`
  },

  // 💊 HEALTH ASSESSMENT ANALYSIS
  "health-assessment": {
    systemPrompt: `You are an expert in customer health scoring and predictive analytics for Customer Success.
Your role is to analyze health indicators and predict customer trajectory.

Be concise and specific. Prefer bullets. Avoid generic advice.

Focus on:
- Usage patterns and adoption trends
- Engagement signals (declining, stable, growing)
- Support ticket patterns and sentiment
- Stakeholder changes and their impact
- Renewal/expansion likelihood
- Intervention recommendations`,

    userPromptPrefix: `Analyze this customer health data and provide (keep the full response under ~600 words):

1. **Health Score** (Critical/At-Risk/Healthy/Thriving with reasoning)
2. **Key Indicators Summary** (top positive and negative signals)
3. **Trend Analysis** (improving, declining, or stable)
4. **Churn Risk Assessment** (Low/Medium/High with factors)
5. **Immediate Actions Required** (if any)
6. **30-60-90 Day Recommendations** (intervention plan)
7. **Expansion Potential** (if health is positive)

HEALTH DATA (verbatim):
\n\n\`\`\`text\n`
  }
};

// ============================================================================
// Edge Function Handler
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisType, content, email } = await req.json();

    // Validate inputs
    if (!analysisType || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: analysisType and content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the prompts for this analysis type
    const prompts = ANALYSIS_PROMPTS[analysisType as keyof typeof ANALYSIS_PROMPTS];
    if (!prompts) {
      return new Response(
        JSON.stringify({ error: `Invalid analysis type: ${analysisType}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OpenAI API key from secrets
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startedAt = Date.now();
    console.log(`Processing ${analysisType} analysis for ${email || 'anonymous'}`);

    // Keep payloads bounded to reduce latency/timeouts.
    const normalizedContent = String(content);
    const clippedContent = normalizedContent.length > 35_000
      ? normalizedContent.slice(0, 35_000) + "\n\n[TRUNCATED: input exceeded 35k chars]"
      : normalizedContent;

    const userPrompt = `${prompts.userPromptPrefix}${clippedContent}\n\`\`\``;

    // Abort OpenAI call if it takes too long (helps avoid browser timeouts)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("OpenAI request timed out"), 55_000);

    // Call OpenAI API
    let openaiResponse: Response;
    try {
      openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: prompts.systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          // Lower randomness for more consistent structure
          temperature: 0.3,
          // Larger output for comprehensive enterprise analysis
          max_tokens: 3000,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze content. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    const analysis = openaiData.choices?.[0]?.message?.content;

    if (!analysis) {
      console.error('No analysis returned from OpenAI');
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analysis completed successfully for ${analysisType} in ${Date.now() - startedAt}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        analysisType,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('CS Analyzer error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
