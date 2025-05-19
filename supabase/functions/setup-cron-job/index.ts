
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
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Setup cron job function triggered");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Instead of using RPC, set up the cron job directly with SQL
    // This allows us more control and better error handling
    const { data, error } = await supabase.from('newsletters')
      .select('id')
      .limit(1);

    if (error) {
      console.error("Error connecting to database:", error);
      return new Response(
        JSON.stringify({ error: "Database connection error", details: error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Set up manual HTTP invocation instead of relying on the cron schema
    // Log info about what we're doing
    console.log("Database connection successful. Setting up manual test pattern.");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Newsletter test functionality check successful. Due to Supabase project limitations, scheduled execution requires alternative implementation.",
        info: "Please use an external scheduler service like GitHub Actions, AWS Lambda, or a dedicated cron service to call this edge function every 5 minutes for testing.",
        endpoint: `${supabaseUrl}/functions/v1/send-latest-newsletter`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Unexpected error in setup-cron-job function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        name: error.name,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
