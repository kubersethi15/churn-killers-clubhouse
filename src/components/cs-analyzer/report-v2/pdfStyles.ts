// ============================================================================
// Premium PDF Report Stylesheet
// Renders a polished, print-ready document from the frozen snapshot DOM.
// ============================================================================

export const getPdfCss = () => `
  /* ======================================================================
     Reset & Base Typography
     ====================================================================== */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @page {
    size: A4;
    margin: 20mm 18mm 22mm 18mm;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    line-height: 1.65;
    color: #1e293b;
    background: #ffffff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    max-width: 100%;
    padding: 0;
  }

  /* ======================================================================
     Cover / Title Block
     ====================================================================== */
  .pdf-cover {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 85vh;
    padding: 48px 40px;
    position: relative;
  }

  .pdf-cover::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #1a1a2e, #2d3a6e, #c0392b);
  }

  .pdf-cover-brand {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 32px;
  }

  .pdf-cover h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 32px;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.2;
    margin-bottom: 16px;
    max-width: 560px;
  }

  .pdf-cover-meta {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 8px;
  }

  .pdf-cover-divider {
    width: 64px;
    height: 3px;
    background: #c0392b;
    border-radius: 2px;
    margin: 28px 0;
  }

  .pdf-cover-footer {
    margin-top: auto;
    padding-top: 32px;
    border-top: 1px solid #e2e8f0;
    font-size: 10px;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pdf-cover-footer span:first-child {
    font-weight: 600;
    color: #64748b;
  }

  /* ======================================================================
     Section Headers
     ====================================================================== */
  h1, h2, h3 {
    font-family: 'Playfair Display', Georgia, serif;
    color: #1a1a2e;
  }

  h2 { font-size: 18px; margin: 24px 0 10px 0; }
  h3 { font-size: 15px; margin: 18px 0 8px 0; }

  /* ======================================================================
     Cards — Print-Friendly Treatment
     ====================================================================== */
  [class*="card"],
  .rounded-xl {
    break-inside: avoid;
    page-break-inside: avoid;
    border: 1px solid #e2e8f0 !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    margin-bottom: 16px;
    overflow: hidden;
  }

  /* Card headers get a subtle tint */
  [class*="cardHeader"],
  .border-b {
    border-bottom: 1px solid #e2e8f0 !important;
    background-color: #f8fafc !important;
  }

  /* ======================================================================
     Executive Snapshot — Navy Gradient Header
     ====================================================================== */
  .bg-gradient-to-r {
    background: linear-gradient(135deg, #1a1a2e 0%, #2d3a6e 60%, #3b4f8a 100%) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ======================================================================
     Tables — Polished Grid
     ====================================================================== */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 10px 0;
    font-size: 11px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  thead tr {
    background: #f1f5f9 !important;
    -webkit-print-color-adjust: exact !important;
  }

  th {
    font-weight: 600;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #475569;
    padding: 10px 12px;
    text-align: left;
    border-bottom: 2px solid #e2e8f0;
  }

  td {
    padding: 9px 12px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
    color: #334155;
  }

  tr:last-child td { border-bottom: none; }

  tr:nth-child(even) {
    background: #fafbfc !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* ======================================================================
     Badges, Pills & Chips — Print Colored Backgrounds
     ====================================================================== */
  [class*="rounded"][class*="text-"][class*="bg-"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Severity badges */
  .bg-red-100 { background-color: #fee2e2 !important; }
  .bg-orange-100 { background-color: #ffedd5 !important; }
  .bg-amber-100 { background-color: #fef3c7 !important; }
  .bg-emerald-100 { background-color: #d1fae5 !important; }
  .bg-blue-100 { background-color: #dbeafe !important; }
  .bg-violet-100 { background-color: #ede9fe !important; }
  .bg-cyan-100 { background-color: #cffafe !important; }
  .bg-slate-100 { background-color: #f1f5f9 !important; }

  .bg-red-50 { background-color: #fef2f2 !important; }
  .bg-orange-50 { background-color: #fff7ed !important; }
  .bg-amber-50 { background-color: #fffbeb !important; }
  .bg-emerald-50 { background-color: #ecfdf5 !important; }
  .bg-slate-50 { background-color: #f8fafc !important; }

  .text-red-700 { color: #b91c1c !important; }
  .text-red-600 { color: #dc2626 !important; }
  .text-orange-700 { color: #c2410c !important; }
  .text-amber-700 { color: #b45309 !important; }
  .text-emerald-700 { color: #047857 !important; }
  .text-emerald-600 { color: #059669 !important; }
  .text-blue-700 { color: #1d4ed8 !important; }
  .text-violet-700 { color: #6d28d9 !important; }
  .text-slate-600 { color: #475569 !important; }
  .text-slate-500 { color: #64748b !important; }

  /* Navy gradient background chips */
  .bg-navy-dark { background-color: #1a1a2e !important; }
  .bg-navy-dark\\/10,
  [class*="bg-navy-dark/10"] { background-color: rgba(26,26,46,0.1) !important; }
  .bg-navy-dark\\/20,
  [class*="bg-navy-dark/20"] { background-color: rgba(26,26,46,0.2) !important; }

  .text-navy-dark { color: #1a1a2e !important; }
  .text-white { color: #ffffff !important; }

  /* ======================================================================
     List Items & Fact Cards
     ====================================================================== */
  .bg-report-surface\\/50,
  [class*="bg-report-surface"] {
    background-color: #f8f9fb !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* ======================================================================
     Charts — Recharts SVG
     ====================================================================== */
  .recharts-wrapper,
  .recharts-surface {
    max-width: 100% !important;
  }

  .recharts-wrapper svg {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ======================================================================
     Interactive Elements — HIDE in PDF
     ====================================================================== */
  button,
  [role="button"],
  .evidence-chip-trigger,
  [data-radix-collection-item],
  input[type="checkbox"],
  .group-hover\\:text-navy-dark\\/40 {
    display: none !important;
  }

  /* Show checkmark icon for completed action items (static) */
  .text-emerald-600 svg { display: inline !important; }

  /* ======================================================================
     Confidence Badges — Simplified for Print
     ====================================================================== */
  [class*="ConfidenceBadge"],
  [title*="confidence"] {
    font-size: 9px;
    opacity: 0.7;
  }

  /* ======================================================================
     Spacing & Flow
     ====================================================================== */
  .space-y-4 > * + * { margin-top: 16px; }
  .space-y-3 > * + * { margin-top: 12px; }
  .space-y-2 > * + * { margin-top: 8px; }
  .space-y-1 > * + * { margin-top: 4px; }

  .p-5, .p-4 { padding: 16px !important; }
  .px-5 { padding-left: 16px !important; padding-right: 16px !important; }
  .py-4 { padding-top: 12px !important; padding-bottom: 12px !important; }
  .py-3 { padding-top: 10px !important; padding-bottom: 10px !important; }

  .gap-3 { gap: 10px; }
  .gap-2 { gap: 8px; }
  .gap-4 { gap: 14px; }

  /* ======================================================================
     Grid — Flatten for Print
     ====================================================================== */
  .grid {
    display: grid !important;
  }
  .lg\\:grid-cols-3 { grid-template-columns: 2fr 1fr !important; }
  .lg\\:grid-cols-\\[280px_1fr\\] { grid-template-columns: 1fr !important; }

  /* ======================================================================
     Timeline Vertical Line (Facts)
     ====================================================================== */
  .absolute.left-3 {
    left: 12px !important;
  }
  .absolute.left-1\\.5 {
    left: 6px !important;
  }

  /* ======================================================================
     Action Plan Cards — Render as Structured Blocks
     ====================================================================== */
  .sm\\:grid-cols-3 {
    grid-template-columns: repeat(3, 1fr) !important;
    display: grid !important;
  }

  /* ======================================================================
     Page Break Hints
     ====================================================================== */
  .space-y-4 > div:nth-child(n+3) {
    page-break-before: auto;
  }

  /* Force page break before major sections */
  .space-y-4 > div {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* ======================================================================
     Footer / Page Numbers (via @page would need more support)
     ====================================================================== */
  .pdf-page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 18mm;
    font-size: 9px;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
  }

  /* ======================================================================
     Print Media Overrides
     ====================================================================== */
  @media print {
    body { padding: 0 !important; }
    .pdf-cover { min-height: 90vh; }
    [class*="card"] { box-shadow: none !important; }
    .bg-gradient-to-r { color-adjust: exact; }
  }
`;

/**
 * Build the cover page HTML for the PDF report.
 */
export const buildCoverPage = (title: string, finalizedAt: string): string => {
  const dateStr = new Date(finalizedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <div class="pdf-cover">
      <div class="pdf-cover-brand">Churn Is Dead — CS Intelligence</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="pdf-cover-divider"></div>
      <p class="pdf-cover-meta">Executive Diagnostic Report</p>
      <p class="pdf-cover-meta">Finalized ${dateStr}</p>
      <div class="pdf-cover-footer">
        <span>Confidential — Internal Use Only</span>
        <span>Generated by CS Analyzer</span>
      </div>
    </div>
  `;
};

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
