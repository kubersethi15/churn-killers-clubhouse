
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

  // Step 1: Process headers with markdown-like syntax
  let formattedContent = content
    // Format H1 (#) - Added this line to handle single # headings
    .replace(/^# (.*?)(\n|$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>')
    // Format H2 (##)
    .replace(/^## (.*?)(\n|$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    // Format H3 (###)
    .replace(/^### (.*?)(\n|$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
    // Format H4 (####)
    .replace(/^#### (.*?)(\n|$)/gm, '<h4 class="text-lg font-bold mt-5 mb-2">$1</h4>');

  // Step 2: Process tables before other formatting
  formattedContent = processMarkdownTables(formattedContent);

  // Step 3: Process block elements
  formattedContent = formattedContent
    // Format blockquotes
    .replace(/> (.*?)(\n|$)/g, '<blockquote class="border-l-4 border-navy pl-4 italic my-6 text-gray-700">$1</blockquote>')
    // Format horizontal rule
    .replace(/---+/g, '<hr class="my-8 border-t border-gray-200" />');

  // Step 4: Process text formatting - improved to handle incomplete formatting
  formattedContent = formattedContent
    // Bold text - only match complete pairs of **
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    // Clean up any remaining incomplete bold formatting - handle cases where ** appears at start but no closing **
    .replace(/^\*\*([^*\n]+?)(\n\n|\n(?!\n)|$)/gm, '<strong>$1</strong>')
    // Also handle mid-text incomplete bold formatting
    .replace(/\*\*([^*\n]+?)(\n\n|\n(?=\n)|$)/g, '<strong>$1</strong>')
    // Italic text - only match complete pairs of *
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');

  // Step 5: Process lists - Updated to handle both * and - bullet points with better spacing
  formattedContent = formattedContent
    // Convert unordered lists with asterisk
    .replace(/^\* (.*?)$/gm, '<li class="ml-6 list-disc mb-3">$1</li>')
    // Convert unordered lists with dash
    .replace(/^- (.*?)$/gm, '<li class="ml-6 list-disc mb-3">$1</li>')
    // Convert ordered lists - improved spacing
    .replace(/^\d+\.\s+(.*?)$/gm, '<li class="ml-6 list-decimal mb-4 leading-relaxed">$1</li>');

  // Cleanup: Wrap lists in appropriate tags with better spacing
  formattedContent = formattedContent
    .replace(/<li class="ml-6 list-disc mb-3">(.*?)(<\/li>[\s\n]*<li class="ml-6 list-disc mb-3">.*?)*<\/li>/gs, '<ul class="my-6 space-y-2">$&</ul>')
    .replace(/<li class="ml-6 list-decimal mb-4 leading-relaxed">(.*?)(<\/li>[\s\n]*<li class="ml-6 list-decimal mb-4 leading-relaxed">.*?)*<\/li>/gs, '<ol class="my-6 space-y-3">$&</ol>');

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

/**
 * Process markdown-style tables and convert them to HTML tables
 */
function processMarkdownTables(content: string): string {
  // Match markdown tables with pipe separators
  const tableRegex = /(\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)*)/gm;
  
  return content.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n');
    if (lines.length < 2) return match;
    
    const headerLine = lines[0];
    const separatorLine = lines[1];
    const dataLines = lines.slice(2);
    
    // Parse header
    const headers = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
    
    // Parse data rows
    const rows = dataLines.map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
    );
    
    // Build HTML table
    let tableHtml = '<div class="overflow-x-auto my-8"><table class="w-full border-collapse border border-gray-300">';
    
    // Add header
    tableHtml += '<thead class="bg-gray-50"><tr>';
    headers.forEach(header => {
      tableHtml += `<th class="border border-gray-300 px-4 py-2 text-left font-semibold">${header}</th>`;
    });
    tableHtml += '</tr></thead>';
    
    // Add body
    tableHtml += '<tbody>';
    rows.forEach(row => {
      tableHtml += '<tr>';
      row.forEach((cell, index) => {
        // Add special styling for trend indicators
        let cellContent = cell;
        if (cell.includes('↑') || cell.includes('⬆')) {
          cellContent = `<span class="text-green-600 font-semibold">${cell}</span>`;
        } else if (cell.includes('↓') || cell.includes('⬇')) {
          cellContent = `<span class="text-red-600 font-semibold">${cell}</span>`;
        } else if (cell.includes('→') || cell.includes('➡')) {
          cellContent = `<span class="text-yellow-600 font-semibold">${cell}</span>`;
        }
        
        tableHtml += `<td class="border border-gray-300 px-4 py-2">${cellContent}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table></div>';
    
    return tableHtml;
  });
}
