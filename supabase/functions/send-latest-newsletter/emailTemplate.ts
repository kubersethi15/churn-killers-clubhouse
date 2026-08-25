/**
 * Newsletter email templates.
 *
 * The email gives the reader the argument's opening, then offers one clear
 * route to the canonical website issue and its playbook. Utility links stay
 * quiet in the footer so the message reads like a useful note, not a campaign.
 */

const SITE_URL = "https://churnisdead.com";

const escapeHtml = (value: string): string => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const decodeHtmlEntities = (value: string): string => value
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)));

export const htmlToPlainText = (html: string): string => decodeHtmlEntities(html
  .replace(/<\s*br\s*\/?\s*>/gi, "\n")
  .replace(/<\/(p|div|h[1-6]|blockquote|li)>/gi, "\n")
  .replace(/<li[^>]*>/gi, "- ")
  .replace(/<[^>]*>/g, " ")
  .replace(/[ \t]+/g, " ")
  .replace(/ *\n */g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim());

const truncateAtWord = (value: string, maximum: number): string => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maximum) return normalized;
  const shortened = normalized.slice(0, maximum + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 60 ? lastSpace : maximum).trim()}…`;
};

export const trackedIssueUrl = (slug: string): string => {
  const safeSlug = encodeURIComponent(slug);
  const campaign = encodeURIComponent(slug);
  return `${SITE_URL}/newsletter/${safeSlug}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaign}&utm_content=read_issue`;
};

export interface EmailTeaser {
  preheader: string;
  bodyHtml: string;
  bodyText: string;
}

export const extractEmailTeaser = (htmlContent: string, previewText = ""): EmailTeaser => {
  const fullText = htmlToPlainText(htmlContent);
  const preheader = truncateAtWord(previewText || fullText, 140);
  const openingSection = htmlContent.split(/<h2[^>]*>/i)[0] || htmlContent;
  const paragraphs = openingSection.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) ?? [];

  let bodyHtml = "";
  let bodyText = "";
  for (const paragraph of paragraphs) {
    const paragraphText = htmlToPlainText(paragraph);
    const candidate = [bodyText, paragraphText].filter(Boolean).join("\n\n");
    if (bodyText && candidate.length > 720) break;
    bodyHtml += paragraph;
    bodyText = candidate;
    if (paragraphs.length >= 3 && bodyText.length >= 360) break;
  }

  if (!bodyText) {
    bodyText = truncateAtWord(htmlToPlainText(openingSection), 680);
    bodyHtml = `<p style="margin:0 0 18px;">${escapeHtml(bodyText)}</p>`;
  }

  return { preheader, bodyHtml, bodyText };
};

export const generateNewsletterEmailTemplate = (
  title: string,
  formattedDate: string,
  readTime: string,
  previewText: string,
  mainContent: string,
  slug: string,
  category: string | null,
  postalAddress: string,
) => {
  const teaser = extractEmailTeaser(mainContent, previewText);
  const issueUrl = trackedIssueUrl(slug);
  const safeTitle = escapeHtml(title);
  const safeDate = escapeHtml(formattedDate);
  const safeReadTime = escapeHtml(readTime);
  const safeCategory = category ? escapeHtml(category) : "";
  const safePreview = escapeHtml(teaser.preheader);
  const safePostalAddress = escapeHtml(postalAddress).replace(/\r?\n/g, "<br>");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${safeTitle} | Churn Is Dead</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-wrap { padding: 0 !important; }
      .email-card { border-radius: 0 !important; }
      .content-cell { padding-left: 24px !important; padding-right: 24px !important; }
      .email-title { font-size: 30px !important; line-height: 1.08 !important; }
      .email-cta { display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f1ed;color:#172033;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none!important;max-height:0;max-width:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    ${safePreview}&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f4f1ed;">
    <tr>
      <td class="email-wrap" align="center" style="padding:28px 16px;">
        <table class="email-card" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td class="content-cell" style="padding:30px 40px 22px;border-top:5px solid #e12b31;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:11px;font-weight:700;letter-spacing:2.5px;color:#e12b31;">CHURN IS DEAD</td>
                  <td align="right" style="font-size:12px;color:#667085;">${safeDate}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="content-cell" style="padding:12px 40px 8px;">
              <h1 class="email-title" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.1;letter-spacing:-0.5px;color:#111827;">${safeTitle}</h1>
            </td>
          </tr>
          <tr>
            <td class="content-cell" style="padding:6px 40px 26px;">
              <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.5;color:#475467;">${safePreview}</p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#667085;">${safeReadTime}${safeCategory ? ` &middot; ${safeCategory}` : ""}</p>
            </td>
          </tr>
          <tr>
            <td class="content-cell" style="padding:0 40px 8px;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.7;color:#253047;">
                ${teaser.bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td class="content-cell" style="padding:18px 40px 36px;">
              <a class="email-cta" href="${issueUrl}" style="display:inline-block;padding:14px 22px;background:#172033;border-radius:5px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Read the issue and get the playbook</a>
            </td>
          </tr>
          <tr>
            <td class="content-cell" style="padding:0 40px 34px;">
              <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.6;color:#253047;">Kuber</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#667085;">If someone on your CS team needs this, forward it to them.</p>
            </td>
          </tr>
          <tr>
            <td class="content-cell" style="padding:24px 40px;background:#f8f6f3;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:#667085;">You subscribed to Churn Is Dead for one useful Customer Success idea every Tuesday. Reply to this email if you want to challenge this one.</p>
              <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:#667085;">Churn Is Dead<br>${safePostalAddress}</p>
              <p style="margin:0;font-size:12px;line-height:1.6;">
                <a href="${SITE_URL}/newsletters" style="color:#475467;text-decoration:underline;">Past issues</a>
                <span aria-hidden="true" style="color:#98a2b3;"> &middot; </span>
                <a href="{{unsubscribe_url}}" style="color:#475467;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const generateNewsletterTextTemplate = (
  title: string,
  previewText: string,
  mainContent: string,
  slug: string,
  postalAddress: string,
) => {
  const teaser = extractEmailTeaser(mainContent, previewText);
  return [
    "CHURN IS DEAD",
    "",
    title,
    teaser.preheader,
    "",
    teaser.bodyText,
    "",
    `Read the issue and get the playbook: ${trackedIssueUrl(slug)}`,
    "",
    "Kuber",
    "",
    "If someone on your CS team needs this, forward it to them.",
    "",
    "You subscribed to Churn Is Dead for one useful Customer Success idea every Tuesday.",
    "Reply to this email if you want to challenge this one.",
    `Churn Is Dead, ${postalAddress.replace(/\s+/g, " ").trim()}`,
    `Past issues: ${SITE_URL}/newsletters`,
    "Unsubscribe: {{unsubscribe_url}}",
  ].join("\n");
};

/** Replace trusted placeholders after the template has escaped editorial data. */
export const replacePlaceholders = (template: string, replacements: Record<string, string>) => {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
};
