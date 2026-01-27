import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, Target, CheckCircle2 } from "lucide-react";
import { parseActionItems } from "./utils";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ActionPlanSectionProps {
  content: string;
}

const getTimelineBadge = (when: string) => {
  const lower = when.toLowerCase();
  if (lower.includes("7 day") || lower.includes("week") || lower.includes("immediate") || lower.includes("next meeting")) {
    return { color: "bg-red-100 text-red-700 border-red-200", priority: "Urgent" };
  }
  if (lower.includes("14 day") || lower.includes("2 week")) {
    return { color: "bg-amber-100 text-amber-700 border-amber-200", priority: "High" };
  }
  return { color: "bg-slate-100 text-slate-600 border-slate-200", priority: "Standard" };
};

export const ActionPlanSection = ({ content }: ActionPlanSectionProps) => {
  const actions = parseActionItems(content);
  
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-navy-dark/10 rounded-lg">
              <Target className="w-5 h-5 text-navy-dark" />
            </div>
            14-Day Strategic Action Plan
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 border-b bg-muted/30">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-navy-dark/10 rounded-lg">
            <Target className="w-5 h-5 text-navy-dark" />
          </div>
          14-Day Strategic Action Plan
          <Badge variant="secondary" className="ml-auto font-normal">
            {actions.length} Actions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {actions.map((action, idx) => {
            const timeline = getTimelineBadge(action.when);
            return (
              <div
                key={idx}
                className={cn(
                  "p-5 hover:bg-muted/30 transition-colors",
                  idx === 0 && "bg-red-50/50"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Priority Number */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
                    idx === 0 ? "bg-navy-dark text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </div>
                  
                  {/* Action Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-semibold text-navy-dark leading-tight">
                        {action.action}
                      </h4>
                      <Badge className={cn("flex-shrink-0 border", timeline.color)}>
                        {timeline.priority}
                      </Badge>
                    </div>
                    
                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {action.owner && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{action.owner}</span>
                        </div>
                      )}
                      {action.when && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{action.when}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Reason */}
                    {action.reason && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Why: </span>
                        {action.reason}
                      </div>
                    )}
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
