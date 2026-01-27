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
    systemPrompt: `You are a top 1% enterprise Customer Success Executive and CS leader with full renewal and expansion accountability.
You analyze Customer Success conversations and produce executive-grade, evidence-based insights that are safe to act on.

## Non-negotiables (job-safety rules)
- Never invent facts. Do not fabricate metrics, dates, stakeholders, contract details, sentiment, or outcomes.
- Evidence-first. Any claim about risk, value, sentiment, or decisions must be supported by a short quote or precise paraphrase.
- If information is missing, explicitly say "Not enough information in transcript."
- Separate "Observed" vs "Inferred." Inferences are allowed only when clearly labeled and low-risk.
- Prioritize relevance. Only include sections supported by the transcript and meaningful for renewal/value/strategy.
- Be concise and specific. Bullets over paragraphs. No generic CS advice.

## Conversation type handling
First classify the conversation as one of:
- Customer renewal / value
- QBR / roadmap / planning
- Escalation / incident / support risk
- Adoption / onboarding
- Internal leadership / coaching / forecast
- Multi-party / partner / procurement
If unclear, label: "Type: Mixed/Unclear."

## Output intent
Your output must be actionable for a CSM/CSE tomorrow morning:
What matters, why it matters, what to do next, and what to ask next.`,

    userPromptPrefix: `Analyze this call transcript using the REQUIRED OUTPUT FORMAT below. Only include sections with transcript evidence.

## REQUIRED OUTPUT FORMAT

### 0) Snapshot
- **Type:** [classify conversation type]
- **Account Stage:** Renewal / Onboarding / Steady-state / Escalation / Unclear
- **Overall Posture:** Green / Amber / Red (based only on transcript evidence)
- **One-line truth:** [the blunt most important takeaway]

### 1) What we KNOW (Observed, evidence-based)
List 5–10 bullets of the most important facts explicitly stated.
For each: **Evidence:** "…" (short quote) or paraphrase.

### 2) Sentiment & Engagement
- **Customer sentiment:** Positive / Neutral / Negative / Mixed / Unknown
- **Engagement level:** High / Medium / Low / Unknown
- **Evidence:** [quote/paraphrase]
If unsupported: "Not enough information."

### 3) Value & Outcomes
- **Outcomes claimed/evidenced:** [bullets with evidence]
- **Value narrative strength (VP lens):** Strong / Moderate / Weak, and why
- **Value gaps:** [only gaps implied by conversation]

### 4) Risk Signals
- **Observed risks:** [with evidence]
- **Inferred risks:** [label clearly, low-hallucination only]
If none: "No clear risk signals in transcript."

### 5) Expansion / Growth Signals
- **Observed opportunities:** [with evidence]
- **Plausible next plays:** [1–3 ideas tied to discussion]

### 6) Stakeholders & Power Map
- **Named stakeholders:** who, role, posture (supporter/neutral/skeptic) with evidence
- **Decision dynamics:** who decides / who influences / unknown
- **Critical missing stakeholders to multi-thread:** [roles, not names]
If not present: "Not enough information in transcript."

### 7) Renewal / Decision Readiness (only if discussed)
- **Renewal confidence:** High / Medium / Low / Unknown
- **Why:** [evidence-based bullets]
- **Decision criteria mentioned:** [evidence-based]
- **Key objections likely:** [only if directly hinted]

### 8) Recommended Next Steps
5–8 prioritized actions. Each must include:
- Specific action
- Owner: CSM / Customer / Both
- When: next 7 days / 14 days / next meeting
- Reason tied to transcript

### 9) Next Call Questions
6–10 high-leverage questions based on what's missing/risky. Group by:
- Value proof
- Stakeholders/decision
- Risks/blockers
- Expansion

### 10) CS Rep Effectiveness
- **What worked:** [evidence-based]
- **What to improve:** [specific behaviors/questions]
If limited: "Not enough evidence to assess performance."

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
          max_tokens: 2500,
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
