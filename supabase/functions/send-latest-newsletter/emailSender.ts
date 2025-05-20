
/**
 * Functions for sending emails using Resend API
 */
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with proper error handling
const getResendClient = () => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  return new Resend(resendApiKey);
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
    
    // Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: "Churn Is Dead <newsletter@churnisdead.com>",
      to: ["newsletter@churnisdead.com"], // Adding a default 'to' address
      bcc: emailAddresses, // Use BCC for privacy
      subject: subject,
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
    
    console.log(`Batch ${batchIndex + 1} sent successfully`);
    return { success: true, count: emailAddresses.length };
  } catch (error) {
    console.error(`Error sending batch ${batchIndex + 1}:`, error);
    throw error;
  }
};

