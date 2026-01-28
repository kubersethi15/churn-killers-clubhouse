import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import TestimonialCard from "@/components/TestimonialCard";
import { MessageSquare, CheckCircle, BookText, LogIn, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ContactDialog from "@/components/ContactDialog";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import { isPreviewMode } from "@/utils/preview";
import { formatContent as formatNewsletterContent } from "@/utils/formatUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Newsletter = {
  id: string;
  title: string;
  excerpt: string;
  published_date: string;
  read_time: string;
  category: string | null;
  slug: string;
};

const Index = () => {
  const [latestNewsletter, setLatestNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const showAdmin = searchParams.get('admin') === 'true';
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Churn Is Dead | Bold Customer Success Strategies";
  }, []);

  useEffect(() => {
    const fetchLatestNewsletter = async () => {
      try {
        let query = supabase
          .from("newsletters")
          .select("*")
          .order("published_date", { ascending: false })
          .limit(1);
        if (!isPreviewMode()) {
          query = query.lte("published_date", new Date().toISOString());
        }
        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error("Error fetching newsletters:", error);
          return;
        }

        if (data) {
          setLatestNewsletter(data as Newsletter);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNewsletter();
  }, []);

  // Optional: trigger test send via query params ?sendTest=1&email=...
  useEffect(() => {
    const shouldSend = searchParams.get('sendTest') === '1';
    const email = searchParams.get('email');
    const key = `newsletter_test_sent_${email}`;
    if (shouldSend && email) {
      const already = localStorage.getItem(key);
      if (already) return;
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke('send-latest-newsletter', {
            body: { testEmail: email },
          });
          if (error) throw error;
          toast({
            title: "Test newsletter sent",
            description: `Sent to ${email}. Check your inbox.`,
          });
          console.log("send-latest-newsletter response", data);
          localStorage.setItem(key, 'true');
        } catch (err: any) {
          console.error("Failed to send test newsletter", err);
          toast({
            title: "Send failed",
            description: err?.message || "Please try again.",
            variant: "destructive",
          });
        }
      })();
    }
  }, [searchParams, toast]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section id="newsletter-section" className="pt-32 pb-20 md:pt-40 md:pb-28 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 animate-fade-in">
              Stop Managing Churn.<br />
              <span className="text-red-500">Start Driving Value.</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
              Weekly insights, AI-powered tools, and battle-tested frameworks for CS pros 
              ready to cut the fluff and drive real outcomes.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium"
                  asChild
                >
                  <Link to="/cs-analyzer">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Open CS Analyzer
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/50 bg-transparent text-white hover:bg-white hover:text-navy-dark"
                  asChild
                >
                  <Link to="/newsletters">
                    Read Newsletter →
                  </Link>
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-medium"
                onClick={() => navigate("/auth")}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Join Free — Get Newsletter + Tools
              </Button>
            )}
            
            <div className="mt-6 text-sm text-gray-300">
              <p>Join CS leaders getting tactical insight every Tuesday.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Content Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-dark mb-10 flex items-center">
              <span className="mr-2">🔥</span> This Week's Tactical Play
            </h2>
            
            {loading ? (
              <div className="text-center py-16">
                <p className="text-lg text-gray-600">Loading latest newsletter...</p>
              </div>
            ) : latestNewsletter ? (
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Latest Newsletter Feature */}
                  <div className="md:col-span-3">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-lg">
                      <div className="p-6 md:p-8">
                        {latestNewsletter.category && (
                          <div className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider text-red-600 bg-red-50 rounded-md mb-4">
                            {latestNewsletter.category}
                          </div>
                        )}
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-navy-dark mb-3">
                          {latestNewsletter.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <span>{formatDate(latestNewsletter.published_date)}</span>
                          <span>•</span>
                          <span>{latestNewsletter.read_time}</span>
                        </div>
                        <div
                          className="text-gray-700 text-lg mb-6 leading-relaxed article-content"
                          dangerouslySetInnerHTML={{ __html: (latestNewsletter.excerpt ? formatNewsletterContent(latestNewsletter.excerpt) : '') }}
                        />
                        <Button 
                          className="bg-red-600 hover:bg-red-700 text-white"
                          asChild
                        >
                          <Link to={`/newsletter/${latestNewsletter.slug}`}>
                            Read More →
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 text-center">
                  <Button 
                    variant="outline" 
                    className="border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white"
                    asChild
                  >
                    <Link to="/newsletters">
                      View All
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-gray-600">No newsletters available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CS Analyzer Promo Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-navy-dark via-navy to-navy-light text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red/20 rounded-full mb-6">
                  <MessageSquare className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-300">Free AI Tool</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  CS Analyzer
                </h2>
                <p className="text-lg text-gray-300 mb-6">
                  Paste your call transcripts and get instant, AI-powered insights. 
                  Identify risks, uncover opportunities, and get actionable next steps in seconds.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-200">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    Instant risk & opportunity detection
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    Stakeholder mapping & sentiment analysis
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    Ready-to-use follow-up questions
                  </li>
                </ul>
                <Button 
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium"
                  asChild
                >
                  <Link to="/cs-analyzer">
                    Try CS Analyzer Free →
                  </Link>
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Call Transcript Analysis</p>
                        <p className="text-sm text-gray-400">AI-powered insights</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/20 rounded-full w-full" />
                      <div className="h-3 bg-white/20 rounded-full w-4/5" />
                      <div className="h-3 bg-white/20 rounded-full w-3/5" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="bg-green-500/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-green-300">Health</p>
                        <p className="text-lg font-bold text-green-400">Good</p>
                      </div>
                      <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-yellow-300">Risk</p>
                        <p className="text-lg font-bold text-yellow-400">Low</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-blue-300">Actions</p>
                        <p className="text-lg font-bold text-blue-400">4</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rallying Cry Section */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-navy-dark">
              CS is broken. Let's fix it together.
            </h2>
            <div className="text-lg text-gray-700 mb-8 space-y-4">
              <p>You're not crazy.</p>
              <p>QBR decks gather dust.</p>
              <p>Check-ins don't drive outcomes.</p>
              <p>Teams are chasing renewals instead of value.</p>
            </div>
            <p className="text-lg text-gray-700 mb-8">
              Churn Is Dead is your weekly roadmap to a better way with battle-tested frameworks, bold plays, and no-BS execution tactics that work.
            </p>
            <Button 
              variant="vibrant-red" 
              size="lg"
              className="font-medium"
              asChild
            >
              <Link to="/newsletters">
                Get the Playbook →
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* What You'll Get Section */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-navy-dark">
              Here's what lands in your inbox every Tuesday:
            </h2>
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <CheckCircle className="text-red-500 flex-shrink-0 mt-1" />
                <p className="text-lg text-navy-dark">What's broken in CS — and what's working</p>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="text-red-500 flex-shrink-0 mt-1" />
                <p className="text-lg text-navy-dark">Frameworks you can run today</p>
              </div>
              <div className="flex items-start gap-4">
                <BookText className="text-red-500 flex-shrink-0 mt-1" />
                <p className="text-lg text-navy-dark">Real stories from CS leaders in the arena</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-navy-dark">
              What CS Leaders Are Saying
            </h2>
            <p className="text-lg text-gray-700">
              Don't take our word for it. See what your peers think.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TestimonialCard 
              quote="Finally, CS content that doesn't just repeat the same tired advice. The framework on driving expansion from the value gap completely changed our approach."
              author="Sarah Jennings"
              role="VP of Customer Success"
              company="SaaS Corp"
            />
            <TestimonialCard 
              quote="As a CS leader building a team from scratch, this newsletter has been my secret weapon. Practical, no-nonsense advice I can implement immediately."
              author="David Chen"
              role="Director of Customer Success"
              company="GrowthTech"
            />
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-red-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
              Ready to lead with clarity, value, and real impact?
            </h2>
            <p className="text-lg mb-8">
              Join CS leaders getting battle-tested plays and AI tools to drive real outcomes.
            </p>
            {user ? (
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-600 font-medium"
                asChild
              >
                <Link to="/cs-analyzer">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Open CS Analyzer
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 font-medium"
                onClick={() => navigate("/auth")}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Join Free →
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Use the consistent Footer component */}
      <Footer />
      
      {/* Hidden Admin Panel */}
      {showAdmin && <AdminPanel />}
    </div>
  );
};

export default Index;
