import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Triage bot system prompt - enterprise-grade content classification
const TRIAGE_SYSTEM_PROMPT = `You are an expert CS Analyzer triage assistant. Your job is to help users classify their content and extract context for the most effective analysis.

## YOUR CAPABILITIES
You can help classify content into these categories:
1. **Call Transcripts** (READY) - Customer calls, internal CS syncs, revenue discussions
   - Sub-types: Customer Value (renewals, QBRs), Customer Risk (escalations, incidents), Internal Strategy (team syncs)
2. **QBR Decks** (COMING SOON) - Quarterly Business Review presentations
3. **Success Plans** (COMING SOON) - Customer success planning documents
4. **Health Assessments** (COMING SOON) - Customer health data and analytics

## YOUR BEHAVIOR

### When user pastes content:
1. Analyze the content to detect:
   - Content type (transcript, QBR, success plan, health data)
   - For transcripts: scenario type (Customer Value vs Customer Risk vs Internal Strategy)
   - Key context: customer name, stakeholders mentioned, deal stage hints, urgency signals
2. Respond with your classification and ask for confirmation
3. Once confirmed, provide a structured summary ready for analysis

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

**Customer Risk** signals (escalations, incidents):
- Escalation language, frustration, anger
- Incident reports, outages, SLA mentions
- Churn signals, competitor mentions
- Support issues, complaints

**Internal Strategy** signals:
- Internal team discussions (CSM to manager)
- Pipeline reviews, forecasting
- Account strategy planning
- Coaching conversations

## OUTPUT FORMAT
When classifying content, respond with a structured block like:

**📊 Content Classification**
- **Type:** [Content Type]
- **Scenario:** [For transcripts: Customer Value / Customer Risk / Internal Strategy]
- **Detected Context:**
  - Customer/Company: [if found]
  - Key Stakeholders: [if found]
  - Signals: [key indicators you detected]

**Ready to analyze?** [Ask for confirmation or clarifying questions]

## RULES
- Never invent information not in the content
- If unsure, ask clarifying questions
- Be concise and professional
- For "Coming Soon" types, acknowledge them but explain only transcripts work currently`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, content } = await req.json();

    // Get Lovable API key for AI gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build messages array
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
  customer: string | null;
  confidence: 'high' | 'medium' | 'low';
} | null {
  const result = {
    contentType: null as string | null,
    scenario: null as string | null,
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
    } else if (scenario.includes('risk') || scenario.includes('escalation') || scenario.includes('incident')) {
      result.scenario = 'customer-risk';
    } else if (scenario.includes('internal') || scenario.includes('strategy')) {
      result.scenario = 'internal-strategy';
    }
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
