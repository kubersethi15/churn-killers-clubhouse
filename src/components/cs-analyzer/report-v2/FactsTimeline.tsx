import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography, reportLayout } from "../report/reportStyles";
import { EvidenceChip } from "./EvidenceChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { EvidenceBackedFact } from "./types";

interface FactsTimelineProps {
  facts: EvidenceBackedFact[];
}

const categoryColors: Record<string, string> = {
  renewal: "bg-amber-100 text-amber-700",
  budget: "bg-orange-100 text-orange-700",
  procurement: "bg-red-100 text-red-700",
  incident: "bg-red-100 text-red-600",
  value: "bg-emerald-100 text-emerald-700",
  adoption: "bg-blue-100 text-blue-700",
  stakeholder: "bg-violet-100 text-violet-700",
  delivery: "bg-cyan-100 text-cyan-700",
  other: "bg-slate-100 text-slate-600",
};

export const FactsTimeline = ({ facts }: FactsTimelineProps) => {
  if (facts.length === 0) return null;

  return (
    <Card className={reportLayout.card}>
      <div className={reportLayout.cardHeader}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-navy-dark/10">
            <FileText className="w-4 h-4 text-navy-dark" />
          </div>
          <div>
            <h3 className={reportTypography.sectionTitle}>Evidence-Backed Facts</h3>
            <p className={reportTypography.sectionSubtitle}>{facts.length} verified facts from transcript</p>
          </div>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-3 bottom-3 w-px bg-report-border" />

          <div className="space-y-3">
            {facts.map((fact, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-8">
                {/* Timeline dot */}
                <div className="absolute left-1.5 top-2.5 w-3 h-3 rounded-full bg-navy-dark/20 border-2 border-card" />

                <div className="flex-1 p-3 rounded-lg bg-report-surface/50 hover:bg-report-surface transition-colors">
                  <p className={cn(reportTypography.bodyText, "mb-1.5")}>{fact.fact}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-semibold font-sans",
                        categoryColors[fact.category] || categoryColors.other,
                      )}
                    >
                      {fact.category}
                    </span>
                    <EvidenceChip anchorIds={fact.anchor_ids} />
                    <ConfidenceBadge level={fact.confidence} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
