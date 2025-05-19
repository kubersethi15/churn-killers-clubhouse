
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: EmailRequest = await req.json();
    
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log(`Sending welcome email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Churn Is Dead <newsletter@churnisdead.com>",
      to: [email],
      subject: "Welcome to Churn Is Dead Newsletter!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #172554; margin-top: 30px;">You're In!</h1>
          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">
            Thanks for subscribing to <strong>Churn Is Dead</strong> — your weekly dose of no-fluff CS strategies.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">
            Every Tuesday, you'll get battle-tested plays to drive trust, revenue, and real outcomes with your customers.
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">
            The next issue lands in your inbox soon. In the meantime, you can check out our 
            <a href="https://yoursite.com/newsletters" style="color: #dc2626; text-decoration: underline;">past newsletters</a>.
          </p>
          <div style="background-color: #f8f8f8; padding: 20px; border-left: 4px solid #dc2626; margin: 25px 0;">
            <p style="font-size: 16px; font-style: italic;">
              "Churn isn't an event. It's the outcome of missed opportunities to deliver value." 
            </p>
          </div>
          <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">
            Looking forward to killing churn together,<br>
            The Churn Is Dead Team
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
            <p>
              If you didn't sign up for this newsletter, please 
              <a href="mailto:unsubscribe@churnisdead.com" style="color: #666;">let us know</a> 
              and we'll remove you from our list.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
