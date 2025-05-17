
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import TestimonialCard from "@/components/TestimonialCard";
import { MessageSquare, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

  useEffect(() => {
    document.title = "Churn Is Dead | Bold Customer Success Strategies";
  }, []);

  useEffect(() => {
    const fetchLatestNewsletter = async () => {
      try {
        const { data, error } = await supabase
          .from("newsletters")
          .select("*")
          .order("published_date", { ascending: false })
          .limit(1)
          .single();

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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 animate-fade-in">
              Stop Managing Churn.<br />
              <span className="text-red-500">Start Driving Value.</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
              A weekly newsletter for CS pros ready to cut through the fluff and create 
              customer outcomes that matter.
            </p>
            <NewsletterForm className="max-w-lg mx-auto" />
            
            <div className="mt-6 text-sm text-gray-300">
              <p>Join 2,000+ CS leaders getting actionable insights every Tuesday.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Current Newsletter Section */}
      <section id="insights" className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-navy-dark">
              Current Newsletter
            </h2>
            <p className="text-lg text-gray-700 mb-10">
              Tactical CS advice you won't find anywhere else.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">Loading latest newsletter...</p>
            </div>
          ) : latestNewsletter ? (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Latest Newsletter Feature */}
                <div className="md:col-span-3">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
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
                      <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                        {latestNewsletter.excerpt}
                      </p>
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
      </section>
      
      {/* Value Proposition */}
      <section className="py-20 md:py-28 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-red-600 rounded-full p-5 flex-shrink-0">
                <MessageSquare size={32} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  CS is broken. Let's fix it together.
                </h2>
                <p className="text-lg text-gray-200 mb-6">
                  In an industry drowning in platitudes about "customer centricity," we deliver 
                  battle-tested frameworks and contrarian insights that actually move the needle on 
                  outcomes, adoption, and expansion revenue.
                </p>
                <NewsletterForm location="footer" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-cream">
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
      <section className="py-16 md:py-20 bg-red-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
              Ready to transform your Customer Success approach?
            </h2>
            <p className="text-lg mb-8">
              Join the weekly newsletter and get tactical CS insights delivered to your inbox.
            </p>
            <NewsletterForm className="max-w-lg mx-auto" />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-serif font-black mb-2">
                <span className="underline-red">Churn</span> Is Dead
              </h2>
              <p className="text-sm text-gray-300">
                © 2025 Churn Is Dead. All rights reserved.
              </p>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
