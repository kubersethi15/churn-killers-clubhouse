import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Target,
  Shield,
  User,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface GenericSectionProps {
  title: string;
  content: string;
}

const getSectionConfig = (title: string) => {
  const lower = title.toLowerCase();
  
  if (lower.includes("know") || lower.includes("observed")) {
    return { 
      icon: CheckCircle2, 
      color: "bg-blue-100 text-blue-600",
      accent: "border-l-blue-500"
    };
  }
  if (lower.includes("sentiment") || lower.includes("engagement")) {
    return { 
      icon: MessageSquare, 
      color: "bg-purple-100 text-purple-600",
      accent: "border-l-purple-500"
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
      color: "bg-indigo-100 text-indigo-600",
      accent: "border-l-indigo-500"
    };
  }
  
  return { 
    icon: FileText, 
    color: "bg-slate-100 text-slate-600",
    accent: "border-l-slate-500"
  };
};

export const GenericSection = ({ title, content }: GenericSectionProps) => {
  const config = getSectionConfig(title);
  const Icon = config.icon;
  
  // Clean up title (remove numbered prefixes like "1)" or "2)")
  const cleanTitle = title.replace(/^\d+\)\s*/, "");
  
  return (
    <Card className={cn("overflow-hidden border-l-4", config.accent)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className={cn("p-2 rounded-lg", config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          {cleanTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-navy-dark prose-strong:text-navy-dark prose-p:text-muted-foreground prose-li:text-muted-foreground prose-ul:my-2 prose-li:my-0.5">
          <ReactMarkdown
            components={{
              // Style bullet points with better visuals
              ul: ({ children }) => (
                <ul className="space-y-2 list-none pl-0">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-dark/40 mt-2 flex-shrink-0" />
                  <span className="flex-1">{children}</span>
                </li>
              ),
              // Make strong text stand out more
              strong: ({ children }) => (
                <strong className="font-semibold text-navy-dark">{children}</strong>
              ),
              // Style paragraphs
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed">{children}</p>
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
