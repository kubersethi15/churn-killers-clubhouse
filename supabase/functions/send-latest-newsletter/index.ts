
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
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Send latest newsletter function triggered");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if this is a test email request
    let testEmailAddress: string | null = null;
    let requestBody = {};
    
    try {
      requestBody = await req.json();
      if (requestBody && typeof requestBody === 'object' && 'testEmail' in requestBody) {
        testEmailAddress = requestBody.testEmail as string;
        console.log(`Test email requested for: ${testEmailAddress}`);
      }
    } catch (e) {
      // Request has no body or invalid JSON, proceed normally
    }

    // 1. Fetch the latest newsletter
    const { data: latestNewsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("*")
      .order("published_date", { ascending: false })
      .limit(1)
      .single();

    if (newsletterError) {
      console.error("Error fetching latest newsletter:", newsletterError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch latest newsletter" }),
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

    console.log("Latest newsletter found:", latestNewsletter.title);

    // If this is a test email, send it directly without fetching all subscribers
    if (testEmailAddress) {
      // 3. Format the newsletter for email
      const formattedDate = new Date(latestNewsletter.published_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Format the content for email
      const fullContent = latestNewsletter.content;
      const intro = fullContent.split('\n\n')[0]; // First paragraph as intro
      const mainContent = formatContentForEmail(fullContent.split('\n\n').slice(1).join('\n\n')); // Rest of content

      // Create email template
      const emailTemplate = generateNewsletterEmailTemplate(
        latestNewsletter.title,
        formattedDate,
        latestNewsletter.read_time,
        intro,
        mainContent,
        latestNewsletter.slug,
        latestNewsletter.category
      );

      // Customize the email
      const customizedEmail = replacePlaceholders(emailTemplate, {
        email: testEmailAddress
      });
      
      // Send the test email
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
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 2. Fetch all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("email")
      .eq("subscribed", true);

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!subscribers.length) {
      console.log("No active subscribers found");
      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${subscribers.length} active subscribers`);

    // 3. Format the newsletter for email
    const formattedDate = new Date(latestNewsletter.published_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format the content for email
    const fullContent = latestNewsletter.content;
    const intro = fullContent.split('\n\n')[0]; // First paragraph as intro
    const mainContent = formatContentForEmail(fullContent.split('\n\n').slice(1).join('\n\n')); // Rest of content

    // Create email template
    const emailTemplate = generateNewsletterEmailTemplate(
      latestNewsletter.title,
      formattedDate,
      latestNewsletter.read_time,
      intro,
      mainContent,
      latestNewsletter.slug,
      latestNewsletter.category
    );

    // Group sending into batches of 50 to avoid rate limits
    const batchSize = 50;
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
      console.log(`Processing batch ${batchIndex + 1} of ${batches.length}`);
      
      // Create array of email addresses for this batch
      const emailAddresses = batch.map(subscriber => subscriber.email);
      
      try {
        // Customize the email for this batch
        const customizedEmail = replacePlaceholders(emailTemplate, {
          email: batch[0].email // Use first email for unsubscribe link
        });
        
        // Send the email batch
        await sendNewsletterBatch(
          emailAddresses, 
          latestNewsletter.title, 
          customizedEmail, 
          batchIndex
        );
        
        successCount += batch.length;
        
        // Add a small delay between batches to avoid rate limits
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
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
