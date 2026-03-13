
/**
 * Functions for sending emails using Resend API
 */
import { Resend } from "https://esm.sh/resend@2.0.0";

// Initialize Resend with proper error handling
const getResendClient = () => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  return new Resend(resendApiKey);
};

/**
 * Clean string for use in email subject (remove newlines and excessive spaces)
 */
const cleanSubjectLine = (subject: string): string => {
  return subject.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Validate email address format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && email.length > 0 && emailRegex.test(email.trim());
};

/**
 * Filter and clean email addresses, returning only valid ones
 */
export const filterValidEmails = (emails: string[]): { valid: string[]; invalid: string[] } => {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const email of emails) {
    const trimmed = (email || '').trim();
    if (isValidEmail(trimmed)) {
      valid.push(trimmed);
    } else {
      invalid.push(email);
    }
  }
  return { valid, invalid };
};

/**
 * Send newsletter to a batch of subscribers
 */
export const sendNewsletterBatch = async (
  emailAddresses: string[], 
  subject: string, 
  htmlContent: string, 
  batchIndex: number
) => {
  try {
    const resend = getResendClient();
    const cleanedSubject = cleanSubjectLine(subject);

    // Filter out invalid emails before sending
    const { valid, invalid } = filterValidEmails(emailAddresses);
    if (invalid.length > 0) {
      console.warn(`Batch ${batchIndex + 1}: Skipping ${invalid.length} invalid emails:`, invalid);
    }
    if (valid.length === 0) {
      console.warn(`Batch ${batchIndex + 1}: No valid emails to send to`);
      return { success: true, count: 0, skipped: invalid.length };
    }
    
    // Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: "Churn Is Dead <newsletter@churnisdead.com>",
      to: ["newsletter@churnisdead.com"],
      bcc: valid,
      subject: cleanedSubject,
      reply_to: "support@churnisdead.com",
      headers: {
        "List-Unsubscribe": "<mailto:unsubscribe@churnisdead.com?subject=unsubscribe>",
        "Precedence": "bulk",
        "X-Entity-Ref-ID": `newsletter-batch-${batchIndex}-${Date.now()}`
      },
      html: htmlContent,
    });

    if (emailResponse.error) {
      console.error(`Batch ${batchIndex + 1} error:`, emailResponse.error);
      throw emailResponse.error;
    }
    
    console.log(`Batch ${batchIndex + 1} sent successfully (${valid.length} recipients)`);
    return { success: true, count: valid.length, skipped: invalid.length };
  } catch (error) {
    console.error(`Error sending batch ${batchIndex + 1}:`, error);
    throw error;
  }
};

/**
 * Send test newsletter to a single email address
 */
export const sendTestNewsletter = async (
  emailAddress: string, 
  subject: string, 
  htmlContent: string
) => {
  try {
    if (!isValidEmail(emailAddress)) {
      throw new Error(`Invalid test email address: ${emailAddress}`);
    }
    
    const resend = getResendClient();
    const cleanedSubject = cleanSubjectLine(subject);
    
    const emailResponse = await resend.emails.send({
      from: "Churn Is Dead <newsletter@churnisdead.com>",
      to: [emailAddress.trim()],
      subject: `[TEST] ${cleanedSubject}`,
      reply_to: "support@churnisdead.com",
      headers: {
        "X-Entity-Ref-ID": `newsletter-test-${Date.now()}`
      },
      html: htmlContent,
    });

    if (emailResponse.error) {
      console.error(`Test email error:`, emailResponse.error);
      throw emailResponse.error;
    }
    
    console.log(`Test email sent successfully to ${emailAddress}`);
    return { success: true, email: emailAddress };
  } catch (error) {
    console.error(`Error sending test email:`, error);
    throw error;
  }
};
