
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import NewsletterCard from "@/components/NewsletterCard";
import NewsletterForm from "@/components/NewsletterForm";
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

const PastNewsletters = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Past Newsletters | Churn Is Dead";
  }, []);

  useEffect(() => {
    const fetchNewsletters = async () => {
      setLoading(true);
      try {
        let query = supabase.from("newsletters").select("*").order("published_date", { ascending: false });
        
        if (activeFilter !== "All") {
          query = query.eq("category", activeFilter);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching newsletters:", error);
          return;
        }

        if (data) {
          setNewsletters(data as Newsletter[]);
          
          // Extract unique categories for filters
          if (activeFilter === "All") {
            const uniqueCategories = Array.from(new Set(data.map(item => item.category).filter(Boolean)));
            setCategories(uniqueCategories as string[]);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, [activeFilter]);

  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-black mb-6">
              <span className="text-red-500">Past Newsletters</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
              Catch up on previous editions of Churn Is Dead. Tactical CS advice and frameworks you won't find anywhere else.
            </p>
          </div>
        </div>
      </section>
      
      {/* Filter Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeFilter === "All" ? "outline" : "ghost"} 
                className={activeFilter === "All" ? "bg-white" : ""}
                onClick={() => handleFilterChange("All")}
              >
                All
              </Button>
              
              {categories.map(category => (
                <Button 
                  key={category} 
                  variant={activeFilter === category ? "outline" : "ghost"}
                  className={activeFilter === category ? "bg-white" : ""}
                  onClick={() => handleFilterChange(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            <div>
              <Button variant="outline" className="gap-2">
                Latest First
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletters Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">Loading newsletters...</p>
            </div>
          ) : newsletters.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">No newsletters found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsletters.map(newsletter => (
                <NewsletterCard 
                  key={newsletter.id}
                  title={newsletter.title}
                  excerpt={newsletter.excerpt}
                  date={formatDate(newsletter.published_date)}
                  readTime={newsletter.read_time}
                  category={newsletter.category || undefined}
                  slug={newsletter.slug}
                />
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Button variant="outline" className="border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white">
              Load More
            </Button>
          </div>
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <section className="py-16 md:py-20 bg-red-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
              Don't miss the next issue
            </h2>
            <p className="text-lg mb-8">
              Join the weekly newsletter and get tactical CS insights delivered to your inbox.
            </p>
            <div className="max-w-lg mx-auto">
              <NewsletterForm />
            </div>
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

export default PastNewsletters;
