import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "./types";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  size?: "sm" | "md";
}

const confidenceConfig: Record<ConfidenceLevel, { dot: string; text: string; label: string }> = {
  high: { dot: "bg-emerald-500", text: "text-emerald-700", label: "High" },
  medium: { dot: "bg-amber-500", text: "text-amber-700", label: "Medium" },
  low: { dot: "bg-red-400", text: "text-red-600", label: "Low" },
};

export const ConfidenceBadge = ({ level, size = "sm" }: ConfidenceBadgeProps) => {
  const config = confidenceConfig[level] || confidenceConfig.low;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-sans",
        size === "sm" && "text-[10px]",
        size === "md" && "text-xs",
        config.text,
      )}
    >
      <span className={cn("rounded-full", config.dot, size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
      {config.label}
    </span>
  );
};
