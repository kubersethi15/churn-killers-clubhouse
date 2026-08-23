import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { createReactivationToken } from "../_shared/reactivationToken.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const signingSecret = Deno.env.get("NEWSLETTER_UNSUBSCRIBE_SECRET") || serviceRoleKey;
const supabase = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

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
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

const validEmail = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const clean = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
};

const genericSuccess = (headers: Record<string, string>) => new Response(
  JSON.stringify({ success: true }),
  { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } },
);

type RequestPayload = {
  email?: unknown;
  source?: unknown;
  medium?: unknown;
  campaign?: unknown;
  content?: unknown;
  sourcePage?: unknown;
};

serve(async (req: Request): Promise<Response> => {
  const headers = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers });

  // Return the same public response for every address so this endpoint cannot
  // be used to discover whether someone is or was a subscriber.
  if (!supabase || !resend || !signingSecret) return genericSuccess(headers);

  const body = await req.json().catch(() => null) as RequestPayload | null;
  if (!body || !validEmail(body.email)) return genericSuccess(headers);
  const email = body.email.trim().toLowerCase();

  try {
    const { data: subscriber, error: lookupError } = await supabase
      .from("subscribers")
      .select("id, subscribed")
      .eq("email", email)
      .maybeSingle();

    if (lookupError || !subscriber || subscriber.subscribed) return genericSuccess(headers);

    const cooldown = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recentRequest } = await supabase
      .from("subscriber_reactivation_requests")
      .select("id")
      .eq("subscriber_id", subscriber.id)
      .gte("requested_at", cooldown)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentRequest) return genericSuccess(headers);

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const requestId = crypto.randomUUID();
    const { error: insertError } = await supabase.from("subscriber_reactivation_requests").insert({
      id: requestId,
      subscriber_id: subscriber.id,
      expires_at: new Date(expiresAt).toISOString(),
      source: clean(body.source, 120),
      medium: clean(body.medium, 120),
      campaign: clean(body.campaign, 160),
      utm_content: clean(body.content, 160),
      source_page: clean(body.sourcePage, 300),
    });

    if (insertError) {
      console.error("Reactivation request insert failed", insertError);
      return genericSuccess(headers);
    }

    const token = await createReactivationToken(requestId, expiresAt, signingSecret);
    const confirmUrl = `${supabaseUrl}/functions/v1/confirm-newsletter-reactivation?token=${encodeURIComponent(token)}`;
    const response = await resend.emails.send({
      from: "Kuber at Churn Is Dead <newsletter@churnisdead.com>",
      to: [email],
      subject: "Confirm you want to rejoin Churn Is Dead",
      reply_to: "support@churnisdead.com",
      text: `You asked to rejoin the Churn Is Dead Tuesday newsletter.\n\nConfirm here: ${confirmUrl}\n\nThis link expires in 24 hours. If you did not request this, ignore this email and you will remain unsubscribed.`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 22px;color:#17233a">
          <p style="margin:0 0 22px;color:#dc2626;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Churn Is Dead</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;line-height:1.15;color:#17233a">Rejoin the Tuesday list?</h1>
          <p style="margin:22px 0;font-size:17px;line-height:1.65;color:#475569">Confirm that you want to receive Churn Is Dead again. This link expires in 24 hours.</p>
          <p style="margin:28px 0"><a href="${confirmUrl}" style="display:inline-block;border-radius:6px;background:#dc2626;padding:13px 20px;color:#fff;font-weight:700;text-decoration:none">Yes, put me back on the list</a></p>
          <p style="margin-top:30px;font-size:13px;line-height:1.6;color:#64748b">If you did not request this, ignore the email. You will remain unsubscribed.</p>
        </div>`,
    });

    if (response.error) {
      await supabase.from("subscriber_reactivation_requests").delete().eq("id", requestId);
      console.error("Reactivation email rejected", response.error);
    }
  } catch (error) {
    console.error("Unexpected reactivation request error", error);
  }

  return genericSuccess(headers);
});
