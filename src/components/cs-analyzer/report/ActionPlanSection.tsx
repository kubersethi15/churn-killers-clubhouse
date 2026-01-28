import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Target, User, Clock } from "lucide-react";
import { parseActionItems } from "./utils";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ActionPlanSectionProps {
  content: string;
}

const getTimelineBadge = (when: string) => {
  const lower = when.toLowerCase();
  if (lower.includes("7 day") || lower.includes("week") || lower.includes("immediate") || lower.includes("next meeting") || lower.includes("asap")) {
    return { color: "bg-red-100 text-red-700 border-red-200", label: "Urgent" };
  }
  if (lower.includes("14 day") || lower.includes("2 week")) {
    return { color: "bg-amber-100 text-amber-700 border-amber-200", label: "High" };
  }
  return { color: "bg-slate-100 text-slate-600 border-slate-200", label: "Standard" };
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12 text-center font-semibold">#</TableHead>
                <TableHead className="font-semibold min-w-[250px]">Action</TableHead>
                <TableHead className="font-semibold w-32">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Owner
                  </div>
                </TableHead>
                <TableHead className="font-semibold w-36">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Timeline
                  </div>
                </TableHead>
                <TableHead className="font-semibold w-24 text-center">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action, idx) => {
                const timeline = getTimelineBadge(action.when);
                return (
                  <TableRow 
                    key={idx} 
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      idx === 0 && "bg-red-50/50"
                    )}
                  >
                    <TableCell className="text-center">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm mx-auto",
                        idx === 0 ? "bg-navy-dark text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {idx + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-navy-dark leading-snug">
                          {action.action}
                        </p>
                        {action.reason && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-medium">Why:</span> {action.reason}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {action.owner || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {action.when || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("border text-xs", timeline.color)}>
                        {timeline.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
