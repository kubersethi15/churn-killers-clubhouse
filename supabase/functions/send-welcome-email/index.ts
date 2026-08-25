import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { EMAIL_IDENTITY } from "../_shared/emailIdentity.ts";
import { createUnsubscribeToken } from "../_shared/unsubscribeToken.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const unsubscribeSecret = Deno.env.get("NEWSLETTER_UNSUBSCRIBE_SECRET") || supabaseServiceKey;

const resend = new Resend(resendApiKey);
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

const allowedOrigins = new Set([
  "https://churnisdead.com",
  "https://www.churnisdead.com",
  "http://localhost:4173",
  "http://localhost:4174",
]);

const corsHeaders = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://churnisdead.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
};

const logRun = async (
  status: "success" | "failure" | "info",
  message: string,
  metadata: Record<string, unknown> = {},
  startedAt = Date.now(),
) => {
  if (!supabase) return;
  try {
    await supabase.from("function_logs").insert([{
      function_name: "send-welcome-email",
      status,
      message: message.slice(0, 500),
      metadata,
      duration_ms: Date.now() - startedAt,
    }]);
  } catch (error) {
    console.warn("function_logs write failed", error);
  }
};

const validEmail = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

serve(async (req: Request): Promise<Response> => {
  const startedAt = Date.now();
  const headers = { "Content-Type": "application/json", ...corsHeaders(req) };

  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  if (!supabase || !supabaseUrl || !resendApiKey || !unsubscribeSecret) {
    await logRun("failure", "welcome email configuration is incomplete", {}, startedAt);
    return new Response(JSON.stringify({ error: "Email service unavailable" }), { status: 503, headers });
  }

  try {
    const body = await req.json().catch(() => null) as { email?: unknown } | null;
    if (!body || !validEmail(body.email)) {
      await logRun("failure", "invalid welcome email payload", {}, startedAt);
      return new Response(JSON.stringify({ error: "Valid email is required" }), { status: 400, headers });
    }

    const email = body.email.trim().toLowerCase();
    const { data: subscriber, error: lookupError } = await supabase
      .from("subscribers")
      .select("id, email, subscribed, welcome_email_sent_at")
      .eq("email", email)
      .maybeSingle();

    if (lookupError || !subscriber || !subscriber.subscribed) {
      await logRun("failure", "active subscriber record not found", {}, startedAt);
      return new Response(JSON.stringify({ error: "Active subscription not found" }), { status: 404, headers });
    }

    if (subscriber.welcome_email_sent_at) {
      return new Response(JSON.stringify({ success: true, alreadySent: true }), { status: 200, headers });
    }

    const claimedAt = new Date().toISOString();
    const { data: claimed } = await supabase
      .from("subscribers")
      .update({ welcome_email_sent_at: claimedAt })
      .eq("id", subscriber.id)
      .is("welcome_email_sent_at", null)
      .select("id")
      .maybeSingle();

    if (!claimed) return new Response(JSON.stringify({ success: true, alreadySent: true }), { status: 200, headers });

    const token = await createUnsubscribeToken(subscriber.id, unsubscribeSecret);
    const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-newsletter?token=${encodeURIComponent(token)}`;
    const startUrl = "https://churnisdead.com/start?utm_source=welcome&utm_medium=email&utm_campaign=starter_kit&utm_content=start";
    const vaultUrl = "https://churnisdead.com/playbook?utm_source=welcome&utm_medium=email&utm_campaign=starter_kit&utm_content=vault";
    const diagnosticUrl = "https://churnisdead.com/ai-exposure-score?utm_source=welcome&utm_medium=email&utm_campaign=starter_kit&utm_content=diagnostic";
    const referralBaseUrl = "https://churnisdead.com/start?utm_source=subscriber_referral&utm_medium=share&utm_campaign=welcome_starter_kit";
    const linkedinReferralUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${referralBaseUrl}&utm_content=welcome_linkedin`)}`;
    const textReferralUrl = `${referralBaseUrl}&utm_content=welcome_forward`;
    const emailReferralUrl = `mailto:?subject=${encodeURIComponent("A useful Customer Success operating resource")}&body=${encodeURIComponent(`Churn Is Dead publishes one evidence-led Customer Success operating system and practical playbook every Tuesday. Start here: ${referralBaseUrl}&utm_content=welcome_email`)}`;

    const response = await resend.emails.send({
      from: EMAIL_IDENTITY.kuberFrom,
      to: [email],
      subject: "Start here: three operating tools for serious CS teams",
      reply_to: EMAIL_IDENTITY.replyTo,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:unsubscribe@churnisdead.com?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "Precedence": "bulk",
      },
      text: `You're on the Churn Is Dead Tuesday list.\n\nStart with the operating problem on your desk: ${startUrl}\nBrowse the Playbook Vault: ${vaultUrl}\nTake the directional AI Exposure Score: ${diagnosticUrl}\n\nReply and tell me: what is the hardest CS decision your team is making this quarter?\n\nKnow one CS operator facing the same problem? Forward this email and keep this starting-point link in it: ${textReferralUrl}\n\nKuber\n\nUnsubscribe: ${unsubscribeUrl}`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 22px;color:#17233a">
          <p style="margin:0 0 22px;color:#dc2626;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Churn Is Dead</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.12;color:#17233a">You are on the Tuesday list.</h1>
          <p style="margin:22px 0 0;font-size:17px;line-height:1.65;color:#475569">Every issue gives you one argument, one operating model, and one tool you can test with your team.</p>
          <div style="margin:28px 0;border-top:1px solid #e5e7eb">
            <p style="margin:0;padding:20px 0;border-bottom:1px solid #e5e7eb"><strong style="display:block;margin-bottom:5px">01. Start with the problem</strong><a href="${startUrl}" style="color:#dc2626">Choose renewal, measurement, AI role design, or CS operations</a></p>
            <p style="margin:0;padding:20px 0;border-bottom:1px solid #e5e7eb"><strong style="display:block;margin-bottom:5px">02. Run a tool</strong><a href="${vaultUrl}" style="color:#dc2626">Open the free Playbook Vault</a></p>
            <p style="margin:0;padding:20px 0;border-bottom:1px solid #e5e7eb"><strong style="display:block;margin-bottom:5px">03. Examine the role</strong><a href="${diagnosticUrl}" style="color:#dc2626">Take the two-minute AI Exposure Score</a></p>
          </div>
          <p style="font-size:17px;line-height:1.65;color:#17233a"><strong>One useful reply:</strong> what is the hardest CS decision your team is making this quarter?</p>
          <div style="margin:26px 0;padding:18px 20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px">
            <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#17233a"><strong>Know one CS operator facing the same problem?</strong> Send them the starting point that helped you.</p>
            <a href="${linkedinReferralUrl}" style="display:inline-block;padding:10px 14px;background:#0a66c2;border-radius:6px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700">Share on LinkedIn</a>
            <a href="${emailReferralUrl}" style="display:inline-block;margin-left:8px;padding:10px 14px;border:1px solid #cbd5e1;border-radius:6px;color:#17233a;text-decoration:none;font-size:13px;font-weight:700">Share by email</a>
          </div>
          <p style="margin-top:26px;font-size:16px;line-height:1.6">Kuber</p>
          <p style="margin-top:34px;padding-top:18px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.6;color:#64748b">You received this because you subscribed at churnisdead.com. <a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:underline">Unsubscribe in one click</a>.</p>
        </div>`,
    });

    if (response.error) {
      await supabase.from("subscribers").update({ welcome_email_sent_at: null }).eq("id", subscriber.id).eq("welcome_email_sent_at", claimedAt);
      await logRun("failure", "welcome email provider rejected send", { subscriber_id: subscriber.id, provider_error: response.error }, startedAt);
      return new Response(JSON.stringify({ error: "Email delivery failed" }), { status: 502, headers });
    }

    await logRun("success", "welcome email sent", { subscriber_id: subscriber.id, resend_id: response.data?.id }, startedAt);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    await logRun("failure", "unexpected welcome email error", { error: error instanceof Error ? error.message : "unknown" }, startedAt);
    return new Response(JSON.stringify({ error: "Unexpected email error" }), { status: 500, headers });
  }
});
