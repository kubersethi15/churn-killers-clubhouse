import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AnalysisReport } from "@/components/cs-analyzer/AnalysisReport";
import { AnalyzerSidebar } from "@/components/analyzer/AnalyzerSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
  CheckCircle,
  RotateCcw,
  Copy,
  LogIn,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";

type AnalysisType = "call-transcript" | "qbr-deck" | "success-plan" | "health-assessment" | null;

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
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "input" | "analyzing" | "results">("select");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [selectedSavedAnalysis, setSelectedSavedAnalysis] = useState<Analysis | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveAnalysis, fetchAnalyses } = useAnalyses();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CS Analyzer | Churn Is Dead";
  }, []);

  const selectedOption = analysisOptions.find(opt => opt.id === selectedType);

  const handleTypeSelect = (type: AnalysisType) => {
    setSelectedType(type);
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
      setContent("");
      setFileName(null);
    }
  };

  const handleAnalyze = async () => {
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
          const title = generateTitle(selectedType, content);
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

  const generateTitle = (type: AnalysisType, inputContent: string): string => {
    const typeLabel = analysisOptions.find(o => o.id === type)?.title || "Analysis";
    const preview = inputContent.slice(0, 50).replace(/\n/g, " ").trim();
    return `${typeLabel} - ${preview}${inputContent.length > 50 ? "..." : ""}`;
  };

  const handleStartOver = () => {
    setSelectedType(null);
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AnalyzerSidebar
          onSelectAnalysis={handleSelectSavedAnalysis}
          onNewAnalysis={handleNewAnalysis}
          selectedAnalysisId={selectedSavedAnalysis?.id}
        />

        <main className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-navy-dark text-white border-b border-navy-light">
            <div className="flex items-center justify-between px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-white hover:bg-white/10" />
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-light" />
                  <h1 className="text-lg font-serif font-bold">CS Analyzer</h1>
                </div>
              </div>

              {!user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => navigate("/auth", { state: { from: "/cs-analyzer" } })}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in to save
                </Button>
              )}
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
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
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
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
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAnalysis}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartOver}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        New Analysis
                      </Button>
                    </div>
                  </div>

                  <AnalysisReport analysisResult={analysisResult} />

                  {!user && (
                    <div className="mt-8 p-6 bg-cream rounded-lg text-center">
                      <p className="text-navy-dark font-medium mb-3">
                        Want to save this analysis and access it later?
                      </p>
                      <Button
                        onClick={() => navigate("/auth", { state: { from: "/cs-analyzer" } })}
                        className="bg-red hover:bg-red-dark text-white"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Create Free Account
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CSAnalyzer;
