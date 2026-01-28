import { PostureType } from "./types";
import { cn } from "@/lib/utils";
import { reportColors, reportTypography } from "./reportStyles";

interface MetricBadgeProps {
  label: string;
  value: string;
  posture: PostureType;
  size?: "sm" | "md" | "lg";
}

export const MetricBadge = ({ label, value, posture, size = "md" }: MetricBadgeProps) => {
  const colors = reportColors[posture];
  
  return (
    <div className={cn(
      "rounded-xl border-2 transition-all hover:shadow-md",
      colors.bgAccent,
      colors.border,
      size === "sm" && "p-3",
      size === "md" && "p-4",
      size === "lg" && "p-5"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full", colors.indicator)} />
        <span className={cn(
          reportTypography.metricLabel,
          size === "sm" && "text-[9px]",
          size === "lg" && "text-xs"
        )}>
          {label}
        </span>
      </div>
      <div className={cn(
        reportTypography.metricValue,
        colors.text,
        size === "sm" && "text-sm",
        size === "lg" && "text-lg"
      )}>
        {value}
      </div>
    </div>
  );
};
