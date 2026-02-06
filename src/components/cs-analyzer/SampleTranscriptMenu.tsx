import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wand2, FileText, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SampleTranscriptMenuProps {
  onSampleGenerated: (transcript: string) => void;
  disabled?: boolean;
}

// Pre-written realistic sample transcripts
const SAMPLE_TEMPLATES = {
  value: `[Customer Success Call - Renewal Discussion]
Date: February 6, 2026
Participants: Sarah Chen (CSM), Michael Torres (VP of Operations, Acme Corp)

Sarah: Michael, thanks for making time today. I wanted to discuss your renewal coming up in March and understand how things are going with the platform.

Michael: Of course, Sarah. Honestly, we've been really happy. The team has seen significant improvements in their workflow since implementing last quarter.

Sarah: That's great to hear! Can you share any specific metrics or outcomes you've noticed?

Michael: Absolutely. Our processing time has dropped by about 40%, and the team is handling 25% more volume without adding headcount. The CFO mentioned it during our last board meeting as a win.

Sarah: That's fantastic ROI. Speaking of the CFO, has Jennifer been involved in reviewing the platform's impact?

Michael: She has, actually. She's been asking about expanding to our European operations. We have three offices there that could benefit from this.

Sarah: I'd love to explore that. Would it make sense to schedule a call with Jennifer to discuss the expansion and align on the renewal terms together?

Michael: Yes, let's do that. I think she'd want to understand the pricing for the additional seats and any volume discounts available.

Sarah: Perfect. I'll send over some options before we meet. Any concerns or areas where you'd like to see improvements?

Michael: The reporting could be more customizable. Our finance team has been asking for specific export formats.

Sarah: Noted. We actually have some new reporting features in beta. I can get you early access if you're interested.

Michael: That would be great. Thanks, Sarah.`,

  risk: `[Customer Escalation Call - Production Issue]
Date: February 6, 2026
Participants: James Wilson (CSM), Lisa Park (Director of Engineering, TechFlow Inc), David Kim (CTO, TechFlow Inc)

James: Thank you both for joining on short notice. I understand there's been an issue with the production environment. Can you walk me through what happened?

Lisa: We had a complete outage this morning. The system was down for almost three hours during our peak usage time. Our customers couldn't access their dashboards.

David: This is the third incident in two months, James. I'm going to be direct - we're evaluating alternatives. The board is asking questions.

James: I completely understand your frustration, David. This is unacceptable, and I want you to know we're treating this as a top priority. Can you tell me more about the impact?

Lisa: We estimate we lost about $50,000 in transaction volume during the outage. Plus, we have three enterprise clients who are now questioning our reliability.

David: Our contract is up in April. I have to be honest - I've already had preliminary conversations with two of your competitors.

James: I hear you, and I appreciate your candor. Let me tell you what we're doing. First, I'm escalating this to our VP of Engineering today. Second, we're implementing additional monitoring specifically for your account.

Lisa: We've heard this before. What's different this time?

James: Fair point. I'm proposing we set up a weekly technical sync between our engineering teams until this is resolved. I'm also requesting a dedicated SRE resource for your account.

David: That's a start, but I need to see concrete improvements by end of month, or we're going to seriously consider our options.

James: Understood. I'll have a detailed incident report and remediation plan to you by end of day tomorrow. Can we schedule a follow-up for Monday?

David: Fine. But James, we need results, not just meetings.`,

  internal: `[Internal Strategy Sync - Q1 Planning]
Date: February 6, 2026
Participants: Amanda Foster (CS Director), Ryan Martinez (CS Manager), Katie Wong (Senior CSM)

Amanda: Let's review our Q1 priorities and the accounts at risk. Ryan, can you start with the Enterprise segment?

Ryan: Sure. We have 12 renewals in Q1, totaling $2.4M ARR. I'm concerned about three of them - TechFlow, Meridian, and GlobalCorp.

Amanda: What's the situation with each?

Ryan: TechFlow is the most urgent. They've had reliability issues and the CTO is actively evaluating competitors. James has a call with them today.

Katie: I'm handling Meridian. Their new VP of Ops came in six months ago and is pushing to consolidate vendors. We need to demonstrate more value quickly.

Amanda: What's our strategy there?

Katie: I'm proposing a value assessment workshop with their leadership team. Show them the TCO comparison and the switching costs they'd incur.

Amanda: Good. What about GlobalCorp?

Ryan: That's a budget issue. They're cutting costs across the board and asking for a 30% discount to renew.

Amanda: Can we offer multi-year in exchange for a smaller discount?

Ryan: I've proposed 15% for a two-year commitment. Waiting to hear back.

Amanda: Okay. On the positive side, what expansion opportunities do we have?

Katie: Acme Corp is interested in expanding to their European operations. Could be an additional $200K ARR.

Amanda: That's great. Let's make sure we're coordinating that with the sales team. Any other updates?

Ryan: We should discuss the new onboarding process. The changes we made last quarter are showing results - time to value is down 20%.

Amanda: Excellent. Let's document that for the QBR. Anything else before we wrap?`
};

export const SampleTranscriptMenu = ({ onSampleGenerated, disabled }: SampleTranscriptMenuProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTemplateSelect = (type: keyof typeof SAMPLE_TEMPLATES) => {
    onSampleGenerated(SAMPLE_TEMPLATES[type]);
    toast({
      title: "Sample loaded",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} scenario transcript ready to analyze.`,
    });
  };

  const handleGenerateUnique = async (scenario: string) => {
    setIsGenerating(true);
    setGenerationType(scenario);

    try {
      const { data, error } = await supabase.functions.invoke("cs-triage", {
        body: {
          generateSample: true,
          scenario,
        },
      });

      if (error) {
        if (error.message?.includes("429") || error.context?.status === 429) {
          throw new Error("Rate limit exceeded. Try a pre-written sample instead.");
        }
        throw error;
      }

      if (data?.transcript) {
        onSampleGenerated(data.transcript);
        toast({
          title: "Unique sample generated",
          description: "AI-generated transcript ready to analyze.",
        });
      }
    } catch (error) {
      console.error("Failed to generate sample:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Try a pre-written sample instead.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationType(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1.5 h-auto py-1 px-2"
          disabled={disabled || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs">Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span className="text-xs">Try a sample</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Quick samples (instant)
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleTemplateSelect("value")} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-emerald-600" />
          <div className="flex flex-col">
            <span className="font-medium">Value & Expansion</span>
            <span className="text-xs text-muted-foreground">Renewal with upsell signals</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTemplateSelect("risk")} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-red-600" />
          <div className="flex flex-col">
            <span className="font-medium">Risk & Escalation</span>
            <span className="text-xs text-muted-foreground">Customer considering churn</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTemplateSelect("internal")} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">Internal Strategy</span>
            <span className="text-xs text-muted-foreground">Team planning discussion</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          AI-generated (unique each time)
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleGenerateUnique("customer-value")} 
          className="gap-2 cursor-pointer"
          disabled={isGenerating}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="font-medium">Generate unique sample</span>
            <span className="text-xs text-muted-foreground">Random scenario via AI</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
