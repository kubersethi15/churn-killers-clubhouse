
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

    // Execute raw SQL to setup everything directly
    console.log("Setting up cron job with direct SQL...");
    
    const setupSQL = `
      -- Enable extensions
      CREATE EXTENSION IF NOT EXISTS pg_cron;
      CREATE EXTENSION IF NOT EXISTS pg_net;
      
      -- Drop existing jobs first
      SELECT cron.unschedule('send-latest-newsletter-weekly') WHERE EXISTS (
        SELECT 1 FROM cron.job WHERE jobname = 'send-latest-newsletter-weekly'
      );
      
      -- Create the new weekly job (Tuesday at 13:00 UTC = 11:00 PM AEST)
      SELECT cron.schedule(
        'send-latest-newsletter-weekly',
        '0 13 * * 2',
        'SELECT net.http_post(
          url:=''https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/send-latest-newsletter'',
          headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d3hlbWx4emJuYWRra3J2b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQ1NTM0MCwiZXhwIjoyMDYzMDMxMzQwfQ.vFNEGPJBpXJNWGVhMnWwxFxMDEiWQ9PWKrHaQK6HgW0\"}''::jsonb,
          body:=''{\"scheduled\": true}''::jsonb
        );'
      );
    `;

    // Execute the SQL directly
    const { error: sqlError } = await supabase.rpc('sql', { query: setupSQL });
    
    if (sqlError) {
      console.error("SQL execution failed:", sqlError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to setup cron job", 
          details: sqlError,
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
