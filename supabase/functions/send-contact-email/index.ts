
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

interface ContactRequest {
  name?: string;
  email?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact email function received request:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log("Received request body:", body);
    
    let data: ContactRequest;
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
    
    const { name = "Website Visitor", email = "no-reply@churnisdead.com", message = "Contact request from website" } = data;
    
    console.log(`Sending contact email from: ${name} (${email})`);

    // Send email to designated address AND forward to personal email
    const emailResponse = await resend.emails.send({
      from: "Churn Is Dead Contact <contact@churnisdead.com>",
      to: ["hello@churnisdead.com"],
      cc: ["kubersethi151@gmail.com"], // Forward to your personal email
      reply_to: email, // Set reply-to as the sender's email for easy responses
      subject: `New Contact Request from ${name}`,
      headers: {
        "X-Entity-Ref-ID": `contact-${Date.now()}`, // Unique ID for email tracking
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #172554; margin-top: 30px;">New Contact Request</h1>
          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0; color: #333;">
            You've received a new contact request from your website.
          </p>
          <div style="background-color: #f8f8f8; padding: 20px; border-left: 4px solid #dc2626; margin: 25px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            This message was sent from the Churn Is Dead website contact form.
          </p>
        </div>
      `,
    });

    console.log("Email sent response:", emailResponse);

    // Properly handle Resend API specific errors
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      
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

    return new Response(JSON.stringify({ success: true, message: "Contact email sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
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
