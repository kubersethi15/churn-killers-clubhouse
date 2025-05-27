
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
    // Test database connection first
    console.log("Testing database connection...");
    const { data: testData, error: testError } = await supabase.from('newsletters')
      .select('id')
      .limit(1);

    if (testError) {
      console.error("Database connection failed:", testError);
      return new Response(
        JSON.stringify({ error: "Database connection failed", details: testError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Database connection successful");

    // Enable extensions
    console.log("Enabling pg_cron and pg_net extensions...");
    try {
      const { error: enableError } = await supabase.rpc('enable_pg_cron');
      if (enableError) {
        console.error("Error enabling extensions:", enableError);
      } else {
        console.log("Extensions enabled successfully");
      }
    } catch (e) {
      console.error("Exception enabling extensions:", e);
    }

    // Create the invoke function
    console.log("Creating newsletter invoke function...");
    try {
      const { error: createError } = await supabase.rpc('create_newsletter_invoke_function');
      if (createError) {
        console.error("Error creating invoke function:", createError);
      } else {
        console.log("Invoke function created successfully");
      }
    } catch (e) {
      console.error("Exception creating invoke function:", e);
    }

    // Clear existing jobs
    console.log("Clearing existing newsletter cron jobs...");
    const existingJobs = [
      'send-latest-newsletter-tonight',
      'send-latest-newsletter-weekly', 
      'send-latest-newsletter-test-cron',
      'send-latest-newsletter-every-15min'
    ];

    for (const jobName of existingJobs) {
      try {
        const { error: unscheduleError } = await supabase.rpc('unschedule_job', { job_name: jobName });
        if (!unscheduleError) {
          console.log(`Successfully unscheduled job: ${jobName}`);
        }
      } catch (error) {
        console.log(`Job ${jobName} might not exist or already unscheduled`);
      }
    }

    // Setup the weekly cron job using the database function
    console.log("Setting up weekly newsletter cron job...");
    try {
      const { error: weeklyJobError } = await supabase.rpc('setup_newsletter_weekly_11pm');
      
      if (weeklyJobError) {
        console.error("Error setting up weekly job:", weeklyJobError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to setup weekly cron job", 
            details: weeklyJobError,
            timestamp: new Date().toISOString()
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      console.log("Weekly newsletter job scheduled successfully");

    } catch (setupError) {
      console.error("Exception during cron job setup:", setupError);
      return new Response(
        JSON.stringify({ 
          error: "Exception during cron job setup", 
          details: setupError.message,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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

    console.log("Cron job setup completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Newsletter cron job successfully configured for weekly delivery at 11:00 PM AEST!",
        recurringSchedule: {
          description: "Every Tuesday at 11:00 PM AEST (1:00 PM UTC)",
          cronExpression: "0 13 * * 2",
          nextScheduledRun: formattedNextTuesday
        },
        cleanupInfo: {
          description: "All previous cron jobs have been cleared and recreated",
          clearedJobs: existingJobs
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
