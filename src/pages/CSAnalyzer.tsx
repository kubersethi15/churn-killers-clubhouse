import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisReport } from "@/components/cs-analyzer/report/AnalysisReport";
import { V2ReportRenderer } from "@/components/cs-analyzer/report-v2/V2ReportRenderer";
import { ReportBuilder } from "@/components/cs-analyzer/report-v2/ReportBuilder";
import { DebugSection } from "@/components/cs-analyzer/report-v2/DebugSection";
import type { PipelineResult, FinalReport, EvidenceAnchor } from "@/components/cs-analyzer/report-v2/types";
import { isValidCustomerName, getDisplayCustomerName } from "@/utils/customerNameUtils";
import { TriageChat } from "@/components/cs-analyzer/TriageChat";
import { AnalyzingProgress } from "@/components/cs-analyzer/AnalyzingProgress";
import { FeedbackButton } from "@/components/cs-analyzer/FeedbackButton";
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
  Loader2,
  FileType,
  PanelLeft,
  Bot,
  Settings2,
  Layers,
  AlertTriangle,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { buildPdfPayload } from "@/utils/pdfPayloadUtils";
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
  const [customerName, setCustomerName] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "input" | "analyzing" | "results">("select");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [reportVersion, setReportVersion] = useState<"v1_single" | "v2_panel">("v1_single");
  const [selectedSavedAnalysis, setSelectedSavedAnalysis] = useState<Analysis | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analyzerMode, setAnalyzerMode] = useState<"manual" | "ai-triage">("ai-triage");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    try { return !localStorage.getItem("cs-analyzer-onboarded"); } catch { return true; }
  });
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
                pipelineMode: selectedType === "call-transcript",
                callMetadata: customerName ? { customer_name: customerName } : undefined,
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

      // Handle v2 pipeline response
      if (data?.reportVersion === 'v2_panel' && data?.pipelineResult) {
        // Check for transcript-too-short error
        if (!data.pipelineResult.success && data.pipelineResult.error?.includes("too short")) {
          toast({
            title: "Transcript too short",
            description: "This transcript is too short for analysis. Please upload a complete call transcript — typically at least a few minutes of conversation.",
            variant: "destructive",
          });
          setStep("input");
          return;
        }

        setPipelineResult(data.pipelineResult);
        setReportVersion('v2_panel');
        setAnalysisResult(null);
        setStep("results");
        toast({
          title: "Analysis complete!",
          description: `Multi-pass pipeline finished${data.pipelineResult.success ? '' : ' with partial results'}.`,
        });

        // Auto-save for logged-in users
        if (user) {
          const rawCustomerName = data.pipelineResult.finalReport?.meta?.customer_name;
          const reportCustomerName = isValidCustomerName(rawCustomerName) ? rawCustomerName : null;
          const title = reportCustomerName
            || data.pipelineResult.finalReport?.executive_snapshot?.one_liner?.slice(0, 60)
            || generateTitle(selectedType, content);
          const { error } = await saveAnalysis(title, selectedType || "unknown", content, JSON.stringify({ pipelineResult: data.pipelineResult, reportVersion: 'v2_panel' }));
          if (!error) {
            window.dispatchEvent(new CustomEvent('analysis-saved'));
            toast({ title: "Analysis saved", description: "You can access this analysis anytime from the sidebar." });
          }
        }
      } else if (data?.analysis) {
        // Legacy v1 response
        setAnalysisResult(data.analysis);
        setPipelineResult(null);
        setReportVersion('v1_single');
        setStep("results");
        toast({ title: "Analysis complete!", description: "Your personalized insights are ready." });

        if (user) {
          const title = generateTitle(selectedType, content, data.analysis);
          const { error } = await saveAnalysis(title, selectedType || "unknown", content, data.analysis);
          if (!error) {
            window.dispatchEvent(new CustomEvent('analysis-saved'));
            toast({ title: "Analysis saved", description: "You can access this analysis anytime from the sidebar." });
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
    setCustomerName("");
    setFileName(null);
    setAnalysisResult(null);
    setPipelineResult(null);
    setReportVersion('v1_single');
    setSelectedSavedAnalysis(null);
    setStep("select");
    setAnalyzerMode("ai-triage");
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

  const handleDownloadDebugBundle = () => {
    if (!pipelineResult) return;

    const transcript = content || selectedSavedAnalysis?.input_text || "";
    const bundle = {
      exportedAt: new Date().toISOString(),
      title: selectedSavedAnalysis?.title || "Untitled Analysis",
      transcript,
      pipeline: {
        success: pipelineResult.success,
        reportVersion: pipelineResult.reportVersion,
        passTimings: pipelineResult.debug?.passTimings ?? [],
        failedPasses: pipelineResult.debug?.failedPasses ?? [],
        errors: pipelineResult.debug?.errors ?? [],
      },
      pass0_preprocessor: pipelineResult.debug?.preprocessor ?? null,
      pass1a_evidence: pipelineResult.debug?.analystEvidence ?? null,
      pass1b_commercial: pipelineResult.debug?.analystCommercial ?? null,
      pass1c_adoption: pipelineResult.debug?.analystAdoption ?? null,
      pass2_judge_final_report: pipelineResult.finalReport ?? null,
      evidenceAnchors: pipelineResult.evidenceAnchors ?? [],
    };

    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = (selectedSavedAnalysis?.title || "analysis").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    a.download = `${safeTitle}_debug_bundle.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Downloaded!", description: "Debug bundle saved as JSON" });
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
    // Only v2 pipeline reports are supported for deterministic PDFs
    if (reportVersion !== "v2_panel" || !pipelineResult?.finalReport) {
      toast({
        title: "PDF not available",
        description: "PDF export requires a pipeline analysis report.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingPdf(true);
    toast({
      title: "Generating PDF...",
      description: "Building your print-ready report — this takes a few seconds.",
    });

    try {
      const reportTitle = getDisplayCustomerName(pipelineResult.finalReport.meta?.customer_name, selectedSavedAnalysis?.title || `${selectedOption?.title || 'Analysis'} Report`);

      // Build a default "all visible" visibility map for Analysis tab export
      const allVisibleMap: Record<string, boolean> = {};
      const sectionIncluded = pipelineResult.finalReport.section_included as unknown as Record<string, boolean>;
      for (const key of Object.keys(sectionIncluded)) {
        allVisibleMap[key] = !!sectionIncluded[key];
      }
      allVisibleMap["evidence_quotes"] = true;
      allVisibleMap["confidence_scores"] = true;
      allVisibleMap["qa_notes"] = false;

      // Build minimal payload — only fields the PDF template actually uses
      const requestBody = {
        report: buildPdfPayload(pipelineResult.finalReport as unknown as Record<string, unknown>),
        visibility: allVisibleMap,
        title: reportTitle,
        finalizedAt: new Date().toISOString(),
      };

      // Retry logic for transient fetch failures
      let fnData: unknown = null;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const payloadSize = JSON.stringify(requestBody).length;
          console.log(`[PDF Export] Attempt ${attempt + 1} — payload size: ${payloadSize} chars (${(payloadSize / 1024).toFixed(1)} KB)`);
          const { data, error: fnError } = await supabase.functions.invoke(
            "cs-report-renderer",
            { body: requestBody },
          );

          if (fnError) {
            console.error(`[PDF Export] Attempt ${attempt + 1} error:`, fnError);
            lastError = new Error(fnError.message || "Edge function failed");
            // Wait before retry
            if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }

          fnData = data;
          break;
        } catch (fetchErr) {
          console.error(`[PDF Export] Attempt ${attempt + 1} fetch error:`, fetchErr);
          lastError = fetchErr instanceof Error ? fetchErr : new Error(String(fetchErr));
          if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      }

      if (!fnData) {
        throw lastError || new Error("Failed to reach the PDF renderer after 3 attempts");
      }

      const responseData = typeof fnData === "string" ? JSON.parse(fnData) : fnData;
      if ((responseData as Record<string, unknown>).error) throw new Error(String((responseData as Record<string, unknown>).error));
      if (!(responseData as Record<string, unknown>).html) throw new Error("No HTML returned from renderer");

      const printWindow = window.open("", "_blank");
      if (!printWindow) throw new Error("Could not open print window — please allow popups");

      printWindow.document.write((responseData as Record<string, unknown>).html as string);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();

      toast({ title: "PDF Ready", description: "Use Save as PDF in the print dialog." });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF generation failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSelectSavedAnalysis = (analysis: Analysis) => {
    setSelectedSavedAnalysis(analysis);
    setSelectedType(analysis.analysis_type as AnalysisType);
    setContent(analysis.input_text);

    // Check if this is a v2 pipeline result
    let results = analysis.results as Record<string, unknown>;

    // The saveAnalysis hook wraps results as { content: stringifiedJSON }
    // so we need to unwrap and parse it first
    if (typeof results?.content === "string") {
      try {
        const parsed = JSON.parse(results.content as string);
        if (typeof parsed === "object" && parsed !== null) {
          results = parsed as Record<string, unknown>;
        }
      } catch {
        // Not valid JSON – treat as v1 markdown
      }
    }

    if (results?.reportVersion === 'v2_panel' && results?.pipelineResult) {
      setPipelineResult(results.pipelineResult as PipelineResult);
      setReportVersion('v2_panel');
      setAnalysisResult(null);
    } else {
      // Legacy v1
      setAnalysisResult(
        typeof results === "object" && "content" in results
          ? String(results.content)
          : JSON.stringify(results)
      );
      setPipelineResult(null);
      setReportVersion('v1_single');
    }
    setStep("results");
  };

  const handleNewAnalysis = () => {
    handleStartOver();
  };

  // Handler for AI triage - when user confirms classification
  // Handler for AI triage - when user confirms classification
  const handleTriageAnalysisReady = async (params: {
    contentType: string;
    callCategory: string | null;
    content: string;
    customerName?: string | null;
    customPrompt?: {
      systemPrompt: string;
      userPromptPrefix: string;
    };
  }) => {
    setSelectedType(params.contentType as AnalysisType);
    setSelectedCallCategory(params.callCategory as CallCategory);
    setContent(params.content);
    setAnalyzerMode("manual"); // Switch to manual mode for the actual analysis
    
    // Automatically trigger analysis
    setStep("analyzing");
    setIsAnalyzing(true);

    try {
      const usePipeline = params.contentType === "call-transcript";

      const requestBody: Record<string, unknown> = {
        analysisType: params.contentType,
        callCategory: params.callCategory,
        content: params.content,
        email: user?.email || "anonymous@user.com",
        pipelineMode: usePipeline,
        callMetadata: params.customerName ? { customer_name: params.customerName } : undefined,
      };

      // Include custom prompt for "other" scenarios
      if (params.callCategory === 'other' && params.customPrompt) {
        requestBody.customPrompt = params.customPrompt;
      }

      const { data, error } = await supabase.functions.invoke("cs-analyzer", {
        body: requestBody,
      });

      if (error) throw error;

      // Handle v2 pipeline response
      if (data?.reportVersion === 'v2_panel' && data?.pipelineResult) {
        setPipelineResult(data.pipelineResult);
        setReportVersion('v2_panel');
        setAnalysisResult(null);
        setStep("results");
        toast({
          title: "Analysis complete!",
          description: `Multi-pass pipeline finished${data.pipelineResult.success ? '' : ' with partial results'}.`,
        });

        if (user) {
          const rawName = data.pipelineResult.finalReport?.meta?.customer_name;
          const reportCustomerName = isValidCustomerName(rawName) ? rawName : null;
          const title = reportCustomerName
            || data.pipelineResult.finalReport?.executive_snapshot?.one_liner?.slice(0, 60)
            || generateTitle(params.contentType as AnalysisType, params.content);
          const { error: saveError } = await saveAnalysis(title, params.contentType, params.content, JSON.stringify({ pipelineResult: data.pipelineResult, reportVersion: 'v2_panel' }));
          if (!saveError) {
            window.dispatchEvent(new CustomEvent('analysis-saved'));
            toast({ title: "Analysis saved", description: "You can access this analysis anytime from the sidebar." });
          }
        }
      } else if (data?.analysis) {
        // Legacy v1 response
        setAnalysisResult(data.analysis);
        setPipelineResult(null);
        setReportVersion('v1_single');
        setStep("results");
        toast({
          title: "Analysis complete!",
          description: "Your personalized insights are ready.",
        });

        if (user) {
          const title = generateTitle(params.contentType as AnalysisType, params.content, data.analysis);
          const { error: saveError } = await saveAnalysis(title, params.contentType, params.content, data.analysis);
          if (!saveError) {
            window.dispatchEvent(new CustomEvent('analysis-saved'));
            toast({ title: "Analysis saved", description: "You can access this analysis anytime from the sidebar." });
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
      setAnalyzerMode("ai-triage");
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
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Persistent Sidebar */}
      <AnalysisSidebar
        onSelectAnalysis={handleSelectSavedAnalysis}
        onNewAnalysis={handleNewAnalysis}
        selectedAnalysisId={selectedSavedAnalysis?.id}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
            <div className={cn("container mx-auto px-4 py-8 md:px-6", step === "results" ? "max-w-7xl" : "max-w-4xl")}>
              
              {/* Step Indicator - Only show for Manual mode */}
              {step !== "results" && analyzerMode === "manual" && (
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
                  {/* AI Triage Mode (default) */}
                  <div className="w-full">
                      {/* First-time welcome banner */}
                      {showWelcome && (
                        <div className="mb-6 rounded-xl border border-navy-dark/10 bg-navy-dark/[0.03] px-5 py-4 relative animate-fade-in">
                          <button
                            onClick={() => {
                              setShowWelcome(false);
                              try { localStorage.setItem("cs-analyzer-onboarded", "1"); } catch {}
                            }}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Dismiss"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <h3 className="text-sm font-semibold text-navy-dark mb-1.5 font-serif">
                            Welcome to CS Analyzer
                          </h3>
                          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside leading-relaxed">
                            <li><strong>Paste</strong> a call transcript below</li>
                            <li>AI <strong>auto-classifies</strong> the scenario and extracts context</li>
                            <li>Five specialist agents produce a <strong>comprehensive report</strong> in ~45 seconds</li>
                          </ol>
                          <p className="text-xs text-muted-foreground mt-2">
                            No transcript handy? Use <strong>Try a sample</strong> at the bottom.
                          </p>
                        </div>
                      )}

                      <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-dark mb-2">
                          Paste your content to get started
                        </h2>
                        <p className="text-muted-foreground">
                          Our AI will auto-detect the type and select the best analysis approach
                        </p>
                      </div>

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

                      {/* Customer Name (optional) */}
                      {selectedType === "call-transcript" && (
                        <div>
                          <Label htmlFor="customer-name" className="text-base font-medium">
                            Customer / Account Name <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                          </Label>
                          <Input
                            id="customer-name"
                            placeholder="e.g. Meridian Financial Group"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Used in report headers and PDF exports. Auto-detected from transcript if left empty.
                          </p>
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
                <AnalyzingProgress />
              )}

              {/* Results State — V2 Pipeline (failed — no finalReport) */}
              {step === "results" && reportVersion === "v2_panel" && pipelineResult && !pipelineResult.finalReport && (
                <div className="animate-fade-in max-w-xl mx-auto py-8">
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-7 h-7 text-destructive" />
                    </div>
                    <h2 className="text-xl font-serif font-bold text-navy-dark mb-2">
                      Analysis couldn't be completed
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Our AI models experienced a temporary issue while generating your report. This happens occasionally and usually resolves on a retry.
                    </p>
                  </div>

                  <Card className="border border-border mb-6">
                    <CardContent className="p-5 text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Your transcript is still saved. Simply try again — most temporary failures resolve immediately.
                      </p>
                      <Button onClick={handleStartOver} className="gap-2 bg-red hover:bg-red-dark text-white">
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Results State — V2 Pipeline (success) */}
              {step === "results" && reportVersion === "v2_panel" && pipelineResult?.finalReport && (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-end mb-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={isExportingPdf}
                        onClick={handleDownloadPDF}
                      >
                        {isExportingPdf ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileDown className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">{isExportingPdf ? "Generating..." : "Export PDF"}</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleStartOver} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">New Analysis</span>
                      </Button>
                    </div>
                  </div>

                  <Tabs defaultValue="analysis" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                      <TabsTrigger value="analysis" className="gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Analysis</span>
                      </TabsTrigger>
                      <TabsTrigger value="builder" className="gap-2">
                        <Layers className="w-4 h-4" />
                        <span className="hidden sm:inline">Builder</span>
                      </TabsTrigger>
                      <TabsTrigger value="transcript" className="gap-2">
                        <FileTextIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Transcript</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="analysis" className="mt-0">
                      <div id="analysis-report-content">
                        <V2ReportRenderer
                          report={pipelineResult.finalReport as FinalReport}
                          evidenceAnchors={(pipelineResult.evidenceAnchors ?? []) as EvidenceAnchor[]}
                          title={selectedSavedAnalysis?.title}
                          createdAt={selectedSavedAnalysis?.created_at}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="builder" className="mt-0">
                      <ReportBuilder
                        report={pipelineResult.finalReport as FinalReport}
                        evidenceAnchors={(pipelineResult.evidenceAnchors ?? []) as EvidenceAnchor[]}
                        title={selectedSavedAnalysis?.title}
                        createdAt={selectedSavedAnalysis?.created_at}
                      />
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
                                Original Transcript
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
      
      {/* Floating Feedback Button */}
      <FeedbackButton analysisId={selectedSavedAnalysis?.id} />
    </div>
  </div>
);
};

export default CSAnalyzer;
