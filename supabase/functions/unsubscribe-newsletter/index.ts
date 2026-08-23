import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const encoder = new TextEncoder();
const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
const timingSafeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
};
const signSubscriberId = async (subscriberId: string, secret: string): Promise<string> => {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`newsletter-unsubscribe:${subscriberId}`));
  return toBase64Url(new Uint8Array(signature));
};
const verifyUnsubscribeToken = async (token: string, secret: string): Promise<string | null> => {
  const separator = token.indexOf(".");
  if (separator <= 0) return null;
  const subscriberId = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  if (!/^[0-9a-f-]{36}$/i.test(subscriberId) || !suppliedSignature) return null;
  return timingSafeEqual(suppliedSignature, await signSubscriberId(subscriberId, secret)) ? subscriberId : null;
};

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
