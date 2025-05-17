
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import NewsletterCard from "@/components/NewsletterCard";

const PastNewsletters = () => {
  useEffect(() => {
    document.title = "Past Newsletters | Churn Is Dead";
  }, []);

  // Sample newsletter data - in a real app this would come from an API
  const newsletters = [
    {
      id: 1,
      title: "The 'Trusted Advisor' Trap and How to Escape It",
      excerpt: "Why being a 'strategic partner' is killing your CS outcomes and the data-driven alternative that works.",
      date: "May 10, 2025",
      readTime: "6 min read",
      category: "Strategy",
    },
    {
      id: 2,
      title: "Expansion Revenue: It's Not About 'Land and Expand'",
      excerpt: "How top CS teams are shifting from growth targets to value delivery – and hitting their expansion numbers anyway.",
      date: "May 3, 2025",
      readTime: "8 min read",
      category: "Revenue",
    },
    {
      id: 3,
      title: "Quarterly Business Reviews Are Dead (Try This Instead)",
      excerpt: "The shocking data on why QBRs are failing both you and your customers, plus the framework that's replacing them.",
      date: "April 26, 2025",
      readTime: "5 min read",
      category: "Process",
    },
    {
      id: 4,
      title: "The Customer Health Score Myth",
      excerpt: "Why traditional health scores are misleading and how to build indicators that actually predict behavior.",
      date: "April 19, 2025",
      readTime: "7 min read",
      category: "Metrics",
    },
    {
      id: 5,
      title: "Unlocking the 'Value Gap' Framework",
      excerpt: "How to identify and monetize the space between what customers are paying for and what they could be achieving.",
      date: "April 12, 2025",
      readTime: "6 min read",
      category: "Strategy",
    },
    {
      id: 6,
      title: "Building a CS Career: Beyond the 'Relationship Manager'",
      excerpt: "The skills that differentiate top-performing CS leaders and how to develop them in your team.",
      date: "April 5, 2025",
      readTime: "9 min read",
      category: "Career",
    },
    {
      id: 7,
      title: "Why Your Onboarding Process Is Failing",
      excerpt: "The three critical mistakes most CS teams make in the first 90 days and how to fix them.",
      date: "March 29, 2025",
      readTime: "6 min read",
      category: "Process",
    },
    {
      id: 8,
      title: "From Red to Green: Turning Around At-Risk Accounts",
      excerpt: "A step-by-step playbook for rescuing struggling customers before they churn.",
      date: "March 22, 2025",
      readTime: "7 min read",
      category: "Retention",
    },
  ];

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
              <Button variant="outline" className="bg-white">All</Button>
              <Button variant="ghost">Strategy</Button>
              <Button variant="ghost">Process</Button>
              <Button variant="ghost">Revenue</Button>
              <Button variant="ghost">Metrics</Button>
              <Button variant="ghost">Career</Button>
            </div>
            <div>
              <Button variant="outline" className="gap-2">
                Latest First
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletters Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsletters.map((newsletter) => (
              <NewsletterCard
                key={newsletter.id}
                title={newsletter.title}
                excerpt={newsletter.excerpt}
                date={newsletter.date}
                readTime={newsletter.readTime}
                category={newsletter.category}
              />
            ))}
          </div>
          
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

import NewsletterForm from "@/components/NewsletterForm"; // Add this import at the top
