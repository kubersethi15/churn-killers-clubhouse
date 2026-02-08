import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  HelpCircle,
  UserCheck,
  Quote,
  BarChart3,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FilteredReportRenderer } from "./FilteredReportRenderer";
import { getPdfCss, buildCoverPage } from "./pdfStyles";
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
    key: "conversational_gaps",
    label: "Conversational Gaps",
    description: "Missing topics & suggested questions",
    icon: <HelpCircle className="w-4 h-4" />,
    sectionKey: "conversational_gaps",
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
  const snapshotRef = useRef<{
    finalizedAt: string;
    visibilityToggles: SectionVisibility;
    fullReport: FinalReport;
    evidenceAnchors: EvidenceAnchor[];
  } | null>(null);
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  // Section dependency chain: action_plan → risks_and_threats → executive_snapshot
  // These are always-visible so we don't toggle them, but the dependency logic
  // applies to toggleable sections that cascade. For future extensibility,
  // enforce: if a child is visible, its parent must be visible.
  // Currently all three are locked as always-visible, so no cascade needed.

  // Toggleable dependency enforcement: toggling OFF a section that others depend on
  // is not needed since the "always visible" sections cover the chain.
  // However, we keep the toggle logic clean for any future section dependencies.

  const toggleSection = useCallback(
    (key: string) => {
      if (isFinalized) return;
      setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [isFinalized],
  );

  const handleFinalize = () => {
    setIsFinalized(true);
    // Store the full snapshot including all confidence scores, regardless of visibility toggles.
    // The snapshot preserves the complete report JSON — visibility only affects rendering.
    // This ensures confidence data is never lost even if hidden in UI/PDF.
    const snapshot = {
      finalizedAt: new Date().toISOString(),
      visibilityToggles: { ...visibility },
      // Full report data preserved — confidence scores always included
      fullReport: report,
      evidenceAnchors,
    };
    // Store on the component instance for potential export
    snapshotRef.current = snapshot;
    toast({
      title: "Report Finalized",
      description: "Section selection locked. Confidence scores preserved in snapshot.",
    });
  };

  const handleUnlock = () => {
    setIsFinalized(false);
    snapshotRef.current = null;
    toast({ title: "Report Unlocked", description: "You can now adjust section visibility." });
  };

  const handleExportPDF = async () => {
    // PDF MUST render from the frozen snapshot — no secondary transformation.
    const snapshot = snapshotRef.current;
    if (!snapshot) {
      toast({ title: "No snapshot", description: "Finalize the report first.", variant: "destructive" });
      return;
    }

    setIsGeneratingPdf(true);
    toast({ title: "Generating PDF...", description: "Building enterprise report template" });

    try {
      const reportTitle = title || "Analysis Report";

      // Call Claude Opus 4 to generate premium HTML
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "cs-report-renderer",
        {
          body: {
            report: snapshot.fullReport,
            visibility: snapshot.visibilityToggles,
            title: reportTitle,
            finalizedAt: snapshot.finalizedAt,
            evidenceAnchors: snapshot.evidenceAnchors,
          },
        },
      );

      if (fnError) throw new Error(fnError.message || "Edge function failed");

      const responseData = typeof fnData === "string" ? JSON.parse(fnData) : fnData;

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      if (!responseData.html) {
        throw new Error("No HTML returned from renderer");
      }

      // Open Claude-generated HTML in print window
      const printWindow = window.open("", "_blank");
      if (!printWindow) throw new Error("Could not open print window — please allow popups");

      printWindow.document.write(responseData.html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };

      toast({ title: "PDF Ready", description: "Enterprise report generated successfully" });
    } catch (error) {
      console.error("PDF export failed:", error);

      // Fallback to DOM-based export if Claude fails
      toast({
        title: "Claude generation failed — using local export",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });

      fallbackDomExport(snapshot);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /** Fallback: DOM-capture PDF export if Claude is unavailable */
  const fallbackDomExport = (snapshot: NonNullable<typeof snapshotRef.current>) => {
    const el = reportRef.current;
    if (!el) return;

    const reportTitle = title || "Analysis Report";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styleSheets = Array.from(document.styleSheets);
    let appCss = "";
    for (const sheet of styleSheets) {
      try {
        appCss += Array.from(sheet.cssRules || []).map((r) => r.cssText).join("\n");
      } catch {
        if (sheet.href) appCss += `@import url("${sheet.href}");\n`;
      }
    }

    const coverHtml = buildCoverPage(reportTitle, snapshot.finalizedAt);
    const pdfCss = getPdfCss();

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${reportTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>${appCss}</style>
  <style>${pdfCss}</style>
</head>
<body>
  ${coverHtml}
  <div class="pdf-report-body">${el.innerHTML}</div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };
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
              <div className="space-y-1">
                {TOGGLEABLE_SECTIONS.map((section) => {
                  const isAvailable = section.sectionKey
                    ? report.section_included[section.sectionKey]
                    : true;
                  const isOn = visibility[section.key];
                  const disabled = isFinalized || !isAvailable;

                  return (
                    <label
                      key={section.key}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all cursor-pointer select-none border",
                        disabled && "cursor-not-allowed opacity-40",
                        isOn && isAvailable
                          ? "bg-navy-dark/5 border-navy-dark/15 text-navy-dark shadow-sm"
                          : "border-transparent text-muted-foreground hover:bg-muted/40 hover:border-muted",
                      )}
                    >
                      <Checkbox
                        checked={isOn && isAvailable}
                        onCheckedChange={() => !disabled && toggleSection(section.key)}
                        disabled={disabled}
                        className="shrink-0"
                      />
                      <div className="shrink-0 opacity-70">{section.icon}</div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">{section.label}</span>
                        <span className="text-[10px] text-muted-foreground block truncate leading-tight mt-0.5">
                          {section.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
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
                  <Button
                    onClick={handleExportPDF}
                    disabled={isGeneratingPdf}
                    className="w-full gap-2 bg-red hover:bg-red/90 text-white"
                    size="sm"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    {isGeneratingPdf ? "Generating..." : "Export PDF"}
                  </Button>
                  <Button onClick={handleUnlock} variant="outline" className="w-full gap-2" size="sm" disabled={isGeneratingPdf}>
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
