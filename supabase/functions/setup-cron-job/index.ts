
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
    // Test database connection to ensure everything is working
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

    // Get tomorrow's date at 10:00 PM for initial run
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(22, 0, 0, 0);
    
    // Format date for display
    const formattedTomorrow = tomorrow.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    // Create cron expression for every Tuesday at 10:00 PM
    const cronExpression = "0 22 * * 2"; // At 22:00 on Tuesday

    return new Response(
      JSON.stringify({
        success: true,
        message: "Newsletter scheduling information prepared.",
        initialRun: {
          scheduledTime: formattedTomorrow,
          timestamp: tomorrow.toISOString()
        },
        recurringSchedule: {
          description: "Every Tuesday at 10:00 PM",
          cronExpression: cronExpression
        },
        setupInstructions: {
          github: "Set up a GitHub Action with cron: '0 22 * * 2' (Note: GitHub Actions uses UTC time)",
          aws: "Create an AWS EventBridge rule or Lambda with cron(0 22 ? * TUE *)",
          cron: "0 22 * * 2 curl -X POST https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/send-latest-newsletter",
        },
        endpoint: `${supabaseUrl}/functions/v1/send-latest-newsletter`,
        note: "Due to Supabase free tier limitations, please use an external scheduler service. For the first run, schedule a one-time execution for tomorrow at 10:00 PM."
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
