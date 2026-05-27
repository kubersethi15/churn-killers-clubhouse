import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography } from "../report/reportStyles";
import { EvidenceChip } from "./EvidenceChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { ExecutiveSnapshot as ExecutiveSnapshotType, ThreatType } from "./types";

interface ExecutiveSnapshotV2Props {
  data: ExecutiveSnapshotType;
}

const threatConfig: Record<ThreatType, { label: string; color: string; bg: string; border: string }> = {
  churn: { label: "Churn Risk", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  downsell: { label: "Downsell Risk", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  displacement: { label: "Displacement Risk", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  delay: { label: "Delay Risk", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  none: { label: "No Threat Detected", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  unknown: { label: "Threat Unknown", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
};

export const ExecutiveSnapshotV2 = ({ data }: ExecutiveSnapshotV2Props) => {
  const threat = threatConfig[data.primary_threat] || threatConfig.unknown;

  return (
    <Card className="overflow-hidden border border-navy-dark/10 shadow-sm">
      {/* Editorial header — flat, not a gradient */}
      <div className="px-6 py-4 border-b border-navy-dark/10 bg-cream/30 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-red font-bold">
            Executive Snapshot
          </p>
          <h2 className="text-xl font-serif font-black text-navy-dark mt-0.5 leading-tight">
            What this transcript actually says
          </h2>
        </div>
        <ConfidenceBadge level={data.overall_confidence} size="md" />
      </div>

      <CardContent className="p-6 space-y-6">
        {/* The one-line headline — the actual "what happened here" verdict */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 pb-5 border-b border-navy-dark/5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold font-sans shrink-0 uppercase tracking-wide",
              threat.bg,
              threat.border,
              threat.color,
            )}
          >
            {data.primary_threat === "none" ? (
              <Shield className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            {threat.label}
          </span>
          <p className="text-base leading-relaxed font-serif font-medium text-navy-dark flex-1">
            {data.one_liner}
          </p>
        </div>

        {/* Top 3 takeaways as a numbered editorial list */}
        {data.top_3_takeaways.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-navy-dark/60 font-bold">
              Top {data.top_3_takeaways.length} Takeaways
            </p>
            <ol className="space-y-3">
              {data.top_3_takeaways.map((t, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-4"
                >
                  <span className="font-serif font-black text-2xl text-red leading-none w-7 shrink-0 mt-0.5">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(reportTypography.bodyText, "mb-1.5")}>{t.takeaway}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <EvidenceChip anchorIds={t.anchor_ids} />
                      <ConfidenceBadge level={t.confidence} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
