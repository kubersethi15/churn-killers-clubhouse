import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, AlertCircle, Lightbulb, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { reportTypography, reportLayout, sectionIconColors } from "./reportStyles";

interface SignalSectionProps {
  content: string;
  type: "risk" | "growth";
}

const config = {
  risk: {
    icon: AlertTriangle,
    title: "Risk Signals",
    subtitle: "Potential threats to renewal & expansion",
    iconColors: sectionIconColors.risk,
    borderColor: "border-l-red-500",
    headerBg: "bg-red-50/50",
    observedBg: "bg-red-50/80",
    observedBorder: "border-red-100",
    bulletColor: "bg-red-500",
    badgeColor: "bg-red-100 text-red-700 border-red-200",
  },
  growth: {
    icon: TrendingUp,
    title: "Expansion & Growth Signals",
    subtitle: "Opportunities for account growth",
    iconColors: sectionIconColors.growth,
    borderColor: "border-l-emerald-500",
    headerBg: "bg-emerald-50/50",
    observedBg: "bg-emerald-50/80",
    observedBorder: "border-emerald-100",
    bulletColor: "bg-emerald-500",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

const parseSignals = (content: string): { observed: string[]; inferred: string[] } => {
  const observed: string[] = [];
  const inferred: string[] = [];
  
  const lines = content.split("\n");
  let currentSection: "observed" | "inferred" | null = null;
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("observed")) {
      currentSection = "observed";
    } else if (lower.includes("inferred") || lower.includes("plausible")) {
      currentSection = "inferred";
    } else if (line.match(/^[-•]\s*.+/)) {
      const signal = line.replace(/^[-•]\s*/, "").replace(/\*\*/g, "").trim();
      if (signal && currentSection === "observed") {
        observed.push(signal);
      } else if (signal && currentSection === "inferred") {
        inferred.push(signal);
      } else if (signal) {
        observed.push(signal);
      }
    }
  }
  
  return { observed, inferred };
};

export const SignalSection = ({ content, type }: SignalSectionProps) => {
  const cfg = config[type];
  const Icon = cfg.icon;
  const signals = parseSignals(content);
  
  const hasSignals = signals.observed.length > 0 || signals.inferred.length > 0;
  const totalSignals = signals.observed.length + signals.inferred.length;
  
  if (!hasSignals) {
    return (
      <Card className={cn(reportLayout.card, "border-l-4", cfg.borderColor)}>
        <CardHeader className="pb-3">
          <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
            <div className={cn(reportLayout.iconContainer, cfg.iconColors)}>
              <Icon className="w-5 h-5" />
            </div>
            {cfg.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={cn("prose prose-sm max-w-none", reportTypography.bodyText)}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn(reportLayout.card, "border-l-4", cfg.borderColor, "overflow-hidden")}>
      <CardHeader className={cn("pb-4", cfg.headerBg)}>
        <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
          <div className={cn(reportLayout.iconContainer, cfg.iconColors)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span>{cfg.title}</span>
            <p className={cn(reportTypography.sectionSubtitle, "mt-0.5 font-normal")}>{cfg.subtitle}</p>
          </div>
          <Badge variant="secondary" className={cn("ml-auto", reportLayout.badgeCount)}>
            {totalSignals} Signal{totalSignals !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-6">
        {/* Observed Signals */}
        {signals.observed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className={cn("w-4 h-4", type === "risk" ? "text-red-600" : "text-emerald-600")} />
              <span className={cn(reportTypography.labelUppercase, type === "risk" ? "text-red-700" : "text-emerald-700")}>
                Observed (Evidence-Based)
              </span>
              <Badge variant="outline" className={cn("ml-2 text-[10px] px-1.5 py-0", cfg.badgeColor)}>
                {signals.observed.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {signals.observed.map((signal, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-lg border transition-colors",
                    cfg.observedBg,
                    cfg.observedBorder,
                    "hover:shadow-sm"
                  )}
                >
                  <Quote className={cn("w-4 h-4 mt-0.5 flex-shrink-0 opacity-40", type === "risk" ? "text-red-500" : "text-emerald-500")} />
                  <span className={cn(reportTypography.bodyText, "leading-relaxed")}>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Inferred Signals */}
        {signals.inferred.length > 0 && (
          <div className={signals.observed.length > 0 ? "pt-2" : ""}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className={cn(reportTypography.labelUppercase, "text-amber-700")}>
                Inferred (Strategic Assessment)
              </span>
              <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200">
                {signals.inferred.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {signals.inferred.map((signal, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50/60 border border-amber-100 hover:shadow-sm transition-colors"
                >
                  <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500 opacity-60" />
                  <span className={cn(reportTypography.bodyText, "leading-relaxed")}>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
