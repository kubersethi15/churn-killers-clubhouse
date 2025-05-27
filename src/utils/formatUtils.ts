
import { format } from "date-fns";

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string) => {
  return format(new Date(dateString), "MMMM d, yyyy");
};

/**
 * Format newsletter content with Markdown-like formatting
 */
export const formatContent = (content: string) => {
  if (!content) return "";

  // Step 1: Clean up incomplete bold formatting first, before other processing
  let formattedContent = content
    // Remove incomplete bold markers at the start of lines (like **Why Your Most Active...)
    .replace(/^\*\*([^*\n]+?)(\n|$)/gm, '$1')
    // Remove any other incomplete bold markers
    .replace(/\*\*([^*\n]+?)(\n\n|\n(?=\n)|$)/g, '$1');

  // Step 2: Process headers with markdown-like syntax
  formattedContent = formattedContent
    // Format H1 (#) - Added this line to handle single # headings
    .replace(/^# (.*?)(\n|$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>')
    // Format H2 (##)
    .replace(/^## (.*?)(\n|$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    // Format H3 (###)
    .replace(/^### (.*?)(\n|$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
    // Format H4 (####)
    .replace(/^#### (.*?)(\n|$)/gm, '<h4 class="text-lg font-bold mt-5 mb-2">$1</h4>');

  // Step 3: Process block elements
  formattedContent = formattedContent
    // Format blockquotes
    .replace(/> (.*?)(\n|$)/g, '<blockquote class="border-l-4 border-navy pl-4 italic my-6 text-gray-700">$1</blockquote>')
    // Format horizontal rule
    .replace(/---+/g, '<hr class="my-8 border-t border-gray-200" />');

  // Step 4: Process text formatting - only complete pairs
  formattedContent = formattedContent
    // Bold text - only match complete pairs of **
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    // Italic text - only match complete pairs of *
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');

  // Step 5: Process lists
  formattedContent = formattedContent
    // Convert unordered lists
    .replace(/^\* (.*?)$/gm, '<li class="ml-6 list-disc mb-2">$1</li>')
    // Convert ordered lists
    .replace(/^\d+\. (.*?)$/gm, '<li class="ml-6 list-decimal mb-2">$1</li>');

  // Cleanup: Wrap lists in appropriate tags
  formattedContent = formattedContent
    .replace(/<li class="ml-6 list-disc mb-2">(.*?)(<\/li>[\s\n]*<li class="ml-6 list-disc mb-2">.*?)*<\/li>/gs, '<ul class="my-4">$&</ul>')
    .replace(/<li class="ml-6 list-decimal mb-2">(.*?)(<\/li>[\s\n]*<li class="ml-6 list-decimal mb-2">.*?)*<\/li>/gs, '<ol class="my-4">$&</ol>');

  // Step 6: Process paragraphs - split by newlines and wrap in paragraph tags if not already processed
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
          '<div class="my-8 px-6 py-4 bg-gray-50 border-l-4 border-navy-light italic text-xl text-gray-700 font-serif">$1</div>');
    }
    
    // Wrap normal paragraphs
    return `<p class="mb-6 leading-relaxed">${paragraph}</p>`;
  }).join('');

  return formattedContent;
};
