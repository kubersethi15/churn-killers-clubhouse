import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": 
    "authorization, x-client-info, apikey, content-type, x-app-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

async function verifyAdmin(req: Request): Promise<{ authorized: boolean; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, error: 'Authentication required' };
  }

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    anonKey!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabaseClient.auth.getClaims(token);
  if (error || !data?.claims) {
    return { authorized: false, error: 'Invalid token' };
  }

  const userId = data.claims.sub;
  const { data: hasAdminRole } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });

  if (!hasAdminRole) {
    return { authorized: false, error: 'Admin access required' };
  }

  return { authorized: true };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Setup cron job function triggered", new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify admin authentication
  const auth = await verifyAdmin(req);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ error: auth.error }),
      { status: auth.error === 'Admin access required' ? 403 : 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Check if this is an unschedule request
    let shouldUnschedule = false;
    
    try {
      const bodyText = await req.text();
      if (bodyText) {
        const requestBody = JSON.parse(bodyText);
        shouldUnschedule = requestBody?.action === 'unschedule';
      }
    } catch (e) {
      console.log("No valid request body, treating as schedule request");
    }

    if (shouldUnschedule) {
      console.log("Unscheduling cron job...");
      
      const { error } = await supabase.rpc('unschedule_job', {
        job_name: 'send-latest-newsletter-weekly'
      });

      if (error) {
        console.error("Error unscheduling cron job:", error);
        return new Response(
          JSON.stringify({ 
            error: "Failed to unschedule cron job", 
            details: error,
            timestamp: new Date().toISOString()
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Newsletter cron job successfully cancelled",
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Subscriber email automation is disabled. Churn Is Dead publishes to the website and uses manually reviewed LinkedIn distribution.",
        timestamp: new Date().toISOString()
      }),
      {
        status: 409,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Unexpected error in setup-cron-job function:", error);
    return new Response(
      JSON.stringify({
        error: "Unexpected error occurred",
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
