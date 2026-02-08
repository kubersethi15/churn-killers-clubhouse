// ============================================================================
// Enterprise PDF Report CSS — Deterministic template matching design spec
// ============================================================================

export function getEnterpriseCss(): string {
  return `
  :root {
    --brand-deep: #0F1A2E;
    --brand-primary: #1B3A5C;
    --brand-accent: #2E7D6F;
    --brand-accent-light: #E8F5F1;
    --brand-warning: #D4792A;
    --brand-warning-light: #FFF3E8;
    --brand-danger: #C0392B;
    --brand-danger-light: #FDEDEB;
    --brand-success: #27AE60;
    --brand-success-light: #E8F8EF;
    --brand-neutral: #6B7B8D;
    --brand-neutral-light: #F4F6F8;
    --brand-border: #DDE3EA;
    --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    --page-margin: 48px;
    --section-gap: 32px;
  }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: var(--font-body);
    font-size: 10.5pt;
    line-height: 1.55;
    color: #2C3E50;
    background: #fff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ── Page structure ───────────────────────────────────────── */
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: var(--page-margin);
    position: relative;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: avoid; }
  /* Cover page should NOT force an extra page break — the next .page handles its own */
  .page.cover-page {
    page-break-after: always;
    max-height: 297mm;
    overflow: hidden;
  }
  .no-break { page-break-inside: avoid; break-inside: avoid; }

  /* ── Page header ──────────────────────────────────────────── */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--brand-deep);
    margin-bottom: 28px;
  }
  .page-header-brand { display: flex; align-items: center; gap: 10px; }
  .page-header-logo {
    width: 28px; height: 28px;
    background: var(--brand-deep);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 11px;
  }
  .page-header-title {
    font-size: 8.5pt; font-weight: 600;
    color: var(--brand-deep);
    letter-spacing: 1.8px;
    text-transform: uppercase;
  }
  .page-header-meta {
    font-size: 7.5pt;
    color: var(--brand-neutral);
    text-align: right;
  }

  /* ── Page footer ──────────────────────────────────────────── */
  .page-footer {
    position: absolute;
    bottom: 28px;
    left: var(--page-margin);
    right: var(--page-margin);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid var(--brand-border);
    font-size: 7pt;
    color: var(--brand-neutral);
    /* Prevent content from overlapping or stacking across pages */
    z-index: 1;
    background: #fff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .page-footer span {
    white-space: nowrap;
  }

  /* ── Cover page ───────────────────────────────────────────── */
  .cover {
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* Constrain to single page — prevent overflow that creates blank page 2 */
    height: calc(297mm - 96px - 60px);
    max-height: calc(297mm - 96px - 60px);
    padding-top: 60px;
    overflow: hidden;
  }
  .cover-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--brand-deep); color: #fff;
    padding: 6px 14px; border-radius: 4px;
    font-size: 7.5pt; font-weight: 600;
    letter-spacing: 2px; text-transform: uppercase;
    width: fit-content; margin-bottom: 24px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .cover-title {
    font-size: 28pt; font-weight: 700;
    color: var(--brand-deep); line-height: 1.15;
    margin-bottom: 8px; max-width: 480px;
  }
  .cover-subtitle {
    font-size: 13pt; color: var(--brand-neutral);
    font-weight: 400; margin-bottom: 40px; max-width: 420px;
  }
  .cover-meta-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 2px 32px; padding: 20px 24px;
    background: var(--brand-neutral-light);
    border-radius: 8px; border-left: 4px solid var(--brand-accent);
    max-width: 460px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .cover-meta-item { display: flex; flex-direction: column; padding: 6px 0; }
  .cover-meta-label {
    font-size: 7pt; font-weight: 600;
    color: var(--brand-neutral); text-transform: uppercase;
    letter-spacing: 1.2px; margin-bottom: 2px;
  }
  .cover-meta-value { font-size: 10pt; font-weight: 500; color: var(--brand-deep); }
  .cover-classification {
    margin-top: 48px; padding: 10px 16px;
    background: var(--brand-danger-light);
    border: 1px solid #E8C4BF; border-radius: 4px;
    font-size: 7.5pt; font-weight: 600;
    color: var(--brand-danger); letter-spacing: 1px;
    text-transform: uppercase; width: fit-content;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ── Section headings ─────────────────────────────────────── */
  .section-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 18px; padding-bottom: 10px;
    border-bottom: 1px solid var(--brand-border);
    page-break-after: avoid;
  }
  .section-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .section-title {
    font-size: 14pt; font-weight: 700;
    color: var(--brand-deep); letter-spacing: -0.2px;
  }
  .section-subtitle { font-size: 8pt; color: var(--brand-neutral); margin-top: 1px; }

  /* ── Badges ───────────────────────────────────────────────── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 4px;
    font-size: 7.5pt; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .badge-danger { background: var(--brand-danger-light); color: var(--brand-danger); border: 1px solid #E8C4BF; }
  .badge-warning { background: var(--brand-warning-light); color: var(--brand-warning); border: 1px solid #EEDCC8; }
  .badge-success { background: var(--brand-success-light); color: var(--brand-success); border: 1px solid #B8E6CC; }
  .badge-info { background: #E8F0FE; color: #1A56DB; border: 1px solid #C5D9F7; }
  .badge-neutral { background: var(--brand-neutral-light); color: var(--brand-neutral); border: 1px solid var(--brand-border); }

  .confidence-dot {
    width: 6px; height: 6px; border-radius: 50%;
    display: inline-block;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .confidence-high { background: var(--brand-success); }
  .confidence-medium { background: var(--brand-warning); }
  .confidence-low { background: var(--brand-neutral); }

  /* ── Executive Snapshot ─────────────────────────────────────── */
  .snapshot-card {
    background: linear-gradient(135deg, var(--brand-deep) 0%, #1E3F5F 100%);
    border-radius: 10px; padding: 28px 32px; color: #fff;
    margin-bottom: 24px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .snapshot-threat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .snapshot-threat-badge {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: #fff; padding: 4px 12px; border-radius: 4px;
    font-size: 7.5pt; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .snapshot-one-liner {
    font-size: 13pt; font-weight: 500;
    line-height: 1.45; color: rgba(255,255,255,0.95);
  }
  .takeaway-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
  .takeaway-item {
    display: flex; gap: 12px; align-items: flex-start;
    background: #fff; border-radius: 8px; padding: 14px 18px;
    border-left: 4px solid var(--brand-accent);
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .takeaway-num {
    width: 24px; height: 24px;
    background: var(--brand-accent); color: #fff;
    border-radius: 50%; display: flex;
    align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    flex-shrink: 0; margin-top: 1px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .takeaway-text { font-size: 9.5pt; color: #2C3E50; line-height: 1.5; flex: 1; }
  .takeaway-confidence {
    font-size: 7pt; color: var(--brand-neutral);
    margin-top: 3px; display: flex; align-items: center; gap: 4px;
  }

  /* ── Strategic Truth ──────────────────────────────────────── */
  .strategic-truth {
    background: var(--brand-neutral-light);
    border-left: 4px solid var(--brand-deep);
    border-radius: 0 8px 8px 0;
    padding: 18px 24px;
    margin-bottom: var(--section-gap);
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .strategic-truth-label {
    font-size: 7pt; font-weight: 700;
    color: var(--brand-neutral); text-transform: uppercase;
    letter-spacing: 1.5px; margin-bottom: 6px;
  }
  .strategic-truth-text {
    font-size: 10.5pt; font-weight: 500;
    color: var(--brand-deep); line-height: 1.5; font-style: italic;
  }

  /* ── Evidence Facts ─────────────────────────────────────────── */
  .facts-grid { display: flex; flex-direction: column; gap: 8px; }
  .fact-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 16px; background: #fff;
    border: 1px solid var(--brand-border); border-radius: 6px;
  }
  .fact-category {
    font-size: 7pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.8px; padding: 2px 8px; border-radius: 3px;
    white-space: nowrap; min-width: 70px; text-align: center; margin-top: 2px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .cat-adoption { background: #E8F0FE; color: #1A56DB; }
  .cat-value { background: var(--brand-success-light); color: var(--brand-success); }
  .cat-incident { background: var(--brand-danger-light); color: var(--brand-danger); }
  .cat-budget { background: var(--brand-warning-light); color: var(--brand-warning); }
  .cat-stakeholder { background: #F0E8FE; color: #6B21A8; }
  .cat-political { background: #FEF0E8; color: #B45309; }
  .fact-text { font-size: 9.5pt; color: #2C3E50; flex: 1; }

  /* ── Risk items ─────────────────────────────────────────────── */
  .threat-bar {
    display: flex; gap: 16px; margin-bottom: 18px;
    padding: 14px 20px; background: var(--brand-neutral-light);
    border-radius: 8px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .threat-item { display: flex; flex-direction: column; gap: 2px; }
  .threat-label {
    font-size: 7pt; font-weight: 600;
    color: var(--brand-neutral); text-transform: uppercase; letter-spacing: 1px;
  }
  .threat-value { font-size: 11pt; font-weight: 700; color: var(--brand-deep); text-transform: capitalize; }

  .risk-card {
    display: flex; gap: 14px; align-items: flex-start;
    padding: 14px 18px; border: 1px solid var(--brand-border);
    border-radius: 8px; margin-bottom: 8px; background: #fff;
  }
  .risk-severity {
    writing-mode: vertical-rl; text-orientation: mixed;
    transform: rotate(180deg);
    font-size: 7pt; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; padding: 4px 2px;
    border-radius: 3px; text-align: center;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .sev-critical { background: var(--brand-danger); color: #fff; }
  .sev-high { background: var(--brand-danger-light); color: var(--brand-danger); }
  .sev-medium { background: var(--brand-warning-light); color: var(--brand-warning); }
  .sev-low { background: var(--brand-neutral-light); color: var(--brand-neutral); }
  .risk-content { flex: 1; }
  .risk-title { font-size: 10pt; font-weight: 600; color: var(--brand-deep); margin-bottom: 3px; }
  .risk-meta {
    font-size: 7.5pt; color: var(--brand-neutral);
    display: flex; gap: 12px; align-items: center;
  }

  /* ── Action Plan ────────────────────────────────────────────── */
  .action-timeline { position: relative; padding-left: 36px; }
  .action-timeline::before {
    content: ''; position: absolute;
    left: 14px; top: 8px; bottom: 8px;
    width: 2px; background: var(--brand-border);
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .action-item {
    position: relative; padding: 14px 18px;
    margin-bottom: 12px; background: #fff;
    border: 1px solid var(--brand-border); border-radius: 8px;
  }
  .action-item::before {
    content: ''; position: absolute;
    left: -28px; top: 18px;
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--brand-accent);
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px var(--brand-accent);
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .action-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .action-title { font-size: 10pt; font-weight: 600; color: var(--brand-deep); flex: 1; }
  .action-day {
    font-size: 8pt; font-weight: 700;
    color: var(--brand-accent); background: var(--brand-accent-light);
    padding: 2px 10px; border-radius: 12px; white-space: nowrap;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .action-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
  .action-detail-item { font-size: 8pt; }
  .action-detail-label { font-weight: 600; color: var(--brand-neutral); display: block; margin-bottom: 1px; }
  .action-detail-value { color: #2C3E50; }

  /* ── Stakeholder Power Map ──────────────────────────────────── */
  .stakeholder-grid { display: flex; flex-direction: column; gap: 10px; }
  .stakeholder-card {
    display: grid; grid-template-columns: 180px 1fr;
    gap: 0; border: 1px solid var(--brand-border);
    border-radius: 8px; overflow: hidden;
  }
  .stakeholder-identity {
    background: var(--brand-neutral-light);
    padding: 14px 16px; display: flex;
    flex-direction: column; justify-content: center;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .stakeholder-name { font-size: 10pt; font-weight: 700; color: var(--brand-deep); }
  .stakeholder-role { font-size: 8pt; color: var(--brand-neutral); margin-top: 2px; }
  .stakeholder-meta-grid {
    padding: 12px 16px; display: grid;
    grid-template-columns: repeat(3, 1fr); gap: 8px;
  }
  .stakeholder-meta-label {
    font-size: 6.5pt; font-weight: 600;
    color: var(--brand-neutral); text-transform: uppercase; letter-spacing: 0.8px;
  }
  .stakeholder-meta-value { font-size: 8.5pt; font-weight: 500; color: var(--brand-deep); margin-top: 1px; }
  .stakeholder-motivation {
    grid-column: 1 / -1; font-size: 8pt; color: #4A5568;
    padding-top: 4px; border-top: 1px solid var(--brand-border); margin-top: 2px;
  }
  .stakeholder-motivation strong { color: var(--brand-deep); }

  /* ── Expansion Readiness ────────────────────────────────────── */
  .expansion-pipeline { display: flex; gap: 0; margin-bottom: 16px; }
  .pipeline-stage {
    flex: 1; padding: 10px 14px; text-align: center;
    font-size: 7.5pt; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.8px;
    border: 1px solid var(--brand-border);
    background: #fff; color: var(--brand-neutral);
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .pipeline-stage:first-child { border-radius: 6px 0 0 6px; }
  .pipeline-stage:last-child { border-radius: 0 6px 6px 0; }
  .pipeline-stage.active {
    background: var(--brand-accent); color: #fff;
    border-color: var(--brand-accent);
  }
  .pipeline-stage.passed {
    background: var(--brand-accent-light); color: var(--brand-accent);
    border-color: var(--brand-accent);
  }
  .gate-list { display: flex; flex-direction: column; gap: 6px; }
  .gate-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px; background: var(--brand-warning-light);
    border-radius: 6px; border-left: 3px solid var(--brand-warning);
    font-size: 8.5pt; color: #2C3E50;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .gate-icon { font-size: 10px; font-weight: 700; color: var(--brand-warning); }

  /* ── Conversational Gaps ────────────────────────────────────── */
  .gap-card {
    padding: 16px 20px; border: 1px solid var(--brand-border);
    border-radius: 8px; margin-bottom: 10px; background: #fff;
  }
  .gap-topic { font-size: 10pt; font-weight: 600; color: var(--brand-deep); margin-bottom: 4px; }
  .gap-why { font-size: 8.5pt; color: #4A5568; margin-bottom: 8px; line-height: 1.5; }
  .gap-question {
    font-size: 8.5pt; color: var(--brand-accent); font-style: italic;
    padding: 8px 12px; background: var(--brand-accent-light);
    border-radius: 4px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* ── Value Narrative Gaps ───────────────────────────────────── */
  .value-gap-card {
    padding: 14px 18px;
    border-left: 3px solid var(--brand-warning);
    background: var(--brand-warning-light);
    border-radius: 0 8px 8px 0; margin-bottom: 10px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .value-gap-text { font-size: 9.5pt; color: #2C3E50; }
  .value-gap-impact { font-size: 7.5pt; color: var(--brand-neutral); margin-top: 4px; }

  /* ── CS Rep Effectiveness ───────────────────────────────────── */
  .effectiveness-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-bottom: 16px;
  }
  .effectiveness-col h4 {
    font-size: 8pt; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid;
  }
  .effectiveness-col.strengths h4 { color: var(--brand-success); border-color: var(--brand-success); }
  .effectiveness-col.gaps h4 { color: var(--brand-warning); border-color: var(--brand-warning); }
  .effectiveness-item { font-size: 8.5pt; color: #2C3E50; padding: 6px 0; line-height: 1.45; }
  .coaching-card {
    padding: 14px 18px; background: var(--brand-neutral-light);
    border-radius: 8px; margin-bottom: 8px;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .coaching-move { font-size: 9pt; font-weight: 600; color: var(--brand-deep); margin-bottom: 3px; }
  .coaching-why { font-size: 8pt; color: #4A5568; line-height: 1.5; }

  /* ── Procurement / Incident ─────────────────────────────────── */
  .detail-card {
    padding: 14px 18px; border: 1px solid var(--brand-border);
    border-radius: 8px; margin-bottom: 8px; background: #fff;
  }
  .detail-card-title { font-size: 9.5pt; font-weight: 600; color: var(--brand-deep); margin-bottom: 4px; }
  .detail-card-text { font-size: 8.5pt; color: #4A5568; line-height: 1.5; }
  .detail-card-meta { font-size: 7.5pt; color: var(--brand-neutral); margin-top: 4px; }

  .sub-section-label {
    font-size: 8pt; font-weight: 600;
    color: var(--brand-neutral); text-transform: uppercase;
    letter-spacing: 1px; margin-bottom: 8px; margin-top: 16px;
  }

  /* ── Print styles ───────────────────────────────────────────── */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page {
      width: 100%;
      margin: 0;
      padding: 20mm 18mm;
      page-break-after: always;
      overflow: hidden;
    }
    .page:last-child { page-break-after: auto; }
    .page.cover-page {
      max-height: 297mm;
      overflow: hidden;
    }
    /* CRITICAL: footer must be absolute within each page, NOT fixed across all pages.
       Using position:fixed causes ALL page footers to stack on every printed page,
       producing garbled overlapping text ("Confifififidential", stacked page numbers). */
    .page-footer {
      position: absolute;
      bottom: 8mm;
      left: 18mm;
      right: 18mm;
    }
    .no-break { page-break-inside: avoid; }
  }

  @page { size: A4; margin: 0; }
`;
}
