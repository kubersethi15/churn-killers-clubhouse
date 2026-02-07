import { EvidenceProvider } from "./EvidenceContext";
import { ExecutiveSnapshotV2 } from "./ExecutiveSnapshotV2";
import { RiskBreakdownV2 } from "./RiskBreakdownV2";
import { FactsTimeline } from "./FactsTimeline";
import { ActionPlanChecklist } from "./ActionPlanChecklist";
import { StakeholderMapV2 } from "./StakeholderMapV2";
import {
  ProcurementTimeline,
  IncidentImpact,
  ExpansionPlays,
  ValueNarrativeGaps,
  CSRepEffectiveness,
} from "./ConditionalSections";
import type { FinalReport, EvidenceAnchor } from "./types";

interface V2ReportRendererProps {
  report: FinalReport;
  evidenceAnchors: EvidenceAnchor[];
  title?: string;
  createdAt?: string;
}

export const V2ReportRenderer = ({ report, evidenceAnchors, title, createdAt }: V2ReportRendererProps) => {
  const si = report.section_included;

  // Build section confidence list for sidebar
  const sectionConfidences = Object.entries(si).map(([section, included]) => ({
    section,
    included: included as boolean,
  }));

  return (
    <EvidenceProvider anchors={evidenceAnchors}>
      <div className="space-y-4">
        {/* Report header */}
        {title && (
          <div className="mb-2">
            <h1 className="text-lg md:text-xl font-serif font-bold text-navy-dark leading-tight">
              {title}
            </h1>
            {createdAt && (
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        )}

        {/* Row 1: Executive Snapshot (always) */}
        {si.executive_snapshot && <ExecutiveSnapshotV2 data={report.executive_snapshot} />}

        {/* Row 2: Risk Breakdown + Section Confidence */}
        {si.risks_and_threats && (
          <RiskBreakdownV2
            threatClassification={report.risks_and_threats.threat_classification}
            riskItems={report.risks_and_threats.risk_items}
            sectionConfidences={sectionConfidences}
          />
        )}

        {/* Stakeholders (conditional) */}
        {si.stakeholder_power_map && report.stakeholder_power_map.stakeholders.length > 0 && (
          <StakeholderMapV2
            stakeholders={report.stakeholder_power_map.stakeholders}
            summary={report.stakeholder_power_map.summary}
          />
        )}

        {/* Facts timeline (always if present) */}
        {si.evidence_backed_facts && report.evidence_backed_facts.length > 0 && (
          <FactsTimeline facts={report.evidence_backed_facts} />
        )}

        {/* Action Plan (always) */}
        {si.action_plan_14_days && report.action_plan_14_days.length > 0 && (
          <ActionPlanChecklist actions={report.action_plan_14_days} />
        )}

        {/* Conditional sections — compact cards only if included AND have content */}
        {si.procurement_and_timeline && <ProcurementTimeline data={report.procurement_and_timeline} />}
        {si.incident_impact && <IncidentImpact data={report.incident_impact} />}
        {si.expansion_plays && report.expansion_plays.length > 0 && <ExpansionPlays data={report.expansion_plays} />}
        {si.value_narrative_gaps && report.value_narrative_gaps.length > 0 && <ValueNarrativeGaps data={report.value_narrative_gaps} />}
        {si.cs_rep_effectiveness && <CSRepEffectiveness data={report.cs_rep_effectiveness} />}
      </div>
    </EvidenceProvider>
  );
};
