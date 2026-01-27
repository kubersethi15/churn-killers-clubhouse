import { Card, CardContent } from "@/components/ui/card";
import { Zap, Quote } from "lucide-react";
import { MetricBadge } from "./MetricBadge";
import { extractKeyValues, getPostureType, extractOneLinerTruth } from "./utils";

interface SnapshotSectionProps {
  content: string;
}

export const SnapshotSection = ({ content }: SnapshotSectionProps) => {
  const keyValues = extractKeyValues(content);
  const oneLiner = extractOneLinerTruth(content);
  
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-navy-dark via-navy to-navy-light p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-white">Executive Snapshot</h2>
            <p className="text-white/70 text-sm">Key indicators at a glance</p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {keyValues.map((kv, idx) => (
            <MetricBadge
              key={idx}
              label={kv.key}
              value={kv.value}
              posture={getPostureType(kv.value)}
              size="md"
            />
          ))}
        </div>
        
        {/* One-liner Truth */}
        {oneLiner && (
          <div className="relative mt-6 p-5 bg-gradient-to-r from-navy-dark/5 to-transparent rounded-xl border-l-4 border-navy-dark">
            <Quote className="absolute top-4 right-4 w-8 h-8 text-navy-dark/10" />
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2 font-medium">
              Strategic Truth
            </p>
            <p className="text-lg font-serif font-semibold text-navy-dark leading-relaxed pr-8">
              {oneLiner}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
