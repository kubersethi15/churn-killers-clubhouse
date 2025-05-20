
/**
 * Utility functions for formatting newsletter content for email
 */

/**
 * Format newsletter content with Markdown-like syntax for HTML email
 */
export const formatContentForEmail = (content: string) => {
  if (!content) return "";

  // Step 1: Process headers with markdown-like syntax
  let formattedContent = content
    // Format H2 (##)
    .replace(/## (.*?)(\n|$)/g, '<h2 style="font-size: 22px; margin-top: 25px; margin-bottom: 15px; font-weight: bold; color: #172554;">$1</h2>')
    // Format H3 (###)
    .replace(/### (.*?)(\n|$)/g, '<h3 style="font-size: 18px; margin-top: 20px; margin-bottom: 10px; font-weight: bold; color: #172554;">$1</h3>')
    // Format H4 (####)
    .replace(/#### (.*?)(\n|$)/g, '<h4 style="font-size: 16px; margin-top: 18px; margin-bottom: 10px; font-weight: bold; color: #172554;">$1</h4>');

  // Step 2: Process block elements
  formattedContent = formattedContent
    // Format blockquotes
    .replace(/> (.*?)(\n|$)/g, '<blockquote style="border-left: 4px solid #172554; padding-left: 15px; font-style: italic; margin: 20px 0; color: #4b5563;">$1</blockquote>')
    // Format horizontal rule
    .replace(/---+/g, '<hr style="margin: 25px 0; border: 0; border-top: 1px solid #e5e7eb;" />');

  // Step 3: Process text formatting
  formattedContent = formattedContent
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Step 4: Process lists
  formattedContent = formattedContent
    // Convert unordered lists
    .replace(/^\* (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 8px;">$1</li>')
    // Convert ordered lists
    .replace(/^\d+\. (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 8px;">$1</li>');

  // Cleanup: Wrap lists in appropriate tags
  formattedContent = formattedContent
    .replace(/<li style="margin-left: 20px; margin-bottom: 8px;">(.*?)(<\/li>[\s\n]*<li style="margin-left: 20px; margin-bottom: 8px;">.*?)*<\/li>/gs, '<ul style="margin: 15px 0;">$&</ul>')
    .replace(/<li style="margin-left: 20px; margin-bottom: 8px;">(.*?)(<\/li>[\s\n]*<li style="margin-left: 20px; margin-bottom: 8px;">.*?)*<\/li>/gs, '<ol style="margin: 15px 0;">$&</ol>');

  // Step 5: Process paragraphs - split by newlines and wrap in paragraph tags if not already processed
  const paragraphs = formattedContent.split('\n\n');
  formattedContent = paragraphs.map(paragraph => {
    // Skip already processed elements (tags)
    if (paragraph.trim().startsWith('<') && paragraph.trim().endsWith('>')) {
      return paragraph;
    }
    
    // Skip empty paragraphs
    if (paragraph.trim() === '') {
      return '';
    }
    
    // Process pull quotes with a special syntax [QUOTE] text [/QUOTE]
    if (paragraph.includes('[QUOTE]') && paragraph.includes('[/QUOTE]')) {
      return paragraph
        .replace(/\[QUOTE\](.*?)\[\/QUOTE\]/g, 
          '<div style="margin: 25px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #172554; font-style: italic; font-size: 18px; color: #4b5563;">$1</div>');
    }
    
    // Wrap normal paragraphs
    return `<p style="margin-bottom: 16px; line-height: 1.6; color: #374151;">${paragraph}</p>`;
  }).join('');

  return formattedContent;
};

