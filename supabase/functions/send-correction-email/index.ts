import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * This was a one-off correction sender that addressed a mailbox and BCC'd
 * subscriber batches. It is intentionally retired. All future newsletter mail
 * must use send-latest-newsletter, which creates one private message per
 * subscriber with a signed one-click unsubscribe URL and an idempotency key.
 */
serve((req: Request): Response => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      error: "This correction sender is retired",
      action: "Use the approved send-latest-newsletter workflow after completing the email safety checklist",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    },
  );
});
