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
} from "lucide-react";
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
  customer: string | null;
  confidence: "high" | "medium" | "low";
}

interface TriageChatProps {
  onAnalysisReady?: (params: {
    contentType: string;
    callCategory: string | null;
    content: string;
  }) => void;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `**Welcome to CS Analyzer** 👋

I can help you analyze your customer success content. Just paste your content below and I'll:

1. **Detect the type** (call transcript, QBR, success plan, health data)
2. **Classify the scenario** (for transcripts: Value, Risk, or Internal)
3. **Extract context** (customer, stakeholders, key signals)

**Paste your content to get started**, or ask me a question about what I can analyze.

*Currently, only Call Transcripts are fully supported. Other types are coming soon!*`,
};

export const TriageChat = ({ onAnalysisReady }: TriageChatProps) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastClassification, setLastClassification] = useState<Classification | null>(null);
  const [originalContent, setOriginalContent] = useState<string>("");
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

    onAnalysisReady?.({
      contentType: lastClassification.contentType,
      callCategory: lastClassification.scenario,
      content: originalContent,
    });
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setLastClassification(null);
    setOriginalContent("");
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
                        {message.classification.scenario.replace("-", " ")}
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
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle className="w-4 h-4" />
              <span>Ready to analyze as <strong>{lastClassification.scenario?.replace("-", " ") || "transcript"}</strong></span>
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
