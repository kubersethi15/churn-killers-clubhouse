import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Eye,
  EyeOff,
  FileDown,
  Snowflake,
  Unlock,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  MessageSquareWarning,
  UserCheck,
  Quote,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FilteredReportRenderer } from "./FilteredReportRenderer";
import type { FinalReport, EvidenceAnchor, SectionIncluded } from "./types";

// Toggleable section definitions
interface ToggleableSection {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  /** Maps to section_included key, or null for display-only toggles */
  sectionKey: keyof SectionIncluded | null;
}

const TOGGLEABLE_SECTIONS: ToggleableSection[] = [
  {
    key: "stakeholder_power_map",
    label: "Stakeholder Map",
    description: "Power, stance & engagement grid",
    icon: <Users className="w-4 h-4" />,
    sectionKey: "stakeholder_power_map",
  },
  {
    key: "evidence_backed_facts",
    label: "Evidence Facts",
    description: "Observed facts with anchors",
    icon: <Quote className="w-4 h-4" />,
    sectionKey: "evidence_backed_facts",
  },
  {
    key: "procurement_and_timeline",
    label: "Procurement & Timeline",
    description: "Procurement risks and dates",
    icon: <ShoppingCart className="w-4 h-4" />,
    sectionKey: "procurement_and_timeline",
  },
  {
    key: "incident_impact",
    label: "Incident Impact",
    description: "Outage/escalation details",
    icon: <AlertTriangle className="w-4 h-4" />,
    sectionKey: "incident_impact",
  },
  {
    key: "expansion_plays",
    label: "Expansion Plays",
    description: "Growth & upsell opportunities",
    icon: <TrendingUp className="w-4 h-4" />,
    sectionKey: "expansion_plays",
  },
  {
    key: "value_narrative_gaps",
    label: "Value Gaps",
    description: "Narrative & positioning gaps",
    icon: <MessageSquareWarning className="w-4 h-4" />,
    sectionKey: "value_narrative_gaps",
  },
  {
    key: "cs_rep_effectiveness",
    label: "CS Rep Effectiveness",
    description: "Coaching & performance signals",
    icon: <UserCheck className="w-4 h-4" />,
    sectionKey: "cs_rep_effectiveness",
  },
  {
    key: "evidence_quotes",
    label: "Evidence Chips",
    description: "Clickable Q-chips on claims",
    icon: <Quote className="w-4 h-4" />,
    sectionKey: null, // display toggle
  },
  {
    key: "confidence_scores",
    label: "Confidence Scores",
    description: "Per-section confidence badges",
    icon: <BarChart3 className="w-4 h-4" />,
    sectionKey: null, // display toggle
  },
  {
    key: "qa_notes",
    label: "QA Notes",
    description: "Removed claims & validation notes",
    icon: <ClipboardList className="w-4 h-4" />,
    sectionKey: null, // display toggle
  },
];

// Always-visible (non-toggleable) sections
const ALWAYS_VISIBLE = ["executive_snapshot", "risks_and_threats", "action_plan_14_days"];

export interface SectionVisibility {
  [key: string]: boolean;
}

interface ReportBuilderProps {
  report: FinalReport;
  evidenceAnchors: EvidenceAnchor[];
  title?: string;
  createdAt?: string;
}

export const ReportBuilder = ({ report, evidenceAnchors, title, createdAt }: ReportBuilderProps) => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  // Initialize toggles from section_included (respect pipeline's judgment)
  const [visibility, setVisibility] = useState<SectionVisibility>(() => {
    const initial: SectionVisibility = {};
    for (const section of TOGGLEABLE_SECTIONS) {
      if (section.sectionKey) {
        // Only enable if pipeline included it
        initial[section.key] = !!report.section_included[section.sectionKey];
      } else {
        // Display toggles default on
        initial[section.key] = section.key !== "qa_notes"; // QA notes off by default
      }
    }
    return initial;
  });

  const [isFinalized, setIsFinalized] = useState(false);

  const toggleSection = useCallback(
    (key: string) => {
      if (isFinalized) return;
      setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [isFinalized],
  );

  const handleFinalize = () => {
    setIsFinalized(true);
    toast({
      title: "Report Finalized",
      description: "Section selection locked. You can now export the curated report.",
    });
  };

  const handleUnlock = () => {
    setIsFinalized(false);
    toast({ title: "Report Unlocked", description: "You can now adjust section visibility." });
  };

  const handleExportPDF = () => {
    const el = reportRef.current;
    if (!el) return;

    toast({ title: "Opening Print Dialog...", description: "Use 'Save as PDF' in the print dialog" });

    try {
      const reportTitle = title || "Analysis Report";
      const printWindow = window.open("", "_blank");
      if (!printWindow) throw new Error("Could not open print window — please allow popups");

      const styleSheets = Array.from(document.styleSheets);
      let cssText = "";
      for (const sheet of styleSheets) {
        try {
          cssText += Array.from(sheet.cssRules || [])
            .map((r) => r.cssText)
            .join("\n");
        } catch {
          if (sheet.href) cssText += `@import url("${sheet.href}");\n`;
        }
      }

      printWindow.document.write(`<!DOCTYPE html><html><head><title>${reportTitle}</title>
        <style>${cssText}
          body { font-family: 'Inter', -apple-system, sans-serif; padding: 24px; line-height: 1.6; color: #1a1a2e; background: white; max-width: 900px; margin: 0 auto; }
          h1, h2, h3 { margin-top: 1.2em; margin-bottom: 0.4em; }
          h1 { font-size: 22px; font-family: 'Playfair Display', Georgia, serif; }
          h2 { font-size: 18px; font-family: 'Playfair Display', Georgia, serif; }
          table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 13px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
          th { background: #f8fafc; font-weight: 600; }
          button, [role="button"], .evidence-chip-trigger { display: none !important; }
          [class*="card"] { break-inside: avoid; border: 1px solid #e2e8f0; margin-bottom: 12px; }
          @media print { body { padding: 0; } [class*="card"] { box-shadow: none; } }
        </style></head><body>
        <h1 style="margin-bottom:4px">${reportTitle}</h1>
        <p style="color:#64748b;font-size:13px;margin-bottom:24px">
          Finalized ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
        ${el.innerHTML}
      </body></html>`);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    } catch (error) {
      toast({
        title: "PDF export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Count how many toggleable sections are available (pipeline included them)
  const availableCount = TOGGLEABLE_SECTIONS.filter(
    (s) => s.sectionKey && report.section_included[s.sectionKey],
  ).length;
  const enabledCount = TOGGLEABLE_SECTIONS.filter(
    (s) => s.sectionKey && visibility[s.key],
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      {/* Sidebar — toggle panel */}
      <div className="space-y-4 order-2 lg:order-1">
        <Card className="border border-report-border sticky top-20">
          <CardHeader className="border-b border-report-border bg-report-surface/50 py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-sm font-bold text-report-heading">
                Report Sections
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-sans">
                {enabledCount}/{availableCount}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-1">
            {/* Always-visible sections */}
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Always Included
              </p>
              {ALWAYS_VISIBLE.map((key) => (
                <div key={key} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span className="capitalize">{key.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>

            {/* Toggleable sections */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Optional Sections
              </p>
              {TOGGLEABLE_SECTIONS.map((section) => {
                const isAvailable = section.sectionKey
                  ? report.section_included[section.sectionKey]
                  : true;
                const isOn = visibility[section.key];

                return (
                  <button
                    key={section.key}
                    onClick={() => isAvailable && toggleSection(section.key)}
                    disabled={isFinalized || !isAvailable}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left",
                      isFinalized && "cursor-not-allowed",
                      !isAvailable && "opacity-40 cursor-not-allowed",
                      isOn && isAvailable ? "bg-navy-dark/5 text-navy-dark" : "text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    <div className="shrink-0">{section.icon}</div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block truncate">{section.label}</span>
                    </div>
                    <Switch
                      checked={isOn && isAvailable}
                      onCheckedChange={() => isAvailable && toggleSection(section.key)}
                      disabled={isFinalized || !isAvailable}
                      className="scale-75 shrink-0"
                    />
                  </button>
                );
              })}
            </div>

            {/* Finalize / Unlock */}
            <div className="pt-3 border-t border-report-border space-y-2">
              {!isFinalized ? (
                <Button
                  onClick={handleFinalize}
                  className="w-full gap-2 bg-navy-dark hover:bg-navy-dark/90 text-white"
                  size="sm"
                >
                  <Snowflake className="w-3.5 h-3.5" />
                  Finalize Report
                </Button>
              ) : (
                <>
                  <Button onClick={handleExportPDF} className="w-full gap-2 bg-red hover:bg-red/90 text-white" size="sm">
                    <FileDown className="w-3.5 h-3.5" />
                    Export PDF
                  </Button>
                  <Button onClick={handleUnlock} variant="outline" className="w-full gap-2" size="sm">
                    <Unlock className="w-3.5 h-3.5" />
                    Unlock & Edit
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main — filtered report */}
      <div className="order-1 lg:order-2" ref={reportRef}>
        {isFinalized && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-navy-dark/5 border border-navy-dark/10 text-xs text-navy-dark font-sans">
            <Snowflake className="w-3.5 h-3.5 shrink-0" />
            <span>Report finalized — export-ready. Only visible sections will appear in PDF.</span>
          </div>
        )}
        <FilteredReportRenderer
          report={report}
          evidenceAnchors={evidenceAnchors}
          visibility={visibility}
          title={title}
          createdAt={createdAt}
        />
      </div>
    </div>
  );
};
