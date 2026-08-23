import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { verifyReactivationToken } from "../_shared/reactivationToken.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const signingSecret = Deno.env.get("NEWSLETTER_UNSUBSCRIBE_SECRET") || serviceRoleKey;
const supabase = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

const htmlResponse = (title: string, body: string, status = 200) => new Response(
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="referrer" content="no-referrer"><title>${title} | Churn Is Dead</title></head><body style="font-family:Arial,sans-serif;max-width:620px;margin:80px auto;padding:0 20px;color:#17233a"><p style="color:#dc2626;font-weight:700;letter-spacing:2px">CHURN IS DEAD</p><h1>${title}</h1><p style="font-size:17px;line-height:1.6;color:#475569">${body}</p><p style="margin-top:28px"><a href="https://churnisdead.com/start?utm_source=reactivation&utm_medium=email&utm_campaign=welcome_back" style="color:#dc2626;font-weight:700">Choose where to start &rarr;</a></p></body></html>`,
  { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
);

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  if (!supabase || !signingSecret) return htmlResponse("Reactivation is temporarily unavailable", "Please try the link again later.", 503);

  const token = new URL(req.url).searchParams.get("token") ?? "";
  const verified = await verifyReactivationToken(token, signingSecret);
  if (!verified) return htmlResponse("This rejoin link is invalid or expired", "Subscribe again on the Churn Is Dead website to request a fresh link.", 400);

  const { data: confirmed, error: confirmationError } = await supabase.rpc(
    "confirm_subscriber_reactivation",
    { _request_id: verified.requestId },
  );

  if (confirmationError) {
    console.error("Subscriber reactivation failed", confirmationError);
    return htmlResponse("Reactivation is temporarily unavailable", "Please try the link again later.", 500);
  }
  if (!confirmed) return htmlResponse("This rejoin link is invalid or expired", "Subscribe again on the Churn Is Dead website to request a fresh link.", 400);

  return htmlResponse("You are back on the Tuesday list", "Your unsubscribe choice was preserved until you confirmed this request. The next issue arrives Tuesday.");
});
