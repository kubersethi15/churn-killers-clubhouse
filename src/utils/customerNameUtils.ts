// ============================================================================
// Customer Name Validation Utilities
// Robust validation to catch LLM-generated placeholder strings.
// Used on both frontend and mirrored in pipeline post-processing (Deno).
// ============================================================================

/**
 * Phrases that indicate the LLM generated a descriptive placeholder
 * instead of returning null for an undetectable customer name.
 */
const REJECT_PHRASES = [
  'not explicitly named',
  'not explicitly mentioned',
  'not explicitly identified',
  'not explicitly stated',
  'unnamed',
  'unknown customer',
  'unknown company',
  'not detected',
  'not identified',
  'not mentioned',
  'not provided',
  'not specified',
  'not disclosed',
  'implied by',
  'inferred from',
  'appears to be',
  'seems to be',
  'possibly',
  'likely',
];

/**
 * Validates whether a customer name string is a real name vs a placeholder.
 * The Judge sometimes generates verbose descriptive placeholders like:
 *   "** Not explicitly named (Splunk mentioned as the product)"
 *   "** Unnamed (Trading Floor context mentioned)"
 *   "** Financial Services (implied by Nicole's benchmark comment)"
 * This function catches all such patterns.
 */
export function isValidCustomerName(name: string | null | undefined): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();

  // Catch literal null/undefined/n-a strings
  if (lower === 'null' || lower === 'undefined' || lower === 'n/a') return false;

  // Catch LLM markdown-style or bracket placeholders
  if (trimmed.startsWith('**')) return false;
  if (trimmed.startsWith('--')) return false;
  if (trimmed.startsWith('[')) return false;

  // Catch descriptive placeholder patterns
  if (REJECT_PHRASES.some(phrase => lower.includes(phrase))) return false;

  // Reject suspiciously long strings (real company names < 50 chars)
  if (trimmed.length > 50) return false;

  // Reject names with parenthetical explanations when they're long
  // e.g. "Acme (mentioned in passing)" but allow "Northstar (Manufacturing)"
  if (trimmed.includes('(') && trimmed.length > 35) return false;

  return true;
}

/**
 * Returns a display-safe customer name, falling back to a clean default.
 */
export function getDisplayCustomerName(
  name: string | null | undefined,
  fallback = 'Customer Report'
): string {
  return isValidCustomerName(name) ? name!.trim() : fallback;
}

/**
 * Builds a clean PDF filename from the customer name and optional call type.
 */
export function getPdfFilename(
  name: string | null | undefined,
  callType?: string | null
): string {
  if (isValidCustomerName(name)) {
    return `${name!.trim()} — CS Intelligence Report.pdf`;
  }
  const suffix = callType
    ? `${callType.replace(/_/g, ' ')} — ${new Date().toISOString().split('T')[0]}`
    : new Date().toISOString().split('T')[0];
  return `CS Intelligence Report — ${suffix}.pdf`;
}
