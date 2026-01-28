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
import { Users, Crown, HelpCircle, UserX, AlertCircle } from "lucide-react";
import { parseStakeholders, getPostureType } from "./utils";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { PostureType } from "./types";

interface StakeholderSectionProps {
  content: string;
}

const postureConfig: Record<PostureType, { icon: typeof Crown; label: string; bgColor: string; textColor: string; badgeColor: string }> = {
  green: { 
    icon: Crown, 
    label: "Supporter", 
    bgColor: "bg-emerald-500",
    textColor: "text-emerald-700",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200" 
  },
  amber: { 
    icon: HelpCircle, 
    label: "Neutral", 
    bgColor: "bg-amber-500",
    textColor: "text-amber-700",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200" 
  },
  red: { 
    icon: UserX, 
    label: "Skeptic", 
    bgColor: "bg-red-500",
    textColor: "text-red-700",
    badgeColor: "bg-red-100 text-red-700 border-red-200" 
  },
  neutral: { 
    icon: HelpCircle, 
    label: "Unknown", 
    bgColor: "bg-slate-400",
    textColor: "text-slate-600",
    badgeColor: "bg-slate-100 text-slate-600 border-slate-200" 
  },
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
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            Stakeholders & Power Map
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
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          Stakeholders & Power Map
          <Badge variant="secondary" className="ml-auto font-normal">
            {stakeholders.length} Identified
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Stakeholders Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold min-w-[150px]">Name</TableHead>
                <TableHead className="font-semibold min-w-[200px]">Role</TableHead>
                <TableHead className="font-semibold w-32 text-center">Posture</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakeholders.map((s, idx) => {
                const posture = getPostureType(s.posture);
                const config = postureConfig[posture];
                const Icon = config.icon;
                
                return (
                  <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                          config.bgColor
                        )}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-navy-dark">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{s.role}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("border text-xs", config.badgeColor)}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Additional Info Sections */}
        {(decisionDynamics.length > 0 || missingStakeholders.length > 0) && (
          <div className="border-t p-5 grid md:grid-cols-2 gap-6">
            {/* Decision Dynamics */}
            {decisionDynamics.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-navy-dark mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Decision Dynamics
                </h4>
                <ul className="space-y-2">
                  {decisionDynamics.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
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
                <h4 className="text-sm font-semibold text-navy-dark mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Critical Missing (Multi-Thread)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {missingStakeholders.map((item, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="border-red-200 bg-red-50 text-red-700"
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
