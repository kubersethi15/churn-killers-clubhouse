import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography, reportLayout } from "../report/reportStyles";
import { EvidenceChip } from "./EvidenceChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { StakeholderEntry } from "./types";

interface StakeholderMapV2Props {
  stakeholders: StakeholderEntry[];
  summary: {
    power_distribution: { high: number; medium: number; low: number };
    stance_distribution: { supportive: number; skeptical: number; neutral: number; resistant?: number; unknown: number };
  };
}

const stanceColors: Record<string, string> = {
  supportive: "bg-emerald-100 text-emerald-700",
  skeptical: "bg-red-100 text-red-700",
  resistant: "bg-red-200 text-red-800",
  neutral: "bg-slate-100 text-slate-600",
  unknown: "bg-slate-50 text-slate-400",
};

const powerColors: Record<string, string> = {
  high: "bg-navy-dark text-white",
  medium: "bg-navy-dark/20 text-navy-dark",
  low: "bg-slate-100 text-slate-500",
};

const roleLabels: Record<string, string> = {
  decision_maker: "Decision Maker",
  influencer: "Influencer",
  champion: "Champion",
  blocker: "Blocker",
  end_user: "End User",
  unknown: "Unknown",
};

const roleColors: Record<string, string> = {
  decision_maker: "bg-purple-100 text-purple-700",
  influencer: "bg-blue-100 text-blue-700",
  champion: "bg-emerald-100 text-emerald-700",
  blocker: "bg-red-100 text-red-700",
  end_user: "bg-slate-100 text-slate-500",
  unknown: "bg-slate-50 text-slate-400",
};

export const StakeholderMapV2 = ({ stakeholders, summary }: StakeholderMapV2Props) => {
  if (stakeholders.length === 0) return null;

  // Check if any stakeholder has the new enriched fields
  const hasEnrichedData = stakeholders.some(
    (s) => s.role_in_decision || s.motivation_or_pressure || s.relationships
  );

  return (
    <Card className={reportLayout.card}>
      <div className={reportLayout.cardHeader}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-navy-dark/10">
            <Users className="w-4 h-4 text-navy-dark" />
          </div>
          <div>
            <h3 className={reportTypography.sectionTitle}>Stakeholder Power Map</h3>
            <p className={reportTypography.sectionSubtitle}>{stakeholders.length} stakeholders identified</p>
          </div>
        </div>
      </div>
      <CardContent className="p-5 space-y-5">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="font-semibold text-report-text">Power:</span>
            {Object.entries(summary.power_distribution)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => (
                <span key={k} className={cn("px-2 py-0.5 rounded font-medium", powerColors[k])}>
                  {k}: {v}
                </span>
              ))}
          </div>
          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="font-semibold text-report-text">Stance:</span>
            {Object.entries(summary.stance_distribution)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => (
                <span key={k} className={cn("px-2 py-0.5 rounded font-medium", stanceColors[k])}>
                  {k}: {v}
                </span>
              ))}
          </div>
        </div>

        {/* Enriched stakeholder cards (when new fields present) */}
        {hasEnrichedData ? (
          <div className="space-y-3">
            {stakeholders.map((s, idx) => (
              <div
                key={idx}
                className="border border-report-border rounded-lg p-3 hover:bg-report-surface/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-report-heading">{s.name_or_title}</span>
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", powerColors[s.power])}>
                      {s.power}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", stanceColors[s.stance])}>
                      {s.stance}
                    </span>
                    {s.role_in_decision && s.role_in_decision !== "unknown" && (
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", roleColors[s.role_in_decision] || roleColors.unknown)}>
                        {roleLabels[s.role_in_decision] || s.role_in_decision}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <EvidenceChip anchorIds={s.anchor_ids} />
                    <ConfidenceBadge level={s.confidence} />
                  </div>
                </div>
                {/* Motivation & Relationships */}
                <div className="space-y-1 ml-0.5">
                  {s.motivation_or_pressure && (
                    <p className="text-[11px] font-sans text-report-muted">
                      <span className="font-semibold text-report-text">Motivation:</span> {s.motivation_or_pressure}
                    </p>
                  )}
                  {s.relationships && (
                    <p className="text-[11px] font-sans text-report-muted">
                      <span className="font-semibold text-report-text">Relationships:</span> {s.relationships}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] font-sans text-report-muted mt-1">
                    <span>Engagement: <span className="font-medium capitalize">{s.engagement_level || s.engagement || "—"}</span></span>
                    {s.presence && <span>Presence: <span className="font-medium capitalize">{s.presence.replace(/_/g, " ")}</span></span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Legacy table view */
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-report-border">
                  <th className="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-report-muted">Stakeholder</th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-report-muted">Power</th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-report-muted">Stance</th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-report-muted">Engagement</th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-report-muted">Presence</th>
                  <th className="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-report-muted">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {stakeholders.map((s, idx) => (
                  <tr key={idx} className="border-b border-report-border/50 hover:bg-report-surface/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-report-heading">{s.name_or_title}</td>
                    <td className="py-2.5 px-3">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", powerColors[s.power])}>
                        {s.power}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", stanceColors[s.stance])}>
                        {s.stance}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-report-muted capitalize">{s.engagement_level || s.engagement || "—"}</td>
                    <td className="py-2.5 px-3 text-report-muted capitalize text-xs">{(s.presence ?? "").replace(/_/g, " ") || "—"}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <EvidenceChip anchorIds={s.anchor_ids} />
                        <ConfidenceBadge level={s.confidence} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
