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
import { Users, Crown, HelpCircle, UserX, AlertCircle, Zap, Quote } from "lucide-react";
import { parseStakeholders, getPostureType } from "./utils";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { PostureType } from "./types";
import { reportTypography, reportLayout, reportColors, sectionIconColors } from "./reportStyles";

interface StakeholderSectionProps {
  content: string;
}

const postureConfig: Record<PostureType, { icon: typeof Crown; label: string; bgColor: string }> = {
  green: { 
    icon: Crown, 
    label: "Champion", 
    bgColor: "bg-emerald-500",
  },
  amber: { 
    icon: HelpCircle, 
    label: "Neutral", 
    bgColor: "bg-amber-500",
  },
  red: { 
    icon: UserX, 
    label: "Skeptic", 
    bgColor: "bg-red-500",
  },
  neutral: { 
    icon: HelpCircle, 
    label: "Unknown", 
    bgColor: "bg-slate-400",
  },
};

const powerConfig: Record<string, { color: string; textColor: string }> = {
  high: { color: "bg-red-100 border-red-200", textColor: "text-red-700" },
  medium: { color: "bg-amber-100 border-amber-200", textColor: "text-amber-700" },
  low: { color: "bg-slate-100 border-slate-200", textColor: "text-slate-600" },
  unknown: { color: "bg-slate-50 border-slate-200", textColor: "text-slate-500" },
};

const getPowerLevel = (power: string): string => {
  const lower = power.toLowerCase();
  if (lower.includes("high")) return "high";
  if (lower.includes("medium") || lower.includes("moderate")) return "medium";
  if (lower.includes("low")) return "low";
  return "unknown";
};

// Extract decision dynamics and missing stakeholders from content
const extractAdditionalInfo = (content: string) => {
  const lines = content.split("\n");
  let decisionDynamics: string[] = [];
  let missingStakeholders: string[] = [];
  let currentSection: "decision" | "missing" | null = null;
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("decision") && (lower.includes("dynamic") || lower.includes("criteria"))) {
      currentSection = "decision";
    } else if (lower.includes("missing") || lower.includes("multi-thread")) {
      currentSection = "missing";
    } else if (line.match(/^[-•]\s*.+/) && currentSection) {
      const item = line.replace(/^[-•]\s*/, "").replace(/\*\*/g, "").trim();
      if (item && currentSection === "decision") {
        decisionDynamics.push(item);
      } else if (item && currentSection === "missing") {
        missingStakeholders.push(item);
      }
    }
  }
  
  return { decisionDynamics, missingStakeholders };
};

export const StakeholderSection = ({ content }: StakeholderSectionProps) => {
  const stakeholders = parseStakeholders(content);
  const { decisionDynamics, missingStakeholders } = extractAdditionalInfo(content);
  
  if (stakeholders.length === 0) {
    return (
      <Card className={reportLayout.card}>
        <CardHeader className="pb-4">
          <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
            <div className={cn(reportLayout.iconContainer, sectionIconColors.stakeholder)}>
              <Users className="w-5 h-5" />
            </div>
            Stakeholders & Power Map
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          <div className={cn(reportLayout.iconContainer, sectionIconColors.stakeholder)}>
            <Users className="w-5 h-5" />
          </div>
          Stakeholders & Power Map
          <Badge variant="secondary" className={cn("ml-auto", reportLayout.badgeCount)}>
            {stakeholders.length} Identified
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Stakeholders Table - Full width with all columns */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={reportLayout.tableHeader}>
                <TableHead className={cn("min-w-[140px]", reportTypography.labelSmall)}>Stakeholder</TableHead>
                <TableHead className={cn("min-w-[160px]", reportTypography.labelSmall)}>Role</TableHead>
                <TableHead className={cn("w-28 text-center", reportTypography.labelSmall)}>Posture</TableHead>
                <TableHead className={cn("w-24 text-center", reportTypography.labelSmall)}>Power</TableHead>
                <TableHead className={cn("min-w-[200px]", reportTypography.labelSmall)}>Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakeholders.map((s, idx) => {
                const posture = getPostureType(s.posture);
                const config = postureConfig[posture];
                const colors = reportColors[posture];
                const Icon = config.icon;
                const powerLevel = getPowerLevel(s.power);
                const powerColors = powerConfig[powerLevel];
                
                return (
                  <TableRow key={idx} className={reportLayout.tableRow}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-sans text-sm font-bold text-white",
                          config.bgColor
                        )}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-sans font-medium text-report-heading">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={reportTypography.bodyMuted}>{s.role}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(reportLayout.badge, colors.badge)}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          reportLayout.badge, 
                          powerColors.color,
                          powerColors.textColor,
                          "border"
                        )}
                      >
                        {powerLevel === "unknown" ? "—" : powerLevel.charAt(0).toUpperCase() + powerLevel.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.evidence ? (
                        <p className={cn(reportTypography.bodyMuted, "text-xs italic line-clamp-2")}>
                          "{s.evidence}"
                        </p>
                      ) : (
                        <span className="text-slate-400 text-xs">No evidence cited</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Additional Info Sections */}
        {(decisionDynamics.length > 0 || missingStakeholders.length > 0) && (
          <div className="border-t border-report-border p-5 grid md:grid-cols-2 gap-6">
            {/* Decision Dynamics */}
            {decisionDynamics.length > 0 && (
              <div>
                <h4 className={cn("mb-3 flex items-center gap-2", reportTypography.labelSmall, "text-report-heading font-semibold")}>
                  <Crown className="w-4 h-4 text-amber-500" />
                  Decision Dynamics
                </h4>
                <ul className="space-y-2">
                  {decisionDynamics.map((item, idx) => (
                    <li key={idx} className={cn("flex items-start gap-2", reportTypography.bodyMuted)}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Missing Stakeholders */}
            {missingStakeholders.length > 0 && (
              <div>
                <h4 className={cn("mb-3 flex items-center gap-2", reportTypography.labelSmall, "text-report-heading font-semibold")}>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Critical Missing (Multi-Thread)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {missingStakeholders.map((item, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className={cn(reportLayout.badge, reportColors.red.badge)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
