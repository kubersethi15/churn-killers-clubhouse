import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  AlertCircle,
  TrendingUp,
  Eye,
  GraduationCap,
  MessageSquareWarning,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography, reportLayout } from "../report/reportStyles";
import { EvidenceChip } from "./EvidenceChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { FinalReport, ConfidenceLevel, ExpansionReadiness, ConversationalGap } from "./types";

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
                {t.topic || t.event || "—"}
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
            <p className={reportTypography.bodyText}>{s.summary || s.incident || ""}</p>
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
              {play.why_it_fits && (
                <p className="text-[11px] font-sans text-report-muted mb-1">{play.why_it_fits}</p>
              )}
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
// Expansion Readiness (NEW)
// ---------------------------------------------------------------------------

const stageColors: Record<string, string> = {
  no_signal: "bg-slate-100 text-slate-500",
  interest: "bg-blue-100 text-blue-700",
  evaluation: "bg-amber-100 text-amber-700",
  negotiation: "bg-purple-100 text-purple-700",
  commitment: "bg-emerald-100 text-emerald-700",
};

export const ExpansionReadinessSection = ({ data }: { data: ExpansionReadiness }) => {
  if (!data || data.stage === "no_signal") return null;

  return (
    <CompactSection title="Expansion Readiness" icon={<Rocket className="w-4 h-4 text-purple-600" />} iconBg="bg-purple-100">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", stageColors[data.stage] || stageColors.no_signal)}>
            {data.stage.replace(/_/g, " ")}
          </span>
          <ConfidenceBadge level={data.confidence} />
          <EvidenceChip anchorIds={data.anchor_ids} />
        </div>

        {data.gate_conditions.length > 0 && (
          <div>
            <p className={cn(reportTypography.labelUppercase, "mb-1")}>Gate Conditions</p>
            <ul className="list-disc list-inside space-y-0.5">
              {data.gate_conditions.map((g, i) => (
                <li key={i} className="text-[11px] font-sans text-report-muted">{g}</li>
              ))}
            </ul>
          </div>
        )}

        {data.decision_makers.length > 0 && (
          <div>
            <p className={cn(reportTypography.labelUppercase, "mb-1")}>Decision Makers</p>
            <div className="flex flex-wrap gap-1">
              {data.decision_makers.map((d, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.blockers.length > 0 && (
          <div>
            <p className={cn(reportTypography.labelUppercase, "mb-1 text-red-600")}>Blockers</p>
            <ul className="list-disc list-inside space-y-0.5">
              {data.blockers.map((b, i) => (
                <li key={i} className="text-[11px] font-sans text-red-600">{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CompactSection>
  );
};

// ---------------------------------------------------------------------------
// Conversational Gaps (NEW)
// ---------------------------------------------------------------------------

export const ConversationalGapsSection = ({ data }: { data: ConversationalGap[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <CompactSection title="Conversational Gaps" icon={<MessageSquareWarning className="w-4 h-4 text-amber-600" />} iconBg="bg-amber-100">
      <div className="space-y-3">
        {data.map((gap, i) => (
          <div key={i} className="border border-report-border rounded-lg p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className={cn(reportTypography.bodyText, "font-medium")}>{gap.missing_topic}</p>
              <ConfidenceBadge level={gap.confidence} />
            </div>
            <p className="text-[11px] font-sans text-report-muted mb-2">{gap.why_it_matters}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
              <p className="text-[10px] font-semibold font-sans text-blue-700 uppercase tracking-wider mb-0.5">Suggested Question</p>
              <p className="text-[11px] font-sans text-blue-800 italic">"{gap.suggested_question}"</p>
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

  const sectionTitle = data.title_override || "CS Rep Effectiveness";

  return (
    <CompactSection title={sectionTitle} icon={<GraduationCap className="w-4 h-4 text-navy-dark" />} iconBg="bg-navy-dark/10">
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
              {c.anchor_ids && <EvidenceChip anchorIds={c.anchor_ids} />}
            </div>
          ))}
        </div>
      )}
    </CompactSection>
  );
};
