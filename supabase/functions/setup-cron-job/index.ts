
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

    // Set up the Supabase pg_cron functionality
    // First, enable the pg_cron extension (if not already enabled)
    const { error: enableExtError } = await supabase.rpc('enable_pg_cron');
    if (enableExtError) {
      console.error("Error enabling pg_cron extension:", enableExtError);
      return new Response(
        JSON.stringify({ error: "Failed to enable pg_cron extension", details: enableExtError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Convert 10:00 PM AEST on Tuesday to cron expression
    // Note: AEST is UTC+10, so 10:00 PM AEST is 12:00 PM UTC (noon)
    const cronExpression = "0 12 * * 2"; // At 12:00 UTC on Tuesday (10:00 PM AEST)
    
    // Schedule the cron job to run the edge function
    const { error: scheduleCronError } = await supabase.rpc('setup_newsletter_cron_job');
    if (scheduleCronError) {
      console.error("Error setting up cron job:", scheduleCronError);
      return new Response(
        JSON.stringify({ error: "Failed to set up cron job", details: scheduleCronError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get next Tuesday at 10:00 PM AEST
    const now = new Date();
    const nextTuesday = new Date();
    nextTuesday.setDate(now.getDate() + (2 + 7 - now.getDay()) % 7); // Get next Tuesday
    nextTuesday.setHours(22, 0, 0, 0); // Set to 10:00 PM
    
    // If today is Tuesday and it's before 10 PM, use today
    if (now.getDay() === 2 && now.getHours() < 22) {
      nextTuesday.setDate(now.getDate());
    }
    
    // Format date for display
    const formattedNextTuesday = nextTuesday.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Australia/Sydney' // Use AEST timezone
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Newsletter scheduling successfully set up with Supabase pg_cron!",
        nextScheduledRun: {
          scheduledTime: formattedNextTuesday,
          timestamp: nextTuesday.toISOString()
        },
        recurringSchedule: {
          description: "Every Tuesday at 10:00 PM AEST",
          cronExpression: cronExpression
        },
        endpoint: `${supabaseUrl}/functions/v1/send-latest-newsletter`
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
