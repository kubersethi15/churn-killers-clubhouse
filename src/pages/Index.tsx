import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import TestimonialCard from "@/components/TestimonialCard";
import { MessageSquare, CheckCircle, BookText } from "lucide-react";
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
      <section id="newsletter-section" className="pt-32 pb-20 md:pt-40 md:pb-28 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 animate-fade-in">
              Stop Managing Churn.<br />
              <span className="text-red-500">Start Driving Value.</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
              A weekly newsletter for CS pros ready to cut the fluff and build a customer 
              engine that drives trust, revenue, and real outcomes.
            </p>
            <NewsletterForm 
              className="max-w-lg mx-auto"
              buttonText="Let's Kill Churn →"
            />
            
            <div className="mt-6 text-sm text-gray-300">
              <p>Join 2,000+ CS leaders getting tactical insight every Tuesday.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Content Section - Updated with "This Week's Drop" heading */}
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
        </div>
      </section>
      
      {/* Rallying Cry Section */}
      <section className="py-20 md:py-28 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              CS is broken. Let's fix it — together.
            </h2>
            <div className="text-lg text-gray-200 mb-8 space-y-4">
              <p>You're not crazy.</p>
              <p>QBR decks gather dust.</p>
              <p>Check-ins don't drive outcomes.</p>
              <p>Teams are chasing renewals instead of value.</p>
            </div>
            <p className="text-lg text-gray-200 mb-8">
              Churn Is Dead is your weekly roadmap to a better way — with battle-tested frameworks, bold plays, and no-BS execution tactics that work.
            </p>
            <Button 
              variant="outline-red" 
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
            <NewsletterForm 
              className="max-w-lg mx-auto"
              buttonText="Join the movement →"
              buttonVariant="soft-red"
            />
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
      <section className="py-16 md:py-20 bg-red-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
              Ready to lead with clarity, value, and real impact?
            </h2>
            <p className="text-lg mb-8">
              Join 2,000+ CS leaders getting battle-tested plays in their inbox every Tuesday.
            </p>
            <NewsletterForm 
              className="max-w-lg mx-auto" 
              buttonText="Let's Kill Churn →"
            />
          </div>
        </div>
      </section>
      
      {/* Footer - UPDATED */}
      <footer className="py-12 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-serif font-bold mb-3">
              Stay ahead of the curve
            </h3>
            <p className="text-base text-gray-300 mb-6">
              No fluff. No slides. Just tactical CS insight.
            </p>
            <NewsletterForm 
              location="footer" 
              className="max-w-lg mx-auto" 
              buttonText="Let's Kill Churn →"
            />
            <p className="text-sm mt-3 text-gray-300">
              Join 2,000+ CS leaders getting tactical insight every Tuesday.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
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
