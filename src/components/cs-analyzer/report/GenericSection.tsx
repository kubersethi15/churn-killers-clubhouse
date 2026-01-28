import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Target,
  Shield,
  FileText,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
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
      borderColor: "border-l-navy"
    };
  }
  if (lower.includes("sentiment") || lower.includes("engagement")) {
    return { 
      icon: MessageSquare, 
      color: "bg-navy-dark/10 text-navy-dark",
      borderColor: "border-l-navy-light"
    };
  }
  if (lower.includes("value") || lower.includes("outcome")) {
    return { 
      icon: TrendingUp, 
      color: "bg-emerald-100 text-emerald-600",
      borderColor: "border-l-emerald-500"
    };
  }
  if (lower.includes("renewal") || lower.includes("decision")) {
    return { 
      icon: Target, 
      color: "bg-amber-100 text-amber-600",
      borderColor: "border-l-amber-500"
    };
  }
  if (lower.includes("effectiveness") || lower.includes("rep") || lower.includes("coaching")) {
    return { 
      icon: Shield, 
      color: "bg-navy-dark/10 text-navy-dark",
      borderColor: "border-l-navy-dark"
    };
  }
  if (lower.includes("objection") || lower.includes("counter") || lower.includes("narrative")) {
    return { 
      icon: Shield, 
      color: "bg-amber-100 text-amber-600",
      borderColor: "border-l-amber-500"
    };
  }
  
  return { 
    icon: FileText, 
    color: "bg-navy-dark/10 text-navy-dark",
    borderColor: "border-l-navy"
  };
};

export const GenericSection = ({ title, content }: GenericSectionProps) => {
  const config = getSectionConfig(title);
  const Icon = config.icon;
  
  // Clean up title (remove numbered prefixes like "1)" or "2)")
  const cleanTitle = title.replace(/^\d+\)\s*/, "");
  
  return (
    <Card className={cn(reportLayout.card, "border-l-4", config.borderColor)}>
      <CardHeader className="pb-3">
        <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
          <div className={cn(reportLayout.iconContainer, config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          {cleanTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:font-semibold prose-headings:text-report-heading">
          <ReactMarkdown
            components={{
              // Style bullet points with refined visuals
              ul: ({ children }) => (
                <ul className="space-y-1.5 list-none pl-0 my-3">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-3 py-1.5">
                  <ChevronRight className="w-4 h-4 text-navy-dark/40 mt-0.5 flex-shrink-0" />
                  <span className={cn("flex-1 leading-relaxed", reportTypography.bodyText)}>{children}</span>
                </li>
              ),
              // Nested lists
              ol: ({ children }) => (
                <ol className="space-y-1.5 list-none pl-0 my-3">{children}</ol>
              ),
              // Make strong text stand out more
              strong: ({ children }) => (
                <strong className="font-sans font-semibold text-report-heading">{children}</strong>
              ),
              // Style paragraphs with proper spacing
              p: ({ children }) => (
                <p className={cn("mb-3 last:mb-0 leading-relaxed", reportTypography.bodyText)}>{children}</p>
              ),
              // Subsection headings
              h4: ({ children }) => (
                <h4 className={cn("text-sm font-semibold text-report-heading mt-4 mb-2 flex items-center gap-2")}>
                  <span className="w-1 h-4 bg-navy-dark/20 rounded-full" />
                  {children}
                </h4>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};
