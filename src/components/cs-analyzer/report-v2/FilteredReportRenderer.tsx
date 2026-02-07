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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import type { FinalReport, EvidenceAnchor } from "./types";
import type { SectionVisibility } from "./ReportBuilder";

interface FilteredReportRendererProps {
  report: FinalReport;
  evidenceAnchors: EvidenceAnchor[];
  visibility: SectionVisibility;
  title?: string;
  createdAt?: string;
}

export const FilteredReportRenderer = ({
  report,
  evidenceAnchors,
  visibility,
  title,
  createdAt,
}: FilteredReportRendererProps) => {
  const si = report.section_included;

  // Merge pipeline section_included with user visibility toggles
  const isVisible = (key: string) => {
    // Check if it's a section_included key
    if (key in si) {
      return si[key as keyof typeof si] && (visibility[key] !== false);
    }
    // Display-only toggle
    return visibility[key] !== false;
  };

  // Build section confidence list for sidebar
  const sectionConfidences = Object.entries(si).map(([section, included]) => ({
    section,
    included: included as boolean,
  }));

  // If evidence_quotes is toggled off, pass empty anchors to suppress chips
  const effectiveAnchors = isVisible("evidence_quotes") ? evidenceAnchors : [];

  return (
    <EvidenceProvider anchors={effectiveAnchors}>
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

        {/* Always visible: Executive Snapshot */}
        {si.executive_snapshot && <ExecutiveSnapshotV2 data={report.executive_snapshot} />}

        {/* Always visible: Risks & Threats */}
        {si.risks_and_threats && (
          <RiskBreakdownV2
            threatClassification={report.risks_and_threats.threat_classification}
            riskItems={report.risks_and_threats.risk_items}
            sectionConfidences={isVisible("confidence_scores") ? sectionConfidences : []}
          />
        )}

        {/* Toggleable: Stakeholders */}
        {isVisible("stakeholder_power_map") && report.stakeholder_power_map.stakeholders.length > 0 && (
          <StakeholderMapV2
            stakeholders={report.stakeholder_power_map.stakeholders}
            summary={report.stakeholder_power_map.summary}
          />
        )}

        {/* Toggleable: Facts timeline */}
        {isVisible("evidence_backed_facts") && report.evidence_backed_facts.length > 0 && (
          <FactsTimeline facts={report.evidence_backed_facts} />
        )}

        {/* Always visible: Action Plan */}
        {si.action_plan_14_days && report.action_plan_14_days.length > 0 && (
          <ActionPlanChecklist actions={report.action_plan_14_days} />
        )}

        {/* Toggleable conditional sections */}
        {isVisible("procurement_and_timeline") && (
          <ProcurementTimeline data={report.procurement_and_timeline} />
        )}
        {isVisible("incident_impact") && <IncidentImpact data={report.incident_impact} />}
        {isVisible("expansion_plays") && report.expansion_plays.length > 0 && (
          <ExpansionPlays data={report.expansion_plays} />
        )}
        {isVisible("value_narrative_gaps") && report.value_narrative_gaps.length > 0 && (
          <ValueNarrativeGaps data={report.value_narrative_gaps} />
        )}
        {isVisible("cs_rep_effectiveness") && (
          <CSRepEffectiveness data={report.cs_rep_effectiveness} />
        )}

        {/* Toggleable: QA Notes */}
        {isVisible("qa_notes") && report.qa && (
          <Card className="border border-report-border">
            <CardHeader className="border-b border-report-border bg-amber-50/50 py-3 px-5">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                <CardTitle className="font-serif text-base font-bold text-report-heading">
                  QA — Removed Claims & Notes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {report.qa.removed_claims.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Removed Claims ({report.qa.removed_claims.length})
                  </p>
                  <ul className="space-y-1">
                    {report.qa.removed_claims.map((rc, i) => (
                      <li key={i} className="text-xs font-sans text-report-text bg-muted/30 rounded px-3 py-1.5">
                        <span className="font-medium">{rc.reason}:</span> {rc.claim}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.qa.notes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Notes ({report.qa.notes.length})
                  </p>
                  <ul className="space-y-1">
                    {report.qa.notes.map((note, i) => (
                      <li key={i} className="text-xs font-sans text-report-text bg-muted/30 rounded px-3 py-1.5">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.qa.removed_claims.length === 0 && report.qa.notes.length === 0 && (
                <p className="text-xs text-muted-foreground">No claims removed or notes generated.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </EvidenceProvider>
  );
};
