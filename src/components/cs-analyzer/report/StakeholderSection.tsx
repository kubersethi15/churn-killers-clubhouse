import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Crown, HelpCircle } from "lucide-react";
import { parseStakeholders, getPostureType } from "./utils";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { PostureType } from "./types";

interface StakeholderSectionProps {
  content: string;
}

const postureConfig: Record<PostureType, { icon: typeof Crown; label: string; color: string }> = {
  green: { 
    icon: Crown, 
    label: "Supporter", 
    color: "bg-emerald-100 text-emerald-700 border-emerald-200" 
  },
  amber: { 
    icon: HelpCircle, 
    label: "Neutral", 
    color: "bg-amber-100 text-amber-700 border-amber-200" 
  },
  red: { 
    icon: User, 
    label: "Skeptic", 
    color: "bg-red-100 text-red-700 border-red-200" 
  },
  neutral: { 
    icon: HelpCircle, 
    label: "Unknown", 
    color: "bg-slate-100 text-slate-600 border-slate-200" 
  },
};

export const StakeholderSection = ({ content }: StakeholderSectionProps) => {
  const stakeholders = parseStakeholders(content);
  
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
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stakeholders.map((s, idx) => {
            const posture = getPostureType(s.posture);
            const config = postureConfig[posture];
            const Icon = config.icon;
            
            return (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all hover:shadow-md",
                  posture === "green" && "border-emerald-200 bg-emerald-50/50",
                  posture === "amber" && "border-amber-200 bg-amber-50/50",
                  posture === "red" && "border-red-200 bg-red-50/50",
                  posture === "neutral" && "border-slate-200 bg-slate-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                    posture === "green" && "bg-emerald-200 text-emerald-700",
                    posture === "amber" && "bg-amber-200 text-amber-700",
                    posture === "red" && "bg-red-200 text-red-700",
                    posture === "neutral" && "bg-slate-200 text-slate-600"
                  )}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-navy-dark truncate">{s.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{s.role}</p>
                    <Badge className={cn("mt-2 border text-xs", config.color)}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
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
