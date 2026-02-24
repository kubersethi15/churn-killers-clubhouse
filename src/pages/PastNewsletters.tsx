import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { supabase } from "@/integrations/supabase/client";
import { isPreviewMode } from "@/utils/preview";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

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
  
  useEffect(() => {
    document.title = "All Issues | Churn Is Dead";
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
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching newsletters:", error);
          return;
        }
        if (data) {
          setNewsletters(data as Newsletter[]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  const formatDate = (dateString: string) => format(new Date(dateString), "MMM d, yyyy");

  // Group newsletters by year-month
  const grouped = newsletters.reduce<Record<string, Newsletter[]>>((acc, nl) => {
    const key = format(new Date(nl.published_date), "MMMM yyyy");
    if (!acc[key]) acc[key] = [];
    acc[key].push(nl);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header */}
      <section className="pt-28 pb-10 md:pt-36 md:pb-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-3">
              All Issues
            </h1>
            <p className="text-lg text-gray-400">
              Every framework, hard truth, and tactical play we've published.
            </p>
          </div>
        </div>
      </section>
      
      {/* Newsletter List */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
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
              <p className="text-gray-400 py-16 text-center">No issues published yet.</p>
            ) : (
              <div className="space-y-14">
                {Object.entries(grouped).map(([monthYear, items]) => (
                  <div key={monthYear}>
                    {/* Month label */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{monthYear}</span>
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
                                  {nl.category}
                                </span>
                              )}
                              <h3 className="text-lg md:text-xl font-serif font-bold text-navy-dark leading-snug group-hover:text-red-600 transition-colors duration-200">
                                {nl.title}
                              </h3>
                              <p className="text-sm text-gray-400 mt-1">
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
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-14 md:py-20 bg-navy-dark">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-white mb-3">
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
      
      <Footer />
    </div>
  );
};

export default PastNewsletters;
