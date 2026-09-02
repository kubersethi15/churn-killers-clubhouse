import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { formatContentForEmail } from "./formatUtils.ts";
import {
  generateNewsletterEmailTemplate,
  generateNewsletterTextTemplate,
  replacePlaceholders,
} from "./emailTemplate.ts";
import { sendNewsletterBatch, sendTestNewsletter } from "./emailSender.ts";
import type { NewsletterMessage } from "./emailSender.ts";
import { createUnsubscribeToken } from "../_shared/unsubscribeToken.ts";
import {
  batchIdempotencyKey,
  normalizeEmail,
  orderSubscribersForSend,
  planBatches,
  limitRecipientsForRun,
  selectPendingRecipients,
  shouldAdvanceLastSent,
} from "./sendPlan.ts";

// Initialize Supabase client (service role for DB operations)
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const unsubscribeSecret = Deno.env.get("NEWSLETTER_UNSUBSCRIBE_SECRET") || supabaseServiceKey;
const resendWebhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
const newsletterPostalAddress = Deno.env.get("NEWSLETTER_POSTAL_ADDRESS")?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-version, x-cron-key",
};

type SubjectVariant = { label: string; subject: string; preheader?: string };

const getSubjectVariants = (newsletter: {
  title: string;
  subject_variants?: SubjectVariant[] | null;
}): SubjectVariant[] => {
  const rows = Array.isArray(newsletter.subject_variants)
    ? newsletter.subject_variants.filter(row =>
      row && typeof row.subject === "string" && row.subject.trim().length > 0
    )
    : [];
  return rows.length > 0
    ? rows.map((row, index) => ({
      label: typeof row.label === "string" && row.label.trim() ? row.label.trim() : `variant-${index + 1}`,
      subject: row.subject.trim(),
      preheader: typeof row.preheader === "string" ? row.preheader.trim() : undefined,
    }))
    : [{ label: "default", subject: newsletter.title }];
};

/**
 * Verify the caller is either an admin user (JWT) or the internal cron job (x-cron-key).
 */
async function verifyAuthorization(req: Request): Promise<{ authorized: boolean; error?: string; statusCode?: number }> {
  // Check for cron key first (internal cron calls)
  const cronKey = req.headers.get('x-cron-key');
  if (cronKey) {
    const { data, error } = await supabase
      .from('internal_config')
      .select('value')
      .eq('key', 'cron_api_key')
      .single();

    if (!error && data?.value === cronKey) {
      console.log("Authorized via cron key");
      return { authorized: true };
    }
    console.warn("Invalid cron key provided");
  }

  // Check for admin JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, error: 'Authentication required', statusCode: 401 };
  }

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    anonKey!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return { authorized: false, error: 'Invalid token', statusCode: 401 };
  }

  const userId = claimsData.claims.sub;
  const { data: hasAdminRole } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });

  if (!hasAdminRole) {
    return { authorized: false, error: 'Admin access required', statusCode: 403 };
  }

  console.log("Authorized via admin JWT");
  return { authorized: true };
}

const handler = async (req: Request): Promise<Response> => {
  const triggerTime = new Date().toISOString();
  console.log(`Send latest newsletter function triggered at ${triggerTime}`);

  // Helper to write to function_logs (best-effort, never throws)
  const startMs = Date.now();
  const logRun = async (status: 'success' | 'failure' | 'partial' | 'info', message: string, metadata: Record<string, unknown> = {}) => {
    try {
      await supabase.from('function_logs').insert([{
        function_name: 'send-latest-newsletter',
        status,
        message: message.slice(0, 500),
        metadata,
        duration_ms: Date.now() - startMs,
      }]);
    } catch (err) {
      console.warn('function_logs write failed (non-fatal):', err);
    }
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify authorization
  const auth = await verifyAuthorization(req);
  if (!auth.authorized) {
    await logRun('failure', `unauthorized: ${auth.error}`, { statusCode: auth.statusCode });
    return new Response(
      JSON.stringify({ error: auth.error }),
      { status: auth.statusCode || 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Check if this is a test email request
    let testEmailAddress: string | null = null;
    let testSubjectVariant: string | null = null;
    let batchSize = 100;
    let maxRecipients: number | null = null;
    let requestBody = {};
    
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
        if (requestBody && typeof requestBody === 'object') {
          if ('testEmail' in requestBody) {
            testEmailAddress = requestBody.testEmail as string;
            console.log("Test email requested");
          }
          if ('testSubjectVariant' in requestBody) {
            testSubjectVariant = String(requestBody.testSubjectVariant || "").trim() || null;
          }
          if ('batchSize' in requestBody) {
            batchSize = Math.min(100, Math.max(1, Number(requestBody.batchSize) || 100));
          }
          if ('maxRecipients' in requestBody) {
            const requestedLimit = Number(requestBody.maxRecipients);
            if (Number.isFinite(requestedLimit) && requestedLimit > 0) {
              maxRecipients = Math.min(100, Math.floor(requestedLimit));
            }
          }
        }
      }
    } catch (e) {
      console.log("No request body provided - treating as regular newsletter sending");
    }

    // Production broadcasts fail closed. Website publication is independent of email,
    // and an operator must deliberately enable sends after the deliverability review.
    if (!testEmailAddress && Deno.env.get("NEWSLETTER_SEND_ENABLED") !== "true") {
      await logRun('info', 'Newsletter broadcast held by NEWSLETTER_SEND_ENABLED');
      return new Response(
        JSON.stringify({
          error: "Newsletter broadcast is held",
          action: "Complete the email safety checklist before setting NEWSLETTER_SEND_ENABLED=true",
        }),
        { status: 423, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (!testEmailAddress && !resendWebhookSecret) {
      await logRun('failure', 'Newsletter broadcast blocked: RESEND_WEBHOOK_SECRET is missing');
      return new Response(
        JSON.stringify({ error: "Newsletter broadcast blocked because delivery-event verification is not configured" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (!newsletterPostalAddress) {
      await logRun('failure', 'Newsletter send blocked: NEWSLETTER_POSTAL_ADDRESS is missing');
      return new Response(
        JSON.stringify({ error: "Newsletter send blocked because the sender mailing address is not configured" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // 1. Fetch the next unsent newsletter (sequential delivery)
    console.log("Fetching next unsent newsletter");

    // Get last sent newsletter ID from internal_config
    const { data: lastSentConfig } = await supabase
      .from("internal_config")
      .select("value")
      .eq("key", "last_sent_newsletter_id")
      .maybeSingle();

    const lastSentId = lastSentConfig?.value || null;
    console.log(`Last sent newsletter ID: ${lastSentId || "none"}`);

    // Get all eligible newsletters ordered by published_date ascending
    const { data: eligibleNewsletters, error: newsletterError } = await supabase
      .from("newsletters")
      .select("*")
      .lte("published_date", new Date().toISOString())
      .order("published_date", { ascending: true });

    if (newsletterError) {
      console.error("Error fetching newsletters:", newsletterError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch newsletters", details: newsletterError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!eligibleNewsletters || eligibleNewsletters.length === 0) {
      return new Response(
        JSON.stringify({ error: "No newsletters found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find the next newsletter to send
    let latestNewsletter;
    if (!lastSentId) {
      // No record of last sent — send the most recent one (backwards compat)
      latestNewsletter = eligibleNewsletters[eligibleNewsletters.length - 1];
    } else {
      // Find the newsletter right after the last sent one
      const lastSentIndex = eligibleNewsletters.findIndex(n => n.id === lastSentId);
      if (lastSentIndex === -1) {
        // Last sent ID not found in eligible list — send the most recent
        latestNewsletter = eligibleNewsletters[eligibleNewsletters.length - 1];
      } else if (lastSentIndex < eligibleNewsletters.length - 1) {
        // There's a next newsletter to send
        latestNewsletter = eligibleNewsletters[lastSentIndex + 1];
      } else {
        // Already sent the latest — nothing new to send
        console.log("No new newsletters to send — latest has already been sent");
        await logRun('info', 'No new newsletters to send — latest already sent', { lastSentId });
        return new Response(
          JSON.stringify({ message: "No new newsletters to send — latest already sent", lastSentId }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log(`Next newsletter to send: "${latestNewsletter.title}" (ID: ${latestNewsletter.id})`);

    // Helper: format newsletter content for email
    const formatNewsletterContent = (newsletter: typeof latestNewsletter) => {
      const formattedDate = new Date(newsletter.published_date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      let fullContent = newsletter.content || '';
      const normalizedTitle = (newsletter.title || '').trim().toLowerCase();
      const firstLine = fullContent.split(/\r?\n/)[0].trim().replace(/^[#\s]*/, '').replace(/\*\*/g, '').toLowerCase();
      if (firstLine === normalizedTitle) {
        fullContent = fullContent.split(/\r?\n/).slice(1).join('\n').trimStart();
      }
      fullContent = fullContent.replace(/\r\n/g, '\n');
      const mainContent = formatContentForEmail(fullContent);

      return { formattedDate, mainContent };
    };

    const variants = getSubjectVariants(latestNewsletter);
    const pickVariantForIndex = (idx: number): SubjectVariant => variants[idx % variants.length];
    console.log(`Using ${variants.length} subject variant(s): ${variants.map(v => v.label).join(', ')}`);

    // A test must reproduce the production message, including a real signed
    // unsubscribe URL. Restrict it to an active subscriber controlled by the
    // operator instead of substituting the homepage and producing false QA.
    if (testEmailAddress) {
      const { formattedDate, mainContent } = formatNewsletterContent(latestNewsletter);
      const normalizedTestEmail = normalizeEmail(testEmailAddress);
      const { data: testSubscriber, error: testSubscriberError } = await supabase
        .from("subscribers")
        .select("id")
        .eq("email", normalizedTestEmail)
        .eq("subscribed", true)
        .maybeSingle();
      if (testSubscriberError || !testSubscriber?.id) {
        return new Response(
          JSON.stringify({ error: "Test address must be an active subscriber so unsubscribe QA is real" }),
          { status: 422, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
      if (!unsubscribeSecret) throw new Error("Missing unsubscribe signing secret");
      const token = await createUnsubscribeToken(testSubscriber.id, unsubscribeSecret);
      const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-newsletter?token=${encodeURIComponent(token)}`;
      const testVariant = variants.find(variant => variant.label === testSubjectVariant) ?? variants[0];
      const previewText = testVariant.preheader || latestNewsletter.excerpt || "";
      const emailTemplate = generateNewsletterEmailTemplate(
        latestNewsletter.title, formattedDate, latestNewsletter.read_time,
        previewText, mainContent, latestNewsletter.slug, latestNewsletter.category,
        newsletterPostalAddress,
      );
      const textTemplate = generateNewsletterTextTemplate(
        latestNewsletter.title, previewText, mainContent, latestNewsletter.slug,
        newsletterPostalAddress,
      );
      const customizedEmail = replacePlaceholders(emailTemplate, {
        unsubscribe_url: unsubscribeUrl,
      });
      const customizedText = replacePlaceholders(textTemplate, {
        unsubscribe_url: unsubscribeUrl,
      });
      
      try {
        await sendTestNewsletter(
          normalizedTestEmail,
          testVariant.subject,
          customizedEmail,
          customizedText,
          unsubscribeUrl,
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: "Production-equivalent test newsletter sent",
            newsletterTitle: latestNewsletter.title,
            subjectVariant: testVariant.label,
            timestamp: triggerTime,
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (sendError) {
        console.error("Error sending test email:", sendError);
        return new Response(
          JSON.stringify({ error: "Failed to send test email", details: sendError.message || sendError, timestamp: triggerTime }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // 2. Fetch all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("id,email")
      .eq("subscribed", true)
      .order("id", { ascending: true });

    if (subscribersError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers", details: subscribersError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subscribers.length) {
      await logRun('info', 'No active subscribers found', { newsletter_id: latestNewsletter.id });
      return new Response(
        JSON.stringify({ message: "No active subscribers found", timestamp: triggerTime }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${subscribers.length} active subscribers`);

    // 3. Format and send
    const { formattedDate, mainContent } = formatNewsletterContent(latestNewsletter);
    const templates = new Map<string, { html: string; text: string }>();
    const templateForVariant = (variant: SubjectVariant) => {
      const existing = templates.get(variant.label);
      if (existing) return existing;
      const previewText = variant.preheader || latestNewsletter.excerpt || "";
      const generated = {
        html: generateNewsletterEmailTemplate(
          latestNewsletter.title, formattedDate, latestNewsletter.read_time,
          previewText, mainContent, latestNewsletter.slug, latestNewsletter.category,
          newsletterPostalAddress,
        ),
        text: generateNewsletterTextTemplate(
          latestNewsletter.title, previewText, mainContent, latestNewsletter.slug,
          newsletterPostalAddress,
        ),
      };
      templates.set(variant.label, generated);
      return generated;
    };

    // Deterministic recipient order so batching and subject-variant assignment
    // are stable across runs.
    const orderedSubscribers = orderSubscribersForSend(subscribers);

    // Per-recipient idempotency: exclude anyone already delivered this issue in
    // an earlier (possibly partial) run. This is the real guard against
    // re-sending when the subscriber list changes between runs — batch keys are
    // only a within-run, identical-batch backstop. If the prior-delivery log
    // cannot be read we do not know who already received it, so we must abort
    // rather than risk a mass double-send.
    const { data: deliveredRows, error: deliveredError } = await supabase
      .from("newsletter_send_log")
      .select("subscriber_email")
      .eq("newsletter_id", latestNewsletter.id)
      .eq("send_status", "sent");

    if (deliveredError) {
      await logRun('failure', 'Aborting send: prior-delivery log unreadable', {
        newsletter_id: latestNewsletter.id,
        error: deliveredError.message,
      });
      return new Response(
        JSON.stringify({ error: "Could not verify prior deliveries; send aborted to avoid duplicates" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const deliveredEmails = new Set(
      (deliveredRows ?? []).map(row => normalizeEmail(row.subscriber_email)),
    );
    const allPendingRecipients = selectPendingRecipients(orderedSubscribers, deliveredEmails);
    const stagedRun = limitRecipientsForRun(allPendingRecipients, maxRecipients);
    const recipients = stagedRun.recipients;
    const pendingAfterRun = stagedRun.remaining;

    if (recipients.length === 0) {
      // Every active subscriber already has this issue. Mark it done and move on.
      await supabase
        .from("internal_config")
        .upsert({ key: "last_sent_newsletter_id", value: latestNewsletter.id }, { onConflict: "key" });
      await logRun('info', 'Issue already delivered to all active subscribers', {
        newsletter_id: latestNewsletter.id,
        already_delivered: deliveredEmails.size,
      });
      return new Response(
        JSON.stringify({ message: "Already delivered to all active subscribers", newsletterId: latestNewsletter.id }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    console.log(`${recipients.length} pending recipient(s); ${deliveredEmails.size} already delivered`);
    const batches = planBatches(recipients, batchSize);

    let successCount = 0;
    let failureCount = 0;
    // Batches that threw (network/provider error) rather than per-recipient
    // invalid addresses. Only these hold back the sequential send pointer.
    let transientBatchFailures = 0;
    // If the per-recipient send log fails to persist, a retry cannot tell who
    // was delivered, so the pointer must not advance.
    let sendLogPersisted = true;
    const errors: string[] = [];
    const variantStats: Record<string, { sent: number; subscriberIds: string[] }> = {};
    const sendLogRows: Array<{
      newsletter_id: string;
      subscriber_email: string;
      subject_variant: string;
      variant_index: number;
      send_status: string;
      resend_message_id?: string;
      error_message?: string;
    }> = [];

    for (const [batchIndex, batch] of batches.entries()) {
      if (!unsubscribeSecret) throw new Error("Missing unsubscribe signing secret");
      const messages: NewsletterMessage[] = await Promise.all(batch.map(async (subscriber, localIndex) => {
        const globalIndex = batchIndex * batchSize + localIndex;
        const variant = pickVariantForIndex(globalIndex);
        const template = templateForVariant(variant);
        const token = await createUnsubscribeToken(subscriber.id, unsubscribeSecret);
        const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-newsletter?token=${encodeURIComponent(token)}`;
        return {
          subscriberId: subscriber.id,
          email: subscriber.email,
          subject: variant.subject,
          html: replacePlaceholders(template.html, {
            unsubscribe_url: unsubscribeUrl,
          }),
          text: replacePlaceholders(template.text, { unsubscribe_url: unsubscribeUrl }),
          unsubscribeUrl,
          newsletterId: latestNewsletter.id,
          newsletterSlug: latestNewsletter.slug,
          variantLabel: variant.label,
        };
      }));
      try {
        const delivery = await sendNewsletterBatch(
          messages,
          batchIndex,
          await batchIdempotencyKey(latestNewsletter.id, batch.map(subscriber => subscriber.id)),
        );
        successCount += delivery.count;
        failureCount += delivery.skipped;
        const deliveredSubscriberIds = new Set(delivery.deliveries.map(item => item.subscriberId));

        for (const item of delivery.deliveries) {
          const variantIdx = variants.findIndex(variant => variant.label === item.variantLabel);
          if (!variantStats[item.variantLabel]) variantStats[item.variantLabel] = { sent: 0, subscriberIds: [] };
          variantStats[item.variantLabel].sent += 1;
          variantStats[item.variantLabel].subscriberIds.push(item.subscriberId);
          sendLogRows.push({
            newsletter_id: latestNewsletter.id,
            subscriber_email: normalizeEmail(item.email),
            subject_variant: item.variantLabel,
            variant_index: Math.max(0, variantIdx),
            send_status: 'sent',
            resend_message_id: item.resendMessageId,
          });
        }

        for (const message of messages.filter(item => !deliveredSubscriberIds.has(item.subscriberId))) {
          const variantIdx = variants.findIndex(variant => variant.label === message.variantLabel);
          sendLogRows.push({
            newsletter_id: latestNewsletter.id,
            subscriber_email: normalizeEmail(message.email),
            subject_variant: message.variantLabel,
            variant_index: Math.max(0, variantIdx),
            send_status: 'failed',
            error_message: 'Invalid email address',
          });
        }

        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error sending private batch ${batchIndex + 1}:`, error);
        failureCount += batch.length;
        transientBatchFailures += 1;
        errors.push(`[batch ${batchIndex + 1}] ${msg}`);

        for (const message of messages) {
          const variantIdx = variants.findIndex(variant => variant.label === message.variantLabel);
          sendLogRows.push({
            newsletter_id: latestNewsletter.id,
            subscriber_email: normalizeEmail(message.email),
            subject_variant: message.variantLabel,
            variant_index: Math.max(0, variantIdx),
            send_status: 'failed',
            error_message: msg.slice(0, 500),
          });
        }
      }
    }

    console.log(`Newsletter sending complete. Success: ${successCount}, Failures: ${failureCount}`);
    console.log(`Variant breakdown:`, JSON.stringify(variantStats, null, 2));

    // Write per-recipient send log (best-effort, chunked in case of large lists)
    if (sendLogRows.length > 0) {
      const CHUNK = 500;
      for (let i = 0; i < sendLogRows.length; i += CHUNK) {
        const slice = sendLogRows.slice(i, i + CHUNK);
        try {
          // Upsert so a retry updates the recipient's row (latest status wins)
          // instead of appending a duplicate. Requires the unique index on
          // (newsletter_id, subscriber_email).
          const { error: logError } = await supabase
            .from('newsletter_send_log')
            .upsert(slice, { onConflict: 'newsletter_id,subscriber_email' });
          if (logError) {
            sendLogPersisted = false;
            console.warn(`Send log chunk ${i}-${i + slice.length} rejected:`, logError.message);
          }
        } catch (err) {
          sendLogPersisted = false;
          console.warn(`Failed to write send log chunk ${i}-${i + slice.length}:`, err);
        }
      }
    }

    // Track which subject variant each subscriber received (best-effort, non-blocking)
    if (variants.length > 1) {
      for (const [label, stats] of Object.entries(variantStats)) {
        if (stats.subscriberIds.length === 0) continue;
        try {
          await supabase
            .from('subscribers')
            .update({ last_subject_variant: label })
            .in('id', stats.subscriberIds);
        } catch (err) {
          console.warn(`Failed to record variant '${label}' on subscribers:`, err);
        }
      }
    }

    if (!sendLogPersisted) {
      await logRun('failure', 'Send log did not fully persist; holding send pointer for a clean retry', {
        newsletter_id: latestNewsletter.id,
      });
    }

    // 4. Advance the sequential send pointer only when every currently active
    // recipient has the issue and that is durably recorded. A batch that threw
    // holds the pointer so the next run retries only the still-pending
    // recipients (delivered ones are pre-filtered out above, so no double-send
    // even if the list changed); an unpersisted send log also holds it, since a
    // retry would otherwise be unable to tell who was already delivered.
    if (shouldAdvanceLastSent({ transientBatchFailures, sendLogPersisted, pendingAfterRun })) {
      const { error: updateError } = await supabase
        .from("internal_config")
        .upsert({ key: "last_sent_newsletter_id", value: latestNewsletter.id }, { onConflict: "key" });
      
      if (updateError) {
        console.error("Failed to update last_sent_newsletter_id:", updateError);
      } else {
        console.log(`Recorded last_sent_newsletter_id: ${latestNewsletter.id}`);
      }
    }

    // Log final outcome
    const overallStatus = (failureCount === 0 && sendLogPersisted)
      ? 'success'
      : (successCount > 0 ? 'partial' : 'failure');
    await logRun(overallStatus, `Newsletter "${latestNewsletter.title}" — ${successCount} sent, ${failureCount} failed`, {
      newsletter_id: latestNewsletter.id,
      newsletter_slug: latestNewsletter.slug,
      newsletter_title: latestNewsletter.title,
      subscribers_total: subscribers.length,
      pending_this_run: recipients.length,
      pending_after_run: pendingAfterRun,
      already_delivered: deliveredEmails.size,
      success_count: successCount,
      failure_count: failureCount,
      send_log_persisted: sendLogPersisted,
      variant_stats: variantStats,
      errors: errors.slice(0, 5),  // limit error log size
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter "${latestNewsletter.title}" sent to ${successCount} subscribers`,
        newsletterId: latestNewsletter.id,
        failureCount,
        pendingAfterRun,
        errors: errors.length ? errors : null,
        startTime: triggerTime,
        endTime: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Unexpected error in send-latest-newsletter function:", error);
    await logRun('failure', `unexpected error: ${msg}`, { stack: error instanceof Error ? error.stack?.slice(0, 1000) : undefined });
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        timestamp: triggerTime
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
