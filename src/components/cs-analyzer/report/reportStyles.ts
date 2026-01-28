// Centralized report styling constants for consistent branding

export const reportTypography = {
  // Section titles - Playfair Display serif
  sectionTitle: "font-serif text-base font-bold text-report-heading tracking-tight",
  sectionSubtitle: "text-xs font-normal text-report-muted",
  
  // Card headers
  cardTitle: "font-serif text-base font-semibold text-report-heading",
  
  // Body text - Inter sans
  bodyText: "font-sans text-sm leading-relaxed text-report-text",
  bodyMuted: "font-sans text-sm text-report-muted",
  
  // Labels
  labelUppercase: "font-sans text-[11px] font-semibold uppercase tracking-wider text-report-muted",
  labelSmall: "font-sans text-xs font-medium text-report-muted",
  
  // Values & metrics
  metricValue: "font-sans text-base font-semibold",
  metricLabel: "font-sans text-[10px] font-medium uppercase tracking-wide text-report-muted",
} as const;

export const reportColors = {
  // Status postures
  green: {
    bg: "bg-report-surface",
    bgAccent: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    indicator: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  amber: {
    bg: "bg-report-surface",
    bgAccent: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    indicator: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  red: {
    bg: "bg-report-surface",
    bgAccent: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    indicator: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
  neutral: {
    bg: "bg-report-surface",
    bgAccent: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    indicator: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
} as const;

export const reportLayout = {
  // Card styling - consistent across all sections
  card: "rounded-xl border border-report-border bg-card shadow-sm",
  cardHeader: "px-5 py-4 border-b border-report-border",
  cardContent: "p-5",
  
  // Icon containers - consistent sizing
  iconContainer: "p-2 rounded-lg shrink-0",
  iconContainerSm: "p-1.5 rounded-md",
  
  // List item styling - unified bullet treatment
  listItem: "flex items-start gap-3 py-2",
  listItemCard: "flex items-start gap-3 p-3 rounded-lg bg-report-surface/50 hover:bg-report-surface transition-colors",
  
  // Bullet styles
  bullet: "w-1.5 h-1.5 rounded-full mt-2 shrink-0",
  bulletNavy: "bg-navy-dark/40",
  
  // Table styling
  tableHeader: "bg-report-surface/50 hover:bg-report-surface/50",
  tableRow: "hover:bg-report-surface/40 transition-colors",
  
  // Badges
  badge: "font-sans text-xs font-medium border",
  badgeCount: "font-sans text-xs font-normal",
} as const;

// Section-specific icon colors (using brand-aligned palette)
export const sectionIconColors = {
  snapshot: "bg-navy-dark/10 text-navy-dark",
  action: "bg-navy-dark/10 text-navy-dark",
  stakeholder: "bg-navy-dark/10 text-navy-dark",
  risk: "bg-red-100 text-red-600",
  growth: "bg-emerald-100 text-emerald-600",
  questions: "bg-navy-dark/10 text-navy-dark",
  generic: "bg-navy-dark/10 text-navy-dark",
  value: "bg-emerald-100 text-emerald-600",
  renewal: "bg-amber-100 text-amber-600",
  effectiveness: "bg-navy-dark/10 text-navy-dark",
} as const;
