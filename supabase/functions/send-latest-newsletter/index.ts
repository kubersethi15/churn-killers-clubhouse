import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { formatContentForEmail } from "./formatUtils.ts";
import { generateNewsletterEmailTemplate, replacePlaceholders } from "./emailTemplate.ts";
import { sendNewsletterBatch, sendTestNewsletter, filterValidEmails } from "./emailSender.ts";

// Initialize Supabase client (service role for DB operations)
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-version, x-cron-key",
};

/**
 * Verify the caller is either an admin user (JWT) or the internal cron job (x-cron-key).
 */
async function verifyAuthorization(req: Request): Promise<{ authorized: boolean; error?: string; statusCode?: number }> {
  // Check for cron key first (internal cron calls)
  const cronKey = req.headers.get('x-cron-key');
  if (cronKey) {
    const { data, error } = await supabase
      .from('internal_config')
      .select('value')
      .eq('key', 'cron_api_key')
      .single();

    if (!error && data?.value === cronKey) {
      console.log("Authorized via cron key");
      return { authorized: true };
    }
    console.warn("Invalid cron key provided");
  }

  // Check for admin JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, error: 'Authentication required', statusCode: 401 };
  }

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    anonKey!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return { authorized: false, error: 'Invalid token', statusCode: 401 };
  }

  const userId = claimsData.claims.sub;
  const { data: hasAdminRole } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });

  if (!hasAdminRole) {
    return { authorized: false, error: 'Admin access required', statusCode: 403 };
  }

  console.log("Authorized via admin JWT");
  return { authorized: true };
}

const handler = async (req: Request): Promise<Response> => {
  const triggerTime = new Date().toISOString();
  console.log(`Send latest newsletter function triggered at ${triggerTime}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify authorization
  const auth = await verifyAuthorization(req);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ error: auth.error }),
      { status: auth.statusCode || 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Check if this is a test email request
    let testEmailAddress: string | null = null;
    let batchSize = 20;
    let requestBody = {};
    
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
        if (requestBody && typeof requestBody === 'object') {
          if ('testEmail' in requestBody) {
            testEmailAddress = requestBody.testEmail as string;
            console.log(`Test email requested for: ${testEmailAddress}`);
          }
          if ('batchSize' in requestBody) {
            batchSize = Math.min(40, Number(requestBody.batchSize) || 40);
          }
        }
      }
    } catch (e) {
      console.log("No request body provided - treating as regular newsletter sending");
    }

    // 1. Fetch the latest newsletter
    console.log("Fetching latest newsletter");
    const { data: latestNewsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("*")
      .lte("published_date", new Date().toISOString())
      .order("published_date", { ascending: false })
      .limit(1)
      .single();

    if (newsletterError) {
      console.error("Error fetching latest newsletter:", newsletterError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch latest newsletter", details: newsletterError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!latestNewsletter) {
      return new Response(
        JSON.stringify({ error: "No newsletters found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Latest newsletter found: "${latestNewsletter.title}" (ID: ${latestNewsletter.id})`);

    // Helper: format newsletter content for email
    const formatNewsletterContent = (newsletter: typeof latestNewsletter) => {
      const formattedDate = new Date(newsletter.published_date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      let fullContent = newsletter.content || '';
      const normalizedTitle = (newsletter.title || '').trim().toLowerCase();
      const firstLine = fullContent.split(/\r?\n/)[0].trim().replace(/^[#\s]*/, '').replace(/\*\*/g, '').toLowerCase();
      if (firstLine === normalizedTitle) {
        fullContent = fullContent.split(/\r?\n/).slice(1).join('\n').trimStart();
      }
      fullContent = fullContent.replace(/\r\n/g, '\n');
      const mainContent = formatContentForEmail(fullContent);

      return { formattedDate, mainContent };
    };

    // If this is a test email, send it directly
    if (testEmailAddress) {
      const { formattedDate, mainContent } = formatNewsletterContent(latestNewsletter);
      const emailTemplate = generateNewsletterEmailTemplate(
        latestNewsletter.title, formattedDate, latestNewsletter.read_time,
        '', mainContent, latestNewsletter.slug, latestNewsletter.category
      );
      const customizedEmail = replacePlaceholders(emailTemplate, { email: testEmailAddress });
      
      try {
        await sendTestNewsletter(testEmailAddress, latestNewsletter.title, customizedEmail);
        return new Response(
          JSON.stringify({ success: true, message: `Test newsletter sent to ${testEmailAddress}`, newsletterTitle: latestNewsletter.title, timestamp: triggerTime }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (sendError) {
        console.error("Error sending test email:", sendError);
        return new Response(
          JSON.stringify({ error: "Failed to send test email", details: sendError.message || sendError, timestamp: triggerTime }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // 2. Fetch all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email")
      .eq("subscribed", true);

    if (subscribersError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers", details: subscribersError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subscribers.length) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found", timestamp: triggerTime }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${subscribers.length} active subscribers`);

    // 3. Format and send
    const { formattedDate, mainContent } = formatNewsletterContent(latestNewsletter);
    const emailTemplate = generateNewsletterEmailTemplate(
      latestNewsletter.title, formattedDate, latestNewsletter.read_time,
      '', mainContent, latestNewsletter.slug, latestNewsletter.category
    );

    const batches = [];
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const [batchIndex, batch] of batches.entries()) {
      const emailAddresses = batch.map(subscriber => subscriber.email);
      try {
        const customizedEmail = replacePlaceholders(emailTemplate, { email: batch[0].email });
        await sendNewsletterBatch(emailAddresses, latestNewsletter.title, customizedEmail, batchIndex);
        successCount += batch.length;
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error sending batch ${batchIndex + 1}:`, error);
        failureCount += batch.length;
        errors.push(error.message || "Unknown error");
      }
    }

    console.log(`Newsletter sending complete. Success: ${successCount}, Failures: ${failureCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter "${latestNewsletter.title}" sent to ${successCount} subscribers`,
        failureCount,
        errors: errors.length ? errors : null,
        startTime: triggerTime,
        endTime: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Unexpected error in send-latest-newsletter function:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        timestamp: triggerTime
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
