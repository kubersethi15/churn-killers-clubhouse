import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { formatContentForEmail } from "./formatUtils.ts";
import { generateNewsletterEmailTemplate, replacePlaceholders } from "./emailTemplate.ts";
import { sendNewsletterBatch, sendTestNewsletter } from "./emailSender.ts";

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
};

const handler = async (req: Request): Promise<Response> => {
  const triggerTime = new Date().toISOString();
  console.log(`Send latest newsletter function triggered at ${triggerTime}`);
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if this is a test email request
    let testEmailAddress: string | null = null;
    let batchSize = 40; // Default batch size reduced from 50 to avoid Resend limits
    let requestBody = {};
    
    try {
      const bodyText = await req.text();
      console.log("Raw request body:", bodyText);
      
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
        console.log("Parsed request body:", requestBody);
        
        if (requestBody && typeof requestBody === 'object') {
          if ('testEmail' in requestBody) {
            testEmailAddress = requestBody.testEmail as string;
            console.log(`Test email requested for: ${testEmailAddress}`);
          }
          if ('batchSize' in requestBody) {
            batchSize = Math.min(40, Number(requestBody.batchSize) || 40); // Cap at 40 max
            console.log(`Custom batch size: ${batchSize}`);
          }
        }
      } else {
        console.log("No request body provided - treating as regular newsletter sending");
      }
    } catch (e) {
      console.error("Error parsing request body:", e);
      // Request has no body or invalid JSON, proceed normally
    }

    // 1. Fetch the latest newsletter
    console.log("Fetching latest newsletter");
    const { data: latestNewsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("*")
      .order("published_date", { ascending: false })
      .limit(1)
      .single();

    if (newsletterError) {
      console.error("Error fetching latest newsletter:", newsletterError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch latest newsletter", details: newsletterError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!latestNewsletter) {
      console.error("No newsletters found");
      return new Response(
        JSON.stringify({ error: "No newsletters found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Latest newsletter found: "${latestNewsletter.title}" (ID: ${latestNewsletter.id})`);

    // If this is a test email, send it directly without fetching all subscribers
    if (testEmailAddress) {
      console.log("Processing test email request");
      // Format the newsletter for email
      const formattedDate = new Date(latestNewsletter.published_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Format the content for email
      let fullContent = latestNewsletter.content || '';
      // Remove duplicated leading heading if it matches the title (handle common cases)
      const normalizedTitle = (latestNewsletter.title || '').trim().toLowerCase();
      const firstLine = fullContent.split(/\r?\n/)[0].trim().replace(/^[#\s]*/, '').replace(/\*\*/g, '').toLowerCase();
      if (firstLine === normalizedTitle) {
        fullContent = fullContent.split(/\r?\n/).slice(1).join('\n').trimStart();
      }
      // Normalize line endings before processing and render FULL content like website
      fullContent = fullContent.replace(/\r\n/g, '\n');
      const mainContent = formatContentForEmail(fullContent);

      // Create email template
      const emailTemplate = generateNewsletterEmailTemplate(
        latestNewsletter.title,
        formattedDate,
        latestNewsletter.read_time,
        '', // intro removed; we render full content
        mainContent,
        latestNewsletter.slug,
        latestNewsletter.category
      );

      // Customize the email
      const customizedEmail = replacePlaceholders(emailTemplate, {
        email: testEmailAddress
      });
      
      // Send the test email
      console.log("Sending test email to:", testEmailAddress);
      try {
        const result = await sendTestNewsletter(
          testEmailAddress, 
          latestNewsletter.title, 
          customizedEmail
        );
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `Test newsletter sent to ${testEmailAddress}`,
            newsletterTitle: latestNewsletter.title,
            timestamp: triggerTime
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } catch (sendError) {
        console.error("Error sending test email:", sendError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to send test email", 
            details: sendError.message || sendError,
            timestamp: triggerTime
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // 2. Fetch all active subscribers
    console.log("Fetching active subscribers");
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email")
      .eq("subscribed", true);

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers", details: subscribersError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!subscribers.length) {
      console.log("No active subscribers found");
      return new Response(
        JSON.stringify({ 
          message: "No active subscribers found",
          timestamp: triggerTime
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${subscribers.length} active subscribers`);

    // 3. Format the newsletter for email
    console.log("Formatting newsletter content for email");
    const formattedDate = new Date(latestNewsletter.published_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format the content for email
    let fullContent = latestNewsletter.content || '';
    // Remove duplicated leading heading if it matches the title
    const normalizedTitle2 = (latestNewsletter.title || '').trim().toLowerCase();
    const firstLine2 = fullContent.split(/\r?\n/)[0].trim().replace(/^[#\s]*/, '').replace(/\*\*/g, '').toLowerCase();
    if (firstLine2 === normalizedTitle2) {
      fullContent = fullContent.split(/\r?\n/).slice(1).join('\n').trimStart();
    }
    fullContent = fullContent.replace(/\r\n/g, '\n');
    const mainContent = formatContentForEmail(fullContent);

    // Create email template
    const emailTemplate = generateNewsletterEmailTemplate(
      latestNewsletter.title,
      formattedDate,
      latestNewsletter.read_time,
      '',
      mainContent,
      latestNewsletter.slug,
      latestNewsletter.category
    );

    // Group sending into batches to avoid rate limits
    const batches = [];
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    console.log(`Sending newsletter in ${batches.length} batches`);

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    // 4. Send newsletter to each batch of subscribers
    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing batch ${batchIndex + 1} of ${batches.length} with ${batch.length} subscribers`);
      
      // Create array of email addresses for this batch
      const emailAddresses = batch.map(subscriber => subscriber.email);
      
      try {
        // Customize the email for this batch
        const customizedEmail = replacePlaceholders(emailTemplate, {
          email: batch[0].email // Use first email for unsubscribe link
        });
        
        // Send the email batch
        console.log(`Sending batch ${batchIndex + 1} with ${emailAddresses.length} recipients`);
        await sendNewsletterBatch(
          emailAddresses, 
          latestNewsletter.title, 
          customizedEmail, 
          batchIndex
        );
        
        successCount += batch.length;
        console.log(`Batch ${batchIndex + 1} sent successfully. Running total: ${successCount} emails sent`);
        
        // Add a small delay between batches to avoid rate limits
        if (batchIndex < batches.length - 1) {
          console.log(`Adding delay before next batch`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error sending batch ${batchIndex + 1}:`, error);
        failureCount += batch.length;
        errors.push(error.message || "Unknown error");
      }
    }

    console.log(`Newsletter sending complete at ${new Date().toISOString()}. Success: ${successCount}, Failures: ${failureCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter "${latestNewsletter.title}" sent to ${successCount} subscribers`,
        failureCount,
        errors: errors.length ? errors : null,
        startTime: triggerTime,
        endTime: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Unexpected error in send-latest-newsletter function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        name: error.name,
        timestamp: triggerTime
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
