import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Analysis } from "@/hooks/useAnalyses";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AdvisorChatProps {
  currentAnalysis: string | null;
  originalContent: string;
  analysisHistory: Analysis[];
  analysisTitle?: string;
  groupName?: string;
}

const SUGGESTED_PROMPTS = [
  "What should I prioritize first?",
  "Help me prepare for the CFO conversation",
  "What's the biggest risk I'm missing?",
  "Give me a 5-minute action plan",
];

export const AdvisorChat = ({ 
  currentAnalysis, 
  originalContent, 
  analysisHistory,
  analysisTitle,
  groupName,
}: AdvisorChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset messages when analysis changes
  useEffect(() => {
    setMessages([]);
  }, [currentAnalysis]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({ 
        role: m.role, 
        content: m.content 
      }));

      const { data, error } = await supabase.functions.invoke("cs-advisor", {
        body: {
          messages: [...conversationHistory, { role: "user", content: text }],
          currentAnalysis,
          originalContent,
          analysisHistory: analysisHistory.map(a => ({
            title: a.title,
            analysis_type: a.analysis_type,
            created_at: a.created_at,
          })),
        },
      });

      if (error) {
        console.error("Advisor function error:", error);
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
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Advisor error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentAnalysis) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-navy-dark text-white shadow-lg hover:bg-navy-dark/90 transition-all duration-200 flex items-center justify-center group hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-10 right-0 bg-navy-dark text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ask CS Advisor
          </span>
        </button>
      )}

      {/* Slide-out Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background border-l shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-navy-dark text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-semibold">CS Advisor</h3>
              <p className="text-xs text-white/70">Enterprise CX strategy guidance</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Context Indicator */}
        {(analysisTitle || groupName) && (
          <div className="px-4 py-2 bg-muted/50 border-b text-xs text-muted-foreground space-y-0.5">
            {groupName && (
              <div>
                <span className="font-medium">Group:</span> {groupName} ({analysisHistory.length} analyses)
              </div>
            )}
            {analysisTitle && (
              <div>
                <span className="font-medium">Analysis:</span> {analysisTitle}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-6">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <h4 className="font-serif font-semibold text-lg mb-2">How can I help?</h4>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                  I have full context of your analysis. Ask me anything about strategy, next steps, or stakeholder handling.
                </p>
              </div>
              
              {/* Suggested Prompts */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Try asking
                </p>
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left px-3 py-2 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-navy-dark text-white"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-headings:text-navy-dark prose-headings:font-serif prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-navy-dark">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
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
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your analysis..."
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-navy-dark hover:bg-navy-dark/90 text-white self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
