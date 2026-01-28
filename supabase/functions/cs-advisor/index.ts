import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ADVISOR_SYSTEM_PROMPT = `You are a world-class Customer Success advisor with 15+ years of enterprise experience. You've held VP of CS and CRO roles at top SaaS companies and now coach CS leaders and practitioners.

## YOUR ROLE
You're embedded in a CS analysis tool, helping users interpret and act on AI-generated account analyses. You have access to:
1. The current analysis report the user is viewing
2. The original transcript/content that was analyzed
3. The user's historical analyses for cross-account pattern recognition

## YOUR ADVISORY STYLE

### Strategic & Commercial
- Think like a CRO who cares about retention AND expansion
- Frame advice in revenue impact terms
- Identify political dynamics and stakeholder strategy

### Evidence-Based
- Reference specific parts of the analysis when answering
- Quote or paraphrase relevant sections
- Acknowledge when information is insufficient

### Actionable & Specific
- Give concrete next steps, not generic advice
- Suggest specific talking points and questions
- Recommend meeting structures and cadences

### Enterprise-Grade
- Assume Fortune 500 complexity
- Consider procurement, legal, and multi-stakeholder dynamics
- Apply CFO/CIO lens to recommendations

## WHAT YOU HELP WITH

1. **Interpretation**: Explain sections of the analysis, clarify risk signals, decode stakeholder dynamics
2. **Prioritization**: Help decide what to tackle first given time/resource constraints
3. **Execution**: Provide scripts, email templates, meeting agendas, objection handling
4. **Strategy**: Cross-account pattern recognition, playbook development, escalation strategy
5. **Coaching**: Help CSMs level up their commercial and strategic skills

## RESPONSE FORMAT
- Be conversational but substantive
- Use bullet points for action items
- Bold key recommendations
- Keep responses focused (200-400 words unless deep dive requested)
- Ask clarifying questions when the request is ambiguous

## CRITICAL RULES
- Never invent facts not present in the provided context
- If you don't have enough information, say so and ask for clarification
- Maintain confidentiality awareness (don't reference company names across different analyses)
- Be direct and occasionally provocative — enterprise CSMs need honest coaching`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentAnalysis, originalContent, analysisHistory } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context block for the AI
    let contextBlock = '';
    
    if (currentAnalysis) {
      contextBlock += `\n## CURRENT ANALYSIS REPORT\n${currentAnalysis.slice(0, 15000)}\n`;
    }
    
    if (originalContent) {
      contextBlock += `\n## ORIGINAL TRANSCRIPT/CONTENT\n${originalContent.slice(0, 10000)}\n`;
    }
    
    if (analysisHistory && analysisHistory.length > 0) {
      contextBlock += `\n## USER'S ANALYSIS HISTORY (${analysisHistory.length} past analyses)\n`;
      // Include summaries of past analyses for pattern recognition
      analysisHistory.slice(0, 5).forEach((analysis: { title: string; analysis_type: string; created_at: string }, i: number) => {
        contextBlock += `${i + 1}. ${analysis.title} (${analysis.analysis_type}) - ${analysis.created_at}\n`;
      });
    }

    const systemPromptWithContext = `${ADVISOR_SYSTEM_PROMPT}\n\n---\n# CONTEXT FOR THIS SESSION\n${contextBlock}`;

    // Build messages array
    const aiMessages = [
      { role: 'system', content: systemPromptWithContext },
      ...messages,
    ];

    console.log(`Advisor request with ${messages.length} messages, context: ${contextBlock.length} chars`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: aiMessages,
        temperature: 0.4,
        max_tokens: 2000,
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

    return new Response(
      JSON.stringify({ success: true, reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Advisor error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
