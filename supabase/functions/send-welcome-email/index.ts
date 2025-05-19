
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with proper error handling
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("Missing RESEND_API_KEY environment variable");
}
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Edge function received request:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log("Received request body:", body);
    
    let data: EmailRequest;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error("Failed to parse JSON body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { email } = data;
    
    if (!email || typeof email !== "string") {
      console.error("Invalid email in request:", email);
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log(`Sending welcome email to: ${email}`);

    // Improved email configuration for better deliverability
    const emailResponse = await resend.emails.send({
      from: "Churn Is Dead <newsletter@churnisdead.com>",
      to: [email],
      subject: "Welcome to Churn Is Dead Newsletter!",
      reply_to: "support@churnisdead.com", // Adding reply-to address improves legitimacy
      headers: {
        "List-Unsubscribe": "<mailto:unsubscribe@churnisdead.com?subject=unsubscribe>", // This helps avoid spam filters
        "Precedence": "bulk" // Common header for bulk emails/newsletters
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #172554; margin-top: 30px;">You're In!</h1>
          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0; color: #333;">
            Thanks for subscribing to <strong>Churn Is Dead</strong> — your weekly dose of no-fluff CS strategies.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0; color: #333;">
            Every Tuesday, you'll get battle-tested plays to drive trust, revenue, and real outcomes with your customers.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0; color: #333;">
            The next issue lands in your inbox soon. In the meantime, you can check out our 
            <a href="https://yoursite.com/newsletters" style="color: #dc2626; text-decoration: underline;">past newsletters</a>.
          </p>
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
              <a href="mailto:unsubscribe@churnisdead.com?subject=Unsubscribe" style="color: #666;">click here</a>.
            </p>
            <p style="margin-top: 10px; color: #888;">
              Churn Is Dead, Inc.<br>
              1234 Marketing Street, Suite 500<br>
              San Francisco, CA 94107
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent response:", emailResponse);

    // Properly handle Resend API specific errors
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      
      // Return error details so we can diagnose the issue
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email delivery had an issue.",
          error: emailResponse.error
        }), 
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        name: error.name 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
