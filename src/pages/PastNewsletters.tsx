import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { supabase } from "@/integrations/supabase/client";
import { isPreviewMode } from "@/utils/preview";
import { format } from "date-fns";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { problemDomainFor, PROBLEM_DOMAINS } from "@/data/publicationTaxonomy";
import { topicHubs } from "@/data/topicHubs";

type Newsletter = {
  id: string;
  title: string;
  excerpt: string;
  published_date: string;
  read_time: string;
  category: string | null;
  slug: string;
};

const PastNewsletters = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(18);
  
  useEffect(() => {
    import("@/utils/seoMeta").then(({ applyRouteSeo }) =>
      applyRouteSeo({
        title: "All Issues | Churn Is Dead Newsletter Archive",
        description: "Every issue of Churn Is Dead. Honest Customer Success arguments and practical help for experienced CS people, by Kuber Sethi.",
        path: "/newsletters",
      })
    );
  }, []);

  useEffect(() => {
    const fetchNewsletters = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("newsletters")
          .select("*")
          .order("published_date", { ascending: false });
        if (!isPreviewMode()) {
          query = query.lte("published_date", new Date().toISOString());
        }
        const [{ data, error }, staticResponse] = await Promise.all([
          query,
          fetch("/newsletter/catalog.json").catch(() => null),
        ]);
        
        if (error) {
          console.error("Error fetching newsletters:", error);
          return;
        }
        const staticRows = staticResponse?.ok ? await staticResponse.json() as Newsletter[] : [];
        const merged = new Map<string, Newsletter>();
        for (const row of (data ?? []) as Newsletter[]) merged.set(row.slug, row);
        for (const row of staticRows) merged.set(row.slug, row);
        setNewsletters([...merged.values()].sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime()));
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  const formatDate = (dateString: string) => format(new Date(dateString), "MMM d, yyyy");

  const categories = PROBLEM_DOMAINS;
  const filtered = newsletters.filter(item => {
    const matchesCategory = category === "All" || problemDomainFor(item) === category;
    const haystack = `${item.title} ${item.excerpt} ${item.category ?? ""}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  });
  const visible = filtered.slice(0, visibleCount);

  // Group the visible result set by year-month.
  const grouped = visible.reduce<Record<string, Newsletter[]>>((acc, nl) => {
    const key = format(new Date(nl.published_date), "MMMM yyyy");
    if (!acc[key]) acc[key] = [];
    acc[key].push(nl);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f3efe7]">
      <Header />
      <main id="main-content">
      
      {/* Header */}
      <section className="editorial-grid-dark relative overflow-hidden border-b border-white/15 bg-navy-dark pb-14 pt-28 text-white md:pb-20 md:pt-40">
        <div className="signal-orbit opacity-40" aria-hidden="true" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative mx-auto max-w-[1100px]">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-red-400">The complete archive</p>
            <h1 className="font-serif text-6xl font-black uppercase leading-[0.82] tracking-[-0.065em] md:text-8xl lg:text-9xl">
              All Issues
            </h1>
            <p className="mt-8 max-w-xl border-l-2 border-red-500 pl-5 text-lg leading-relaxed text-white/65 md:text-xl">
              Browse every issue, or search for the problem you are working on.
            </p>
          </div>
        </div>
      </section>
      
      {/* Newsletter List */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {newsletters.length > 0 && (
              <section aria-labelledby="editor-picks" className="mb-12">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-red-600">Best place to start</p>
                <h2 id="editor-picks" className="max-w-2xl font-serif text-3xl font-black uppercase leading-tight tracking-[-0.035em] text-navy-dark md:text-4xl">Three issues that show how Churn Is Dead works.</h2>
                <div className="mt-7 grid border-y-2 border-navy-dark sm:grid-cols-3 sm:divide-x sm:divide-navy-dark/20">
                  {topicHubs.slice(0, 3).map((topic) => {
                    const pick = newsletters.find(item => item.slug === topic.reads[0]?.slug);
                    return pick ? <Link key={pick.slug} to={`/newsletter/${pick.slug}`} className="group min-h-[210px] p-5 transition-colors hover:bg-white"><span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Recommended</span><h3 className="mt-5 font-serif text-xl font-black leading-tight text-navy-dark group-hover:text-red-600">{pick.title}</h3><p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-gray-500">{problemDomainFor(pick)}</p></Link> : null;
                  })}
                </div>
              </section>
            )}
            <div className="mb-14 min-h-[365px] border-2 border-navy-dark bg-white p-5 shadow-[8px_8px_0_0_hsl(var(--red))] sm:min-h-[250px] md:p-7">
              {loading ? (
                <div className="animate-pulse" aria-hidden="true">
                  <div className="mb-4 h-3 w-24 rounded bg-gray-200" />
                  <div className="mb-4 h-12 rounded bg-white" />
                  <div className="flex flex-wrap gap-2">
                    {[72, 110, 128, 84, 102, 118, 74, 132].map((width, index) => <div key={index} className="h-8 rounded-full bg-white" style={{ width }} />)}
                  </div>
                </div>
              ) : newsletters.length > 0 ? (
                <>
                <label htmlFor="issue-search" className="text-xs font-bold uppercase tracking-widest text-navy-dark">Find an issue</label>
                <div className="relative mt-3">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="issue-search"
                    type="search"
                    value={query}
                    onChange={event => { setQuery(event.target.value); setVisibleCount(18); }}
                    placeholder="Renewals, QBRs, risk, AI, expansion..."
                    className="h-12 bg-white pl-11"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by topic">
                  {categories.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => { setCategory(item); setVisibleCount(18); }}
                      aria-pressed={category === item}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${category === item ? "bg-navy-dark text-white" : "border border-gray-200 bg-white text-gray-700 hover:border-navy-dark"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-600" aria-live="polite">{filtered.length} {filtered.length === 1 ? "issue" : "issues"} found</p>
                </>
              ) : (
                <p className="text-sm text-gray-600">The archive is loading.</p>
              )}
            </div>
            {loading ? (
              <div className="space-y-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 w-3/4 bg-gray-100 rounded mb-2" />
                    <div className="h-4 w-1/3 bg-gray-50 rounded" />
                  </div>
                ))}
              </div>
            ) : newsletters.length === 0 ? (
              <p className="text-gray-600 py-16 text-center">No issues published yet.</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-600 py-16 text-center">No issue matches that search. Try a broader topic.</p>
            ) : (
              <div className="space-y-14">
                {Object.entries(grouped).map(([monthYear, items]) => (
                  <div key={monthYear}>
                    {/* Month label */}
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600">{monthYear}</h2>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Issues in this month */}
                    <div className="space-y-0 divide-y divide-gray-100">
                      {items.map((nl) => (
                        <Link 
                          key={nl.id}
                          to={`/newsletter/${nl.slug}`}
                          className="group block py-5 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {nl.category && (
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600 mb-1 block">
                                  {problemDomainFor(nl)}
                                </span>
                              )}
                              <h3 className="font-serif text-2xl font-black leading-tight tracking-[-0.025em] text-navy-dark transition-colors duration-200 group-hover:text-red-600 md:text-3xl">
                                {nl.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDate(nl.published_date)} · {nl.read_time}
                              </p>
                              {nl.excerpt && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                  {nl.excerpt}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-red-600 mt-1.5 flex-shrink-0 transition-colors duration-200" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                {visibleCount < filtered.length && (
                  <div className="pt-2 text-center">
                    <button onClick={() => setVisibleCount(count => count + 18)} className="rounded-lg border border-navy-dark px-5 py-2.5 text-sm font-semibold text-navy-dark hover:bg-navy-dark hover:text-white">
                      Show more issues
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="editorial-grid-dark border-t border-white/15 bg-navy-dark py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-4xl font-black uppercase leading-none tracking-[-0.045em] text-white md:text-6xl">
              Don't miss the next one.
            </h2>
            <p className="text-gray-400 mb-8">
              New issue every Tuesday. Free. No spam. Unsubscribe anytime.
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
      </main>
      
      <Footer />
    </div>
  );
};

export default PastNewsletters;
