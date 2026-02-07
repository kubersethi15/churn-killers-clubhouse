import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, Clock, User, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography, reportLayout } from "../report/reportStyles";
import { EvidenceChip } from "./EvidenceChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { ActionPlanItem } from "./types";

interface ActionPlanChecklistProps {
  actions: ActionPlanItem[];
}

const ownerColors: Record<string, string> = {
  cs: "bg-blue-100 text-blue-700",
  customer: "bg-amber-100 text-amber-700",
  internal: "bg-violet-100 text-violet-700",
  partner: "bg-cyan-100 text-cyan-700",
  unknown: "bg-slate-100 text-slate-600",
};

export const ActionPlanChecklist = ({ actions }: ActionPlanChecklistProps) => {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  if (actions.length === 0) return null;

  const toggle = (idx: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  return (
    <Card className={reportLayout.card}>
      <div className={reportLayout.cardHeader}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-navy-dark/10">
            <Target className="w-4 h-4 text-navy-dark" />
          </div>
          <div>
            <h3 className={reportTypography.sectionTitle}>14-Day Action Plan</h3>
            <p className={reportTypography.sectionSubtitle}>
              {checked.size}/{actions.length} completed
            </p>
          </div>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="space-y-3">
          {actions
            .sort((a, b) => a.due_in_days - b.due_in_days)
            .map((action, idx) => {
              const done = checked.has(idx);
              return (
                <div
                  key={idx}
                  className={cn(
                    "group rounded-lg border transition-all cursor-pointer",
                    done
                      ? "bg-emerald-50/50 border-emerald-200 opacity-70"
                      : "bg-card border-report-border hover:border-navy-dark/30 hover:shadow-sm",
                  )}
                  onClick={() => toggle(idx)}
                >
                  <div className="p-4 flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      className="shrink-0 mt-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(idx);
                      }}
                    >
                      {done ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-report-muted/40 group-hover:text-navy-dark/40" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          reportTypography.bodyText,
                          "font-medium mb-2",
                          done && "line-through text-report-muted",
                        )}
                      >
                        {action.action}
                      </p>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-sans", ownerColors[action.owner] || ownerColors.unknown)}>
                          <User className="w-2.5 h-2.5" />
                          {action.owner.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-sans bg-slate-100 text-slate-600">
                          <Clock className="w-2.5 h-2.5" />
                          Day {action.due_in_days}
                        </span>
                        <EvidenceChip anchorIds={action.evidence_basis_anchor_ids} />
                        <ConfidenceBadge level={action.confidence} />
                      </div>

                      {/* Expandable details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-sans text-report-muted">
                        <div>
                          <span className="font-semibold text-report-text block mb-0.5">Why</span>
                          {action.why_this_matters}
                        </div>
                        <div>
                          <span className="font-semibold text-report-text block mb-0.5">Expected Response</span>
                          {action.expected_customer_response}
                        </div>
                        <div>
                          <span className="font-semibold text-report-text block mb-0.5">Success Criteria</span>
                          {action.success_criteria}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};
