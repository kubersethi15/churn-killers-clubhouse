import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisReport } from "@/components/cs-analyzer/AnalysisReport";
import { TriageChat } from "@/components/cs-analyzer/TriageChat";
import { AnalysisSidebar } from "@/components/analyzer/AnalysisSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalyses, Analysis } from "@/hooks/useAnalyses";
import { 
  FileText, 
  Presentation, 
  Target, 
  MessageSquare, 
  Upload, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  FileText as FileTextIcon,
  BarChart3,
  CheckCircle,
  RotateCcw,
  Copy,
  Save,
  LogOut,
  User,
  ChevronDown,
  Download,
  FileDown,
  FileType,
  PanelLeft,
  Bot,
  Settings2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AnalysisType = "call-transcript" | "qbr-deck" | "success-plan" | "health-assessment" | null;
type CallCategory = "customer-value" | "customer-risk" | "internal-strategy" | null;

interface CallCategoryOption {
  id: CallCategory;
  title: string;
  description: string;
  examples: string[];
}

const callCategoryOptions: CallCategoryOption[] = [
  {
    id: "customer-value",
    title: "Customer Value",
    description: "Renewal, QBR, expansion, and value realization conversations",
    examples: ["Renewal discussions", "Quarterly Business Reviews", "Upsell/cross-sell calls", "Value proof meetings"]
  },
  {
    id: "customer-risk",
    title: "Customer Risk",
    description: "Escalations, incidents, churn signals, and at-risk conversations",
    examples: ["Escalation calls", "Incident debriefs", "At-risk account discussions", "Churn prevention calls"]
  },
  {
    id: "internal-strategy",
    title: "Internal Strategy",
    description: "CS team syncs, leadership discussions, and coaching sessions",
    examples: ["Team strategy meetings", "1:1 coaching sessions", "Pipeline reviews", "Playbook development"]
  }
];

interface AnalysisOption {
  id: AnalysisType;
  title: string;
  description: string;
  icon: React.ReactNode;
  placeholder: string;
  acceptedFormats: string;
  examples: string[];
}

const analysisOptions: AnalysisOption[] = [
  {
    id: "call-transcript",
    title: "Call Transcripts",
    description: "Analyze internal CS/revenue calls or external customer conversations",
    icon: <MessageSquare className="w-8 h-8" />,
    placeholder: "Paste your call transcript here...\n\nExample:\n[00:00] CSM: Hi Sarah, thanks for joining today's check-in...\n[00:15] Customer: Thanks for setting this up...",
    acceptedFormats: ".txt, .docx, .pdf",
    examples: [
      "Customer check-in calls",
      "Internal CS team syncs",
      "Revenue/expansion discussions",
      "Onboarding calls"
    ]
  },
  {
    id: "qbr-deck",
    title: "QBR Decks",
    description: "Get insights on your Quarterly Business Review presentations",
    icon: <Presentation className="w-8 h-8" />,
    placeholder: "Paste your QBR content or key slides here...\n\nInclude sections like:\n- Executive Summary\n- Value Delivered\n- Adoption Metrics\n- Roadmap & Next Steps",
    acceptedFormats: ".pptx, .pdf, .txt",
    examples: [
      "Quarterly Business Reviews",
      "Executive Business Reviews",
      "Value realization decks",
      "Renewal presentations"
    ]
  },
  {
    id: "success-plan",
    title: "Success Plans",
    description: "Evaluate and improve your customer success plans",
    icon: <Target className="w-8 h-8" />,
    placeholder: "Paste your success plan here...\n\nInclude:\n- Customer goals & objectives\n- Success criteria\n- Milestones & timeline\n- Stakeholders",
    acceptedFormats: ".docx, .pdf, .txt",
    examples: [
      "Onboarding success plans",
      "Adoption roadmaps",
      "Renewal success plans",
      "Expansion playbooks"
    ]
  },
  {
    id: "health-assessment",
    title: "Health Assessment",
    description: "Analyze customer health indicators and risk factors",
    icon: <FileText className="w-8 h-8" />,
    placeholder: "Describe your customer's current state...\n\nInclude:\n- Usage patterns\n- Engagement levels\n- Support ticket trends\n- Stakeholder changes",
    acceptedFormats: ".csv, .xlsx, .txt",
    examples: [
      "Account health snapshots",
      "Risk assessment data",
      "Usage analytics exports",
      "NPS/CSAT feedback"
    ]
  }
];

const CSAnalyzer = () => {
  const [selectedType, setSelectedType] = useState<AnalysisType>(null);
  const [selectedCallCategory, setSelectedCallCategory] = useState<CallCategory>(null);
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "input" | "analyzing" | "results">("select");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [selectedSavedAnalysis, setSelectedSavedAnalysis] = useState<Analysis | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analyzerMode, setAnalyzerMode] = useState<"manual" | "ai-triage">("ai-triage");
  const { toast } = useToast();
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const { saveAnalysis, fetchAnalyses } = useAnalyses();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CS Analyzer | Churn Is Dead";
  }, []);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { from: "/cs-analyzer" } });
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-pulse text-red mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  const selectedOption = analysisOptions.find(opt => opt.id === selectedType);

  const handleTypeSelect = (type: AnalysisType) => {
    setSelectedType(type);
    setSelectedCallCategory(null); // Reset call category when type changes
    setStep("input");
    setSelectedSavedAnalysis(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      toast({
        title: "File uploaded",
        description: `${file.name} ready for analysis`,
      });
    }
  };

  const handleBack = () => {
    if (step === "input") {
      setStep("select");
      setSelectedType(null);
      setSelectedCallCategory(null);
      setContent("");
      setFileName(null);
    }
  };

  const handleAnalyze = async () => {
    // Require call category for call transcripts
    if (selectedType === "call-transcript" && !selectedCallCategory) {
      toast({
        title: "Call type required",
        description: "Please select the type of call before analyzing",
        variant: "destructive",
      });
      return;
    }
    if (!content && !fileName) {
      toast({
        title: "Content required",
        description: "Please paste your content or upload a file",
        variant: "destructive",
      });
      return;
    }

    setStep("analyzing");
    setIsAnalyzing(true);

    try {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const retryDelays = [500, 1500, 3000];

      const invokeWithRetry = async () => {
        let lastErr: unknown;
        for (let attempt = 0; attempt < retryDelays.length; attempt++) {
          try {
            const { data, error } = await supabase.functions.invoke("cs-analyzer", {
              body: {
                analysisType: selectedType,
                callCategory: selectedType === "call-transcript" ? selectedCallCategory : undefined,
                content,
                email: user?.email || "anonymous@user.com",
              },
            });

            if (error) throw error;
            return data;
          } catch (err: unknown) {
            lastErr = err;
            const msg = String((err as Error)?.message || "");
            const name = String((err as Error)?.name || "");
            const isTransientFetch = name.includes("FunctionsFetchError") || msg.includes("Failed to fetch");
            if (!isTransientFetch || attempt === retryDelays.length - 1) throw err;

            toast({
              title: "Retrying…",
              description: "Connection hiccup—retrying the analysis.",
            });
            await sleep(retryDelays[attempt]);
          }
        }
        throw lastErr;
      };

      const data = await invokeWithRetry();

      if (data?.analysis) {
        setAnalysisResult(data.analysis);
        setStep("results");
        toast({
          title: "Analysis complete!",
          description: "Your personalized insights are ready.",
        });

        // Auto-save for logged-in users
        if (user) {
          const title = generateTitle(selectedType, content, data.analysis);
          const { error } = await saveAnalysis(title, selectedType || "unknown", content, data.analysis);
          if (!error) {
            // Trigger a refresh of the sidebar's analysis list
            window.dispatchEvent(new CustomEvent('analysis-saved'));
            toast({
              title: "Analysis saved",
              description: "You can access this analysis anytime from the sidebar.",
            });
          }
        }
      } else {
        throw new Error("No analysis returned");
      }
    } catch (error: unknown) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: (error as Error)?.message || "Please try again later.",
        variant: "destructive",
      });
      setStep("input");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateTitle = (type: AnalysisType, inputContent: string, analysisOutput?: string): string => {
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const typeLabel = analysisOptions.find(o => o.id === type)?.title || "Analysis";
    
    if (analysisOutput) {
      // Look for Account Posture in Executive Snapshot (most meaningful indicator)
      const postureMatch = analysisOutput.match(/Account Posture[:\s]*\*?\*?(Green|Amber|Red)/i);
      const threatMatch = analysisOutput.match(/Revenue Threat Level[:\s]*\*?\*?([^\n*]+)/i);
      
      // Look for company/customer name patterns
      const companyPatterns = [
        /Customer(?:\/Company)?[:\s]*\*?\*?([A-Za-z0-9\s&.-]{3,30})(?:\*?\*?[\n,|]|$)/i,
        /Account[:\s]*\*?\*?([A-Za-z0-9\s&.-]{3,30})(?:\*?\*?[\n,|]|$)/i,
      ];
      
      for (const pattern of companyPatterns) {
        const match = analysisOutput.match(pattern);
        if (match && match[1].trim().length > 2 && !match[1].includes("Posture")) {
          const company = match[1].trim().slice(0, 25);
          if (postureMatch) {
            return `${company} - ${postureMatch[1]}`;
          }
          return `${company} - ${date}`;
        }
      }
      
      // Use posture + threat for title if available
      if (postureMatch && threatMatch) {
        const threat = threatMatch[1].trim().slice(0, 20);
        return `${postureMatch[1]} Account - ${threat}`;
      }
      
      if (postureMatch) {
        return `${postureMatch[1]} Account - ${date}`;
      }
    }
    
    // Extract from input content - look for company mentions
    const inputCompanyMatch = inputContent.match(/(?:at|with|for)\s+([A-Z][A-Za-z0-9\s&.-]{2,25})(?:,|\.|:|\s+(?:today|this|we))/i);
    if (inputCompanyMatch) {
      return `${inputCompanyMatch[1].trim()} - ${date}`;
    }
    
    // Look for speaker names/roles in transcripts
    const roleMatch = inputContent.match(/^(Head of [A-Za-z]+|VP of [A-Za-z]+|Director of [A-Za-z]+|[A-Z][a-z]+ Director|Finance Director|CSM|CEO|CFO|CIO)[:\s]/m);
    if (roleMatch) {
      return `${typeLabel} - ${date}`;
    }
    
    // Last resort: use type and date
    return `${typeLabel} - ${date}`;
  };

  const handleStartOver = () => {
    setSelectedType(null);
    setSelectedCallCategory(null);
    setContent("");
    setFileName(null);
    setAnalysisResult(null);
    setSelectedSavedAnalysis(null);
    setStep("select");
  };

  const handleCopyAnalysis = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      toast({
        title: "Copied!",
        description: "Analysis copied to clipboard",
      });
    }
  };

  const handleDownloadMarkdown = () => {
    if (!analysisResult) return;
    
    const title = selectedSavedAnalysis?.title || `${selectedOption?.title || 'Analysis'} Report`;
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    
    const blob = new Blob([analysisResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Markdown file saved",
    });
  };

  const handleDownloadPDF = async () => {
    if (!analysisResult) return;
    
    toast({
      title: "Generating PDF...",
      description: "This may take a moment",
    });

    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      const title = selectedSavedAnalysis?.title || `${selectedOption?.title || 'Analysis'} Report`;
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      
      // Create a styled HTML version of the report
      const reportElement = document.getElementById('analysis-report-content');
      
      if (reportElement) {
        const opt = {
          margin: [10, 10, 10, 10],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        await html2pdf().set(opt).from(reportElement).save();
        
        toast({
          title: "Downloaded!",
          description: "PDF file saved",
        });
      } else {
        throw new Error("Report content not found");
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF generation failed",
        description: "Try downloading as Markdown instead",
        variant: "destructive",
      });
    }
  };

  const handleSelectSavedAnalysis = (analysis: Analysis) => {
    setSelectedSavedAnalysis(analysis);
    setSelectedType(analysis.analysis_type as AnalysisType);
    setContent(analysis.input_text);
    setAnalysisResult(
      typeof analysis.results === "object" && "content" in analysis.results
        ? String(analysis.results.content)
        : JSON.stringify(analysis.results)
    );
    setStep("results");
  };

  const handleNewAnalysis = () => {
    handleStartOver();
  };

  // Handler for AI triage - when user confirms classification
  const handleTriageAnalysisReady = async (params: {
    contentType: string;
    callCategory: string | null;
    content: string;
  }) => {
    setSelectedType(params.contentType as AnalysisType);
    setSelectedCallCategory(params.callCategory as CallCategory);
    setContent(params.content);
    setAnalyzerMode("manual"); // Switch to manual mode for the actual analysis
    
    // Automatically trigger analysis
    setStep("analyzing");
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("cs-analyzer", {
        body: {
          analysisType: params.contentType,
          callCategory: params.callCategory,
          content: params.content,
          email: user?.email || "anonymous@user.com",
        },
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysisResult(data.analysis);
        setStep("results");
        toast({
          title: "Analysis complete!",
          description: "Your personalized insights are ready.",
        });

        // Auto-save for logged-in users
        if (user) {
          const title = generateTitle(params.contentType as AnalysisType, params.content, data.analysis);
          const { error: saveError } = await saveAnalysis(title, params.contentType, params.content, data.analysis);
          if (!saveError) {
            window.dispatchEvent(new CustomEvent('analysis-saved'));
            toast({
              title: "Analysis saved",
              description: "You can access this analysis anytime from the sidebar.",
            });
          }
        }
      } else {
        throw new Error("No analysis returned");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: (error as Error)?.message || "Please try again later.",
        variant: "destructive",
      });
      setStep("select");
      setAnalyzerMode("ai-triage"); // Go back to triage mode
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Persistent Sidebar */}
      <AnalysisSidebar
        onSelectAnalysis={handleSelectSavedAnalysis}
        onNewAnalysis={handleNewAnalysis}
        selectedAnalysisId={selectedSavedAnalysis?.id}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - seamlessly blends with sidebar */}
        <header className="sticky top-0 z-40 bg-navy-dark text-white h-14">
          <div className="flex items-center justify-between px-4 h-full md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile sidebar toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="md:hidden text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-serif font-bold tracking-tight">CS Analyzer</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="text-white/60 hover:text-white text-sm transition-colors hidden md:block"
              >
                ← Back to Churn Is Dead
              </Link>
              
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/10 gap-2 h-9">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium">
                        {initials}
                      </div>
                      <span className="hidden sm:inline text-sm text-white/90">{displayName}</span>
                      <ChevronDown className="h-3 w-3 text-white/40" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg z-50">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto px-4 py-8 md:px-6 max-w-4xl">
              
              {/* Step Indicator */}
              {step !== "results" && (
                <div className="flex items-center justify-center gap-4 mb-8">
                  {["Select Type", "Add Content", "Results"].map((label, index) => {
                    const stepIndex = index + 1;
                    const currentStepIndex = step === "select" ? 1 : step === "input" ? 2 : 3;
                    const isActive = stepIndex === currentStepIndex;
                    const isCompleted = stepIndex < currentStepIndex;
                    
                    return (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                          ${isActive ? "bg-red text-white" : isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}
                        `}>
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepIndex}
                        </div>
                        <span className={`hidden md:block text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                        {index < 2 && (
                          <div className={`w-12 h-0.5 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 1: Select Analysis Type */}
              {step === "select" && (
                <div className="animate-fade-in">
                  {/* Mode Tabs */}
                  <Tabs 
                    value={analyzerMode} 
                    onValueChange={(v) => setAnalyzerMode(v as "manual" | "ai-triage")}
                    className="w-full"
                  >
                    <div className="flex justify-center mb-8">
                      <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="manual" className="gap-2">
                          <Settings2 className="w-4 h-4" />
                          Manual
                        </TabsTrigger>
                        <TabsTrigger value="ai-triage" className="gap-2">
                          <Bot className="w-4 h-4" />
                          AI Triage
                          <span className="ml-1 text-[10px] bg-red/20 text-red px-1.5 py-0.5 rounded-full font-medium">Beta</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Manual Mode */}
                    <TabsContent value="manual" className="mt-0">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-dark mb-2">
                          What would you like to analyze?
                        </h2>
                        <p className="text-muted-foreground">
                          Choose the type of content you want our AI to review
                        </p>
                      </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisOptions.map((option) => {
                      const isEnabled = option.id === "call-transcript";
                      return (
                        <Card 
                          key={option.id}
                          className={`transition-all duration-300 ${
                            isEnabled 
                              ? "cursor-pointer hover:shadow-lg hover:border-red/50 hover:-translate-y-1" 
                              : "opacity-60 cursor-not-allowed"
                          }`}
                          onClick={() => isEnabled && handleTypeSelect(option.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="w-14 h-14 rounded-xl bg-red/10 flex items-center justify-center text-red mb-3">
                                {option.icon}
                              </div>
                              {!isEnabled && (
                                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <CardTitle className="text-xl font-serif">{option.title}</CardTitle>
                            <CardDescription>{option.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {option.examples.map((example, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {example}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                      </div>

                      {/* Benefits Section */}
                      <div className="mt-16 pt-12 border-t">
                        <h3 className="text-xl font-serif font-bold text-navy-dark text-center mb-8">
                          Why use CS Analyzer?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center text-red mx-auto mb-4">
                              <Sparkles className="w-6 h-6" />
                            </div>
                            <h4 className="font-serif font-bold text-navy-dark mb-2">AI-Powered</h4>
                            <p className="text-sm text-muted-foreground">
                              Advanced analysis identifies patterns humans might miss
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center text-red mx-auto mb-4">
                              <Target className="w-6 h-6" />
                            </div>
                            <h4 className="font-serif font-bold text-navy-dark mb-2">Actionable</h4>
                            <p className="text-sm text-muted-foreground">
                              Get specific recommendations you can implement today
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center text-red mx-auto mb-4">
                              <Save className="w-6 h-6" />
                            </div>
                            <h4 className="font-serif font-bold text-navy-dark mb-2">Save & Review</h4>
                            <p className="text-sm text-muted-foreground">
                              Sign in to save analyses and build your CS knowledge base
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* AI Triage Mode */}
                    <TabsContent value="ai-triage" className="mt-0">
                      <Card className="border-2 border-dashed border-navy-dark/20">
                        <CardHeader className="text-center pb-2">
                          <div className="w-14 h-14 rounded-full bg-navy-dark/10 flex items-center justify-center mx-auto mb-3">
                            <Bot className="w-8 h-8 text-navy-dark" />
                          </div>
                          <CardTitle className="text-xl font-serif">AI Triage Assistant</CardTitle>
                          <CardDescription>
                            Paste your content and I'll automatically classify it and extract context
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <TriageChat onAnalysisReady={handleTriageAnalysisReady} />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Step 2: Input Content */}
              {step === "input" && selectedOption && (
                <div className="animate-fade-in">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="mb-6 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to selection
                  </Button>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red/10 flex items-center justify-center text-red">
                          {selectedOption.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-serif">{selectedOption.title}</CardTitle>
                          <CardDescription>{selectedOption.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Call Category Selection - Only for Call Transcripts */}
                      {selectedType === "call-transcript" && (
                        <div>
                          <Label className="text-base font-medium mb-3 block">
                            What type of call is this?
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {callCategoryOptions.map((category) => (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCallCategory(category.id)}
                                className={cn(
                                  "text-left p-4 rounded-lg border-2 transition-all duration-200",
                                  selectedCallCategory === category.id
                                    ? "border-red bg-red/5 shadow-sm"
                                    : "border-border hover:border-red/30 hover:bg-muted/50"
                                )}
                              >
                                <div className="font-medium text-foreground mb-1">
                                  {category.title}
                                </div>
                                <div className="text-xs text-muted-foreground leading-relaxed">
                                  {category.description}
                                </div>
                              </button>
                            ))}
                          </div>
                          {!selectedCallCategory && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Select a call type to enable tailored analysis
                            </p>
                          )}
                        </div>
                      )}

                      {/* Text Input */}
                      <div>
                        <Label htmlFor="content" className="text-base font-medium">
                          Paste your content
                        </Label>
                        <Textarea
                          id="content"
                          placeholder={selectedOption.placeholder}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="mt-2 min-h-[250px] font-mono text-sm"
                        />
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-sm text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* File Upload */}
                      <div>
                        <Label className="text-base font-medium">Upload a file</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Accepted formats: {selectedOption.acceptedFormats}
                        </p>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-red/50 transition-colors">
                          <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept={selectedOption.acceptedFormats}
                            onChange={handleFileUpload}
                          />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                            {fileName ? (
                              <div>
                                <p className="font-medium text-foreground">{fileName}</p>
                                <p className="text-sm text-muted-foreground">Click to replace</p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-foreground">Click to upload</p>
                                <p className="text-sm text-muted-foreground">or drag and drop</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Analyze Button */}
                      <Button 
                        onClick={handleAnalyze}
                        className="w-full bg-red hover:bg-red-dark text-white"
                        size="lg"
                        disabled={isAnalyzing || (!content && !fileName)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      {!user && (
                        <p className="text-xs text-center text-muted-foreground">
                          <Link to="/auth" state={{ from: "/cs-analyzer" }} className="text-red hover:underline">
                            Sign in
                          </Link>
                          {" "}to save your analysis and view it later
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Analyzing State */}
              {step === "analyzing" && (
                <div className="animate-fade-in text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-red/10 flex items-center justify-center text-red mx-auto mb-6">
                    <Sparkles className="w-10 h-10 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-navy-dark mb-4">
                    Analyzing your content...
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Our AI is reviewing your {selectedOption?.title.toLowerCase()} and generating 
                    personalized insights. This usually takes about 30 seconds.
                  </p>
                </div>
              )}

              {/* Results State */}
              {step === "results" && analysisResult && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-navy-dark">
                        {selectedSavedAnalysis?.title || `Your ${selectedOption?.title} Analysis`}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedSavedAnalysis 
                          ? `Saved on ${new Date(selectedSavedAnalysis.created_at).toLocaleDateString()}`
                          : user ? "Saved to your account" : "Not saved - sign in to keep"
                        }
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                        <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2 cursor-pointer">
                          <FileDown className="w-4 h-4 text-red" />
                          <div>
                            <p className="font-medium">PDF Document</p>
                            <p className="text-xs text-muted-foreground">Best for sharing & printing</p>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDownloadMarkdown} className="gap-2 cursor-pointer">
                          <FileType className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium">Markdown</p>
                            <p className="text-xs text-muted-foreground">For Notion, docs, or editing</p>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Tabs for Analysis and Transcript */}
                  <Tabs defaultValue="analysis" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                      <TabsTrigger value="analysis" className="gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Analysis
                      </TabsTrigger>
                      <TabsTrigger value="transcript" className="gap-2">
                        <FileTextIcon className="w-4 h-4" />
                        Transcript
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="analysis" className="mt-0">
                      <div id="analysis-report-content">
                        <AnalysisReport 
                          analysisResult={analysisResult} 
                          title={selectedSavedAnalysis?.title || (selectedOption ? `${selectedOption.title} Analysis` : undefined)}
                          createdAt={selectedSavedAnalysis?.created_at}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="transcript" className="mt-0">
                      <Card className="border border-report-border">
                        <CardHeader className="border-b border-report-border bg-report-surface/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-navy-dark/10">
                              <FileTextIcon className="w-5 h-5 text-navy-dark" />
                            </div>
                            <div>
                              <CardTitle className="font-serif text-lg font-bold text-report-heading">
                                Original {selectedOption?.title || "Content"}
                              </CardTitle>
                              <CardDescription className="text-sm text-report-muted">
                                The source material used for this analysis
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="bg-muted/30 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-report-text">
                              {content || selectedSavedAnalysis?.input_text || "No transcript available"}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CSAnalyzer;
