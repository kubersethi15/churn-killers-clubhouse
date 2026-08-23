import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { shouldSuppressSubscriber, tagValue, type ResendTags } from "./eventUtils.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, svix-id, svix-signature, svix-timestamp",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logRun = async (
  status: "success" | "failure" | "info",
  message: string,
  metadata: Record<string, unknown> = {},
  startedAt = Date.now(),
) => {
  try {
    await supabase.from("function_logs").insert([{
      function_name: "resend-webhook",
      status,
      message: message.slice(0, 500),
      metadata,
      duration_ms: Date.now() - startedAt,
    }]);
  } catch (error) {
    console.warn("function_logs write failed", error);
  }
};

const constantTimeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
};

const verifySvixSignature = async (req: Request, rawBody: string): Promise<boolean> => {
  if (!webhookSecret) throw new Error("RESEND_WEBHOOK_SECRET is not configured");
  const messageId = req.headers.get("svix-id") ?? "";
  const timestamp = req.headers.get("svix-timestamp") ?? "";
  const supplied = req.headers.get("svix-signature") ?? "";
  if (!messageId || !timestamp || !supplied) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) {
    return false;
  }

  const encodedSecret = webhookSecret.startsWith("whsec_") ? webhookSecret.slice(6) : webhookSecret;
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(encodedSecret), character => character.charCodeAt(0));
  } catch {
    return false;
  }
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${messageId}.${timestamp}.${rawBody}`),
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return supplied.split(/\s+/).some(candidate => {
    const [version, value] = candidate.split(",", 2);
    return version === "v1" && Boolean(value) && constantTimeEqual(value, expected);
  });
};

interface ResendEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    to?: string[] | string;
    from?: string;
    subject?: string;
    tags?: ResendTags;
    click?: { link: string; ipAddress?: string; userAgent?: string };
    bounce?: { type?: string; subType?: string; message?: string; diagnosticCode?: string[] };
  };
}

serve(async (req: Request): Promise<Response> => {
  const startedAt = Date.now();
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const rawBody = await req.text();
    if (!(await verifySvixSignature(req, rawBody))) {
      await logRun("failure", "Rejected webhook with invalid signature", {}, startedAt);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const event = JSON.parse(rawBody) as ResendEvent;
    if (!event?.type || !event.data) {
      return new Response(JSON.stringify({ error: "Malformed payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const recipient = Array.isArray(event.data.to) ? event.data.to[0] : event.data.to;
    const email = (recipient ?? "").toLowerCase().trim();
    const newsletterSlug = tagValue(event.data.tags, "newsletter_slug");
    const subscriberId = tagValue(event.data.tags, "subscriber_id");
    const webhookEventId = req.headers.get("svix-id") ?? "";

    if (event.type === "email.bounced" || event.type === "email.complained") {
      const sendStatus = event.type === "email.bounced" ? "bounced" : "complained";
      if (event.data.email_id) {
        const { error: sendLogError } = await supabase
          .from("newsletter_send_log")
          .update({ send_status: sendStatus })
          .eq("resend_message_id", event.data.email_id);
        if (sendLogError) throw sendLogError;
      }

      if (shouldSuppressSubscriber(event.type, event.data.bounce?.type)) {
        if (subscriberId) {
          const { error: suppressionError } = await supabase
            .from("subscribers")
            .update({ subscribed: false })
            .eq("id", subscriberId);
          if (suppressionError) throw suppressionError;
        } else if (email) {
          const { error: suppressionError } = await supabase
            .from("subscribers")
            .update({ subscribed: false })
            .eq("email", email);
          if (suppressionError) throw suppressionError;
        }
      }
    }

    const { error: insertError } = await supabase.from("email_events").insert([{
      webhook_event_id: webhookEventId,
      resend_message_id: event.data.email_id,
      event_type: event.type,
      email,
      subject: event.data.subject,
      newsletter_slug: newsletterSlug,
      payload: event.data as unknown as Record<string, unknown>,
      occurred_at: event.created_at || new Date().toISOString(),
    }]);
    if (insertError?.code === "23505") {
      await logRun("info", "Duplicate webhook replay ignored", {
        event_type: event.type,
        resend_id: event.data.email_id,
      }, startedAt);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (insertError) throw insertError;

    await logRun("success", `${event.type} processed`, {
      event_type: event.type,
      resend_id: event.data.email_id,
      newsletter_slug: newsletterSlug,
    }, startedAt);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Webhook error", error);
    await logRun("failure", `Webhook processing failed: ${message}`, {}, startedAt);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
