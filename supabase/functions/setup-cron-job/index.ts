
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

const handler = async (req: Request): Promise<Response> => {
  console.log("Setup cron job function triggered", new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Setting up weekly newsletter cron job directly...");

    // Directly setup the cron job without trying to enable extensions
    // (extensions should already be available in Supabase)
    const { data, error } = await supabase.rpc('setup_newsletter_weekly_11pm');

    if (error) {
      console.error("Error setting up cron job:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to setup cron job", 
          details: error,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Cron job setup completed successfully");

    // Calculate next Tuesday at 11:00 PM AEST for display
    const nextTuesday = new Date();
    const daysUntilTuesday = (2 + 7 - nextTuesday.getDay()) % 7;
    nextTuesday.setDate(nextTuesday.getDate() + (daysUntilTuesday || 7));
    nextTuesday.setHours(23, 0, 0, 0);
    
    // If today is Tuesday and it's before 11 PM, use today
    const now = new Date();
    if (now.getDay() === 2 && now.getHours() < 23) {
      nextTuesday.setDate(now.getDate());
    }
    
    const formattedNextTuesday = nextTuesday.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Australia/Sydney'
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Newsletter cron job successfully configured for weekly delivery at 11:00 PM AEST!",
        recurringSchedule: {
          description: "Every Tuesday at 11:00 PM AEST (1:00 PM UTC)",
          cronExpression: "0 13 * * 2",
          nextScheduledRun: formattedNextTuesday
        },
        endpoint: `${supabaseUrl}/functions/v1/send-latest-newsletter`,
        timestamp: new Date().toISOString()
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
        error: "Unexpected error occurred",
        message: error.message || "Unknown error",
        stack: error.stack,
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
