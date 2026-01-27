import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

import { parseIntoSections } from "./report/utils";
import { SnapshotSection } from "./report/SnapshotSection";
import { ActionPlanSection } from "./report/ActionPlanSection";
import { StakeholderSection } from "./report/StakeholderSection";
import { SignalSection } from "./report/SignalSection";
import { QuestionsSection } from "./report/QuestionsSection";
import { GenericSection } from "./report/GenericSection";

interface AnalysisReportProps {
  analysisResult: string;
}

// Determine which component to render based on section title
const renderSection = (title: string, content: string, idx: number) => {
  const lowerTitle = title.toLowerCase();
  
  // Snapshot section
  if (lowerTitle.includes("snapshot")) {
    return <SnapshotSection key={idx} content={content} />;
  }
  
  // Action Plan section
  if (lowerTitle.includes("action") || lowerTitle.includes("plan") || lowerTitle.includes("14-day") || lowerTitle.includes("14 day")) {
    return <ActionPlanSection key={idx} content={content} />;
  }
  
  // Stakeholder section
  if (lowerTitle.includes("stakeholder") || lowerTitle.includes("power map")) {
    return <StakeholderSection key={idx} content={content} />;
  }
  
  // Risk signals
  if (lowerTitle.includes("risk")) {
    return <SignalSection key={idx} content={content} type="risk" />;
  }
  
  // Growth/Expansion signals
  if (lowerTitle.includes("expansion") || lowerTitle.includes("growth")) {
    return <SignalSection key={idx} content={content} type="growth" />;
  }
  
  // Questions section
  if (lowerTitle.includes("question")) {
    return <QuestionsSection key={idx} content={content} />;
  }
  
  // All other sections use the generic renderer
  return <GenericSection key={idx} title={title} content={content} />;
};

export const AnalysisReport = ({ analysisResult }: AnalysisReportProps) => {
  const sections = useMemo(() => parseIntoSections(analysisResult), [analysisResult]);
  
  if (sections.length === 0) {
    // Fallback to raw markdown if parsing fails
    return (
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:text-navy-dark prose-strong:text-navy-dark">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {sections.map((section, idx) => renderSection(section.title, section.content, idx))}
    </div>
  );
};

export default AnalysisReport;
