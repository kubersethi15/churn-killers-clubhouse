// ============================================================================
// Customer Name Validation Utilities
// Robust validation to catch LLM-generated placeholder strings
// ============================================================================

/**
 * Validates whether a customer name string is a real name vs a placeholder.
 * The Judge sometimes generates verbose descriptive placeholders like:
 *   "** Not explicitly named (Splunk mentioned as the product)"
 *   "** Unnamed (Trading Floor context mentioned)"
 * This function catches all such patterns.
 */
export function isValidCustomerName(name: string | null | undefined): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();

  // Catch literal null/undefined strings
  if (lower === 'null' || lower === 'undefined') return false;

  // Catch LLM markdown-style placeholders
  if (trimmed.startsWith('**')) return false;

  // Catch descriptive placeholder patterns
  if (lower.includes('not explicitly named')) return false;
  if (lower.includes('unnamed')) return false;
  if (lower.includes('not detected')) return false;
  if (lower.includes('not identified')) return false;
  if (lower.includes('unknown customer')) return false;
  if (lower.includes('not available')) return false;

  // Reject suspiciously long strings (real names < 50 chars)
  if (trimmed.length > 50) return false;

  return true;
}

/**
 * Returns a display-safe customer name, falling back to a clean default.
 */
export function getDisplayCustomerName(
  name: string | null | undefined,
  fallback = 'Customer Report'
): string {
  return isValidCustomerName(name) ? name! : fallback;
}

/**
 * Builds a clean PDF filename from the customer name.
 */
export function getPdfFilename(name: string | null | undefined): string {
  if (isValidCustomerName(name)) {
    return `${name} — CS Intelligence Report.pdf`;
  }
  return `CS Intelligence Report — ${new Date().toISOString().split('T')[0]}.pdf`;
}
