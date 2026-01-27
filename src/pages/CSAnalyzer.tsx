import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  Mail,
  RotateCcw,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

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
  const [email, setEmail] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "input" | "email" | "analyzing" | "results">("select");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "CS Analyzer | Churn Is Dead";
  }, []);

  const selectedOption = analysisOptions.find(opt => opt.id === selectedType);

  const handleTypeSelect = (type: AnalysisType) => {
    setSelectedType(type);
    setStep("input");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // For now, just show the file name - actual parsing would happen on backend
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
    } else if (step === "email") {
      setStep("input");
    }
  };

  const handleContinue = () => {
    if (!content && !fileName) {
      toast({
        title: "Content required",
        description: "Please paste your content or upload a file",
        variant: "destructive",
      });
      return;
    }
    setStep("email");
  };

  const handleAnalyze = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to receive the analysis",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
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
        let lastErr: any;
        for (let attempt = 0; attempt < retryDelays.length; attempt++) {
          try {
            const { data, error } = await supabase.functions.invoke("cs-analyzer", {
              body: {
                analysisType: selectedType,
                content,
                email,
              },
            });

            if (error) throw error;
            return data;
          } catch (err: any) {
            lastErr = err;
            const msg = String(err?.message || "");
            const name = String(err?.name || "");
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
      } else {
        throw new Error("No analysis returned");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
      setStep("email");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartOver = () => {
    setSelectedType(null);
    setContent("");
    setEmail("");
    setFileName(null);
    setAnalysisResult(null);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-red-light" />
              <span className="text-sm font-medium text-red-light">AI-Powered Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-black mb-4 animate-fade-in">
              CS Analyzer
            </h1>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
              Get instant, actionable insights on your customer success artifacts. 
              Upload your content and let AI identify what's working and what needs improvement.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 mb-12">
              {["Select Type", "Add Content", "Get Analysis"].map((label, index) => {
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

            {/* Step 1: Select Analysis Type */}
            {step === "select" && (
              <div className="animate-fade-in">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-dark mb-2 text-center">
                  What would you like to analyze?
                </h2>
                <p className="text-muted-foreground text-center mb-8">
                  Choose the type of content you want our AI to review
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysisOptions.map((option) => (
                    <Card 
                      key={option.id}
                      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-red/50 hover:-translate-y-1"
                      onClick={() => handleTypeSelect(option.id)}
                    >
                      <CardHeader>
                        <div className="w-14 h-14 rounded-xl bg-red/10 flex items-center justify-center text-red mb-3">
                          {option.icon}
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
                  ))}
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

                    {/* Continue Button */}
                    <Button 
                      onClick={handleContinue}
                      className="w-full bg-red hover:bg-red-dark text-white"
                      size="lg"
                    >
                      Continue to Analysis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Email Capture */}
            {step === "email" && (
              <div className="animate-fade-in">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="mb-6 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to content
                </Button>

                <Card className="max-w-lg mx-auto">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red/10 flex items-center justify-center text-red mx-auto mb-4">
                      <Mail className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-serif">Almost there!</CardTitle>
                    <CardDescription className="text-base">
                      Enter your email to receive your personalized CS analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="email">Work Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Detailed analysis of your {selectedOption?.title.toLowerCase()}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Actionable recommendations to improve</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Best practices from top CS teams</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleAnalyze}
                      className="w-full bg-red hover:bg-red-dark text-white"
                      size="lg"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Get My Analysis
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By continuing, you agree to receive the analysis and occasional CS insights. 
                      Unsubscribe anytime.
                    </p>
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
                        Your {selectedOption?.title} Analysis
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Generated for {email}
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
                      Analyze Another
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6 md:p-8">
                    <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:text-navy-dark prose-strong:text-navy-dark prose-li:marker:text-red">
                      <ReactMarkdown>{analysisResult}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Want more CS insights delivered to your inbox?
                  </p>
                  <Button
                    variant="outline"
                    className="border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white"
                    onClick={() => window.location.href = "/"}
                  >
                    Subscribe to Churn Is Dead Newsletter
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {step === "select" && (
        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-dark mb-4">
                Why use CS Analyzer?
              </h2>
              <p className="text-muted-foreground mb-10">
                Stop guessing what's working. Get data-driven insights in seconds.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center text-red mx-auto mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-navy-dark mb-2">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced analysis identifies patterns humans might miss
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center text-red mx-auto mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-navy-dark mb-2">Actionable</h3>
                  <p className="text-sm text-muted-foreground">
                    Get specific recommendations you can implement today
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center text-red mx-auto mb-4">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-navy-dark mb-2">Best Practices</h3>
                  <p className="text-sm text-muted-foreground">
                    Benchmarked against what top CS teams are doing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default CSAnalyzer;
