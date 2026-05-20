import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

/**
 * Resend Webhook Receiver
 *
 * Configure in Resend dashboard → Webhooks:
 *   Endpoint: https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/resend-webhook
 *   Events: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
 *
 * For each event, this function:
 *   1. Inserts a row into email_events for analysis
 *   2. Updates newsletter_send_log with bounce/complaint flags if the email matches
 *   3. Logs success/failure to function_logs
 */

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-signature, svix-timestamp",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logRun = async (
  status: 'success' | 'failure' | 'info',
  message: string,
  metadata: Record<string, unknown> = {},
  startedAt: number = Date.now()
) => {
  try {
    await supabase.from('function_logs').insert([{
      function_name: 'resend-webhook',
      status,
      message: message.slice(0, 500),
      metadata,
      duration_ms: Date.now() - startedAt,
    }]);
  } catch (err) {
    console.warn('function_logs write failed (non-fatal):', err);
  }
};

interface ResendEvent {
  type: string;  // email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
  created_at: string;
  data: {
    email_id?: string;
    to?: string[] | string;
    from?: string;
    subject?: string;
    headers?: Record<string, string>;
    click?: { link: string; ipAddress?: string; userAgent?: string };
    bounce?: { type: string; subType?: string; reason?: string };
  };
}

const handler = async (req: Request): Promise<Response> => {
  const startedAt = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const event = await req.json() as ResendEvent;

    if (!event || !event.type || !event.data) {
      await logRun('failure', 'malformed webhook payload', { sample: JSON.stringify(event).slice(0, 200) }, startedAt);
      return new Response(JSON.stringify({ error: "Malformed payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Extract email — Resend can send `to` as string or array
    let email = '';
    if (Array.isArray(event.data.to)) {
      email = event.data.to[0] || '';
    } else if (typeof event.data.to === 'string') {
      email = event.data.to;
    }
    email = email.toLowerCase().trim();

    // Insert the event
    const { error: insertError } = await supabase.from('email_events').insert([{
      resend_message_id: event.data.email_id,
      event_type: event.type,
      email,
      subject: event.data.subject,
      payload: event.data as unknown as Record<string, unknown>,
      occurred_at: event.created_at || new Date().toISOString(),
    }]);

    if (insertError) {
      console.error('Failed to insert email_event:', insertError);
      await logRun('failure', 'email_events insert failed', {
        error: insertError.message,
        event_type: event.type,
        email,
      }, startedAt);
      return new Response(JSON.stringify({ error: "Insert failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // For bounce/complaint events, also flag in newsletter_send_log
    if (event.type === 'email.bounced' || event.type === 'email.complained') {
      const newStatus = event.type === 'email.bounced' ? 'bounced' : 'complained';
      try {
        await supabase
          .from('newsletter_send_log')
          .update({ send_status: newStatus })
          .eq('subscriber_email', email)
          .eq('send_status', 'sent');  // only update most recent sent rows
      } catch (err) {
        console.warn('Failed to flag bounce in send log:', err);
      }
    }

    await logRun('success', `${event.type} processed for ${email}`, {
      event_type: event.type,
      email,
      resend_id: event.data.email_id,
    }, startedAt);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "unknown";
    console.error('Webhook error:', error);
    await logRun('failure', `unexpected error: ${msg}`, {
      stack: error instanceof Error ? error.stack?.slice(0, 1000) : undefined,
    }, startedAt);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
