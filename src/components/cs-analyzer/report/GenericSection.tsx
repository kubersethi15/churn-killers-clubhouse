import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Target,
  Shield,
  FileText,
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
      accent: "border-l-navy"
    };
  }
  if (lower.includes("sentiment") || lower.includes("engagement")) {
    return { 
      icon: MessageSquare, 
      color: "bg-navy-dark/10 text-navy-dark",
      accent: "border-l-navy-light"
    };
  }
  if (lower.includes("value") || lower.includes("outcome")) {
    return { 
      icon: TrendingUp, 
      color: "bg-emerald-100 text-emerald-600",
      accent: "border-l-emerald-500"
    };
  }
  if (lower.includes("renewal") || lower.includes("decision")) {
    return { 
      icon: Target, 
      color: "bg-amber-100 text-amber-600",
      accent: "border-l-amber-500"
    };
  }
  if (lower.includes("effectiveness") || lower.includes("rep")) {
    return { 
      icon: Shield, 
      color: "bg-navy-dark/10 text-navy-dark",
      accent: "border-l-navy-dark"
    };
  }
  
  return { 
    icon: FileText, 
    color: "bg-navy-dark/10 text-navy-dark",
    accent: "border-l-navy"
  };
};

export const GenericSection = ({ title, content }: GenericSectionProps) => {
  const config = getSectionConfig(title);
  const Icon = config.icon;
  
  // Clean up title (remove numbered prefixes like "1)" or "2)")
  const cleanTitle = title.replace(/^\d+\)\s*/, "");
  
  return (
    <Card className={cn(reportLayout.card, "border-l-4", config.accent)}>
      <CardHeader className="pb-4">
        <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
          <div className={cn(reportLayout.iconContainer, config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          {cleanTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:font-semibold prose-headings:text-report-heading">
          <ReactMarkdown
            components={{
              // Style bullet points with better visuals
              ul: ({ children }) => (
                <ul className="space-y-2 list-none pl-0">{children}</ul>
              ),
              li: ({ children }) => (
                <li className={cn("flex items-start gap-3 p-2 rounded-lg", reportLayout.tableRow)}>
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-dark/40 mt-2 flex-shrink-0" />
                  <span className={cn("flex-1", reportTypography.bodyText)}>{children}</span>
                </li>
              ),
              // Make strong text stand out more
              strong: ({ children }) => (
                <strong className="font-sans font-semibold text-report-heading">{children}</strong>
              ),
              // Style paragraphs
              p: ({ children }) => (
                <p className={cn("mb-3", reportTypography.bodyText)}>{children}</p>
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
