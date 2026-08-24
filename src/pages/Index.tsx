import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import WaitlistModal from "@/components/WaitlistModal";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import Footer from "@/components/Footer";
import { isPreviewMode } from "@/utils/preview";
import { formatContent as formatNewsletterContent } from "@/utils/formatUtils";
import NewsletterForm from "@/components/NewsletterForm";
import { topicHubs } from "@/data/topicHubs";

// Real reader quotes ONLY. The "What readers say" section renders nothing while
// this list is empty. Add entries as {quote, name, role} when readers give
// permission to be quoted. Never add invented testimonials.
const TESTIMONIALS: { quote: string; name: string; role: string }[] = [];

const FEATURED_REFRESH = {
  title: "Your Digital CS Programme Cannot Tell You Who Needs Help",
  excerpt: "A simple way to see who received your digital journey, who acted, who went quiet, and when a person should step in.",
  category: "Digital Customer Success",
  read_time: "8 min read",
};

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

  useEffect(() => {
    import("@/utils/seoMeta").then(({ applyRouteSeo }) =>
      applyRouteSeo({
        title: "Churn Is Dead | Honest Customer Success Thinking",
        description: "A direct weekly Customer Success newsletter by Kuber Sethi. Honest arguments, useful ways forward, and practical tools for people doing the work.",
        path: "/",
      })
    );

    return () => {
      // The production build prerenders this block into the homepage only.
      // Removing it on client-side navigation prevents homepage identity
      // markup from leaking onto another route. Development has no static block.
      const cleanup = document.querySelector('script[data-seo="homepage-jsonld"]');
      if (cleanup) cleanup.remove();
    };
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
          const first = data[0] as Newsletter;
          setLatestNewsletter(first.slug === "digital-cs-coverage-silence" ? { ...first, ...FEATURED_REFRESH } : first);
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

  // Test newsletter sends removed - use Admin Panel instead

  const formatDate = (dateString: string) => format(new Date(dateString), "MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content">
      
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-navy-dark pb-16 pt-28 text-white md:pb-24 md:pt-36">
        {/* Subtle grain texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />
        
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-gray-300 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-red-500 motion-safe:animate-pulse" />
                New issue every Tuesday
              </div>
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-red-400">Honest Customer Success thinking for people doing the work</p>
              <h1 className="font-serif text-4xl font-black leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
                The CS newsletter that doesn't <span className="text-red-500 italic">sugarcoat it.</span>
              </h1>
              <p className="mb-8 mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">Every Tuesday: one sharp take, a practical way forward, and something useful for your team.</p>
              <div className="max-w-md">
              <NewsletterForm 
                location="hero" 
                buttonVariant="vibrant-red"
                textColor="text-white"
                buttonText="Subscribe"
                subscribeText=""
              />
                <p className="mt-4 text-xs text-gray-400">Free. No gated downloads.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Publication facts" className="border-b border-gray-200 bg-cream/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-y divide-gray-200 py-6 text-center md:grid-cols-4 md:divide-y-0">
            <div className="px-2 pb-4 md:pb-0"><strong className="block text-xl font-serif text-navy-dark">10+ years</strong><span className="text-xs text-gray-600">operating in CS</span></div>
            <div className="px-2"><strong className="block text-xl font-serif text-navy-dark">40+</strong><span className="text-xs text-gray-600">published issues</span></div>
            <div className="px-2 pt-4 md:pt-0"><strong className="block text-xl font-serif text-navy-dark">32</strong><span className="text-xs text-gray-600">practical tools</span></div>
            <div className="px-2 pt-4 md:pt-0"><strong className="block text-xl font-serif text-navy-dark">~8,200</strong><span className="text-xs text-gray-600">LinkedIn followers</span></div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6"><div className="mx-auto max-w-5xl">
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.22em] text-red-600">Choose your route in</p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["I run accounts", "For CSMs working out what to do next with a real customer.", "/start#run-accounts"],
              ["I lead the function", "For leaders building a clearer, more useful CS function.", "/start#lead-function"],
              ["I am moving into leadership", "For operators ready to lead with judgment, not just activity.", "/start#move-into-leadership"],
            ].map(([title, copy, href], index) => (
              <Link key={title} to={href} className="group rounded-2xl border border-gray-200 p-5 transition-all hover:-translate-y-0.5 hover:border-red-300 hover:shadow-sm"><span className="font-serif text-xl font-black text-red-600">0{index + 1}</span><h2 className="mt-4 font-sans text-base font-bold text-navy-dark group-hover:text-red-600">{title}</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">{copy}</p></Link>
            ))}
          </div>
        </div></div>
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
              <div className="py-16 text-center text-gray-600">Loading...</div>
            ) : latestNewsletter ? (
              <Link to={`/newsletter/${latestNewsletter.slug}`} className="group block">
                <article>
                  {latestNewsletter.category && (
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-3 block">
                      {latestNewsletter.category}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-4 leading-tight group-hover:text-red-600 transition-colors duration-200">
                    {latestNewsletter.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-5">
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
              <div className="py-16 text-center text-gray-600">No newsletters yet.</div>
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
                        <p className="text-sm text-gray-600 mt-1.5">
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
              No fluff. No "just checking in." Just a hard question, a useful way to think about it, and something you can put to work.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-3xl font-serif font-black text-red-600 mb-2">01</div>
                <h3 className="font-semibold text-navy-dark mb-1.5">The Hard Truth</h3>
                <p className="text-sm text-gray-500 leading-relaxed">A direct argument with visible sourcing when it relies on external facts.</p>
              </div>
              <div>
                <div className="text-3xl font-serif font-black text-red-600 mb-2">02</div>
                <h3 className="font-semibold text-navy-dark mb-1.5">A Way Forward</h3>
                <p className="text-sm text-gray-500 leading-relaxed">A clear approach you can adapt to the team and customers you actually have.</p>
              </div>
              <div>
                <div className="text-3xl font-serif font-black text-red-600 mb-2">03</div>
                <h3 className="font-semibold text-navy-dark mb-1.5">Something Useful</h3>
                <p className="text-sm text-gray-500 leading-relaxed">A checklist, worksheet, or review you can use without handing over your email.</p>
              </div>
            </div>

            {/* Vault lead magnet */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-navy-dark mb-1">The Playbook Vault is open.</h3>
                <p className="text-sm text-gray-500">Browse practical checklists, audits, and worksheets. No gatekeeping and no email required.</p>
              </div>
              <Link
                to="/playbook"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-navy-dark text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Browse the Vault
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-cream/30 py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-red-600">Find what helps</p>
                <h2 className="font-serif text-3xl font-black text-navy-dark md:text-4xl">Start with the problem you are facing.</h2>
              </div>
              <Link to="/topics" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">Explore all topics <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {topicHubs.map((topic, index) => (
                <Link key={topic.slug} to={`/topics/${topic.slug}`} className="group rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-red-300">
                  <div className="flex gap-4">
                    <span className="font-serif text-2xl font-black text-red-600">0{index + 1}</span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-navy-dark transition-colors group-hover:text-red-600">{topic.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{topic.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-cream/30 py-14 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-7 md:flex-row md:items-center">
            <div aria-hidden="true" className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-navy-dark font-serif text-xl font-black text-white">KS</div>
            <div className="flex-1">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-red-600">Written by Kuber Sethi</p>
              <h2 className="mb-2 text-2xl font-serif font-black text-navy-dark">Strong opinions. Honest evidence. Useful help.</h2>
              <p className="text-sm leading-relaxed text-gray-600">Churn Is Dead takes difficult CS questions, says what most teams avoid, and gives you a practical next step.</p>
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">Why it exists <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* ── WHAT READERS SAY (renders only when real quotes exist) ── */}
      {TESTIMONIALS.length > 0 && (
        <section className="py-16 md:py-24 border-t border-gray-100 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-black text-navy-dark mb-10">
                What readers say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg border border-gray-100">
                    <p className="text-gray-700 leading-relaxed mb-4">"{t.quote}"</p>
                    <p className="text-sm font-semibold text-navy-dark">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ── */}
      <section className="py-16 md:py-20 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-black mb-3">
              Stop hoping your accounts renew.
            </h2>
            <p className="text-gray-400 mb-8">
              Start doing the work that makes renewals less surprising.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterForm 
                location="footer" 
                buttonVariant="vibrant-red"
                textColor="text-white"
                buttonText="Subscribe"
                subscribeText=""
              />
              <p className="text-sm text-gray-400 mt-4">The weekly issue and practical tools remain free.</p>
            </div>
          </div>
        </div>
      </section>
      </main>
      
      <Footer />
      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} source="homepage" />
    </div>
  );
};

export default Index;
