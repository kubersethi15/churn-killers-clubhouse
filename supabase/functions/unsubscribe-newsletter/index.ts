import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
// Verify tokens with the same module send-latest-newsletter and
// send-welcome-email use to sign them. Keeping one implementation guarantees
// the signer and verifier can never drift apart and silently break every
// unsubscribe link. Contract is locked by unsubscribeToken.test.ts.
import { verifyUnsubscribeToken } from "../_shared/unsubscribeToken.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const signingSecret = Deno.env.get("NEWSLETTER_UNSUBSCRIBE_SECRET") || serviceRoleKey;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const htmlResponse = (message: string, status = 200) => new Response(
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Churn Is Dead</title></head><body style="font-family:Arial,sans-serif;max-width:620px;margin:80px auto;padding:0 20px;color:#1a1a1a"><p style="color:#C8553D;font-weight:700;letter-spacing:2px">CHURN IS DEAD</p><h1>${message}</h1><p>You can close this page.</p></body></html>`,
  { status, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } },
);

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!supabaseUrl || !serviceRoleKey || !signingSecret) {
    return htmlResponse("Unsubscribe is temporarily unavailable", 503);
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const token = new URL(req.url).searchParams.get("token") ?? "";
  const subscriberId = await verifyUnsubscribeToken(token, signingSecret);
  if (!subscriberId) return htmlResponse("This unsubscribe link is invalid", 400);

  const { error } = await supabase
    .from("subscribers")
    .update({ subscribed: false })
    .eq("id", subscriberId);

  if (error) {
    console.error("Unsubscribe update failed", error);
    return htmlResponse("Unsubscribe is temporarily unavailable", 500);
  }

  if (req.method === "POST") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  return htmlResponse("You have been unsubscribed");
});
