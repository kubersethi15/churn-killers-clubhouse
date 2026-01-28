import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Target,
  Shield,
  FileText,
  Award,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography, reportLayout } from "./reportStyles";

interface GenericSectionProps {
  title: string;
  content: string;
}

const getSectionConfig = (title: string) => {
  const lower = title.toLowerCase();
  
  if (lower.includes("know") || lower.includes("observed")) {
    return { 
      icon: CheckCircle2, 
      color: "bg-navy-dark/10 text-navy-dark",
      subtitle: "Evidence-based facts from the conversation"
    };
  }
  if (lower.includes("sentiment") || lower.includes("engagement")) {
    return { 
      icon: MessageSquare, 
      color: "bg-navy-dark/10 text-navy-dark",
      subtitle: "Customer sentiment and engagement signals"
    };
  }
  if (lower.includes("value") || lower.includes("outcome")) {
    return { 
      icon: TrendingUp, 
      color: "bg-emerald-100 text-emerald-600",
      subtitle: "Value delivered and outcomes achieved"
    };
  }
  if (lower.includes("renewal") || lower.includes("decision") || lower.includes("readiness")) {
    return { 
      icon: Target, 
      color: "bg-amber-100 text-amber-600",
      subtitle: "Deal cycle and renewal readiness"
    };
  }
  if (lower.includes("effectiveness") || lower.includes("rep") || lower.includes("coaching")) {
    return { 
      icon: Award, 
      color: "bg-navy-dark/10 text-navy-dark",
      subtitle: "CS rep performance coaching"
    };
  }
  if (lower.includes("objection") || lower.includes("counter") || lower.includes("narrative")) {
    return { 
      icon: Shield, 
      color: "bg-amber-100 text-amber-600",
      subtitle: "Counter-narratives for objections"
    };
  }
  
  return { 
    icon: FileText, 
    color: "bg-navy-dark/10 text-navy-dark",
    subtitle: null
  };
};

// Parse subsections from content (e.g., "**What Worked**" followed by bullets)
const parseSubsections = (content: string): { title: string; items: string[] }[] => {
  const subsections: { title: string; items: string[] }[] = [];
  let currentSubsection: { title: string; items: string[] } | null = null;
  
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Match subsection headers: **Subsection Title**
    const subsectionMatch = trimmedLine.match(/^\*\*([^*]+)\*\*\s*$/);
    if (subsectionMatch) {
      if (currentSubsection && currentSubsection.items.length > 0) {
        subsections.push(currentSubsection);
      }
      currentSubsection = { title: subsectionMatch[1].trim(), items: [] };
      continue;
    }
    
    // Match bullet items
    const bulletMatch = trimmedLine.match(/^[-•]\s*(.+)$/);
    if (bulletMatch && currentSubsection) {
      currentSubsection.items.push(bulletMatch[1].trim());
    }
  }
  
  if (currentSubsection && currentSubsection.items.length > 0) {
    subsections.push(currentSubsection);
  }
  
  return subsections;
};

// Get icon for subsection based on title
const getSubsectionConfig = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("worked") || lower.includes("positive") || lower.includes("strength")) {
    return { icon: CheckCircle2, color: "text-emerald-600", bullet: "bg-emerald-500" };
  }
  if (lower.includes("differently") || lower.includes("improve") || lower.includes("top 1%")) {
    return { icon: Lightbulb, color: "text-amber-600", bullet: "bg-amber-500" };
  }
  if (lower.includes("missed") || lower.includes("gap") || lower.includes("weak")) {
    return { icon: AlertCircle, color: "text-red-600", bullet: "bg-red-500" };
  }
  return { icon: FileText, color: "text-navy-dark/50", bullet: "bg-navy-dark/40" };
};

export const GenericSection = ({ title, content }: GenericSectionProps) => {
  const config = getSectionConfig(title);
  const Icon = config.icon;
  
  // Clean up title (remove numbered prefixes like "1)" or "2)")
  const cleanTitle = title.replace(/^\d+\)\s*/, "");
  
  // Check if content has structured subsections
  const subsections = parseSubsections(content);
  const hasStructuredContent = subsections.length > 0;
  
  return (
    <Card className={reportLayout.card}>
      <CardHeader className={reportLayout.cardHeader}>
        <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
          <div className={cn(reportLayout.iconContainer, config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span>{cleanTitle}</span>
            {config.subtitle && (
              <p className={cn(reportTypography.sectionSubtitle, "mt-0.5")}>{config.subtitle}</p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={reportLayout.cardContent}>
        {hasStructuredContent ? (
          <div className="space-y-5">
            {subsections.map((subsection, idx) => {
              const subConfig = getSubsectionConfig(subsection.title);
              const SubIcon = subConfig.icon;
              
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <SubIcon className={cn("w-4 h-4", subConfig.color)} />
                    <h4 className="font-sans font-semibold text-sm text-report-heading">
                      {subsection.title}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {subsection.items.map((item, itemIdx) => (
                      <div key={itemIdx} className={reportLayout.listItemCard}>
                        <span className={cn(reportLayout.bullet, subConfig.bullet)} />
                        <span className={cn("leading-relaxed", reportTypography.bodyText)}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {content.split("\n").filter(line => line.trim()).map((line, idx) => {
              const trimmedLine = line.trim();
              
              // Check if it's a bullet point
              const bulletMatch = trimmedLine.match(/^[-•]\s*(.+)$/);
              if (bulletMatch) {
                return (
                  <div key={idx} className={reportLayout.listItem}>
                    <span className={cn(reportLayout.bullet, reportLayout.bulletNavy)} />
                    <span className={cn("leading-relaxed", reportTypography.bodyText)}>
                      {bulletMatch[1]}
                    </span>
                  </div>
                );
              }
              
              // Check if it's a bold label: **Label:** value
              const labelMatch = trimmedLine.match(/^\*\*([^*]+):\*\*\s*(.*)$/);
              if (labelMatch) {
                return (
                  <div key={idx} className="py-1.5">
                    <span className="font-sans font-semibold text-sm text-report-heading">
                      {labelMatch[1]}:
                    </span>
                    {labelMatch[2] && (
                      <span className={cn("ml-1", reportTypography.bodyText)}>
                        {labelMatch[2]}
                      </span>
                    )}
                  </div>
                );
              }
              
              // Regular paragraph
              return (
                <p key={idx} className={cn("py-1", reportTypography.bodyText)}>
                  {trimmedLine.replace(/\*\*/g, "")}
                </p>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
