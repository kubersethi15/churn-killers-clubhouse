import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WaitlistEmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WaitlistEmailRequest = await req.json();

    // Validate required fields
    if (!email || !name) {
      throw new Error("Missing required fields: email and name");
    }

    const firstName = name.split(" ")[0];

    const emailResponse = await resend.emails.send({
      from: "Churn Is Dead <noreply@churnisdead.com>",
      to: [email],
      subject: "You're on the CS Analyzer waitlist",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1a2744; padding: 32px 40px; text-align: center;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; font-family: Georgia, serif;">
                        <span style="border-bottom: 3px solid #ef4444;">Churn</span> Is Dead
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #1a2744; font-family: Georgia, serif;">
                        You're on the list, ${firstName}!
                      </h2>
                      
                      <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                        Thanks for joining the CS Analyzer waitlist. You'll be among the first to get access when we launch.
                      </p>
                      
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1a2744;">
                          What you'll get with CS Analyzer:
                        </h3>
                        <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 15px; line-height: 1.8;">
                          <li>AI-powered analysis of call transcripts & QBR decks</li>
                          <li>Instant risk detection and opportunity signals</li>
                          <li>Stakeholder mapping with sentiment analysis</li>
                          <li>Ready-to-use action plans with owners and timelines</li>
                        </ul>
                      </div>
                      
                      <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                        We're putting the finishing touches on the tool and will reach out soon with exclusive early access.
                      </p>
                      
                      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                        In the meantime, check out our latest insights on Customer Success:
                      </p>
                      
                      <div style="margin-top: 24px;">
                        <a href="https://churnisdead.com/newsletters" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                          Read Our Newsletters
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 14px; color: #718096; text-align: center;">
                        © ${new Date().getFullYear()} Churn Is Dead. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Waitlist confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending waitlist email:", error);
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
