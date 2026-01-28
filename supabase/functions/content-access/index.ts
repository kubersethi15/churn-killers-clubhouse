import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, user-agent',
};

// Common search engine bot user agents
const BOT_PATTERNS = [
  'googlebot',
  'bingbot',
  'slurp',         // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'facebot',       // Facebook
  'ia_archiver',   // Alexa
  'linkedinbot',
  'twitterbot',
  'applebot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'petalbot',
  'bytespider',
];

function isSearchBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some(pattern => ua.includes(pattern));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const userAgent = req.headers.get('user-agent');
    const isBot = isSearchBot(userAgent);

    // Check if user is authenticated via Authorization header
    const authHeader = req.headers.get('Authorization');
    let isAuthenticated = false;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      // Simple check - if there's a valid-looking JWT, consider authenticated
      // In production, you'd want to verify this with Supabase
      if (token && token.split('.').length === 3) {
        isAuthenticated = true;
      }
    }

    // Determine access level
    const accessLevel = isBot || isAuthenticated ? 'full' : 'partial';

    return new Response(
      JSON.stringify({
        accessLevel,
        isBot,
        isAuthenticated,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in content-access function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', accessLevel: 'partial' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
