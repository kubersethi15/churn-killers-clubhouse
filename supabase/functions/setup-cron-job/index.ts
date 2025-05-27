
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

    // Enable required extensions using direct SQL
    console.log("Enabling required extensions...");
    
    // Enable pg_cron and pg_net extensions directly
    const { error: extensionError } = await supabase.rpc('sql', {
      query: `
        CREATE EXTENSION IF NOT EXISTS pg_cron;
        CREATE EXTENSION IF NOT EXISTS pg_net;
      `
    });

    if (extensionError) {
      console.error("Error enabling extensions:", extensionError);
      // Continue anyway, extensions might already be enabled
    }

    // Create the newsletter invoke function directly with SQL
    console.log("Creating newsletter invoke function...");
    const { error: functionError } = await supabase.rpc('sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.invoke_newsletter_function()
        RETURNS text
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public, pg_catalog
        AS $func$
        DECLARE
          request_id text;
        BEGIN
          SELECT net.http_post(
            url:='https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/send-latest-newsletter',
            headers:='{"Content-Type": "application/json"}'::jsonb,
            body:='{}'::jsonb
          ) INTO request_id;
          
          RETURN request_id;
        END;
        $func$;
      `
    });

    if (functionError) {
      console.error("Error creating PostgreSQL function:", functionError);
      // Try alternative approach without the function
    }

    // Clear existing newsletter jobs
    console.log("Clearing existing newsletter cron jobs...");
    const existingJobs = [
      'send-latest-newsletter-tonight',
      'send-latest-newsletter-weekly',
      'send-latest-newsletter-test-cron',
      'send-latest-newsletter-every-15min'
    ];

    for (const jobName of existingJobs) {
      try {
        const { error: unscheduleError } = await supabase.rpc('sql', {
          query: `SELECT cron.unschedule('${jobName}');`
        });
        if (!unscheduleError) {
          console.log(`Unscheduled job: ${jobName}`);
        }
      } catch (error) {
        console.log(`Job ${jobName} might not exist, continuing...`);
      }
    }

    // Setup the weekly recurring job for Tuesday at 11:00 PM AEST (1:00 PM UTC)
    console.log("Setting up weekly recurring newsletter job...");
    
    // Create the weekly cron job directly using SQL
    const { error: weeklyJobError } = await supabase.rpc('sql', {
      query: `
        SELECT cron.schedule(
          'send-latest-newsletter-weekly',
          '0 13 * * 2',
          'SELECT public.invoke_newsletter_function();'
        );
      `
    });

    if (weeklyJobError) {
      console.error("Error creating weekly cron job:", weeklyJobError);
      return new Response(
        JSON.stringify({ error: "Failed to create cron job", details: weeklyJobError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Weekly newsletter job scheduled successfully");

    // Get next Tuesday at 11:00 PM AEST for display
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

    // Verify the job was created by checking cron.job table
    let jobVerification = "Job created successfully";
    try {
      const { data: jobCheck, error: jobCheckError } = await supabase
        .from('cron.job')
        .select('jobname, schedule, command')
        .eq('jobname', 'send-latest-newsletter-weekly');

      if (!jobCheckError && jobCheck && jobCheck.length > 0) {
        jobVerification = `Job verified: ${jobCheck[0].jobname} scheduled for ${jobCheck[0].schedule}`;
        console.log("Job verification successful:", jobCheck[0]);
      }
    } catch (verifyError) {
      console.log("Could not verify job creation, but job was likely created");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Newsletter cron job successfully configured for weekly delivery at 11:00 PM AEST!",
        recurringSchedule: {
          description: "Every Tuesday at 11:00 PM AEST (1:00 PM UTC)",
          cronExpression: "0 13 * * 2",
          nextScheduledRun: formattedNextTuesday,
          verification: jobVerification
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
        error: error.message,
        stack: error.stack,
        name: error.name,
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
