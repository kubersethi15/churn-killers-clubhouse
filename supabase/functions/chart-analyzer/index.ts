import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Chart analyzer system prompt - extracts visualization data from analysis reports
const CHART_ANALYZER_PROMPT = `You are a data visualization expert. Your job is to analyze Customer Success analysis reports and extract structured data for charts.

## YOUR TASK
Given an analysis report, extract data for the following chart types (if sufficient data exists):

### 1. Stakeholder Quadrant (Power vs Sentiment)
- X-axis: Sentiment (-5 very negative to +5 very positive)
- Y-axis: Power/Influence (1 low to 5 high)
- Extract each stakeholder with their position

### 2. Risk Radar
- Extract risk dimensions and their severity (0-100 scale)
- Common dimensions: Churn Risk, Competitive Threat, Champion Fragility, Budget Pressure, Adoption Risk, Executive Alignment

### 3. Sentiment Distribution
- Analyze overall conversation tone
- Categorize into: Positive, Neutral, Concerning percentages

### 4. Action Priority Distribution
- Group actions by priority/urgency
- Categories: Immediate (24-48h), Short-term (1-2 weeks), Medium-term (30+ days)

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no explanation):

{
  "stakeholderQuadrant": {
    "enabled": true/false,
    "data": [
      { "id": "Name", "x": 3, "y": 4, "role": "Title", "sentiment": "positive/neutral/negative" }
    ]
  },
  "riskRadar": {
    "enabled": true/false,
    "data": [
      { "metric": "Churn Risk", "value": 25 },
      { "metric": "Competitive Threat", "value": 40 }
    ]
  },
  "sentimentDonut": {
    "enabled": true/false,
    "data": [
      { "id": "Positive", "value": 60, "color": "#10B981" },
      { "id": "Neutral", "value": 30, "color": "#6B7280" },
      { "id": "Concerning", "value": 10, "color": "#EF4444" }
    ]
  },
  "actionTimeline": {
    "enabled": true/false,
    "data": [
      { "priority": "Immediate", "count": 3 },
      { "priority": "Short-term", "count": 5 },
      { "priority": "Medium-term", "count": 2 }
    ]
  },
  "insights": {
    "summary": "One sentence about what the visualizations reveal",
    "keyMetric": { "label": "Primary metric name", "value": "metric value", "trend": "positive/negative/neutral" }
  }
}

## RULES
- Set "enabled": false if insufficient data for that chart type
- Infer reasonable values from context when explicit numbers aren't given
- For stakeholder sentiment, analyze their quotes and described behavior
- For risks, look at explicit risk mentions AND inferred risks from context
- Always include at least 3 data points per chart if enabled
- Colors should use: #10B981 (positive/green), #F59E0B (neutral/amber), #EF4444 (negative/red), #1E3A5F (navy brand)`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisReport, scenario } = await req.json();

    if (!analysisReport) {
      return new Response(
        JSON.stringify({ error: 'No analysis report provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Chart analyzer processing ${scenario || 'unknown'} scenario, report length: ${analysisReport.length}`);

    // Use Gemini 3 Pro for better reasoning on chart extraction
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-preview',
        messages: [
          { role: 'system', content: CHART_ANALYZER_PROMPT },
          { 
            role: 'user', 
            content: `Analyze this Customer Success report and extract chart data:\n\n---\nSCENARIO: ${scenario || 'Unknown'}\n---\n\n${analysisReport.slice(0, 25000)}` 
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log('Rate limited, returning empty charts');
        return new Response(
          JSON.stringify({ 
            success: true, 
            charts: getEmptyChartConfig(),
            rateLimited: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: true, charts: getEmptyChartConfig() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.log('No content in response, returning empty charts');
      return new Response(
        JSON.stringify({ success: true, charts: getEmptyChartConfig() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let charts;
    try {
      // Remove markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      charts = JSON.parse(jsonStr);
      console.log('Successfully parsed chart data');
    } catch (parseError) {
      console.error('Failed to parse chart JSON:', parseError);
      console.log('Raw content:', content.slice(0, 500));
      charts = getEmptyChartConfig();
    }

    // Validate and sanitize chart data
    charts = sanitizeChartData(charts);

    return new Response(
      JSON.stringify({ success: true, charts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chart analyzer error:', error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        charts: getEmptyChartConfig(),
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getEmptyChartConfig() {
  return {
    stakeholderQuadrant: { enabled: false, data: [] },
    riskRadar: { enabled: false, data: [] },
    sentimentDonut: { enabled: false, data: [] },
    actionTimeline: { enabled: false, data: [] },
    insights: null
  };
}

function sanitizeChartData(charts: any) {
  const sanitized = { ...charts };

  // Validate stakeholder quadrant
  if (sanitized.stakeholderQuadrant?.enabled) {
    sanitized.stakeholderQuadrant.data = (sanitized.stakeholderQuadrant.data || [])
      .filter((d: any) => d.id && typeof d.x === 'number' && typeof d.y === 'number')
      .map((d: any) => ({
        ...d,
        x: Math.max(-5, Math.min(5, d.x)),
        y: Math.max(1, Math.min(5, d.y))
      }));
    if (sanitized.stakeholderQuadrant.data.length < 2) {
      sanitized.stakeholderQuadrant.enabled = false;
    }
  }

  // Validate risk radar
  if (sanitized.riskRadar?.enabled) {
    sanitized.riskRadar.data = (sanitized.riskRadar.data || [])
      .filter((d: any) => d.metric && typeof d.value === 'number')
      .map((d: any) => ({
        ...d,
        value: Math.max(0, Math.min(100, d.value))
      }));
    if (sanitized.riskRadar.data.length < 3) {
      sanitized.riskRadar.enabled = false;
    }
  }

  // Validate sentiment donut
  if (sanitized.sentimentDonut?.enabled) {
    sanitized.sentimentDonut.data = (sanitized.sentimentDonut.data || [])
      .filter((d: any) => d.id && typeof d.value === 'number' && d.value > 0);
    if (sanitized.sentimentDonut.data.length < 2) {
      sanitized.sentimentDonut.enabled = false;
    }
  }

  // Validate action timeline
  if (sanitized.actionTimeline?.enabled) {
    sanitized.actionTimeline.data = (sanitized.actionTimeline.data || [])
      .filter((d: any) => d.priority && typeof d.count === 'number' && d.count > 0);
    if (sanitized.actionTimeline.data.length < 2) {
      sanitized.actionTimeline.enabled = false;
    }
  }

  return sanitized;
}
