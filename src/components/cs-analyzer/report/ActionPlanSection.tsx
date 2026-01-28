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
import { reportTypography, reportLayout, reportColors, sectionIconColors } from "./reportStyles";

interface ActionPlanSectionProps {
  content: string;
}

const getTimelineBadge = (when: string) => {
  const lower = when.toLowerCase();
  if (lower.includes("7 day") || lower.includes("week") || lower.includes("immediate") || lower.includes("next meeting") || lower.includes("asap")) {
    return { color: reportColors.red.badge, label: "Urgent" };
  }
  if (lower.includes("14 day") || lower.includes("2 week")) {
    return { color: reportColors.amber.badge, label: "High" };
  }
  return { color: reportColors.neutral.badge, label: "Standard" };
};

export const ActionPlanSection = ({ content }: ActionPlanSectionProps) => {
  const actions = parseActionItems(content);
  
  if (actions.length === 0) {
    return (
      <Card className={reportLayout.card}>
        <CardHeader className={reportLayout.cardHeader}>
          <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
            <div className={cn(reportLayout.iconContainer, sectionIconColors.action)}>
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span>14-Day Strategic Action Plan</span>
              <p className={cn(reportTypography.sectionSubtitle, "mt-0.5")}>
                Priority actions for the next two weeks
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={reportLayout.cardContent}>
          <div className={cn("prose prose-sm max-w-none", reportTypography.bodyText)}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={reportLayout.card}>
      <CardHeader className={reportLayout.cardHeader}>
        <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
          <div className={cn(reportLayout.iconContainer, sectionIconColors.action)}>
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span>14-Day Strategic Action Plan</span>
            <p className={cn(reportTypography.sectionSubtitle, "mt-0.5")}>
              Priority actions for the next two weeks
            </p>
          </div>
          <Badge variant="secondary" className={cn("ml-auto", reportLayout.badgeCount)}>
            {actions.length} action{actions.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={reportLayout.tableHeader}>
                <TableHead className={cn("w-12 text-center", reportTypography.labelSmall)}>#</TableHead>
                <TableHead className={cn("min-w-[250px]", reportTypography.labelSmall)}>Action</TableHead>
                <TableHead className={cn("w-32", reportTypography.labelSmall)}>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Owner
                  </div>
                </TableHead>
                <TableHead className={cn("w-36", reportTypography.labelSmall)}>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Timeline
                  </div>
                </TableHead>
                <TableHead className={cn("w-24 text-center", reportTypography.labelSmall)}>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action, idx) => {
                const timeline = getTimelineBadge(action.when);
                return (
                  <TableRow 
                    key={idx} 
                    className={cn(
                      reportLayout.tableRow,
                      idx === 0 && "bg-report-surface/50"
                    )}
                  >
                    <TableCell className="text-center">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center font-sans font-bold text-sm mx-auto",
                        idx === 0 ? "bg-navy-dark text-white" : "bg-muted text-report-muted"
                      )}>
                        {idx + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-sans font-medium leading-snug text-report-heading">
                          {action.action}
                        </p>
                        {action.reason && (
                          <p className={cn(reportTypography.bodyMuted, "text-xs")}>
                            <span className="font-medium">Why:</span> {action.reason}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={reportTypography.bodyMuted}>
                        {action.owner || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={reportTypography.bodyMuted}>
                        {action.when || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(reportLayout.badge, timeline.color)}>
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
