import { useMemo } from "react";
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
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Target,
  Calendar,
  HelpCircle,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AnalysisReportProps {
  analysisResult: string;
}

interface ParsedSection {
  title: string;
  content: string;
  level: number;
}

// Parse the markdown into sections by headers
const parseIntoSections = (markdown: string): ParsedSection[] => {
  const lines = markdown.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    const h3Match = line.match(/^### (.+)/);
    const h2Match = line.match(/^## (.+)/);
    
    if (h3Match || h2Match) {
      // Save previous section
      if (currentSection) {
        currentSection.content = contentLines.join("\n").trim();
        sections.push(currentSection);
      }
      
      currentSection = {
        title: (h3Match?.[1] || h2Match?.[1] || "").trim(),
        content: "",
        level: h3Match ? 3 : 2,
      };
      contentLines = [];
    } else if (currentSection) {
      contentLines.push(line);
    }
  }
  
  // Save last section
  if (currentSection) {
    currentSection.content = contentLines.join("\n").trim();
    sections.push(currentSection);
  }
  
  return sections;
};

// Extract key-value pairs from content like "**Key:** Value"
const extractKeyValues = (content: string): { key: string; value: string }[] => {
  const pairs: { key: string; value: string }[] = [];
  const regex = /\*\*([^*]+):\*\*\s*([^\n]+)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    pairs.push({ key: match[1].trim(), value: match[2].trim() });
  }
  
  return pairs;
};

// Get posture color
const getPostureColor = (posture: string): string => {
  const lower = posture.toLowerCase();
  if (lower.includes("green") || lower.includes("strong") || lower.includes("high") || lower.includes("positive")) {
    return "bg-green-100 text-green-800 border-green-200";
  }
  if (lower.includes("red") || lower.includes("weak") || lower.includes("critical") || lower.includes("negative")) {
    return "bg-red-100 text-red-800 border-red-200";
  }
  if (lower.includes("amber") || lower.includes("medium") || lower.includes("moderate") || lower.includes("mixed")) {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  return "bg-gray-100 text-gray-800 border-gray-200";
};

// Get icon for section
const getSectionIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("snapshot")) return <Sparkles className="w-5 h-5" />;
  if (lower.includes("know") || lower.includes("observed")) return <CheckCircle className="w-5 h-5" />;
  if (lower.includes("sentiment")) return <Users className="w-5 h-5" />;
  if (lower.includes("value") || lower.includes("outcome")) return <TrendingUp className="w-5 h-5" />;
  if (lower.includes("risk")) return <AlertTriangle className="w-5 h-5" />;
  if (lower.includes("expansion") || lower.includes("growth")) return <TrendingUp className="w-5 h-5" />;
  if (lower.includes("stakeholder") || lower.includes("power")) return <Users className="w-5 h-5" />;
  if (lower.includes("renewal") || lower.includes("decision")) return <Target className="w-5 h-5" />;
  if (lower.includes("action") || lower.includes("step") || lower.includes("plan")) return <Calendar className="w-5 h-5" />;
  if (lower.includes("question")) return <HelpCircle className="w-5 h-5" />;
  if (lower.includes("effectiveness") || lower.includes("rep")) return <Shield className="w-5 h-5" />;
  return <ArrowRight className="w-5 h-5" />;
};

// Snapshot Card Component
const SnapshotCard = ({ content }: { content: string }) => {
  const keyValues = extractKeyValues(content);
  
  return (
    <Card className="border-2 border-navy-dark/20 bg-gradient-to-br from-navy-dark/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-serif">
          <Sparkles className="w-5 h-5 text-red" />
          Executive Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {keyValues.map((kv, idx) => (
            <div key={idx} className="text-center p-3 rounded-lg bg-background border">
              <div className="text-xs text-muted-foreground mb-1 font-medium">{kv.key}</div>
              <Badge className={`${getPostureColor(kv.value)} border`}>
                {kv.value}
              </Badge>
            </div>
          ))}
        </div>
        {/* One-line truth */}
        {content.includes("One-line truth") && (
          <div className="mt-4 p-3 bg-red/5 border border-red/20 rounded-lg">
            <p className="text-sm font-medium text-navy-dark">
              {content.match(/One-line truth[:\s]*(.+)/i)?.[1] || ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Action Plan Table Component
const ActionPlanTable = ({ content }: { content: string }) => {
  // Parse action items from content
  const actions: { action: string; owner: string; when: string; reason: string }[] = [];
  
  // Try to extract numbered items
  const lines = content.split("\n").filter(l => l.trim());
  let currentAction: any = null;
  
  for (const line of lines) {
    const numberedMatch = line.match(/^\d+\.\s*\*\*(.+?)\*\*/);
    const bulletMatch = line.match(/^[-•]\s*\*\*(.+?)\*\*/);
    const actionMatch = line.match(/^\d+\.\s*(.+)/);
    
    if (numberedMatch || bulletMatch || actionMatch) {
      if (currentAction) actions.push(currentAction);
      currentAction = {
        action: numberedMatch?.[1] || bulletMatch?.[1] || actionMatch?.[1] || "",
        owner: "",
        when: "",
        reason: "",
      };
    }
    
    if (currentAction) {
      const ownerMatch = line.match(/Owner[:\s]*([^\n,]+)/i);
      const whenMatch = line.match(/When[:\s]*([^\n,]+)/i);
      const reasonMatch = line.match(/Reason[:\s]*([^\n]+)/i);
      
      if (ownerMatch) currentAction.owner = ownerMatch[1].trim();
      if (whenMatch) currentAction.when = whenMatch[1].trim();
      if (reasonMatch) currentAction.reason = reasonMatch[1].trim();
    }
  }
  
  if (currentAction) actions.push(currentAction);
  
  if (actions.length === 0) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="w-24">Owner</TableHead>
            <TableHead className="w-28">Timeline</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{idx + 1}</TableCell>
              <TableCell className="font-medium">{action.action}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {action.owner || "—"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {action.when || "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {action.reason || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Stakeholder Table Component
const StakeholderTable = ({ content }: { content: string }) => {
  const stakeholders: { name: string; role: string; posture: string }[] = [];
  
  // Parse stakeholder lines
  const lines = content.split("\n");
  for (const line of lines) {
    // Look for patterns like "Name, role, posture" or "**Name:** role, posture"
    const match = line.match(/[-•]\s*\*\*([^*]+)\*\*[:\s]*([^,]+),?\s*(supporter|neutral|skeptic|unknown)?/i);
    if (match) {
      stakeholders.push({
        name: match[1].trim(),
        role: match[2].trim(),
        posture: match[3] || "unknown",
      });
    }
  }
  
  if (stakeholders.length === 0) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stakeholder</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Posture</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stakeholders.map((s, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>{s.role}</TableCell>
              <TableCell>
                <Badge className={getPostureColor(s.posture)}>
                  {s.posture}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Risk/Signal Card
const RiskSignalCard = ({ content, type }: { content: string; type: "risk" | "growth" }) => {
  const isRisk = type === "risk";
  const bgColor = isRisk ? "bg-red-50" : "bg-green-50";
  const borderColor = isRisk ? "border-red-200" : "border-green-200";
  const iconColor = isRisk ? "text-red-600" : "text-green-600";
  
  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        {isRisk ? (
          <AlertTriangle className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
        ) : (
          <TrendingUp className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
        )}
        <div className="prose prose-sm max-w-none flex-1">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

// Questions Grid Component
const QuestionsGrid = ({ content }: { content: string }) => {
  // Group questions by category
  const categories: { [key: string]: string[] } = {};
  let currentCategory = "General";
  
  const lines = content.split("\n");
  for (const line of lines) {
    const categoryMatch = line.match(/^[-•]?\s*\*\*([^*]+)\*\*/);
    const questionMatch = line.match(/^[-•]\s*(.+\?)/);
    
    if (categoryMatch && !line.includes("?")) {
      currentCategory = categoryMatch[1].trim();
      if (!categories[currentCategory]) categories[currentCategory] = [];
    } else if (questionMatch) {
      if (!categories[currentCategory]) categories[currentCategory] = [];
      categories[currentCategory].push(questionMatch[1].trim());
    }
  }
  
  const categoryEntries = Object.entries(categories).filter(([_, qs]) => qs.length > 0);
  
  if (categoryEntries.length === 0) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categoryEntries.map(([category, questions]) => (
        <div key={category} className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-navy-dark mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-red" />
            {category}
          </h4>
          <ul className="space-y-2">
            {questions.map((q, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-red mt-1">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Generic Section Card
const SectionCard = ({ section }: { section: ParsedSection }) => {
  const title = section.title;
  const content = section.content;
  const lowerTitle = title.toLowerCase();
  
  // Special rendering for specific sections
  if (lowerTitle.includes("snapshot")) {
    return <SnapshotCard content={content} />;
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-serif">
          <span className="text-red">{getSectionIcon(title)}</span>
          {title.replace(/^\d+\)\s*/, "")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowerTitle.includes("action") || lowerTitle.includes("plan") ? (
          <ActionPlanTable content={content} />
        ) : lowerTitle.includes("stakeholder") || lowerTitle.includes("power map") ? (
          <StakeholderTable content={content} />
        ) : lowerTitle.includes("risk") ? (
          <RiskSignalCard content={content} type="risk" />
        ) : lowerTitle.includes("expansion") || lowerTitle.includes("growth") ? (
          <RiskSignalCard content={content} type="growth" />
        ) : lowerTitle.includes("question") ? (
          <QuestionsGrid content={content} />
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-navy-dark prose-strong:text-navy-dark prose-li:marker:text-red">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AnalysisReport = ({ analysisResult }: AnalysisReportProps) => {
  const sections = useMemo(() => parseIntoSections(analysisResult), [analysisResult]);
  
  if (sections.length === 0) {
    // Fallback to raw markdown if parsing fails
    return (
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:text-navy-dark prose-strong:text-navy-dark prose-li:marker:text-red">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {sections.map((section, idx) => (
        <SectionCard key={idx} section={section} />
      ))}
    </div>
  );
};

export default AnalysisReport;
