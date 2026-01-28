import { AlertTriangle, CheckCircle, AlertCircle, TrendingDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostureType, SeverityLevel } from "./types";
import { reportColors, reportTypography } from "./reportStyles";

interface MetricBadgeProps {
  label: string;
  value: string;
  posture?: PostureType;
  severity?: SeverityLevel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

// Severity configuration with icons and colors
const severityConfig: Record<SeverityLevel, { 
  icon: typeof AlertTriangle; 
  bgColor: string; 
  textColor: string;
  borderColor: string;
  indicatorColor: string;
}> = {
  critical: { 
    icon: AlertTriangle, 
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    indicatorColor: "bg-red-500",
  },
  high: { 
    icon: AlertCircle, 
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    indicatorColor: "bg-orange-500",
  },
  medium: { 
    icon: TrendingDown, 
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    indicatorColor: "bg-amber-500",
  },
  low: { 
    icon: Shield, 
    bgColor: "bg-slate-50",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    indicatorColor: "bg-slate-400",
  },
  none: { 
    icon: CheckCircle, 
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    indicatorColor: "bg-emerald-500",
  },
};

// Posture to severity mapping for visual consistency
const postureToSeverity = (posture: PostureType): SeverityLevel => {
  switch (posture) {
    case "red": return "critical";
    case "amber": return "medium";
    case "green": return "none";
    default: return "low";
  }
};

// Get visual configuration based on key and value
const getVisualConfig = (label: string, value: string, posture?: PostureType, severity?: SeverityLevel) => {
  // Use explicit severity if provided
  if (severity) {
    return severityConfig[severity];
  }
  
  // Use posture if provided
  if (posture) {
    return severityConfig[postureToSeverity(posture)];
  }
  
  // Infer from value for common patterns
  const lowerValue = value.toLowerCase();
  const lowerLabel = label.toLowerCase();
  
  // Revenue Threat patterns
  if (lowerLabel.includes("revenue") || lowerLabel.includes("threat")) {
    if (lowerValue.includes("churn")) return severityConfig.critical;
    if (lowerValue.includes("displacement")) return severityConfig.high;
    if (lowerValue.includes("downsell")) return severityConfig.medium;
    if (lowerValue.includes("none")) return severityConfig.none;
  }
  
  // Account Posture patterns
  if (lowerLabel.includes("posture")) {
    if (lowerValue.includes("red")) return severityConfig.critical;
    if (lowerValue.includes("amber")) return severityConfig.medium;
    if (lowerValue.includes("green")) return severityConfig.none;
  }
  
  // Champion Strength patterns
  if (lowerLabel.includes("champion")) {
    if (lowerValue.includes("weak")) return severityConfig.critical;
    if (lowerValue.includes("fragile")) return severityConfig.high;
    if (lowerValue.includes("moderate")) return severityConfig.medium;
    if (lowerValue.includes("strong")) return severityConfig.none;
  }
  
  // Risk/Complexity patterns
  if (lowerLabel.includes("risk") || lowerLabel.includes("complexity")) {
    if (lowerValue.includes("high") || lowerValue.includes("critical")) return severityConfig.critical;
    if (lowerValue.includes("medium")) return severityConfig.medium;
    if (lowerValue.includes("low")) return severityConfig.none;
  }
  
  // Default patterns
  if (lowerValue.includes("high") || lowerValue.includes("critical") || lowerValue.includes("weak")) {
    return severityConfig.high;
  }
  if (lowerValue.includes("medium") || lowerValue.includes("moderate") || lowerValue.includes("fragile")) {
    return severityConfig.medium;
  }
  if (lowerValue.includes("low") || lowerValue.includes("strong") || lowerValue.includes("green")) {
    return severityConfig.none;
  }
  
  return severityConfig.low;
};

export const MetricBadge = ({ 
  label, 
  value, 
  posture, 
  severity,
  size = "md",
  showIcon = true,
}: MetricBadgeProps) => {
  const config = getVisualConfig(label, value, posture, severity);
  const Icon = config.icon;
  
  // Legacy posture-based colors for backward compatibility
  const legacyColors = posture ? reportColors[posture] : null;
  
  return (
    <div className={cn(
      "rounded-xl border-2 transition-all hover:shadow-md",
      config.bgColor,
      config.borderColor,
      size === "sm" && "p-3",
      size === "md" && "p-4",
      size === "lg" && "p-5"
    )}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", config.indicatorColor)} />
          <span className={cn(
            reportTypography.metricLabel,
            size === "sm" && "text-[9px]",
            size === "lg" && "text-xs"
          )}>
            {label}
          </span>
        </div>
        {showIcon && (
          <Icon className={cn(
            config.textColor,
            size === "sm" && "w-3 h-3",
            size === "md" && "w-4 h-4",
            size === "lg" && "w-5 h-5"
          )} />
        )}
      </div>
      <div className={cn(
        reportTypography.metricValue,
        config.textColor,
        size === "sm" && "text-sm",
        size === "lg" && "text-lg"
      )}>
        {value}
      </div>
    </div>
  );
};
