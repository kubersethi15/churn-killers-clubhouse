
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
  console.log("Setup cron job function triggered", new Date().toISOString());
  
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

    // Unschedule existing jobs to avoid duplicates
    const { error: unscheduleNightlyError } = await supabase.rpc('unschedule_job', {
      job_name: 'send-latest-newsletter-tonight'
    });
    
    if (unscheduleNightlyError) {
      console.log("Warning: Could not unschedule tonight's job (might not exist yet):", unscheduleNightlyError);
      // Continue since this is not critical
    }
    
    const { error: unscheduleWeeklyError } = await supabase.rpc('unschedule_job', {
      job_name: 'send-latest-newsletter-weekly'
    });
    
    if (unscheduleWeeklyError) {
      console.log("Warning: Could not unschedule weekly job (might not exist yet):", unscheduleWeeklyError);
      // Continue since this is not critical
    }

    // Create a PostgreSQL function to directly invoke the edge function
    const { error: createFunctionError } = await supabase.rpc('create_newsletter_invoke_function');
    
    if (createFunctionError) {
      console.error("Error creating PostgreSQL function to invoke edge function:", createFunctionError);
      return new Response(
        JSON.stringify({ error: "Failed to create PostgreSQL function", details: createFunctionError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Schedule tonight's job for 11:00 PM (should be same day)
    // Get today's date at 11:00 PM
    const tonight = new Date();
    tonight.setHours(23, 0, 0, 0); // Set to 11:00 PM tonight
    
    // Add 5 minutes to current time if it's past 11 PM already
    const now = new Date();
    if (now.getHours() >= 23) {
      tonight.setDate(tonight.getDate() + 1); // Schedule for tomorrow instead
    }
    
    // Format time for cron expression (minutes hours day month day-of-week)
    const hours = tonight.getHours();
    const minutes = tonight.getMinutes();
    const day = tonight.getDate();
    const month = tonight.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Nightly once-off cron expression
    const tonightCronExpression = `${minutes} ${hours} ${day} ${month} *`;
    
    console.log(`Scheduling one-time job for tonight at ${hours}:${minutes} (${tonightCronExpression})`);
    
    // Schedule the one-time job for tonight
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

    // Schedule the weekly newsletter for Tuesday at 10:00 PM AEST (12:00 PM UTC)
    // Note: AEST is UTC+10, so 10:00 PM AEST is 12:00 PM UTC (noon)
    const { error: scheduleWeeklyError } = await supabase.rpc('setup_newsletter_weekly');
    
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
    const { error: unscheduleTestError } = await supabase.rpc('unschedule_job', {
      job_name: 'send-latest-newsletter-test-cron'
    });
    
    if (unscheduleTestError) {
      console.log("Warning: Could not unschedule test job (might not exist yet):", unscheduleTestError);
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
    nextTuesday.setDate(nextTuesday.getDate() + (2 + 7 - nextTuesday.getDay()) % 7); // Get next Tuesday
    nextTuesday.setHours(22, 0, 0, 0); // Set to 10:00 PM
    
    // If today is Tuesday and it's before 10 PM, use today
    if (new Date().getDay() === 2 && new Date().getHours() < 22) {
      nextTuesday.setDate(new Date().getDate());
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

    // Return success information
    return new Response(
      JSON.stringify({
        success: true,
        message: "Newsletter scheduling successfully set up with Supabase pg_cron!",
        immediateSchedule: {
          description: "Tonight's one-time run",
          scheduledTime: formattedTonight,
          timestamp: tonight.toISOString(),
          cronExpression: tonightCronExpression
        },
        recurringSchedule: {
          description: "Every Tuesday at 10:00 PM AEST",
          cronExpression: "0 12 * * 2", // At 12:00 UTC on Tuesday
          nextScheduledRun: formattedNextTuesday
        },
        removedSchedule: {
          description: "Testing cron job has been removed"
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
