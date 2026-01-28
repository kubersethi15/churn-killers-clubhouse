import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircleQuestion, DollarSign, Users, Shield, Rocket, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography, reportLayout, sectionIconColors } from "./reportStyles";

interface QuestionsSectionProps {
  content: string;
}

const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes("value") || lower.includes("roi") || lower.includes("financial") || lower.includes("proof")) {
    return { icon: DollarSign, color: "bg-emerald-100 text-emerald-600" };
  }
  if (lower.includes("stakeholder") || lower.includes("decision") || lower.includes("process")) {
    return { icon: Users, color: "bg-navy-dark/10 text-navy-dark" };
  }
  if (lower.includes("risk") || lower.includes("blocker") || lower.includes("political")) {
    return { icon: Shield, color: "bg-red-100 text-red-600" };
  }
  if (lower.includes("expansion") || lower.includes("growth")) {
    return { icon: Rocket, color: "bg-emerald-100 text-emerald-600" };
  }
  if (lower.includes("procurement") || lower.includes("timeline")) {
    return { icon: Clock, color: "bg-amber-100 text-amber-600" };
  }
  return { icon: MessageCircleQuestion, color: sectionIconColors.questions };
};

// Enhanced parser that handles various markdown formats
const parseQuestionsFromContent = (content: string): { [key: string]: string[] } => {
  const categories: { [key: string]: string[] } = {};
  let currentCategory = "General";
  
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Match category headers: **Category Name** or bold text without question mark
    const categoryMatch = trimmedLine.match(/^\*\*([^*?]+)\*\*\s*$/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      if (!categories[currentCategory]) categories[currentCategory] = [];
      continue;
    }
    
    // Match questions - lines that end with ? (with or without bullet)
    const questionMatch = trimmedLine.match(/^[-•]?\s*(.+\?)$/);
    if (questionMatch) {
      if (!categories[currentCategory]) categories[currentCategory] = [];
      categories[currentCategory].push(questionMatch[1].trim());
    }
  }
  
  return categories;
};

export const QuestionsSection = ({ content }: QuestionsSectionProps) => {
  const categories = parseQuestionsFromContent(content);
  const categoryEntries = Object.entries(categories).filter(([_, qs]) => qs.length > 0);
  const totalQuestions = categoryEntries.reduce((acc, [_, qs]) => acc + qs.length, 0);
  
  // Fallback: if no structured categories found, render content with basic styling
  if (categoryEntries.length === 0 || totalQuestions === 0) {
    // Try to extract all questions directly
    const allQuestions = content.split("\n")
      .filter(line => line.trim().endsWith("?"))
      .map(line => line.replace(/^[-•*]\s*/, "").trim());
    
    if (allQuestions.length > 0) {
      return (
        <Card className={reportLayout.card}>
          <CardHeader className={reportLayout.cardHeader}>
            <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
              <div className={cn(reportLayout.iconContainer, sectionIconColors.questions)}>
                <MessageCircleQuestion className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span>Next Call High-Leverage Questions</span>
                <p className={cn(reportTypography.sectionSubtitle, "mt-0.5")}>
                  Strategic questions to uncover insights
                </p>
              </div>
              <Badge variant="secondary" className={cn("ml-auto", reportLayout.badgeCount)}>
                {allQuestions.length} question{allQuestions.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className={reportLayout.cardContent}>
            <div className="space-y-2">
              {allQuestions.map((q, idx) => (
                <div key={idx} className={reportLayout.listItemCard}>
                  <span className={cn(reportLayout.bullet, reportLayout.bulletNavy)} />
                  <span className={cn(reportTypography.bodyText, "leading-relaxed")}>{q}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Ultimate fallback: render raw content
    return (
      <Card className={reportLayout.card}>
        <CardHeader className={reportLayout.cardHeader}>
          <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
            <div className={cn(reportLayout.iconContainer, sectionIconColors.questions)}>
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span>Next Call High-Leverage Questions</span>
              <p className={cn(reportTypography.sectionSubtitle, "mt-0.5")}>
                Strategic questions to uncover insights
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={reportLayout.cardContent}>
          <div className={cn("prose prose-sm max-w-none whitespace-pre-line", reportTypography.bodyText)}>
            {content}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={reportLayout.card}>
      <CardHeader className={reportLayout.cardHeader}>
        <CardTitle className={cn("flex items-center gap-3", reportTypography.sectionTitle)}>
          <div className={cn(reportLayout.iconContainer, sectionIconColors.questions)}>
            <MessageCircleQuestion className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span>Next Call High-Leverage Questions</span>
            <p className={cn(reportTypography.sectionSubtitle, "mt-0.5")}>
              Strategic questions to uncover insights
            </p>
          </div>
          <Badge variant="secondary" className={cn("ml-auto", reportLayout.badgeCount)}>
            {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={reportLayout.cardContent}>
        <div className="space-y-5">
          {categoryEntries.map(([category, questions]) => {
            const { icon: Icon, color } = getCategoryIcon(category);
            
            return (
              <div key={category} className="space-y-2">
                {/* Category Header */}
                <div className="flex items-center gap-2">
                  <div className={cn(reportLayout.iconContainerSm, color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-sans font-semibold text-sm text-report-heading">{category}</h4>
                  <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                    {questions.length}
                  </Badge>
                </div>
                
                {/* Questions List */}
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div key={idx} className={reportLayout.listItemCard}>
                      <span className={cn(reportLayout.bullet, reportLayout.bulletNavy)} />
                      <span className={cn(reportTypography.bodyText, "leading-relaxed")}>{q}</span>
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
