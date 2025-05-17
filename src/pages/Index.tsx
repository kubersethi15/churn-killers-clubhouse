import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import ArticleCard from "@/components/ArticleCard";
import TestimonialCard from "@/components/TestimonialCard";
import { MessageSquare } from "lucide-react";
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
  const [latestNewsletters, setLatestNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Churn Is Dead | Bold Customer Success Strategies";
  }, []);

  useEffect(() => {
    const fetchLatestNewsletters = async () => {
      try {
        const { data, error } = await supabase
          .from("newsletters")
          .select("*")
          .order("published_date", { ascending: false })
          .limit(3);

        if (error) {
          console.error("Error fetching newsletters:", error);
          return;
        }

        if (data) {
          setLatestNewsletters(data as Newsletter[]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNewsletters();
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
      
      {/* Insights Section */}
      <section id="insights" className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-navy-dark">
              Latest Insights
            </h2>
            <p className="text-lg text-gray-700">
              Tactical CS advice you won't find anywhere else.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-16">
                <p className="text-lg text-gray-600">Loading latest newsletters...</p>
              </div>
            ) : (
              latestNewsletters.map(newsletter => (
                <ArticleCard
                  key={newsletter.id}
                  title={newsletter.title}
                  excerpt={newsletter.excerpt}
                  date={formatDate(newsletter.published_date)}
                  readTime={newsletter.read_time}
                  category={newsletter.category || undefined}
                  slug={newsletter.slug}
                />
              ))
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              variant="outline" 
              className="border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white"
              asChild
            >
              <Link to="/newsletters">
                View All Insights
              </Link>
            </Button>
          </div>
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
      
      {/* About Section */}
      <section id="about" className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-navy-dark text-center">
              About Churn Is Dead
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p>
                After 15+ years in Customer Success leadership roles across B2B SaaS, I was tired of 
                watching smart CS professionals struggle with recycled advice that never moved the needle
                on what really matters: customer outcomes and revenue growth.
              </p>
              
              <p>
                Churn Is Dead was born from the belief that CS needs to stop defining itself by what it 
                prevents (churn) and start focusing on what it creates: value, trust, and sustainable growth.
              </p>
              
              <p>
                Each week, I share tactical frameworks, contrarian perspectives, and real case studies 
                that help CS professionals at every level drive better results in less time.
              </p>
              
              <p>
                No fluff. No platitudes. Just practical, battle-tested insights from the CS trenches.
              </p>
              
              <div className="mt-8 p-6 bg-gray-100 rounded-lg">
                <h3 className="font-serif font-bold text-xl mb-3 text-navy-dark">About the Author</h3>
                <p className="mb-0">
                  <strong>Alex Mitchell</strong> has led Customer Success teams at companies including 
                  [Company Name], [Company Name], and [Company Name], where he helped scale CS organizations 
                  and develop strategies that consistently increased NRR by 15-25%. He regularly speaks on 
                  CS strategy at industry events including [Conference Name] and [Conference Name].
                </p>
              </div>
            </div>
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
