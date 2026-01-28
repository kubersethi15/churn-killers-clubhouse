import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, CheckCircle, Users, Zap, BarChart3 } from "lucide-react";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
}

const ROLE_OPTIONS = [
  { value: "csm", label: "Customer Success Manager" },
  { value: "cs_manager", label: "CS Manager" },
  { value: "cs_director", label: "CS Director" },
  { value: "vp_cs", label: "VP of Customer Success" },
  { value: "cro", label: "CRO" },
  { value: "other", label: "Other" },
];

const WaitlistModal = ({ open, onOpenChange, source = "homepage" }: WaitlistModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !role) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("waitlist")
        .insert([{ name: name.trim(), email: email.trim().toLowerCase(), role, source }]);

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - email already exists
          toast({
            title: "Already on the list",
            description: "You're already on the waitlist. We'll be in touch soon!",
          });
          setIsSuccess(true);
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "You're on the list!",
          description: "We'll notify you when CS Analyzer is ready.",
        });
      }
    } catch (error: any) {
      console.error("Waitlist signup error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setName("");
    setEmail("");
    setRole("");
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Panel - Value Proposition */}
          <div className="bg-navy-dark text-white p-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red/20 rounded-full mb-6 w-fit">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Coming Soon</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              CS Analyzer
            </h2>
            <p className="text-gray-300 mb-6">
              AI-powered analysis for your call transcripts, QBR decks, and success plans. 
              Get instant insights and actionable next steps.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Instant Risk Detection</p>
                  <p className="text-sm text-gray-400">Identify churn signals before it's too late</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Stakeholder Mapping</p>
                  <p className="text-sm text-gray-400">Understand power dynamics and sentiment</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Action Plans</p>
                  <p className="text-sm text-gray-400">Get prioritized next steps with owners</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Right Panel - Form */}
          <div className="p-8 bg-white">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-serif font-bold text-navy-dark">
                {isSuccess ? "You're In!" : "Get Early Access"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {isSuccess 
                  ? "Thanks for joining! We'll notify you as soon as CS Analyzer is ready."
                  : "Be the first to try CS Analyzer when it launches."
                }
              </DialogDescription>
            </DialogHeader>
            
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-gray-600 mb-6">
                  We'll reach out soon with exclusive early access.
                </p>
                <Button onClick={handleClose} variant="outline" className="w-full">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="waitlist-name">Name</Label>
                  <Input
                    id="waitlist-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="waitlist-email">Email</Label>
                  <Input
                    id="waitlist-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="waitlist-role">Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger id="waitlist-role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </Button>
                
                <p className="text-xs text-center text-gray-500">
                  No spam, ever. We'll only email you about CS Analyzer.
                </p>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
