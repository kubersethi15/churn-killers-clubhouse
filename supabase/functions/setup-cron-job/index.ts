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

    // Get today's date
    const now = new Date();
    const tonight = new Date();
    tonight.setHours(23, 0, 0, 0); // Set to 11:00 PM today
    
    // Format time for cron expression (minutes hours * * *)
    // We're assuming it's still possible to schedule for today
    // Otherwise, this will schedule for 11:00 PM tomorrow
    const hours = tonight.getHours();
    const minutes = tonight.getMinutes();
    
    // One-time cron job for tonight at 11:00 PM
    const tonightCronExpression = `${minutes} ${hours} ${tonight.getDate()} ${tonight.getMonth() + 1} *`;
    
    // Schedule the one-time cron job to run the edge function tonight at 11:00 PM
    const { error: scheduleTonightError } = await supabase.rpc('setup_newsletter_once', {
      job_name: 'send-latest-newsletter-tonight',
      cron_schedule: tonightCronExpression
    });
    
    if (scheduleTonightError) {
      console.error("Error setting up one-time cron job:", scheduleTonightError);
      return new Response(
        JSON.stringify({ error: "Failed to set up one-time cron job", details: scheduleTonightError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Also set up the weekly schedule for future newsletters
    // Convert 10:00 PM AEST on Tuesday to cron expression
    // Note: AEST is UTC+10, so 10:00 PM AEST is 12:00 PM UTC (noon)
    const weeklyCronExpression = "0 12 * * 2"; // At 12:00 UTC on Tuesday (10:00 PM AEST)
    
    // Schedule the weekly cron job
    const { error: scheduleWeeklyError } = await supabase.rpc('setup_newsletter_cron_job');
    if (scheduleWeeklyError) {
      console.error("Error setting up weekly cron job:", scheduleWeeklyError);
      return new Response(
        JSON.stringify({ error: "Failed to set up weekly cron job", details: scheduleWeeklyError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Unschedule the test job if it exists
    const { error: unscheduleError } = await supabase.rpc('unschedule_job', {
      job_name: 'send-latest-newsletter-test-cron'
    });
    
    if (unscheduleError) {
      console.error("Warning: Could not unschedule test job:", unscheduleError);
      // Continue since this is not critical
    }
    
    // Format tonight's date for display
    const formattedTonight = tonight.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Australia/Sydney'
    });

    // Get next Tuesday at 10:00 PM AEST for the weekly schedule
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
      timeZone: 'Australia/Sydney'
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Newsletter scheduling successfully set up with Supabase pg_cron!",
        immediateSchedule: {
          description: "Tonight's one-time run",
          scheduledTime: formattedTonight,
          timestamp: tonight.toISOString()
        },
        recurringSchedule: {
          description: "Every Tuesday at 10:00 PM AEST",
          cronExpression: weeklyCronExpression,
          nextScheduledRun: formattedNextTuesday
        },
        removedSchedule: {
          description: "Testing cron job (every 15 minutes) has been removed"
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
