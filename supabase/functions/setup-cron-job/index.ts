
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

    // Schedule tonight's job for 11:00 PM
    // Get today's date at 11:00 PM
    const tonight = new Date();
    tonight.setHours(23, 0, 0, 0); // Set to 11:00 PM tonight
    
    // If it's already past 11 PM, schedule for tomorrow at 11 PM
    const now = new Date();
    if (now.getHours() >= 23) {
      tonight.setDate(tonight.getDate() + 1); // Schedule for tomorrow instead
    }
    
    // Format time for cron expression (minutes hours day month day-of-week)
    const hours = 23; // 11 PM
    const minutes = 0;  // 0 minutes
    const day = tonight.getDate();
    const month = tonight.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Nightly once-off cron expression for 11:00 PM
    const tonightCronExpression = `${minutes} ${hours} ${day} ${month} *`;
    
    console.log(`Scheduling one-time job for tonight at 11:00 PM (${tonightCronExpression})`);
    
    // Schedule the one-time job for tonight at 11:00 PM
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

    // Schedule the weekly newsletter for Tuesday at 11:00 PM AEST (which is 1:00 PM UTC)
    // Note: AEST is UTC+10, so 11:00 PM AEST is 1:00 PM UTC
    const { error: scheduleWeeklyError } = await supabase.rpc('setup_newsletter_weekly_11pm');
    
    if (scheduleWeeklyError) {
      console.error("Error setting up weekly cron job:", scheduleWeeklyError);
      // Create the weekly function if it doesn't exist
      try {
        await supabase.rpc('create_weekly_11pm_function');
        // Try again
        const { error: retryWeeklyError } = await supabase.rpc('setup_newsletter_weekly_11pm');
        if (retryWeeklyError) {
          console.error("Error setting up weekly cron job on retry:", retryWeeklyError);
        }
      } catch (createError) {
        console.error("Error creating weekly function:", createError);
      }
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

    // Get next Tuesday at 11:00 PM AEST for the weekly schedule
    const nextTuesday = new Date();
    nextTuesday.setDate(nextTuesday.getDate() + (2 + 7 - nextTuesday.getDay()) % 7); // Get next Tuesday
    nextTuesday.setHours(23, 0, 0, 0); // Set to 11:00 PM
    
    // If today is Tuesday and it's before 11 PM, use today
    if (new Date().getDay() === 2 && new Date().getHours() < 23) {
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
        message: "Newsletter scheduling successfully set up with Supabase pg_cron for 11:00 PM!",
        immediateSchedule: {
          description: "Tonight's one-time run at 11:00 PM",
          scheduledTime: formattedTonight,
          timestamp: tonight.toISOString(),
          cronExpression: tonightCronExpression
        },
        recurringSchedule: {
          description: "Every Tuesday at 11:00 PM AEST",
          cronExpression: "0 13 * * 2", // At 13:00 UTC on Tuesday (11:00 PM AEST)
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
