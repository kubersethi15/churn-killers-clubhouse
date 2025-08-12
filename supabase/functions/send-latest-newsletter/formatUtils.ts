
/**
 * Utility functions for formatting newsletter content for email
 */

/**
 * Format newsletter content with Markdown-like syntax for HTML email
 */
export const formatContentForEmail = (content: string) => {
  if (!content) return "";

  // Normalize line endings and force any inline '---' into standalone HR with spacing
  content = content.replace(/\r\n/g, '\n')
                   .replace(/\s*---+\s*/g, '\n\n---\n\n')
                   .replace(/\n{3,}/g, '\n\n');

  // Remove leading title + subtitle block if present (e.g., Title line followed by **(...)** or **...**)
  {
    const lines = content.split('\n');
    // drop leading empty lines
    while (lines.length && lines[0].trim() === '') lines.shift();
    if (lines.length >= 2) {
      const first = lines[0].trim();
      const second = lines[1].trim();
      if (first && (/^\*\*\(.*\)\*\*$/.test(second) || /^\*\*.*\*\*$/.test(second))) {
        lines.splice(0, 2);
        content = lines.join('\n');
      }
    }
  }

  // Step 1: Process headers with markdown-like syntax (allow leading spaces)
  let formattedContent = content
    // Format H1 (#)
    .replace(/^\s*#\s+(.*?)(\n|$)/gm, '<h1 style="font-size: 26px; margin-top: 30px; margin-bottom: 20px; font-weight: bold; color: #172554;">$1</h1>')
    // Format H2 (##)
    .replace(/^\s*##\s+(.*?)(\n|$)/gm, '<h2 style="font-size: 22px; margin-top: 25px; margin-bottom: 15px; font-weight: bold; color: #172554;">$1</h2>')
    // Format H3 (###)
    .replace(/^\s*###\s+(.*?)(\n|$)/gm, '<h3 style="font-size: 18px; margin-top: 20px; margin-bottom: 10px; font-weight: bold; color: #172554;">$1</h3>')
    // Format H4 (####)
    .replace(/^\s*####\s+(.*?)(\n|$)/gm, '<h4 style="font-size: 16px; margin-top: 18px; margin-bottom: 10px; font-weight: bold; color: #172554;">$1</h4>');

  // Step 2: Process block elements
  formattedContent = formattedContent
    // Format blockquotes (allow leading spaces)
    .replace(/^\s*>\s+(.*?)(\n|$)/gm, '<blockquote style="border-left: 4px solid #172554; padding-left: 15px; font-style: italic; margin: 20px 0; color: #4b5563;">$1</blockquote>')
    // Format horizontal rule (line with only hyphens)
    .replace(/^\s*---+\s*$/gm, '<hr style="margin: 25px 0; border: 0; border-top: 1px solid #e5e7eb;" />');

  // Step 3: Process text formatting - improved to handle incomplete formatting
  formattedContent = formattedContent
    // Bold text - only match complete pairs of **
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    // Clean up any remaining incomplete bold formatting - handle cases where ** appears at start but no closing **
    .replace(/^\*\*([^*\n]+?)(\n\n|\n(?!\n)|$)/gm, '<strong>$1</strong>')
    // Also handle mid-text incomplete bold formatting
    .replace(/\*\*([^*\n]+?)(\n\n|\n(?=\n)|$)/g, '<strong>$1</strong>')
    // Italic text - only match complete pairs of *
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');

  // Step 4: Process lists - Updated to handle both * and - bullet points with better spacing
  formattedContent = formattedContent
    // Convert unordered lists with asterisk
    .replace(/^\* (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 12px;">$1</li>')
    // Convert unordered lists with dash
    .replace(/^- (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 12px;">$1</li>')
    // Convert ordered lists - improved spacing with better regex
    .replace(/^\d+\.\s+(.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 16px; line-height: 1.6;">$1</li>');

  // Cleanup: Wrap lists in appropriate tags with better spacing
  formattedContent = formattedContent
    .replace(/<li style="margin-left: 20px; margin-bottom: 12px;">(.*?)(<\/li>[\s\n]*<li style="margin-left: 20px; margin-bottom: 12px;">.*?)*<\/li>/gs, '<ul style="margin: 20px 0; padding-left: 0;">$&</ul>')
    .replace(/<li style="margin-left: 20px; margin-bottom: 16px; line-height: 1.6;">(.*?)(<\/li>[\s\n]*<li style="margin-left: 20px; margin-bottom: 16px; line-height: 1.6;">.*?)*<\/li>/gs, '<ol style="margin: 20px 0; padding-left: 0;">$&</ol>');

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
