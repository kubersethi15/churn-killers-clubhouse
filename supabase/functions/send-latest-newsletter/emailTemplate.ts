
/**
 * Functions for generating newsletter email templates
 * v2: Marketing-grade email that hooks readers and drives clicks
 */

/**
 * Generate HTML email content for newsletter
 * Strategy: Tease with opening story + first key insight, then drive to website
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
  // Extract a teaser from the main content (first ~600 chars of actual text)
  const teaser = extractTeaser(mainContent);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Churn Is Dead</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f3f0; font-family: Georgia, 'Times New Roman', serif;">
  
  <!-- Preheader text (shows in inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden; color: #f7f3f0; font-size: 1px;">
    ${teaser.preheader}
  </div>

  <!-- Outer container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f3f0;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        
        <!-- Email card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 2px;">
          
          <!-- Brand header -->
          <tr>
            <td style="padding: 32px 40px 20px 40px; border-bottom: 3px solid #C8553D;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 3px; color: #C8553D; text-transform: uppercase;">CHURN IS DEAD</span>
                  </td>
                  <td align="right">
                    <span style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #9A9A9A;">${formattedDate}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 32px 40px 8px 40px;">
              <h1 style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 28px; font-weight: bold; line-height: 1.2; color: #0D0D0D;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Meta line -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <span style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #9A9A9A;">
                ${readTime}${category ? ` · ${category}` : ''}
              </span>
            </td>
          </tr>

          <!-- Opening hook / teaser content -->
          <tr>
            <td style="padding: 0 40px 8px 40px;">
              <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 17px; line-height: 1.7; color: #2A2A2A;">
                ${teaser.body}
              </div>
            </td>
          </tr>

          <!-- Fade-out effect + CTA -->
          <tr>
            <td style="padding: 0 40px 0 40px;">
              <!-- Gradient fade -->
              <div style="position: relative; height: 60px; background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1)); margin-top: -60px;"></div>
            </td>
          </tr>

          <!-- Primary CTA -->
          <tr>
            <td align="center" style="padding: 16px 40px 32px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #C8553D; border-radius: 4px;">
                    <a href="https://churnisdead.com/newsletter/${slug}" 
                       style="display: inline-block; padding: 14px 32px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; font-weight: bold; color: #ffffff; text-decoration: none;">
                      Read the Full Issue →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's inside teaser -->
          <tr>
            <td style="padding: 0 40px 32px 40px; border-top: 1px solid #e8e4e0;">
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #C8553D; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px 0;">
                In this issue:
              </p>
              ${teaser.insideList}
            </td>
          </tr>

          <!-- Secondary CTA -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <a href="https://churnisdead.com/newsletter/${slug}" 
                 style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; color: #C8553D; text-decoration: underline;">
                Continue Reading on churnisdead.com
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f7f3f0; border-top: 1px solid #e8e4e0;">
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #6B6B6B; margin: 0 0 12px 0;">
                Weekly frameworks that replace hope with strategy.<br>
                Written by <strong style="color: #2A2A2A;">Kuber Sethi</strong>
              </p>
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #9A9A9A; margin: 0 0 8px 0;">
                You received this because you subscribed to Churn Is Dead.
              </p>
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; margin: 0;">
                <a href="https://churnisdead.com/newsletters" style="color: #C8553D; text-decoration: underline;">Past issues</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="mailto:unsubscribe@churnisdead.com?subject=Unsubscribe&body=Email: {{email}}" style="color: #9A9A9A; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- End email card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

/**
 * Extract a teaser from HTML content
 * Gets the opening story hook + builds an "In this issue" list from h2/h3 headers
 */
function extractTeaser(htmlContent: string): { preheader: string; body: string; insideList: string } {
  // Strip HTML tags for preheader
  const plainText = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const preheader = plainText.substring(0, 140) + '...';
  
  // Extract first few paragraphs for the teaser body (opening story hook)
  // Get content up to the second <h2> or <hr> (whichever comes first after the first section)
  let body = '';
  const sections = htmlContent.split(/<h2[^>]*>/i);
  
  if (sections.length >= 2) {
    // First section (before first h2) - this is usually the opening story
    body = sections[0];
    
    // If the first section is too short, include content up to the first h2
    if (body.replace(/<[^>]*>/g, '').trim().length < 200 && sections.length >= 3) {
      body = sections[0] + '<h2>' + sections[1].split(/<h2[^>]*>/i)[0];
    }
  } else {
    // No h2 found, just take first ~800 chars of content
    body = htmlContent.substring(0, 800);
  }
  
  // Trim to a reasonable length - find a good paragraph break point
  const paragraphs = body.split('</p>');
  let teaserBody = '';
  for (const p of paragraphs) {
    const candidate = teaserBody + p + '</p>';
    if (candidate.replace(/<[^>]*>/g, '').length > 600) break;
    teaserBody = candidate;
  }
  
  // If teaser is still too short, just use what we have
  if (teaserBody.replace(/<[^>]*>/g, '').trim().length < 100) {
    teaserBody = body;
  }
  
  // Extract h2 and h3 headers for "In this issue" list
  const headerRegex = /<h[23][^>]*>(.*?)<\/h[23]>/gi;
  const headers: string[] = [];
  let match;
  while ((match = headerRegex.exec(htmlContent)) !== null) {
    const headerText = match[1].replace(/<[^>]*>/g, '').trim();
    if (headerText && !headerText.includes('Churn Is Dead') && headers.length < 4) {
      headers.push(headerText);
    }
  }
  
  let insideList = '';
  if (headers.length > 0) {
    insideList = headers.map(h => 
      `<p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #2A2A2A; margin: 0 0 8px 0; padding-left: 12px; border-left: 2px solid #C8553D;">
        ${h}
      </p>`
    ).join('');
  }
  
  return { preheader, body: teaserBody, insideList };
}

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
