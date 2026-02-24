import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import WaitlistModal from "@/components/WaitlistModal";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import Footer from "@/components/Footer";
import { isPreviewMode } from "@/utils/preview";
import { formatContent as formatNewsletterContent } from "@/utils/formatUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import NewsletterForm from "@/components/NewsletterForm";

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
  const [recentNewsletters, setRecentNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Churn Is Dead | Weekly CS Frameworks That Replace Hope With Strategy";
  }, []);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        let query = supabase
          .from("newsletters")
          .select("*")
          .order("published_date", { ascending: false })
          .limit(4);
        if (!isPreviewMode()) {
          query = query.lte("published_date", new Date().toISOString());
        }
        const { data, error } = await query;

        if (error) {
          console.error("Error fetching newsletters:", error);
          return;
        }

        if (data && data.length > 0) {
          setLatestNewsletter(data[0] as Newsletter);
          setRecentNewsletters(data.slice(1) as Newsletter[]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  // Optional: trigger test send via query params
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
          toast({ title: "Test newsletter sent", description: `Sent to ${email}.` });
          localStorage.setItem(key, 'true');
        } catch (err: any) {
          console.error("Failed to send test newsletter", err);
          toast({ title: "Send failed", description: err?.message || "Please try again.", variant: "destructive" });
        }
      })();
    }
  }, [searchParams, toast]);

  const formatDate = (dateString: string) => format(new Date(dateString), "MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* ── HERO ── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-navy-dark text-white relative overflow-hidden">
        {/* Subtle grain texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-8 text-sm text-gray-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              New issue every Tuesday
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black mb-6 leading-[1.05] tracking-tight">
              The CS newsletter<br />
              that doesn't<br />
              <span className="text-red-500 italic">sugarcoat it.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg mx-auto leading-relaxed">
              Frameworks, hard truths, and tactical plays for CS leaders who'd rather drive outcomes than manage vibes.
            </p>
            
            {/* Subscribe form inline */}
            <div className="max-w-md mx-auto">
              <NewsletterForm 
                location="hero" 
                buttonVariant="vibrant-red"
                textColor="text-white"
                buttonText="Subscribe"
                subscribeText=""
              />
              <p className="text-xs text-gray-400 mt-3">Free. Every Tuesday. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LATEST ISSUE (The Star) ── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-red-600">Latest Issue</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-400">Loading...</div>
            ) : latestNewsletter ? (
              <Link to={`/newsletter/${latestNewsletter.slug}`} className="group block">
                <article>
                  {latestNewsletter.category && (
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3 block">
                      {latestNewsletter.category}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-4 leading-tight group-hover:text-red-600 transition-colors duration-200">
                    {latestNewsletter.title}
                  </h2>
                  <p className="text-sm text-gray-400 mb-5">
                    {formatDate(latestNewsletter.published_date)} · {latestNewsletter.read_time}
                  </p>
                  <div
                    className="text-lg text-gray-600 leading-relaxed mb-6 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: latestNewsletter.excerpt ? formatNewsletterContent(latestNewsletter.excerpt) : '' }}
                  />
                  <span className="inline-flex items-center gap-2 text-red-600 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Read this issue <ArrowRight className="w-4 h-4" />
                  </span>
                </article>
              </Link>
            ) : (
              <div className="py-16 text-center text-gray-400">No newsletters yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── RECENT ISSUES ── */}
      {recentNewsletters.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Recent Issues</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-0 divide-y divide-gray-200">
                {recentNewsletters.map((nl) => (
                  <Link 
                    key={nl.id} 
                    to={`/newsletter/${nl.slug}`} 
                    className="group block py-6 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-serif font-bold text-navy-dark leading-snug group-hover:text-red-600 transition-colors duration-200">
                          {nl.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1.5">
                          {formatDate(nl.published_date)} · {nl.read_time}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-red-600 mt-2 flex-shrink-0 transition-colors duration-200" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200">
                <Button 
                  variant="outline"
                  className="border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white transition-all duration-200"
                  asChild
                >
                  <Link to="/newsletters">
                    View all issues
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── WHAT YOU GET ── */}
      <section className="py-16 md:py-24 border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-black text-navy-dark mb-4">
              Every Tuesday, straight to your inbox.
            </h2>
            <p className="text-lg text-gray-500 mb-10">
              No fluff. No "just checking in." Just the plays that work.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-3xl font-serif font-black text-red-600 mb-2">01</div>
                <h3 className="font-semibold text-navy-dark mb-1.5">The Hard Truth</h3>
                <p className="text-sm text-gray-500 leading-relaxed">What the CS industry gets wrong this week, backed by real examples and data.</p>
              </div>
              <div>
                <div className="text-3xl font-serif font-black text-red-600 mb-2">02</div>
                <h3 className="font-semibold text-navy-dark mb-1.5">The Framework</h3>
                <p className="text-sm text-gray-500 leading-relaxed">A named, actionable framework you can run on your team this week.</p>
              </div>
              <div>
                <div className="text-3xl font-serif font-black text-red-600 mb-2">03</div>
                <h3 className="font-semibold text-navy-dark mb-1.5">The Playbook</h3>
                <p className="text-sm text-gray-500 leading-relaxed">A downloadable audit or diagnostic to measure what actually matters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 md:py-20 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-black mb-3">
              Stop hoping your accounts renew.
            </h2>
            <p className="text-gray-400 mb-8">
              Start running the frameworks that make it inevitable.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterForm 
                location="footer" 
                buttonVariant="vibrant-red"
                textColor="text-white"
                buttonText="Subscribe"
                subscribeText=""
              />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} source="homepage" />
    </div>
  );
};

export default Index;
