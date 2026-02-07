import { Card, CardContent } from "@/components/ui/card";
import { Zap, Quote, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography } from "../report/reportStyles";
import { EvidenceChip } from "./EvidenceChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { ExecutiveSnapshot as ExecutiveSnapshotType, ThreatType, ConfidenceLevel } from "./types";

interface ExecutiveSnapshotV2Props {
  data: ExecutiveSnapshotType;
}

const threatConfig: Record<ThreatType, { label: string; color: string; bg: string; border: string }> = {
  churn: { label: "Churn Risk", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  downsell: { label: "Downsell Risk", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  displacement: { label: "Displacement Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  delay: { label: "Delay Risk", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  none: { label: "No Threat", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  unknown: { label: "Unknown", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
};

export const ExecutiveSnapshotV2 = ({ data }: ExecutiveSnapshotV2Props) => {
  const threat = threatConfig[data.primary_threat] || threatConfig.unknown;

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      {/* Navy gradient header */}
      <div className="bg-gradient-to-r from-navy-dark via-navy to-navy-light px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base text-white font-serif font-bold tracking-tight">
                Executive Snapshot
              </h2>
              <p className="text-white/70 text-xs font-sans">Key indicators at a glance</p>
            </div>
          </div>
          <ConfidenceBadge level={data.overall_confidence} size="md" />
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Threat chip + one-liner */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold font-sans shrink-0",
              threat.bg,
              threat.border,
              threat.color,
            )}
          >
            {data.primary_threat === "none" ? (
              <Shield className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            {threat.label}
          </span>
          <p className="text-sm leading-relaxed font-sans font-medium text-report-heading flex-1">
            {data.one_liner}
          </p>
        </div>

        {/* Top 3 takeaways */}
        {data.top_3_takeaways.length > 0 && (
          <div className="space-y-2">
            <p className={reportTypography.labelUppercase}>Key Takeaways</p>
            <div className="space-y-2">
              {data.top_3_takeaways.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-report-surface/50 hover:bg-report-surface transition-colors"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-navy-dark/10 text-navy-dark text-xs font-bold font-sans shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(reportTypography.bodyText, "mb-1")}>{t.takeaway}</p>
                    <div className="flex items-center gap-2">
                      <EvidenceChip anchorIds={t.anchor_ids} />
                      <ConfidenceBadge level={t.confidence} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic truth callout */}
        <div className="relative p-4 bg-report-surface rounded-lg border border-report-border">
          <Quote className="absolute top-3 right-3 w-6 h-6 text-navy-dark/10" />
          <p className={cn(reportTypography.labelUppercase, "mb-1.5")}>Strategic Truth</p>
          <p className="text-sm leading-relaxed pr-6 font-sans font-medium text-report-heading">
            {data.one_liner}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
