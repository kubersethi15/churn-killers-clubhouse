// ============================================================================
// Fallback PDF Stylesheet — Enterprise Design System
// Applied to DOM-captured HTML when the edge function is unavailable.
// ============================================================================

export const getPdfCss = () => `
  /* ── Reset & Base ─────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @page { size: A4; margin: 20mm 18mm 22mm 18mm; }

  body {
    font-family: 'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    line-height: 1.65;
    color: #2C3E50;
    background: #ffffff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    max-width: 100%;
    padding: 0;
  }

  /* ── Cover page ───────────────────────────────────────────── */
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
    top: 0; left: 0; right: 0;
    height: 6px;
    background: linear-gradient(90deg, #0F1A2E, #1B3A5C, #2E7D6F);
  }

  .pdf-cover-brand {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #0F1A2E;
    color: #fff;
    padding: 6px 14px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    width: fit-content;
    margin-bottom: 24px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pdf-cover h1 {
    font-size: 28pt;
    font-weight: 700;
    color: #0F1A2E;
    line-height: 1.15;
    margin-bottom: 8px;
    max-width: 480px;
  }

  .pdf-cover-subtitle {
    font-size: 13pt;
    color: #6B7B8D;
    font-weight: 400;
    margin-bottom: 40px;
    max-width: 420px;
  }

  .pdf-cover-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 32px;
    padding: 20px 24px;
    background: #F4F6F8;
    border-radius: 8px;
    border-left: 4px solid #2E7D6F;
    max-width: 460px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pdf-cover-meta-item {
    display: flex;
    flex-direction: column;
    padding: 6px 0;
  }

  .pdf-cover-meta-label {
    font-size: 7pt;
    font-weight: 600;
    color: #6B7B8D;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    margin-bottom: 2px;
  }

  .pdf-cover-meta-value {
    font-size: 10pt;
    font-weight: 500;
    color: #0F1A2E;
  }

  .pdf-cover-classification {
    margin-top: 48px;
    padding: 10px 16px;
    background: #FDEDEB;
    border: 1px solid #E8C4BF;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 600;
    color: #C0392B;
    letter-spacing: 1px;
    text-transform: uppercase;
    width: fit-content;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .pdf-cover-footer {
    margin-top: auto;
    padding-top: 32px;
    border-top: 1px solid #DDE3EA;
    font-size: 9px;
    color: #6B7B8D;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pdf-cover-footer span:first-child {
    font-weight: 600;
    color: #4A5568;
  }

  /* ── Section Headers ──────────────────────────────────────── */
  h1, h2, h3 {
    color: #0F1A2E;
  }
  h2 { font-size: 18px; margin: 24px 0 10px 0; font-weight: 700; }
  h3 { font-size: 15px; margin: 18px 0 8px 0; font-weight: 600; }

  /* ── Cards ─────────────────────────────────────────────────── */
  [class*="card"],
  .rounded-xl {
    break-inside: avoid;
    page-break-inside: avoid;
    border: 1px solid #DDE3EA !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    margin-bottom: 16px;
    overflow: hidden;
  }

  [class*="cardHeader"],
  .border-b {
    border-bottom: 1px solid #DDE3EA !important;
    background-color: #F4F6F8 !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* ── Executive Snapshot gradient ───────────────────────────── */
  .bg-gradient-to-r {
    background: linear-gradient(135deg, #0F1A2E 0%, #1E3F5F 100%) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ── Tables ────────────────────────────────────────────────── */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 10px 0;
    font-size: 11px;
    border: 1px solid #DDE3EA;
    border-radius: 8px;
    overflow: hidden;
  }

  thead tr {
    background: #F4F6F8 !important;
    -webkit-print-color-adjust: exact !important;
  }

  th {
    font-weight: 600;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #6B7B8D;
    padding: 10px 12px;
    text-align: left;
    border-bottom: 2px solid #DDE3EA;
  }

  td {
    padding: 9px 12px;
    border-bottom: 1px solid #F4F6F8;
    vertical-align: top;
    color: #2C3E50;
  }

  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) {
    background: #FAFBFC !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* ── Badge colors — force print ────────────────────────────── */
  [class*="rounded"][class*="text-"][class*="bg-"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .bg-red-100 { background-color: #FDEDEB !important; }
  .bg-red-50 { background-color: #FEF2F2 !important; }
  .bg-orange-100, .bg-orange-50 { background-color: #FFF3E8 !important; }
  .bg-amber-100, .bg-amber-50 { background-color: #FFFBEB !important; }
  .bg-emerald-100, .bg-emerald-50 { background-color: #E8F8EF !important; }
  .bg-blue-100 { background-color: #E8F0FE !important; }
  .bg-violet-100 { background-color: #F0E8FE !important; }
  .bg-cyan-100 { background-color: #CFFAFE !important; }
  .bg-slate-100, .bg-slate-50 { background-color: #F4F6F8 !important; }

  .text-red-700, .text-red-600 { color: #C0392B !important; }
  .text-orange-700 { color: #D4792A !important; }
  .text-amber-700 { color: #B45309 !important; }
  .text-emerald-700, .text-emerald-600 { color: #27AE60 !important; }
  .text-blue-700 { color: #1A56DB !important; }
  .text-violet-700 { color: #6B21A8 !important; }
  .text-slate-600, .text-slate-500 { color: #6B7B8D !important; }

  .bg-navy-dark { background-color: #0F1A2E !important; }
  .text-navy-dark { color: #0F1A2E !important; }
  .text-white { color: #ffffff !important; }

  /* ── Surface backgrounds ──────────────────────────────────── */
  .bg-report-surface\\/50,
  [class*="bg-report-surface"] {
    background-color: #F4F6F8 !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* ── Charts ────────────────────────────────────────────────── */
  .recharts-wrapper, .recharts-surface { max-width: 100% !important; }
  .recharts-wrapper svg {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ── Hide interactive elements ─────────────────────────────── */
  button,
  [role="button"],
  .evidence-chip-trigger,
  [data-radix-collection-item],
  input[type="checkbox"],
  .group-hover\\:text-navy-dark\\/40 {
    display: none !important;
  }
  .text-emerald-600 svg { display: inline !important; }

  /* ── Spacing ───────────────────────────────────────────────── */
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

  /* ── Grid flatten ──────────────────────────────────────────── */
  .grid { display: grid !important; }
  .lg\\:grid-cols-3 { grid-template-columns: 2fr 1fr !important; }
  .lg\\:grid-cols-\\[280px_1fr\\] { grid-template-columns: 1fr !important; }
  .sm\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; display: grid !important; }

  /* ── Page breaks ───────────────────────────────────────────── */
  .space-y-4 > div { break-inside: avoid; page-break-inside: avoid; }

  /* ── Print overrides ───────────────────────────────────────── */
  @media print {
    body { padding: 0 !important; }
    .pdf-cover { min-height: 85vh; max-height: 95vh; overflow: hidden; }
    [class*="card"] { box-shadow: none !important; }
    .bg-gradient-to-r { color-adjust: exact; }
    /* Ensure page footers stay within their page context */
    .page-footer { position: absolute !important; }
  }
`;

/**
 * Build the cover page HTML for the DOM-capture fallback PDF export.
 */
export const buildCoverPage = (title: string, finalizedAt: string): string => {
  const dateStr = new Date(finalizedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
    <div class="pdf-cover">
      <div class="pdf-cover-brand">Churn Is Dead &mdash; CS Intelligence</div>
      <h1>Executive Diagnostic Report</h1>
      <p class="pdf-cover-subtitle">Transcript analysis and strategic recommendations for the ${escapeHtml(title)} account.</p>
      <div class="pdf-cover-meta">
        <div class="pdf-cover-meta-item">
          <span class="pdf-cover-meta-label">Customer</span>
          <span class="pdf-cover-meta-value">${escapeHtml(title)}</span>
        </div>
        <div class="pdf-cover-meta-item">
          <span class="pdf-cover-meta-label">Date Analysed</span>
          <span class="pdf-cover-meta-value">${escapeHtml(dateStr)}</span>
        </div>
      </div>
      <div class="pdf-cover-classification">Confidential &mdash; Internal Use Only</div>
      <div class="pdf-cover-footer">
        <span>Confidential &mdash; Internal Use Only</span>
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
