
/**
 * Functions for generating newsletter email templates
 */

/**
 * Generate HTML email content for newsletter
 */
export const generateNewsletterEmailTemplate = (
  title: string, 
  formattedDate: string, 
  readTime: string, 
  intro: string, 
  mainContent: string,
  slug: string,
  category: string | null
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #172554; margin-top: 30px;">${title}</h1>
      <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
        ${formattedDate} · ${readTime}
      </p>
      
      ${category ? 
        `<div style="display: inline-block; background-color: #f3f4f6; border-radius: 4px; padding: 4px 8px; margin-bottom: 16px; font-size: 14px; color: #4b5563;">
          ${category}
        </div>` : 
        ''
      }
      
      <div style="font-size: 16px; line-height: 1.5; margin: 20px 0; color: #333;">
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 25px; color: #111827;">
          ${intro}
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; margin: 25px 0;"></div>
        
        <div style="font-size: 16px; line-height: 1.6;">
          ${mainContent}
        </div>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="https://churnisdead.com/newsletter/${slug}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Read on Website
        </a>
      </div>
      
      <div style="background-color: #f8f8f8; padding: 20px; border-left: 4px solid #dc2626; margin: 25px 0;">
        <p style="font-size: 16px; font-style: italic; color: #555;">
          "Churn isn't an event. It's the outcome of missed opportunities to deliver value."
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5; margin: 20px 0; color: #333;">
        Looking forward to killing churn together,<br>
        The Churn Is Dead Team
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
        <p>
          You received this email because you signed up for the Churn Is Dead newsletter.
          If you'd like to unsubscribe, please 
          <a href="mailto:unsubscribe@churnisdead.com?subject=Unsubscribe&body=Email: {{email}}" style="color: #666;">click here</a>.
        </p>
        <p style="margin-top: 10px; color: #888;">
          Churn Is Dead, Inc.<br>
          1234 Marketing Street, Suite 500<br>
          San Francisco, CA 94107
        </p>
        <p style="margin-top: 10px;">
          <a href="https://churnisdead.com/newsletters" style="color: #dc2626; text-decoration: underline;">View all newsletters</a>
        </p>
      </div>
    </div>
  `;
};

/**
 * Replace placeholder values in email template
 */
export const replacePlaceholders = (template: string, replacements: Record<string, string>) => {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
};

