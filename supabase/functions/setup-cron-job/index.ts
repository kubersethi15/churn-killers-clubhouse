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

async function verifyAdmin(req: Request): Promise<{ authorized: boolean; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, error: 'Authentication required' };
  }

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    anonKey!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabaseClient.auth.getClaims(token);
  if (error || !data?.claims) {
    return { authorized: false, error: 'Invalid token' };
  }

  const userId = data.claims.sub;
  const { data: hasAdminRole } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });

  if (!hasAdminRole) {
    return { authorized: false, error: 'Admin access required' };
  }

  return { authorized: true };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Setup cron job function triggered", new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify admin authentication
  const auth = await verifyAdmin(req);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ error: auth.error }),
      { status: auth.error === 'Admin access required' ? 403 : 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Check if this is an unschedule request
    let shouldUnschedule = false;
    
    try {
      const bodyText = await req.text();
      if (bodyText) {
        const requestBody = JSON.parse(bodyText);
        shouldUnschedule = requestBody?.action === 'unschedule';
      }
    } catch (e) {
      console.log("No valid request body, treating as schedule request");
    }

    if (shouldUnschedule) {
      console.log("Unscheduling cron job...");
      
      const { error } = await supabase.rpc('unschedule_job', {
        job_name: 'send-latest-newsletter-weekly'
      });

      if (error) {
        console.error("Error unscheduling cron job:", error);
        return new Response(
          JSON.stringify({ 
            error: "Failed to unschedule cron job", 
            details: error,
            timestamp: new Date().toISOString()
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Newsletter cron job successfully cancelled",
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Checking cron job status...");

    // Check if the cron job already exists
    const { data: jobs, error: jobsError } = await supabase
      .from('cron.job')
      .select('*')
      .eq('jobname', 'send-latest-newsletter-weekly');

    if (jobsError) {
      console.error("Error checking cron jobs:", jobsError);
    }

    const jobExists = jobs && jobs.length > 0;
    
    if (jobExists) {
      console.log("Cron job already exists and is configured");
    } else {
      console.log("Setting up cron job...");
      
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
    }

    console.log("Cron job setup completed successfully");

    // Calculate next Tuesday at 6:00 PM AEST for display
    const nextTuesday = new Date();
    const daysUntilTuesday = (2 + 7 - nextTuesday.getDay()) % 7;
    nextTuesday.setDate(nextTuesday.getDate() + (daysUntilTuesday || 7));
    nextTuesday.setHours(18, 0, 0, 0);
    
    const now = new Date();
    if (now.getDay() === 2 && now.getHours() < 18) {
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
        message: "Newsletter cron job successfully configured for weekly delivery at 6:00 PM AEST!",
        recurringSchedule: {
          description: "Every Tuesday at 6:00 PM AEST (8:00 AM UTC)",
          cronExpression: "0 8 * * 2",
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
