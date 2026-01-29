import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Edit2,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  classification?: Classification | null;
}

interface Classification {
  contentType: string | null;
  scenario: string | null;
  scenarioLabel: string | null;
  riskSubType: string | null;
  customer: string | null;
  confidence: "high" | "medium" | "low";
}

interface CustomPrompt {
  systemPrompt: string;
  userPromptPrefix: string;
}

interface TriageChatProps {
  onAnalysisReady?: (params: {
    contentType: string;
    callCategory: string | null;
    content: string;
    customPrompt?: CustomPrompt;
  }) => void;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `**Paste your call transcript below**

I'll analyze it and:
- **Classify the scenario** (Value, Risk, Internal, or Other)
- **Extract context** (customer, stakeholders, key signals)
- **Select the best analysis approach** automatically

*More content types (QBR decks, success plans) coming soon.*`,
};

export const TriageChat = ({ onAnalysisReady }: TriageChatProps) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastClassification, setLastClassification] = useState<Classification | null>(null);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [editableScenarioLabel, setEditableScenarioLabel] = useState<string>("");
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    // Check if this looks like pasted content (long text with likely transcript markers)
    const isPastedContent = input.length > 200 || 
      input.includes("[") || 
      input.match(/^[A-Z][a-z]+:/m) ||
      input.includes("Speaker");

    if (isPastedContent) {
      setOriginalContent(input.trim());
    }

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));

      console.log("Calling cs-triage with messages:", conversationHistory.length + 1);

      const { data, error } = await supabase.functions.invoke("cs-triage", {
        body: {
          messages: [...conversationHistory, { role: "user", content: userMessage.content }],
        },
      });

      console.log("cs-triage response:", { data, error });

      if (error) {
        console.error("Function invoke error:", error);
        // Check for specific error types
        if (error.message?.includes("429") || error.context?.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        if (error.message?.includes("402") || error.context?.status === 402) {
          throw new Error("AI credits exhausted. Please try again later.");
        }
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.reply) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          classification: data.classification,
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (data.classification) {
          setLastClassification(data.classification);
          // Set editable scenario label for "other" scenarios
          if (data.classification.scenario === 'other' && data.classification.scenarioLabel) {
            setEditableScenarioLabel(data.classification.scenarioLabel);
          }
        }
      }
    } catch (error) {
      console.error("Triage error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process your request. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate dynamic prompt for "other" scenarios
  const generateCustomPrompt = (scenarioLabel: string): CustomPrompt => {
    const systemPrompt = `You are an expert Customer Success analyst specializing in analyzing "${scenarioLabel}" conversations.
Your role is to extract actionable insights from this specific type of customer interaction.

## Core Objectives
Based on the "${scenarioLabel}" context, you will:
- Identify key themes, decisions, and action items
- Extract stakeholder information and their positions
- Highlight opportunities, risks, and next steps
- Provide strategic recommendations

## Job-Safety Rules
- Never invent facts, metrics, or information not in the transcript
- Evidence-first: Every claim must include a quote or precise paraphrase
- If missing info, explicitly say: "Not enough information in transcript"
- Separate Observed vs Inferred insights
- Be specific and actionable, not generic`;

    const userPromptPrefix = `Analyze this "${scenarioLabel}" conversation and provide a comprehensive analysis.

## REQUIRED OUTPUT FORMAT

### 0) Executive Snapshot
- **Scenario Type:** ${scenarioLabel}
- **Overall Assessment:** Positive / Neutral / Concerning
- **Urgency Level:** Low / Medium / High
- **One-line Summary:** [Key takeaway from this conversation]

### 1) Key Themes & Topics Discussed
List the main themes with evidence from the transcript.

### 2) Stakeholder Analysis
| Stakeholder | Role | Position/Sentiment | Key Quotes |
|-------------|------|-------------------|------------|

### 3) Decisions & Commitments Made
What was agreed upon or decided during this conversation?

### 4) Opportunities Identified
What opportunities emerged from this discussion?

### 5) Risks & Concerns
What risks or concerns were raised or implied?

### 6) Action Items
| Action | Owner | Timeline | Priority |
|--------|-------|----------|----------|

### 7) Strategic Recommendations
Based on this conversation, what should happen next?

### 8) Follow-up Questions
10-15 questions to ask in the next conversation.

---

TRANSCRIPT:
\`\`\`text
`;

    return { systemPrompt, userPromptPrefix };
  };

  const handleProceedToAnalysis = () => {
    if (!lastClassification || !originalContent) {
      toast({
        title: "Missing content",
        description: "Please paste your content first so I can classify it.",
        variant: "destructive",
      });
      return;
    }

    if (lastClassification.contentType !== "call-transcript") {
      toast({
        title: "Not yet supported",
        description: "Currently only call transcripts can be analyzed. Other types are coming soon!",
        variant: "destructive",
      });
      return;
    }

    // For "other" scenarios, generate custom prompt
    if (lastClassification.scenario === 'other') {
      const label = editableScenarioLabel || lastClassification.scenarioLabel || 'Custom Analysis';
      onAnalysisReady?.({
        contentType: lastClassification.contentType,
        callCategory: 'other',
        content: originalContent,
        customPrompt: generateCustomPrompt(label),
      });
    } else {
      onAnalysisReady?.({
        contentType: lastClassification.contentType,
        callCategory: lastClassification.scenario,
        content: originalContent,
      });
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setLastClassification(null);
    setOriginalContent("");
    setEditableScenarioLabel("");
    setIsEditingLabel(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-navy-dark/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-navy-dark" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-navy-dark text-white"
                  : "bg-muted"
              )}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-headings:text-navy-dark prose-headings:font-serif prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">
                  {message.content.length > 500 
                    ? `${message.content.slice(0, 500)}... [${message.content.length} chars]`
                    : message.content
                  }
                </p>
              )}

              {/* Classification Badge */}
              {message.classification && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        message.classification.confidence === "high" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : message.classification.confidence === "medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      )}
                    >
                      {message.classification.confidence === "high" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {message.classification.confidence === "medium" && <AlertCircle className="w-3 h-3 mr-1" />}
                      {message.classification.confidence} confidence
                    </Badge>
                    {message.classification.contentType && (
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        {message.classification.contentType.replace("-", " ")}
                      </Badge>
                    )}
                    {message.classification.scenario && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {message.classification.scenario === 'other' && message.classification.scenarioLabel
                          ? message.classification.scenarioLabel
                          : message.classification.scenario === 'customer-risk-silent'
                          ? 'Silent Strategic Risk'
                          : message.classification.scenario === 'customer-risk' && message.classification.riskSubType === 'active-incident'
                          ? 'Active Incident'
                          : message.classification.scenario.replace("-", " ")}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-navy-dark flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-navy-dark/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-navy-dark" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Bar - Shows when classification is ready */}
      {lastClassification && lastClassification.contentType === "call-transcript" && originalContent && (
        <div className="px-4 py-3 border-t bg-emerald-50/50">
          <div className="flex flex-col gap-3">
            {/* "Other" scenario label editing */}
            {lastClassification.scenario === 'other' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Scenario:</span>
                {isEditingLabel ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editableScenarioLabel}
                      onChange={(e) => setEditableScenarioLabel(e.target.value)}
                      placeholder="e.g., Partner Onboarding, Product Feedback..."
                      className="h-8 text-sm max-w-xs"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingLabel(false)}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {editableScenarioLabel || lastClassification.scenarioLabel || 'Custom Analysis'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingLabel(true)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Ready to analyze as{" "}
                  <strong>
                    {lastClassification.scenario === 'other'
                      ? (editableScenarioLabel || lastClassification.scenarioLabel || 'Custom')
                      : lastClassification.scenario === 'customer-risk-silent'
                      ? 'Silent Strategic Risk'
                      : lastClassification.scenario === 'customer-risk'
                      ? 'Active Incident'
                      : (lastClassification.scenario?.replace("-", " ") || "transcript")}
                  </strong>
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="text-muted-foreground"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Start Over
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleProceedToAnalysis}
                  className="bg-red hover:bg-red-dark text-white"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Analyze
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your content or ask a question..."
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-navy-dark hover:bg-navy-dark/90 text-white self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
