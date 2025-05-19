
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with proper error handling
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("Missing RESEND_API_KEY environment variable");
}
const resend = new Resend(resendApiKey);

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

// Function to format newsletter content for email
const formatContentForEmail = (content: string) => {
  if (!content) return "";

  // Step 1: Process headers with markdown-like syntax
  let formattedContent = content
    // Format H2 (##)
    .replace(/## (.*?)(\n|$)/g, '<h2 style="font-size: 22px; margin-top: 25px; margin-bottom: 15px; font-weight: bold; color: #172554;">$1</h2>')
    // Format H3 (###)
    .replace(/### (.*?)(\n|$)/g, '<h3 style="font-size: 18px; margin-top: 20px; margin-bottom: 10px; font-weight: bold; color: #172554;">$1</h3>')
    // Format H4 (####)
    .replace(/#### (.*?)(\n|$)/g, '<h4 style="font-size: 16px; margin-top: 18px; margin-bottom: 10px; font-weight: bold; color: #172554;">$1</h4>');

  // Step 2: Process block elements
  formattedContent = formattedContent
    // Format blockquotes
    .replace(/> (.*?)(\n|$)/g, '<blockquote style="border-left: 4px solid #172554; padding-left: 15px; font-style: italic; margin: 20px 0; color: #4b5563;">$1</blockquote>')
    // Format horizontal rule
    .replace(/---+/g, '<hr style="margin: 25px 0; border: 0; border-top: 1px solid #e5e7eb;" />');

  // Step 3: Process text formatting
  formattedContent = formattedContent
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Step 4: Process lists
  formattedContent = formattedContent
    // Convert unordered lists
    .replace(/^\* (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 8px;">$1</li>')
    // Convert ordered lists
    .replace(/^\d+\. (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 8px;">$1</li>');

  // Cleanup: Wrap lists in appropriate tags
  formattedContent = formattedContent
    .replace(/<li style="margin-left: 20px; margin-bottom: 8px;">(.*?)(<\/li>[\s\n]*<li style="margin-left: 20px; margin-bottom: 8px;">.*?)*<\/li>/gs, '<ul style="margin: 15px 0;">$&</ul>')
    .replace(/<li style="margin-left: 20px; margin-bottom: 8px;">(.*?)(<\/li>[\s\n]*<li style="margin-left: 20px; margin-bottom: 8px;">.*?)*<\/li>/gs, '<ol style="margin: 15px 0;">$&</ol>');

  // Step 5: Process paragraphs - split by newlines and wrap in paragraph tags if not already processed
  const paragraphs = formattedContent.split('\n\n');
  formattedContent = paragraphs.map(paragraph => {
    // Skip already processed elements (tags)
    if (paragraph.trim().startsWith('<') && paragraph.trim().endsWith('>')) {
      return paragraph;
    }
    
    // Skip empty paragraphs
    if (paragraph.trim() === '') {
      return '';
    }
    
    // Process pull quotes with a special syntax [QUOTE] text [/QUOTE]
    if (paragraph.includes('[QUOTE]') && paragraph.includes('[/QUOTE]')) {
      return paragraph
        .replace(/\[QUOTE\](.*?)\[\/QUOTE\]/g, 
          '<div style="margin: 25px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #172554; font-style: italic; font-size: 18px; color: #4b5563;">$1</div>');
    }
    
    // Wrap normal paragraphs
    return `<p style="margin-bottom: 16px; line-height: 1.6; color: #374151;">${paragraph}</p>`;
  }).join('');

  return formattedContent;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Send latest newsletter function triggered");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
        // Send the email using Resend - FIX: adding a 'to' address to make the API happy
        const emailResponse = await resend.emails.send({
          from: "Churn Is Dead <newsletter@churnisdead.com>",
          to: ["newsletter@churnisdead.com"], // Adding a default 'to' address to fix the error
          bcc: emailAddresses, // Use BCC for privacy
          subject: latestNewsletter.title,
          reply_to: "support@churnisdead.com",
          headers: {
            "List-Unsubscribe": "<mailto:unsubscribe@churnisdead.com?subject=unsubscribe>",
            "Precedence": "bulk",
            "X-Entity-Ref-ID": `newsletter-${latestNewsletter.id}-${Date.now()}`
          },
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #172554; margin-top: 30px;">${latestNewsletter.title}</h1>
              <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                ${formattedDate} · ${latestNewsletter.read_time}
              </p>
              
              ${latestNewsletter.category ? 
                `<div style="display: inline-block; background-color: #f3f4f6; border-radius: 4px; padding: 4px 8px; margin-bottom: 16px; font-size: 14px; color: #4b5563;">
                  ${latestNewsletter.category}
                </div>` : 
                ''
              }
              
              <div style="font-size: 16px; line-height: 1.5; margin: 20px 0; color: #333;">
                <p style="font-size: 18px; line-height: 1.6; margin-bottom: 25px; color: #111827;">
                  ${intro}
                </p>
                
                <div style="border-top: 1px solid #e5e7eb; margin: 25px 0;"></div>
                
                <div style="font-size: 16px; line-height: 1.6;">
                  ${mainContent}
                </div>
              </div>
              
              <div style="margin: 30px 0;">
                <a href="https://churnisdead.com/newsletter/${latestNewsletter.slug}" 
                   style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Read on Website
                </a>
              </div>
              
              <div style="background-color: #f8f8f8; padding: 20px; border-left: 4px solid #dc2626; margin: 25px 0;">
                <p style="font-size: 16px; font-style: italic; color: #555;">
                  "Churn isn't an event. It's the outcome of missed opportunities to deliver value."
                </p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 20px 0; color: #333;">
                Looking forward to killing churn together,<br>
                The Churn Is Dead Team
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
                <p>
                  You received this email because you signed up for the Churn Is Dead newsletter.
                  If you'd like to unsubscribe, please 
                  <a href="mailto:unsubscribe@churnisdead.com?subject=Unsubscribe&body=${encodeURIComponent(`Email: ${batch[0].email}`)}" style="color: #666;">click here</a>.
                </p>
                <p style="margin-top: 10px; color: #888;">
                  Churn Is Dead, Inc.<br>
                  1234 Marketing Street, Suite 500<br>
                  San Francisco, CA 94107
                </p>
                <p style="margin-top: 10px;">
                  <a href="https://churnisdead.com/newsletters" style="color: #dc2626; text-decoration: underline;">View all newsletters</a>
                </p>
              </div>
            </div>
          `,
        });

        if (emailResponse.error) {
          console.error(`Batch ${batchIndex + 1} error:`, emailResponse.error);
          failureCount += batch.length;
          errors.push(emailResponse.error);
        } else {
          console.log(`Batch ${batchIndex + 1} sent successfully`);
          successCount += batch.length;
        }
        
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
