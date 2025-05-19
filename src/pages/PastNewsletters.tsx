
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import NewsletterCard from "@/components/NewsletterCard";
import NewsletterForm from "@/components/NewsletterForm";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Handshake, DollarSign, Target } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type Newsletter = {
  id: string;
  title: string;
  excerpt: string;
  published_date: string;
  read_time: string;
  category: string | null;
  slug: string;
};

// Define new category configuration with icons and tooltips
const categoryConfig = [
  {
    id: "All",
    label: "All",
    tooltipText: "View all newsletters",
    filterValue: "All",
  },
  {
    id: "Trust",
    label: "Trust",
    icon: Handshake,
    tooltipText: "Build relationships that retain.",
    filterValue: "Trust",
    color: "bg-blue-500",
  },
  {
    id: "Revenue",
    label: "Revenue",
    icon: DollarSign,
    tooltipText: "Grow accounts without chasing renewals.",
    filterValue: "Revenue",
    color: "bg-green-500",
  },
  {
    id: "Outcomes",
    label: "Outcomes",
    icon: Target,
    tooltipText: "Deliver what matters. Prove it.",
    filterValue: "Outcomes",
    color: "bg-amber-500",
  },
];

const PastNewsletters = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  
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
      
      {/* Hero Section - Updated headline and subtext */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-black mb-6">
              The Library of <span className="text-red-500">No-Fluff CS Plays</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
              Catch up on every edition of Churn Is Dead — built to drive trust, revenue, and real outcomes
            </p>
          </div>
        </div>
      </section>
      
      {/* Filter Section with Icons and Tooltips */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6">
          {/* New section label */}
          <div className="mb-3 text-sm text-gray-600 font-medium">
            Filter by what you're trying to achieve
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 md:pb-0 md:flex-wrap">
              {categoryConfig.map((category) => (
                <TooltipProvider key={category.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={activeFilter === category.filterValue ? "default" : "outline"}
                        className={`${
                          activeFilter === category.filterValue 
                            ? "bg-navy-dark text-white" 
                            : "bg-white border-navy-dark/30 text-navy-dark hover:bg-navy-dark/10"
                        } whitespace-nowrap gap-2`}
                        onClick={() => handleFilterChange(category.filterValue)}
                      >
                        {category.id !== "All" && <category.icon className="h-4 w-4" />}
                        <span>{category.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.tooltipText}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
          
          {/* Improved Load More Button */}
          <div className="mt-16 text-center">
            <Button 
              variant="outline-red"  
              size="lg"
              className="border-red-500 hover:bg-red-50 hover:scale-[1.03] transition-all duration-200 px-8"
            >
              Load More
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="M12 5v14"/>
                <path d="m19 12-7 7-7-7"/>
              </svg>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Newsletter Signup with improved microcopy */}
      <section className="py-16 md:py-20 newsletter-section">
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6 text-white">
              Don't miss the next issue
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Join the weekly newsletter and get tactical CS insights delivered to your inbox.
            </p>
            <div className="max-w-lg mx-auto">
              <NewsletterForm 
                location="footer" 
                buttonVariant="white" 
                textColor="text-white"
                buttonText="Let's Kill Churn" 
                subscribeText="Join 2,000+ CS leaders getting fresh insights every Tuesday." 
              />
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
