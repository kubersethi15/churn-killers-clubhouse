import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography, reportLayout } from "../report/reportStyles";
import { EvidenceChip } from "./EvidenceChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { RiskItem, ConfidenceLevel } from "./types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RiskBreakdownV2Props {
  threatClassification: {
    primary: string;
    secondary: string;
    confidence: ConfidenceLevel;
    anchor_ids: string[];
  };
  riskItems: RiskItem[];
  sectionConfidences: { section: string; included: boolean }[];
}

const severityColors: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
  low: "#64748b",
};

const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export const RiskBreakdownV2 = ({ threatClassification, riskItems, sectionConfidences }: RiskBreakdownV2Props) => {
  // Build chart data: group risks by severity
  const severityCounts = riskItems.reduce<Record<string, number>>((acc, r) => {
    acc[r.severity] = (acc[r.severity] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(severityCounts)
    .map(([severity, count]) => ({ severity: severity.charAt(0).toUpperCase() + severity.slice(1), count, key: severity }))
    .sort((a, b) => (severityOrder[a.key] ?? 4) - (severityOrder[b.key] ?? 4));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Risk bar chart */}
      <div className="lg:col-span-2">
        <Card className={reportLayout.card}>
          <div className={reportLayout.cardHeader}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className={reportTypography.sectionTitle}>Risks & Threat Classification</h3>
                <p className={reportTypography.sectionSubtitle}>
                  Primary: {threatClassification.primary} | Secondary: {threatClassification.secondary}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <EvidenceChip anchorIds={threatClassification.anchor_ids} />
                <ConfidenceBadge level={threatClassification.confidence} />
              </div>
            </div>
          </div>
          <CardContent className="p-5">
            {/* Bar chart */}
            {chartData.length > 0 && (
              <div className="h-40 mb-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fontFamily: "Inter" }} />
                    <YAxis type="category" dataKey="severity" tick={{ fontSize: 11, fontFamily: "Inter" }} width={70} />
                    <Tooltip
                      contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8 }}
                      formatter={(value: number) => [`${value} risk${value > 1 ? "s" : ""}`, "Count"]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                      {chartData.map((entry) => (
                        <Cell key={entry.key} fill={severityColors[entry.key] || "#64748b"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Risk items list */}
            <div className="space-y-2">
              {riskItems
                .sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))
                .map((risk, idx) => (
                  <div key={idx} className={reportLayout.listItemCard}>
                    <span
                      className={cn(
                        "shrink-0 px-2 py-0.5 rounded text-[10px] font-bold font-sans uppercase tracking-wide",
                        risk.severity === "critical" && "bg-red-100 text-red-700",
                        risk.severity === "high" && "bg-orange-100 text-orange-700",
                        risk.severity === "medium" && "bg-amber-100 text-amber-700",
                        risk.severity === "low" && "bg-slate-100 text-slate-600",
                      )}
                    >
                      {risk.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn(reportTypography.bodyText, "mb-0.5")}>{risk.risk}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-sans text-report-muted">
                          {risk.observed_or_inferred === "inferred" ? "Inferred" : "Observed"} · {risk.type}
                        </span>
                        <EvidenceChip anchorIds={risk.anchor_ids} />
                        <ConfidenceBadge level={risk.confidence} />
                      </div>
                      {risk.inference_rationale && (
                        <p className="text-[11px] font-sans text-report-muted mt-1 italic">
                          {risk.inference_rationale}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confidence by section */}
      <Card className={reportLayout.card}>
        <div className={reportLayout.cardHeader}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-navy-dark" />
            <h3 className={reportTypography.cardTitle}>Section Confidence</h3>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            {sectionConfidences.map((sc) => (
              <div
                key={sc.section}
                className={cn(
                  "flex items-center justify-between py-1.5 px-2 rounded text-xs font-sans",
                  sc.included ? "text-report-text" : "text-report-muted/40 line-through",
                )}
              >
                <span className="capitalize">{sc.section.replace(/_/g, " ")}</span>
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    sc.included ? "bg-emerald-500" : "bg-slate-200",
                  )}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
