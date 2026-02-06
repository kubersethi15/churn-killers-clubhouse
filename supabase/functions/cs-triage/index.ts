import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Triage bot system prompt - enterprise-grade content classification
const TRIAGE_SYSTEM_PROMPT = `You are an expert CS Analyzer triage assistant. Your job is to help users classify their content and extract context for the most effective analysis.

## YOUR CAPABILITIES
You can help classify content into these categories:
1. **Call Transcripts** (READY) - Customer calls, internal CS syncs, revenue discussions
   - Sub-types: 
     - Customer Value (renewals, QBRs, expansion)
     - Customer Risk - Active Incident (escalations, outages, SLA issues)
     - Customer Risk - Silent Risk (tool review, low adoption, leadership changes, strategic uncertainty)
     - Internal Strategy (team syncs)
     - Other (custom scenarios that don't fit the above)
2. **QBR Decks** (COMING SOON) - Quarterly Business Review presentations
3. **Success Plans** (COMING SOON) - Customer success planning documents
4. **Health Assessments** (COMING SOON) - Customer health data and analytics

## YOUR BEHAVIOR

### When user pastes content:
1. Analyze the content to detect:
   - Content type (transcript, QBR, success plan, health data)
   - For transcripts: scenario type (Customer Value / Customer Risk - Active / Customer Risk - Silent / Internal Strategy / Other)
   - Key context: customer name, stakeholders mentioned, deal stage hints, urgency signals
2. Respond with your classification and ask for confirmation
3. For "Customer Risk" scenarios, you MUST sub-classify as either:
   - **Active Incident** (outages, SLA breaches, exec escalations, support crises, compensation discussions)
   - **Silent Strategic Risk** (tool review, low adoption, leadership changes, budget scrutiny, quiet disengagement)
4. If scenario is "Other", suggest a specific scenario label (e.g., "Partner Onboarding", "Product Feedback", "Sales Handoff")
5. Once confirmed, provide a structured summary ready for analysis

### When user asks questions:
- Be helpful and explain the analysis types
- Guide them to paste their content
- Ask clarifying questions if needed

### Classification Signals:

**Call Transcripts** look like:
- Speaker labels with timestamps: "[00:00] John:", "Speaker 1:", "CSM:"
- Conversational back-and-forth dialogue
- Discussion format with questions and responses

**Customer Value** signals (renewals, QBRs, expansion):
- Renewal discussions, pricing, contracts
- Value realization, ROI, outcomes
- QBR content, executive reviews
- Upsell/cross-sell, expansion

**Customer Risk - ACTIVE INCIDENT** signals:
- Outage, downtime, incident, Sev-1, Sev-2
- SLA breach, penalty, compensation
- Executive escalation, angry customer
- Immediate crisis language
- Support ticket references
- "We're down", "This is unacceptable", "We need this fixed now"

**Customer Risk - SILENT STRATEGIC RISK** signals:
- Tool review, vendor evaluation, "evaluating options"
- Low adoption, declining usage, "not using it as much"
- Leadership change, new VP, new CIO, "new management"
- Budget review, cost scrutiny, "looking at costs"
- Unclear strategy, "we need to figure out"
- Quiet disengagement, delayed responses, missed meetings
- "What's the roadmap", "Where is this going"
- Consolidation discussions, reducing vendors
- NO outage, NO SLA breach, NO angry escalation

**Internal Strategy** signals:
- Internal team discussions (CSM to manager)
- Pipeline reviews, forecasting
- Account strategy planning
- Coaching conversations

**Other** signals (custom scenarios):
- Partner/vendor discussions
- Product feedback or feature request conversations
- Sales handoff or deal context calls
- Training or enablement sessions
- Technical deep-dives or implementation calls
- Customer advisory board meetings
- Any call that doesn't fit the above categories

## OUTPUT FORMAT
When classifying content, respond with a structured block like:

**Content Classification**
- **Type:** [Content Type]
- **Scenario:** [For transcripts: Customer Value / Customer Risk - Active Incident / Customer Risk - Silent Risk / Internal Strategy / Other]
- **Scenario Label:** [Only for "Other": e.g., "Partner Onboarding Call", "Product Feedback Session"]
- **Risk Sub-type:** [Only for Customer Risk: Active Incident / Silent Strategic Risk]
- **Detected Context:**
  - Customer/Company: [if found]
  - Key Stakeholders: [if found]
  - Signals: [key indicators you detected]

**Ready to analyze?** [Ask for confirmation or clarifying questions. For Customer Risk scenarios, confirm the sub-type is correct. For "Other" scenarios, ask if the suggested label is accurate.]

## RULES
- Never invent information not in the content
- If unsure, ask clarifying questions
- Be concise and professional
- For "Coming Soon" types, acknowledge them but explain only transcripts work currently
- For "Other" scenarios, always suggest a specific scenario label based on content analysis
- For "Customer Risk" scenarios, ALWAYS determine if it's Active Incident or Silent Strategic Risk`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, content, generateSample, scenario } = body;

    // Get Lovable API key for AI gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle sample transcript generation
    if (generateSample) {
      return await generateSampleTranscript(LOVABLE_API_KEY, scenario);
    }

    // Build messages array for triage
    const aiMessages = [
      { role: 'system', content: TRIAGE_SYSTEM_PROMPT },
      ...messages,
    ];

    // If content is provided separately (for initial paste), add it as a user message
    if (content && messages.length === 0) {
      aiMessages.push({
        role: 'user',
        content: `Please analyze and classify this content:\n\n${content.slice(0, 30000)}`,
      });
    }

    console.log(`Triage request with ${aiMessages.length - 1} messages`);

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: aiMessages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to process request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return new Response(
        JSON.stringify({ error: 'No response generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to extract classification from the response
    const classification = extractClassification(reply);

    return new Response(
      JSON.stringify({
        success: true,
        reply,
        classification,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Triage error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Extract structured classification from AI response
function extractClassification(text: string): {
  contentType: string | null;
  scenario: string | null;
  scenarioLabel: string | null;
  riskSubType: string | null;
  customer: string | null;
  confidence: 'high' | 'medium' | 'low';
} | null {
  const result = {
    contentType: null as string | null,
    scenario: null as string | null,
    scenarioLabel: null as string | null,
    riskSubType: null as string | null,
    customer: null as string | null,
    confidence: 'low' as 'high' | 'medium' | 'low',
  };

  // Extract content type
  const typeMatch = text.match(/\*\*Type:\*\*\s*([^\n]+)/i);
  if (typeMatch) {
    const type = typeMatch[1].toLowerCase();
    if (type.includes('transcript') || type.includes('call')) {
      result.contentType = 'call-transcript';
    } else if (type.includes('qbr')) {
      result.contentType = 'qbr-deck';
    } else if (type.includes('success') && type.includes('plan')) {
      result.contentType = 'success-plan';
    } else if (type.includes('health')) {
      result.contentType = 'health-assessment';
    }
  }

  // Extract scenario for transcripts
  const scenarioMatch = text.match(/\*\*Scenario:\*\*\s*([^\n]+)/i);
  if (scenarioMatch) {
    const scenario = scenarioMatch[1].toLowerCase();
    if (scenario.includes('value') || scenario.includes('renewal') || scenario.includes('qbr')) {
      result.scenario = 'customer-value';
    } else if (scenario.includes('risk')) {
      // Check for sub-type: Active Incident vs Silent Risk
      if (scenario.includes('active') || scenario.includes('incident') || scenario.includes('escalation')) {
        result.scenario = 'customer-risk';
        result.riskSubType = 'active-incident';
      } else if (scenario.includes('silent') || scenario.includes('strategic')) {
        result.scenario = 'customer-risk-silent';
        result.riskSubType = 'silent-risk';
      } else {
        // Default to checking Risk Sub-type field
        result.scenario = 'customer-risk';
      }
    } else if (scenario.includes('internal') && scenario.includes('strategy')) {
      result.scenario = 'internal-strategy';
    } else if (scenario.includes('other')) {
      result.scenario = 'other';
    }
  }

  // Extract risk sub-type if not already determined
  const riskSubTypeMatch = text.match(/\*\*Risk Sub-type:\*\*\s*([^\n]+)/i);
  if (riskSubTypeMatch && !result.riskSubType) {
    const subType = riskSubTypeMatch[1].toLowerCase();
    if (subType.includes('active') || subType.includes('incident')) {
      result.riskSubType = 'active-incident';
      result.scenario = 'customer-risk';
    } else if (subType.includes('silent') || subType.includes('strategic')) {
      result.riskSubType = 'silent-risk';
      result.scenario = 'customer-risk-silent';
    }
  }

  // Extract scenario label for "Other" scenarios
  const scenarioLabelMatch = text.match(/\*\*Scenario Label:\*\*\s*([^\n]+)/i);
  if (scenarioLabelMatch && !scenarioLabelMatch[1].includes('N/A') && !scenarioLabelMatch[1].includes('if found')) {
    result.scenarioLabel = scenarioLabelMatch[1].trim().replace(/[*"]/g, '');
  }

  // Extract customer name
  const customerMatch = text.match(/Customer(?:\/Company)?:\s*([^\n]+)/i);
  if (customerMatch && !customerMatch[1].includes('not found') && !customerMatch[1].includes('if found')) {
    result.customer = customerMatch[1].trim();
  }

  // Determine confidence
  if (result.contentType && result.scenario) {
    result.confidence = 'high';
  } else if (result.contentType) {
    result.confidence = 'medium';
  }

  return result.contentType ? result : null;
}

// Generate sample transcript using AI
async function generateSampleTranscript(apiKey: string, scenario?: string): Promise<Response> {
  const scenarios = ['customer-value', 'customer-risk', 'internal-strategy'];
  const selectedScenario = scenario || scenarios[Math.floor(Math.random() * scenarios.length)];
  
  const scenarioPrompts: Record<string, string> = {
    'customer-value': `Generate a realistic Customer Success call transcript for a RENEWAL/EXPANSION scenario.
Include:
- A CSM and customer stakeholders (VP, Director level)
- Discussion of ROI, value realization, positive outcomes
- Hints of expansion opportunity (new departments, additional users)
- Natural conversation flow with speaker labels
- Specific metrics mentioned (%, time savings, revenue impact)
- A named company (fictional but realistic)
Make it 400-600 words, formatted as a call transcript with timestamps.`,
    
    'customer-risk': `Generate a realistic Customer Success call transcript for a CUSTOMER RISK/ESCALATION scenario.
Include:
- A CSM and frustrated customer stakeholders
- Discussion of issues (reliability, support, missing features)
- Competitor mentions or churn signals
- Natural conversation with speaker labels
- Specific pain points and timeline pressures
- A named company (fictional but realistic)
Make it 400-600 words, formatted as a call transcript with timestamps.`,
    
    'internal-strategy': `Generate a realistic INTERNAL CS team strategy meeting transcript.
Include:
- CS Director, CS Manager, and Senior CSM
- Discussion of at-risk accounts and renewals in pipeline
- Strategic planning and resource allocation
- Natural conversation with speaker labels
- Specific account names and ARR numbers mentioned
- Action items and owners assigned
Make it 400-600 words, formatted as a call transcript with timestamps.`,
  };

  const prompt = scenarioPrompts[selectedScenario] || scenarioPrompts['customer-value'];

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert at creating realistic Customer Success call transcripts for training and demo purposes. Create authentic-sounding conversations that feel like real business discussions.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Try a pre-written sample instead.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const transcript = data.choices?.[0]?.message?.content;

    if (!transcript) {
      throw new Error('No transcript generated');
    }

    return new Response(
      JSON.stringify({ success: true, transcript, scenario: selectedScenario }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sample generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate sample. Try a pre-written template.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Generate dynamic prompt for "Other" scenarios
function generateDynamicPrompt(scenarioLabel: string, content: string): { systemPrompt: string; userPromptPrefix: string } {
  const systemPrompt = `You are an expert Customer Success analyst specializing in analyzing "${scenarioLabel}" conversations.
Your role is to extract actionable insights from this specific type of customer interaction.

## Core Objectives
Based on the "${scenarioLabel}" context, you will:
- Identify key themes, decisions, and action items
- Extract stakeholder information and their positions
- Highlight opportunities, risks, and next steps
- Provide strategic recommendations

## Job-Safety Rules
- Never invent facts, metrics, or information not in the transcript
- Evidence-first: Every claim must include a quote or precise paraphrase
- If missing info, explicitly say: "Not enough information in transcript"
- Separate Observed vs Inferred insights
- Be specific and actionable, not generic`;

  const userPromptPrefix = `Analyze this "${scenarioLabel}" conversation and provide a comprehensive analysis.

## REQUIRED OUTPUT FORMAT

### 0) Executive Snapshot
- **Scenario Type:** ${scenarioLabel}
- **Overall Assessment:** Positive / Neutral / Concerning
- **Urgency Level:** Low / Medium / High
- **One-line Summary:** [Key takeaway from this conversation]

### 1) Key Themes & Topics Discussed
List the main themes with evidence from the transcript.

### 2) Stakeholder Analysis
| Stakeholder | Role | Position/Sentiment | Key Quotes |
|-------------|------|-------------------|------------|

### 3) Decisions & Commitments Made
What was agreed upon or decided during this conversation?

### 4) Opportunities Identified
What opportunities emerged from this discussion?

### 5) Risks & Concerns
What risks or concerns were raised or implied?

### 6) Action Items
| Action | Owner | Timeline | Priority |
|--------|-------|----------|----------|

### 7) Strategic Recommendations
Based on this conversation, what should happen next?

### 8) Follow-up Questions
10-15 questions to ask in the next conversation.

---

TRANSCRIPT:
\`\`\`text
`;

  return { systemPrompt, userPromptPrefix };
}
