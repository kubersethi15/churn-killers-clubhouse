import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildCallTranscriptPrompt,
  ANALYSIS_PROMPTS,
  PromptConfig,
} from "./prompts.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Use getUser instead of getClaims for more reliable auth validation
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData?.user) {
      console.error('Auth validation failed:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    console.log(`Authenticated user: ${userEmail} (${userId})`);

    const body = await req.json();
    const { analysisType, callCategory, content, email, customPrompt } = body;

    // Validate inputs
    if (!analysisType || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: analysisType and content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the prompts for this analysis type
    let prompts: PromptConfig;
    
    if (analysisType === 'call-transcript') {
      // Check for custom prompt (used for "other" category)
      if (callCategory === 'other' && customPrompt) {
        console.log(`Using custom prompt for "other" scenario`);
        prompts = {
          systemPrompt: customPrompt.systemPrompt,
          userPromptPrefix: customPrompt.userPromptPrefix,
        };
      } else {
        // Use category-specific prompts for call transcripts
        prompts = buildCallTranscriptPrompt(callCategory);
        console.log(`Using call category: ${callCategory || 'generic'}`);
      }
    } else {
      // Use standard prompts for other analysis types
      const standardPrompts = ANALYSIS_PROMPTS[analysisType as keyof typeof ANALYSIS_PROMPTS];
      if (!standardPrompts) {
        return new Response(
          JSON.stringify({ error: `Invalid analysis type: ${analysisType}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      prompts = standardPrompts;
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
          max_tokens: 4500,
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
