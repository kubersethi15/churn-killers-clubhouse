
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Initialize Resend with proper error handling
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("Missing RESEND_API_KEY environment variable");
}
const resend = new Resend(resendApiKey);

// Supabase client for observability logging (best-effort, never blocks the response)
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const logRun = async (
  status: 'success' | 'failure' | 'info',
  message: string,
  metadata: Record<string, unknown> = {},
  startedAt: number = Date.now()
) => {
  if (!supabase) return;
  try {
    await supabase.from('function_logs').insert([{
      function_name: 'send-welcome-email',
      status,
      message: message.slice(0, 500),
      metadata,
      duration_ms: Date.now() - startedAt,
    }]);
  } catch (err) {
    console.warn('function_logs write failed (non-fatal):', err);
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  const startedAt = Date.now();
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
      await logRun('failure', 'invalid email payload', { received_type: typeof email }, startedAt);
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
            <a href="https://churnisdead.com/newsletters" style="color: #dc2626; text-decoration: underline;">past newsletters</a>.
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
              Churn Is Dead — Weekly CS frameworks by Kuber Sethi<br>
              <a href="https://churnisdead.com" style="color: #888;">churnisdead.com</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent response:", emailResponse);

    // Properly handle Resend API specific errors
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      await logRun('failure', 'resend api error', {
        email,
        resend_error: emailResponse.error,
      }, startedAt);

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

    await logRun('success', `welcome email sent to ${email}`, {
      email,
      resend_id: (emailResponse as { data?: { id?: string } }).data?.id,
    }, startedAt);
    return new Response(JSON.stringify({ success: true, message: "Email sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    await logRun('failure', `unexpected error: ${error.message || 'unknown'}`, {
      error_name: error.name,
      stack: error.stack?.slice(0, 1000),
    }, startedAt);
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
