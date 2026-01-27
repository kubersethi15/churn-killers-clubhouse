import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircleQuestion, ChevronRight, DollarSign, Users, Shield, Rocket } from "lucide-react";
import { parseQuestions } from "./utils";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface QuestionsSectionProps {
  content: string;
}

const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes("value") || lower.includes("roi") || lower.includes("financial")) {
    return { icon: DollarSign, color: "bg-emerald-100 text-emerald-600" };
  }
  if (lower.includes("stakeholder") || lower.includes("decision") || lower.includes("process")) {
    return { icon: Users, color: "bg-purple-100 text-purple-600" };
  }
  if (lower.includes("risk") || lower.includes("blocker")) {
    return { icon: Shield, color: "bg-red-100 text-red-600" };
  }
  if (lower.includes("expansion") || lower.includes("growth")) {
    return { icon: Rocket, color: "bg-blue-100 text-blue-600" };
  }
  return { icon: MessageCircleQuestion, color: "bg-slate-100 text-slate-600" };
};

export const QuestionsSection = ({ content }: QuestionsSectionProps) => {
  const categories = parseQuestions(content);
  const categoryEntries = Object.entries(categories).filter(([_, qs]) => qs.length > 0);
  
  if (categoryEntries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MessageCircleQuestion className="w-5 h-5 text-indigo-600" />
            </div>
            Next Call High-Leverage Questions
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
      <CardHeader className="pb-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <MessageCircleQuestion className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span>Next Call High-Leverage Questions</span>
            <p className="text-sm font-normal text-muted-foreground mt-0.5">
              Strategic questions to uncover insights
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
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
                className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Category Header */}
                <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-navy-dark">{category}</h4>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {questions.length}
                  </Badge>
                </div>
                
                {/* Questions List */}
                <div className="divide-y">
                  {questions.map((q, idx) => (
                    <div 
                      key={idx}
                      className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{q}</span>
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
