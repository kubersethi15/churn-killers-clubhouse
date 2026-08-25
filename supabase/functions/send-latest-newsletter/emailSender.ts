/** Resend delivery helpers. Each subscriber receives a separate message. */

import { EMAIL_IDENTITY } from "../_shared/emailIdentity.ts";

const resendApiKey = () => {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("Missing RESEND_API_KEY environment variable");
  return key;
};

const cleanSubjectLine = (subject: string): string =>
  subject.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === "string" && email.length > 0 && emailRegex.test(email.trim());
};

export interface NewsletterMessage {
  subscriberId: string;
  email: string;
  subject: string;
  html: string;
  unsubscribeUrl: string;
  newsletterId: string;
  newsletterSlug: string;
  variantLabel: string;
}

interface BatchResponse {
  data?: Array<{ id: string }>;
  error?: { message?: string } | string;
}

const postResend = async (
  endpoint: string,
  payload: unknown,
  idempotencyKey?: string,
): Promise<BatchResponse> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${resendApiKey()}`,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const response = await fetch(`https://api.resend.com${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const result = await response.json() as BatchResponse;
  if (!response.ok || result.error) {
    const message = typeof result.error === "string" ? result.error : result.error?.message;
    throw new Error(message || `Resend request failed with status ${response.status}`);
  }
  return result;
};

export const sendNewsletterBatch = async (
  messages: NewsletterMessage[],
  batchIndex: number,
  idempotencyKey: string,
) => {
  if (messages.length > 100) throw new Error("Resend batches cannot exceed 100 messages");
  const valid = messages.filter(message => isValidEmail(message.email));
  const skipped = messages.length - valid.length;
  if (skipped) console.warn(`Batch ${batchIndex + 1}: skipped ${skipped} invalid address(es)`);
  if (!valid.length) return { success: true, count: 0, skipped, deliveries: [] };

  const payload = valid.map((message, messageIndex) => ({
    from: EMAIL_IDENTITY.newsletterFrom,
    to: [message.email.trim()],
    subject: cleanSubjectLine(message.subject),
    reply_to: EMAIL_IDENTITY.replyTo,
    headers: {
      "List-Unsubscribe": `<${message.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      "Precedence": "bulk",
      "X-Entity-Ref-ID": `${message.newsletterId}-${batchIndex}-${messageIndex}`,
    },
    tags: [
      { name: "subscriber_id", value: message.subscriberId },
      { name: "newsletter_slug", value: message.newsletterSlug },
      { name: "subject_variant", value: message.variantLabel },
    ],
    html: message.html,
  }));

  const result = await postResend("/emails/batch", payload, idempotencyKey);
  const ids = result.data ?? [];
  if (ids.length !== valid.length) {
    throw new Error(`Resend accepted ${ids.length} of ${valid.length} batch messages`);
  }
  const deliveries = valid.map((message, index) => ({
    subscriberId: message.subscriberId,
    email: message.email,
    resendMessageId: ids[index].id,
    variantLabel: message.variantLabel,
  }));
  console.log(`Batch ${batchIndex + 1} sent as ${valid.length} private message(s)`);
  return { success: true, count: valid.length, skipped, deliveries };
};

export const sendTestNewsletter = async (
  emailAddress: string,
  subject: string,
  htmlContent: string,
) => {
  if (!isValidEmail(emailAddress)) throw new Error(`Invalid test email address: ${emailAddress}`);
  const result = await postResend("/emails", {
    from: EMAIL_IDENTITY.newsletterFrom,
    to: [emailAddress.trim()],
    subject: `[TEST] ${cleanSubjectLine(subject)}`,
    reply_to: EMAIL_IDENTITY.replyTo,
    headers: { "X-Entity-Ref-ID": `newsletter-test-${Date.now()}` },
    html: htmlContent,
  });
  return { success: true, email: emailAddress, result };
};
