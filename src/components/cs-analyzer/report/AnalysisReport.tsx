import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";

import { parseIntoSections } from "./utils";
import { SnapshotSection } from "./SnapshotSection";
import { ActionPlanSection } from "./ActionPlanSection";
import { StakeholderSection } from "./StakeholderSection";
import { SignalSection } from "./SignalSection";
import { QuestionsSection } from "./QuestionsSection";
import { GenericSection } from "./GenericSection";

interface AnalysisReportProps {
  analysisResult: string;
  title?: string;
  createdAt?: string;
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

export const AnalysisReport = ({ analysisResult, title, createdAt }: AnalysisReportProps) => {
  const sections = useMemo(() => parseIntoSections(analysisResult), [analysisResult]);
  
  const ReportHeader = () => (
    title ? (
      <div className="mb-8 pb-5 border-b border-report-border">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-navy-dark/10 shrink-0">
            <FileText className="w-6 h-6 text-navy-dark" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-navy-dark leading-tight">
              {title}
            </h1>
            {createdAt && (
              <p className="text-sm text-muted-foreground mt-1.5">
                {new Date(createdAt).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    ) : null
  );
  
  if (sections.length === 0) {
    // Fallback to raw markdown if parsing fails
    return (
      <Card>
        <CardContent className="p-6 md:p-8">
          <ReportHeader />
          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:text-navy-dark prose-strong:text-navy-dark">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-5">
      <ReportHeader />
      <div className="space-y-5">
        {sections.map((section, idx) => renderSection(section.title, section.content, idx))}
      </div>
    </div>
  );
};

export default AnalysisReport;
