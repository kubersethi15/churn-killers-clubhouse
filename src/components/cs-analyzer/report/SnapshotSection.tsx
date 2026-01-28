import { Card, CardContent } from "@/components/ui/card";
import { Zap, Quote, AlertTriangle } from "lucide-react";
import { MetricBadge } from "./MetricBadge";
import { extractSeverityMetrics, extractOneLinerTruth } from "./utils";
import { reportTypography } from "./reportStyles";
import { cn } from "@/lib/utils";
import { SeverityLevel } from "./types";

interface SnapshotSectionProps {
  content: string;
}

// Priority order for displaying metrics in the snapshot
const metricPriority = [
  "account posture",
  "revenue threat",
  "champion",
  "commercial risk",
  "political complexity",
  "engagement",
];

// Sort metrics by priority
const sortByPriority = (metrics: { key: string; value: string; level: SeverityLevel }[]) => {
  return [...metrics].sort((a, b) => {
    const aLower = a.key.toLowerCase();
    const bLower = b.key.toLowerCase();
    
    const aIndex = metricPriority.findIndex(p => aLower.includes(p));
    const bIndex = metricPriority.findIndex(p => bLower.includes(p));
    
    // If both found in priority list, sort by priority
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    // Priority items come first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // Otherwise maintain order
    return 0;
  });
};

export const SnapshotSection = ({ content }: SnapshotSectionProps) => {
  const metrics = extractSeverityMetrics(content);
  const sortedMetrics = sortByPriority(metrics);
  const oneLiner = extractOneLinerTruth(content);
  
  // Separate critical/high severity metrics for visual emphasis
  const criticalMetrics = sortedMetrics.filter(m => m.level === "critical" || m.level === "high");
  const otherMetrics = sortedMetrics.filter(m => m.level !== "critical" && m.level !== "high");
  
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-navy-dark via-navy to-navy-light p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={cn("text-xl text-white", reportTypography.sectionTitle.replace("text-report-heading", ""))}>
              Executive Snapshot
            </h2>
            <p className="text-white/70 text-sm font-sans">Key indicators at a glance</p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Critical/High Severity Alerts - Show prominently */}
        {criticalMetrics.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className={cn(reportTypography.labelUppercase, "text-red-600")}>
                Critical Indicators
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {criticalMetrics.map((metric, idx) => (
                <MetricBadge
                  key={idx}
                  label={metric.key}
                  value={metric.value}
                  severity={metric.level}
                  size="lg"
                  showIcon={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Other Metrics Grid */}
        {otherMetrics.length > 0 && (
          <div className={cn(criticalMetrics.length > 0 && "pt-4 border-t border-report-border")}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherMetrics.map((metric, idx) => (
                <MetricBadge
                  key={idx}
                  label={metric.key}
                  value={metric.value}
                  severity={metric.level}
                  size="md"
                  showIcon={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* One-liner Truth - Strategic callout */}
        {oneLiner && (
          <div className="relative mt-6 p-5 bg-gradient-to-r from-navy-dark/5 to-transparent rounded-xl border-l-4 border-navy-dark">
            <Quote className="absolute top-4 right-4 w-8 h-8 text-navy-dark/10" />
            <p className={cn(reportTypography.labelUppercase, "mb-2")}>
              Strategic Truth
            </p>
            <p className={cn("text-lg leading-relaxed pr-8 font-serif font-semibold text-report-heading")}>
              {oneLiner}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
