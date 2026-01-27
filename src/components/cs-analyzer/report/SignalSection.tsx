import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface SignalSectionProps {
  content: string;
  type: "risk" | "growth";
}

const config = {
  risk: {
    icon: AlertTriangle,
    title: "Risk Signals",
    subtitle: "Potential threats to renewal & expansion",
    gradient: "from-red-500 to-rose-600",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    bulletColor: "text-red-500",
  },
  growth: {
    icon: TrendingUp,
    title: "Expansion & Growth Signals",
    subtitle: "Opportunities for account growth",
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    bulletColor: "text-emerald-500",
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
  
  if (!hasSignals) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className={cn("p-2 rounded-lg", cfg.iconBg)}>
              <Icon className={cn("w-5 h-5", cfg.iconColor)} />
            </div>
            {cfg.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("overflow-hidden border-2", cfg.borderColor)}>
      <CardHeader className={cn("pb-4", cfg.bgLight)}>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className={cn("p-2 rounded-lg", cfg.iconBg)}>
            <Icon className={cn("w-5 h-5", cfg.iconColor)} />
          </div>
          <div>
            <span>{cfg.title}</span>
            <p className="text-sm font-normal text-muted-foreground mt-0.5">{cfg.subtitle}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Observed Signals */}
          {signals.observed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className={cn("w-4 h-4", cfg.iconColor)} />
                <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Observed (Evidence-Based)
                </span>
              </div>
              <div className="space-y-3">
                {signals.observed.map((signal, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg",
                      cfg.bgLight
                    )}
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", 
                      type === "risk" ? "bg-red-500" : "bg-emerald-500"
                    )} />
                    <span className="text-sm leading-relaxed">{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Inferred Signals */}
          {signals.inferred.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Inferred (Strategic Assessment)
                </span>
              </div>
              <div className="space-y-3">
                {signals.inferred.map((signal, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100"
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-amber-500" />
                    <span className="text-sm leading-relaxed">{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
