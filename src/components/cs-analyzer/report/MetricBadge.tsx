import { PostureType } from "./types";
import { cn } from "@/lib/utils";

interface MetricBadgeProps {
  label: string;
  value: string;
  posture: PostureType;
  size?: "sm" | "md" | "lg";
}

const postureStyles: Record<PostureType, { bg: string; text: string; border: string; indicator: string }> = {
  green: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    indicator: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    indicator: "bg-amber-500",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    indicator: "bg-red-500",
  },
  neutral: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    indicator: "bg-slate-400",
  },
};

export const MetricBadge = ({ label, value, posture, size = "md" }: MetricBadgeProps) => {
  const styles = postureStyles[posture];
  
  return (
    <div className={cn(
      "rounded-xl border-2 transition-all hover:shadow-md",
      styles.bg,
      styles.border,
      size === "sm" && "p-3",
      size === "md" && "p-4",
      size === "lg" && "p-5"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-2 h-2 rounded-full", styles.indicator)} />
        <span className={cn(
          "font-medium text-muted-foreground uppercase tracking-wide",
          size === "sm" && "text-[10px]",
          size === "md" && "text-xs",
          size === "lg" && "text-sm"
        )}>
          {label}
        </span>
      </div>
      <div className={cn(
        "font-semibold",
        styles.text,
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg"
      )}>
        {value}
      </div>
    </div>
  );
};
