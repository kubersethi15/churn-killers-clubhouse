import { motion } from "framer-motion";
import { staggerContainer, sectionFadeUp } from "@/lib/motion";
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
  ExpansionReadinessSection,
  ConversationalGapsSection,
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

/**
 * Wraps any child node in a fade-up section. Keeps the conditional-render
 * logic below readable instead of repeating motion.div boilerplate.
 */
const Section = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={sectionFadeUp}>{children}</motion.div>
);

export const V2ReportRenderer = ({ report, evidenceAnchors, title, createdAt }: V2ReportRendererProps) => {
  const si = report.section_included;

  // Build section confidence list for sidebar
  const sectionConfidences = Object.entries(si).map(([section, included]) => ({
    section,
    included: included as boolean,
  }));

  return (
    <EvidenceProvider anchors={evidenceAnchors}>
      <motion.div
        className="space-y-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Editorial report masthead */}
        {title && (
          <motion.div variants={sectionFadeUp} className="mb-2 pb-4 border-b border-navy-dark/10">
            <p className="text-[10px] uppercase tracking-[0.22em] text-red font-bold mb-2">
              CS Analyzer Report
            </p>
            <h1 className="text-2xl md:text-3xl font-serif font-black text-navy-dark leading-tight tracking-tight">
              {title}
            </h1>
            {createdAt && (
              <p className="text-xs text-muted-foreground mt-2">
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
          </motion.div>
        )}

        {/* Row 1: Executive Snapshot (always) */}
        {si.executive_snapshot && (
          <Section>
            <ExecutiveSnapshotV2 data={report.executive_snapshot} />
          </Section>
        )}

        {/* Row 2: Risk Breakdown + Section Confidence */}
        {si.risks_and_threats && (
          <Section>
            <RiskBreakdownV2
              threatClassification={report.risks_and_threats.threat_classification}
              riskItems={report.risks_and_threats.risk_items}
              sectionConfidences={sectionConfidences}
            />
          </Section>
        )}

        {/* Stakeholders (conditional) */}
        {si.stakeholder_power_map && report.stakeholder_power_map.stakeholders.length > 0 && (
          <Section>
            <StakeholderMapV2
              stakeholders={report.stakeholder_power_map.stakeholders}
              summary={report.stakeholder_power_map.summary}
            />
          </Section>
        )}

        {/* Facts timeline (always if present) */}
        {si.evidence_backed_facts && report.evidence_backed_facts.length > 0 && (
          <Section>
            <FactsTimeline facts={report.evidence_backed_facts} />
          </Section>
        )}

        {/* Action Plan (always) */}
        {si.action_plan_14_days && report.action_plan_14_days.length > 0 && (
          <Section>
            <ActionPlanChecklist actions={report.action_plan_14_days} />
          </Section>
        )}

        {/* Conditional sections — compact cards only if included AND have content */}
        {si.procurement_and_timeline && (
          <Section>
            <ProcurementTimeline data={report.procurement_and_timeline} />
          </Section>
        )}
        {si.incident_impact && (
          <Section>
            <IncidentImpact data={report.incident_impact} />
          </Section>
        )}
        {si.expansion_plays && report.expansion_plays.length > 0 && (
          <Section>
            <ExpansionPlays data={report.expansion_plays} />
          </Section>
        )}

        {/* Expansion Readiness (new) */}
        {report.expansion_readiness && (
          <Section>
            <ExpansionReadinessSection data={report.expansion_readiness} />
          </Section>
        )}

        {si.value_narrative_gaps && report.value_narrative_gaps.length > 0 && (
          <Section>
            <ValueNarrativeGaps data={report.value_narrative_gaps} />
          </Section>
        )}

        {/* Conversational Gaps (new) */}
        {si.conversational_gaps && report.conversational_gaps && report.conversational_gaps.length > 0 && (
          <Section>
            <ConversationalGapsSection data={report.conversational_gaps} />
          </Section>
        )}

        {si.cs_rep_effectiveness && (
          <Section>
            <CSRepEffectiveness data={report.cs_rep_effectiveness} />
          </Section>
        )}
      </motion.div>
    </EvidenceProvider>
  );
};
