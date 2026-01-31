import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FeedbackButtonProps {
  analysisId?: string;
}

const RatingScale = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  label: string;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="flex gap-2"
    >
      {[1, 2, 3, 4, 5].map((num) => (
        <div key={num} className="flex flex-col items-center gap-1">
          <RadioGroupItem
            value={num.toString()}
            id={`${label}-${num}`}
            className="peer sr-only"
          />
          <Label
            htmlFor={`${label}-${num}`}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-muted bg-background text-sm font-medium transition-colors hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
          >
            {num}
          </Label>
        </div>
      ))}
    </RadioGroup>
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Poor</span>
      <span>Excellent</span>
    </div>
  </div>
);

export const FeedbackButton = ({ analysisId }: FeedbackButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [easeOfUse, setEaseOfUse] = useState("");
  const [analysisAccuracy, setAnalysisAccuracy] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState("");
  const [mostUseful, setMostUseful] = useState("");
  const [improvements, setImprovements] = useState("");
  const [bugs, setBugs] = useState("");
  const [additional, setAdditional] = useState("");

  const resetForm = () => {
    setEaseOfUse("");
    setAnalysisAccuracy("");
    setWouldRecommend("");
    setMostUseful("");
    setImprovements("");
    setBugs("");
    setAdditional("");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    if (!easeOfUse && !analysisAccuracy && !wouldRecommend && !improvements && !bugs && !additional) {
      toast({
        title: "Feedback required",
        description: "Please provide at least one rating or comment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("cs_analyzer_feedback").insert({
        user_id: user.id,
        analysis_id: analysisId || null,
        ease_of_use: easeOfUse ? parseInt(easeOfUse) : null,
        analysis_accuracy: analysisAccuracy ? parseInt(analysisAccuracy) : null,
        would_recommend: wouldRecommend ? parseInt(wouldRecommend) : null,
        most_useful_feature: mostUseful || null,
        improvement_suggestions: improvements || null,
        bugs_encountered: bugs || null,
        additional_comments: additional || null,
      });

      if (error) throw error;

      toast({
        title: "Thanks for your feedback! 🙏",
        description: "Your input helps us improve CS Analyzer.",
      });

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 gap-2 shadow-lg"
        size="lg"
      >
        <MessageSquarePlus className="h-5 w-5" />
        Give Feedback
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
              CS Analyzer Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve! Your feedback shapes the future of this tool.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <RatingScale
              label="Ease of Use"
              value={easeOfUse}
              onChange={setEaseOfUse}
            />

            <RatingScale
              label="Analysis Accuracy"
              value={analysisAccuracy}
              onChange={setAnalysisAccuracy}
            />

            <RatingScale
              label="Would Recommend"
              value={wouldRecommend}
              onChange={setWouldRecommend}
            />

            <div className="space-y-2">
              <Label htmlFor="mostUseful">What was most useful?</Label>
              <Textarea
                id="mostUseful"
                placeholder="e.g., Risk signals, stakeholder map..."
                value={mostUseful}
                onChange={(e) => setMostUseful(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="improvements">What could be improved?</Label>
              <Textarea
                id="improvements"
                placeholder="Features, UI, analysis quality..."
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bugs">Any bugs encountered?</Label>
              <Textarea
                id="bugs"
                placeholder="Describe any issues you faced..."
                value={bugs}
                onChange={(e) => setBugs(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional">Additional comments</Label>
              <Textarea
                id="additional"
                placeholder="Anything else you'd like to share..."
                value={additional}
                onChange={(e) => setAdditional(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
