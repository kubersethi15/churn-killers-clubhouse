import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircleQuestion, ChevronRight, DollarSign, Users, Shield, Rocket } from "lucide-react";
import { parseQuestions } from "./utils";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { reportTypography, reportLayout, sectionIconColors } from "./reportStyles";

interface QuestionsSectionProps {
  content: string;
}

const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes("value") || lower.includes("roi") || lower.includes("financial")) {
    return { icon: DollarSign, color: "bg-emerald-100 text-emerald-600" };
  }
  if (lower.includes("stakeholder") || lower.includes("decision") || lower.includes("process")) {
    return { icon: Users, color: "bg-navy-dark/10 text-navy-dark" };
  }
  if (lower.includes("risk") || lower.includes("blocker")) {
    return { icon: Shield, color: "bg-red-100 text-red-600" };
  }
  if (lower.includes("expansion") || lower.includes("growth")) {
    return { icon: Rocket, color: "bg-emerald-100 text-emerald-600" };
  }
  return { icon: MessageCircleQuestion, color: sectionIconColors.questions };
};

export const QuestionsSection = ({ content }: QuestionsSectionProps) => {
  const categories = parseQuestions(content);
  const categoryEntries = Object.entries(categories).filter(([_, qs]) => qs.length > 0);
  
  if (categoryEntries.length === 0) {
    return (
      <Card className={reportLayout.card}>
        <CardHeader className="pb-4">
          <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
            <div className={cn(reportLayout.iconContainer, sectionIconColors.questions)}>
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
            Next Call High-Leverage Questions
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
      <CardHeader className={cn(reportLayout.cardHeader, "bg-gradient-to-r from-navy-dark/5 to-transparent")}>
        <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
          <div className={cn(reportLayout.iconContainer, sectionIconColors.questions)}>
            <MessageCircleQuestion className="w-5 h-5" />
          </div>
          <div>
            <span>Next Call High-Leverage Questions</span>
            <p className={cn(reportTypography.sectionSubtitle, "mt-0.5")}>
              Strategic questions to uncover insights
            </p>
          </div>
          <Badge variant="secondary" className={cn("ml-auto", reportLayout.badgeCount)}>
            {categoryEntries.reduce((acc, [_, qs]) => acc + qs.length, 0)} Questions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoryEntries.map(([category, questions]) => {
            const { icon: Icon, color } = getCategoryIcon(category);
            
            return (
              <div 
                key={category}
                className="rounded-xl border border-report-border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Category Header */}
                <div className="p-4 border-b border-report-border bg-report-surface/50 flex items-center gap-3">
                  <div className={cn(reportLayout.iconContainerSm, color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-sans font-semibold text-report-heading">{category}</h4>
                  <Badge variant="outline" className={cn("ml-auto", reportLayout.badge)}>
                    {questions.length}
                  </Badge>
                </div>
                
                {/* Questions List */}
                <div className="divide-y divide-report-border">
                  {questions.map((q, idx) => (
                    <div 
                      key={idx}
                      className={cn("p-4 flex items-start gap-3", reportLayout.tableRow)}
                    >
                      <ChevronRight className="w-4 h-4 text-report-muted mt-0.5 flex-shrink-0" />
                      <span className={reportTypography.bodyText}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
