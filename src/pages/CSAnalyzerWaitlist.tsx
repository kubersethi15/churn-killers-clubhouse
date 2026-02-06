import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  CheckCircle, 
  Users, 
  Zap, 
  BarChart3, 
  FileText, 
  Target,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";

const ROLE_OPTIONS = [
  { value: "csm", label: "Customer Success Manager" },
  { value: "cs_manager", label: "CS Manager" },
  { value: "cs_director", label: "CS Director" },
  { value: "vp_cs", label: "VP of Customer Success" },
  { value: "cro", label: "CRO" },
  { value: "other", label: "Other" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Risk Detection",
    description: "AI identifies churn signals, escalation triggers, and sentiment shifts in seconds",
    color: "emerald",
  },
  {
    icon: Users,
    title: "Stakeholder Mapping",
    description: "Visualize power dynamics, influence levels, and relationship health",
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Action Plans",
    description: "Get prioritized 14-day plans with owners, timelines, and success metrics",
    color: "amber",
  },
  {
    icon: Target,
    title: "Risk Scoring",
    description: "Comprehensive risk radar covering renewal, adoption, relationship, and more",
    color: "red",
  },
];

const USE_CASES = [
  {
    icon: FileText,
    title: "Call Transcripts",
    description: "Analyze customer calls to surface hidden risks and opportunities",
  },
  {
    icon: TrendingUp,
    title: "QBR Decks",
    description: "Extract key insights and prepare talking points automatically",
  },
  {
    icon: Target,
    title: "Success Plans",
    description: "Evaluate plan effectiveness and identify gaps",
  },
];

const CSAnalyzerWaitlist = () => {
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
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      
      const { error } = await supabase
        .from("waitlist")
        .insert([{ name: trimmedName, email: trimmedEmail, role, source: "linkedin-landing" }]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already on the list",
            description: "You're already on the waitlist. We'll be in touch soon!",
          });
          setIsSuccess(true);
        } else {
          throw error;
        }
      } else {
        try {
          await supabase.functions.invoke("send-waitlist-email", {
            body: { email: trimmedEmail, name: trimmedName },
          });
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
        
        setIsSuccess(true);
        toast({
          title: "You're on the list!",
          description: "Check your inbox for a confirmation email.",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto flex justify-between items-center px-4 py-3">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-serif font-black text-foreground">
              <span className="text-primary">Churn</span> Is Dead
            </h1>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Value Proposition */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Coming Soon</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                Turn Call Transcripts Into
                <span className="text-primary block">Churn Prevention</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                AI-powered analysis that detects risks, maps stakeholders, and generates 
                action plans from your customer conversations in seconds.
              </p>

              {/* Quick benefits */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">Analysis in 30 seconds</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm">No integrations needed</span>
                </div>
              </div>

              {/* Mobile CTA - shows on mobile only */}
              <div className="lg:hidden">
                <a href="#signup-form" className="inline-flex">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    Get Early Access
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Right - Signup Form */}
            <div id="signup-form" className="bg-card border border-border rounded-2xl shadow-xl p-8 max-w-md mx-auto lg:mx-0 w-full">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
                    You're In!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Thanks for joining the waitlist. We'll reach out with exclusive early access soon.
                  </p>
                  <Link to="/">
                    <Button variant="outline" className="w-full">
                      Explore Churn Is Dead
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                    Get Early Access
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Be first in line when CS Analyzer launches
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={setRole} required>
                        <SelectTrigger id="role" className="h-11">
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
                      className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Joining..." : "Join Waitlist"}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      No spam. We'll only email you about CS Analyzer.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              What CS Analyzer Does
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste a transcript. Get instant intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  feature.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    feature.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                    feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    feature.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Analyze Any CS Content
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Works with transcripts, documents, and more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {USE_CASES.map((useCase, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <useCase.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Ready to Stop Churn Before It Starts?
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
            Join the waitlist and be first to transform how you analyze customer conversations.
          </p>
          <a href="#signup-form">
            <Button 
              size="lg" 
              variant="secondary"
              className="font-medium gap-2"
            >
              Get Early Access
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <span className="font-serif font-bold">Churn Is Dead</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Customer Success resources for modern CS teams
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CSAnalyzerWaitlist;
