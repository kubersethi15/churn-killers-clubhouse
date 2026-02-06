import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { FileText, Loader2 } from "lucide-react";

import { parseIntoSections } from "./utils";
import { SnapshotSection } from "./SnapshotSection";
import { ActionPlanSection } from "./ActionPlanSection";
import { StakeholderSection } from "./StakeholderSection";
import { SignalSection } from "./SignalSection";
import { QuestionsSection } from "./QuestionsSection";
import { GenericSection } from "./GenericSection";
import { useChartAnalysis } from "../hooks/useChartAnalysis";
import { 
  StakeholderQuadrant, 
  RiskRadar, 
  SentimentDonut, 
  ActionTimeline,
  ChartConfig 
} from "../charts";

interface AnalysisReportProps {
  analysisResult: string;
  title?: string;
  createdAt?: string;
  scenario?: string;
}

// Determine which component to render based on section title
const renderSection = (
  title: string,
  content: string,
  idx: number,
  charts: ChartConfig | null,
  chartsLoading: boolean,
  chartsError: string | null
) => {
  const lowerTitle = title.toLowerCase();
  
  // Snapshot section - add sentiment chart
  if (lowerTitle.includes("snapshot")) {
    return (
      <div key={idx}>
        <SnapshotSection content={content} />
        {chartsLoading && (
          <div className="mt-4 flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">Generating insights...</span>
          </div>
        )}
        {chartsError && (
          <div className="mt-4 rounded-lg border border-report-border bg-report-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Charts unavailable: {chartsError}</p>
          </div>
        )}
        {charts?.sentimentDonut?.enabled && (
          <SentimentDonut data={charts.sentimentDonut.data} />
        )}
      </div>
    );
  }
  
  // Plans (keep structured table rendering but preserve the actual section title)
  if (
    lowerTitle.includes("14-day") ||
    lowerTitle.includes("14 day") ||
    lowerTitle.includes("battle plan") ||
    lowerTitle.includes("strategic action plan")
  ) {
    return (
      <div key={idx}>
        <ActionPlanSection content={content} />
        {charts?.actionTimeline?.enabled && (
          <ActionTimeline data={charts.actionTimeline.data} />
        )}
      </div>
    );
  }

  if (lowerTitle.includes("stabilization") || lowerTitle.includes("0–72") || lowerTitle.includes("0-72") || lowerTitle.includes("72h")) {
    return (
      <div key={idx}>
        <ActionPlanSection
          title={title}
          subtitle="Concrete actions for the next 72 hours"
          content={content}
        />
        {charts?.actionTimeline?.enabled && (
          <ActionTimeline data={charts.actionTimeline.data} />
        )}
      </div>
    );
  }

  if (lowerTitle.includes("trust recovery") || lowerTitle.includes("30–90") || lowerTitle.includes("30-90")) {
    return (
      <div key={idx}>
        <ActionPlanSection
          title={title}
          subtitle="Actions to rebuild trust over the next 30–90 days"
          content={content}
        />
      </div>
    );
  }
  
  // Stakeholder section - add quadrant chart
  if (lowerTitle.includes("stakeholder") || lowerTitle.includes("power map")) {
    return (
      <div key={idx}>
        <StakeholderSection content={content} />
        {charts?.stakeholderQuadrant?.enabled && (
          <StakeholderQuadrant data={charts.stakeholderQuadrant.data} />
        )}
      </div>
    );
  }
  
  // Risk signals - add radar chart
  if (lowerTitle.includes("risk")) {
    return (
      <div key={idx}>
        <SignalSection content={content} type="risk" />
        {charts?.riskRadar?.enabled && (
          <RiskRadar data={charts.riskRadar.data} />
        )}
      </div>
    );
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

export const AnalysisReport = ({ analysisResult, title, createdAt, scenario }: AnalysisReportProps) => {
  const sections = useMemo(() => parseIntoSections(analysisResult), [analysisResult]);
  
  // Fetch chart data using AI analysis
  const { charts, isLoading: chartsLoading, error: chartsError } = useChartAnalysis({
    analysisResult,
    scenario,
    enabled: true,
  });
  
  const ReportHeader = () => (
    title ? (
      <div className="mb-6 pb-4 border-b border-report-border">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-navy-dark/10 shrink-0">
            <FileText className="w-5 h-5 text-navy-dark" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-serif font-bold text-navy-dark leading-tight">
              {title}
            </h1>
            {createdAt && (
              <p className="text-xs text-muted-foreground mt-1">
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
        <CardContent className="p-5">
          <ReportHeader />
          <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-navy-dark prose-strong:text-navy-dark">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <ReportHeader />
      <div className="space-y-4">
        {sections.map((section, idx) =>
          renderSection(
            section.title,
            section.content,
            idx,
            charts,
            chartsLoading && idx === 0,
            idx === 0 ? chartsError : null
          )
        )}
      </div>
    </div>
  );
};

export default AnalysisReport;
