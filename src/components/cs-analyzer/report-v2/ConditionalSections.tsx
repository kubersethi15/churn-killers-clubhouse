import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  AlertCircle,
  TrendingUp,
  Eye,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography, reportLayout } from "../report/reportStyles";
import { EvidenceChip } from "./EvidenceChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { FinalReport, ConfidenceLevel } from "./types";

// ---------------------------------------------------------------------------
// Generic compact card wrapper
// ---------------------------------------------------------------------------

interface CompactSectionProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
}

const CompactSection = ({ title, icon, iconBg, children }: CompactSectionProps) => (
  <Card className={reportLayout.card}>
    <div className={cn(reportLayout.cardHeader, "py-3")}>
      <div className="flex items-center gap-2">
        <div className={cn("p-1.5 rounded-md", iconBg)}>{icon}</div>
        <h3 className={reportTypography.cardTitle}>{title}</h3>
      </div>
    </div>
    <CardContent className="p-4">{children}</CardContent>
  </Card>
);

// ---------------------------------------------------------------------------
// Procurement & Timeline
// ---------------------------------------------------------------------------

export const ProcurementTimeline = ({ data }: { data: FinalReport["procurement_and_timeline"] }) => {
  if (data.timeline_items.length === 0 && data.procurement_risks.length === 0) return null;

  return (
    <CompactSection title="Procurement & Timeline" icon={<Calendar className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100">
      {data.timeline_items.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className={reportTypography.labelUppercase}>Timeline</p>
          {data.timeline_items.map((t, i) => (
            <div key={i} className={reportLayout.listItemCard}>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold font-sans bg-amber-100 text-amber-700 shrink-0">
                {t.topic}
              </span>
              <span className={reportTypography.bodyText}>{t.when_text}</span>
              <EvidenceChip anchorIds={t.anchor_ids} />
              <ConfidenceBadge level={t.confidence as ConfidenceLevel} />
            </div>
          ))}
        </div>
      )}
      {data.procurement_risks.length > 0 && (
        <div className="space-y-2">
          <p className={reportTypography.labelUppercase}>Procurement Risks</p>
          {data.procurement_risks.map((r, i) => (
            <div key={i} className={reportLayout.listItemCard}>
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <span className={reportTypography.bodyText}>{r.risk}</span>
              <EvidenceChip anchorIds={r.anchor_ids} />
            </div>
          ))}
        </div>
      )}
    </CompactSection>
  );
};

// ---------------------------------------------------------------------------
// Incident Impact
// ---------------------------------------------------------------------------

export const IncidentImpact = ({ data }: { data: FinalReport["incident_impact"] }) => {
  if (data.incident_summary.length === 0 && data.customer_impact.length === 0) return null;

  return (
    <CompactSection title="Incident Impact" icon={<AlertCircle className="w-4 h-4 text-red-600" />} iconBg="bg-red-100">
      {data.incident_summary.map((s, i) => (
        <div key={i} className={cn(reportLayout.listItemCard, "mb-2")}>
          <div className="flex-1">
            <p className={reportTypography.bodyText}>{s.summary}</p>
            <EvidenceChip anchorIds={s.anchor_ids} className="mt-1" />
          </div>
        </div>
      ))}
      {data.customer_impact.map((c, i) => (
        <div key={i} className={cn(reportLayout.listItemCard, "mb-2")}>
          <div className="flex-1">
            <p className={reportTypography.bodyText}>{c.impact}</p>
            <EvidenceChip anchorIds={c.anchor_ids} className="mt-1" />
          </div>
        </div>
      ))}
    </CompactSection>
  );
};

// ---------------------------------------------------------------------------
// Expansion Plays
// ---------------------------------------------------------------------------

export const ExpansionPlays = ({ data }: { data: FinalReport["expansion_plays"] }) => {
  if (data.length === 0) return null;

  return (
    <CompactSection title="Expansion Plays" icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} iconBg="bg-emerald-100">
      <div className="space-y-2">
        {data.map((play, i) => (
          <div key={i} className={reportLayout.listItemCard}>
            <div className="flex-1">
              <p className={cn(reportTypography.bodyText, "font-medium mb-0.5")}>{play.play}</p>
              <p className="text-[11px] font-sans text-report-muted mb-1">{play.why_it_fits}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans text-report-muted">
                  {play.observed_or_inferred === "inferred" ? "Inferred" : "Observed"}
                </span>
                <EvidenceChip anchorIds={play.anchor_ids} />
                <ConfidenceBadge level={play.confidence as ConfidenceLevel} />
              </div>
              {play.inference_rationale && (
                <p className="text-[11px] font-sans text-report-muted mt-1 italic">{play.inference_rationale}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </CompactSection>
  );
};

// ---------------------------------------------------------------------------
// Value Narrative Gaps
// ---------------------------------------------------------------------------

export const ValueNarrativeGaps = ({ data }: { data: FinalReport["value_narrative_gaps"] }) => {
  if (data.length === 0) return null;

  return (
    <CompactSection title="Value Narrative Gaps" icon={<Eye className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100">
      <div className="space-y-2">
        {data.map((gap, i) => (
          <div key={i} className={reportLayout.listItemCard}>
            <div className="flex-1">
              <p className={cn(reportTypography.bodyText, "font-medium mb-0.5")}>{gap.gap}</p>
              <p className="text-[11px] font-sans text-report-muted mb-1">
                Impact on renewal: {gap.impact_on_renewal}
              </p>
              <div className="flex items-center gap-2">
                <EvidenceChip anchorIds={gap.anchor_ids} />
                <ConfidenceBadge level={gap.confidence as ConfidenceLevel} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CompactSection>
  );
};

// ---------------------------------------------------------------------------
// CS Rep Effectiveness
// ---------------------------------------------------------------------------

export const CSRepEffectiveness = ({ data }: { data: FinalReport["cs_rep_effectiveness"] }) => {
  const hasContent = data.strengths.length > 0 || data.gaps.length > 0 || data.coaching_moves.length > 0;
  if (!hasContent) return null;

  return (
    <CompactSection title="CS Rep Effectiveness" icon={<GraduationCap className="w-4 h-4 text-navy-dark" />} iconBg="bg-navy-dark/10">
      {data.strengths.length > 0 && (
        <div className="mb-3">
          <p className={cn(reportTypography.labelUppercase, "mb-2 text-emerald-600")}>Strengths</p>
          {data.strengths.map((s, i) => (
            <div key={i} className={cn(reportLayout.listItemCard, "mb-1")}>
              <span className={reportTypography.bodyText}>{s.strength}</span>
              <EvidenceChip anchorIds={s.anchor_ids} />
            </div>
          ))}
        </div>
      )}
      {data.gaps.length > 0 && (
        <div className="mb-3">
          <p className={cn(reportTypography.labelUppercase, "mb-2 text-red-600")}>Gaps</p>
          {data.gaps.map((g, i) => (
            <div key={i} className={cn(reportLayout.listItemCard, "mb-1")}>
              <span className={reportTypography.bodyText}>{g.gap}</span>
              <EvidenceChip anchorIds={g.anchor_ids} />
            </div>
          ))}
        </div>
      )}
      {data.coaching_moves.length > 0 && (
        <div>
          <p className={cn(reportTypography.labelUppercase, "mb-2")}>Coaching Moves</p>
          {data.coaching_moves.map((c, i) => (
            <div key={i} className={cn(reportLayout.listItemCard, "mb-1")}>
              <div className="flex-1">
                <p className={cn(reportTypography.bodyText, "font-medium")}>{c.move}</p>
                <p className="text-[11px] font-sans text-report-muted mt-0.5">{c.why}</p>
              </div>
              <EvidenceChip anchorIds={c.anchor_ids} />
            </div>
          ))}
        </div>
      )}
    </CompactSection>
  );
};
