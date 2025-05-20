
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import { MessageSquare, User, Briefcase, Award, CheckCircle, XCircle } from "lucide-react";
import ContactDialog from "@/components/ContactDialog";

const About = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  useEffect(() => {
    document.title = "Churn Is Dead: Tactical Customer Success That Drives Outcomes";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Discover tactical customer success strategies that drive revenue, trust, and outcomes. Churn Is Dead provides actionable insights for CS leaders.");
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", "Churn Is Dead: Tactical Customer Success That Drives Outcomes");
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", "Discover tactical customer success strategies that drive revenue, trust, and outcomes. Churn Is Dead provides actionable insights for CS leaders.");
    document.querySelector('meta[property="twitter:title"]')?.setAttribute("content", "Churn Is Dead: Tactical Customer Success That Drives Outcomes");
    document.querySelector('meta[property="twitter:description"]')?.setAttribute("content", "Discover tactical customer success strategies that drive revenue, trust, and outcomes. Churn Is Dead provides actionable insights for CS leaders.");
  }, []);

  const scrollToNewsletter = (e: React.MouseEvent) => {
    e.preventDefault();
    const newsletterSection = document.getElementById('newsletter-section');
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-black mb-6 leading-tight">
              CS isn't about fighting churn.<br />
              <span className="text-red-500 text-2xl md:text-4xl">It's about driving revenue, trust, and outcomes.</span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold mb-4">
              This is your roadmap.
            </p>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-10 md:p-14 rounded-xl shadow-lg">
              <p className="text-xl font-medium mb-6 text-navy-dark">
                Churn Is Dead isn't a newsletter. It's a wake-up call.
                <span className="block text-red-600 mt-1">A rejection of fluffy CS thought leadership.</span>
                <span className="block text-navy-dark mt-1">A rallying cry for bold, tactical, outcome-driven execution.</span>
              </p>
              
              <p className="mb-8 text-gray-700">
                After 10+ years in the CS trenches, I saw it all:
              </p>

              <ul className="space-y-5 mb-8 text-lg">
                <li className="flex items-start">
                  <XCircle size={24} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">QBR decks collecting dust</span>
                </li>
                <li className="flex items-start">
                  <XCircle size={24} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Check-ins with no impact</span>
                </li>
                <li className="flex items-start">
                  <XCircle size={24} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Teams chasing renewals, not outcomes</span>
                </li>
              </ul>
              
              <p className="mb-6 text-gray-700 text-lg">
                So I created Churn Is Dead — a space for battle-tested plays, contrarian thinking, and no-BS strategies that actually move the needle.
              </p>
              
              <p className="mb-8 italic border-l-4 border-red-500 pl-4 py-2 font-medium text-lg">
                💥 This isn't about inspiration. It's about implementation.<br />
                Churn isn't your North Star. Value is.
              </p>
              
              <div className="mb-8">
                <h3 className="font-semibold text-red-600 mb-5 text-2xl">Every Tuesday, Here's What Lands in Your Inbox:</h3>
                <ul className="space-y-5 text-lg">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-3 font-bold text-xl">🧠</span>
                    <span>What's broken (and what's actually working) in CS</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-3 font-bold text-xl">📦</span>
                    <span>Frameworks and plays you can run now</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-3 font-bold text-xl">🎤</span>
                    <span>Real stories from CS leaders in the arena (not just "influencers")</span>
                  </li>
                </ul>
              </div>
              
              {/* Mid-page newsletter form with standardized styling */}
              <div id="newsletter-section" className="bg-navy-dark p-8 rounded-lg shadow-md mb-8">
                <NewsletterForm 
                  location="article" 
                  className="max-w-full" 
                  title="Ready to transform your CS approach?"
                  description="Join 2,000+ CS leaders getting fresh insights every Tuesday."
                  buttonVariant="outline-red"
                  textColor="text-white"
                />
              </div>
              
              <p className="font-medium text-navy-dark mb-8 text-lg">
                If you're done chasing renewals…<br />
                If you're ready to lead with clarity, value, and real impact…<br />
                <span className="text-red-600">Then welcome. You're one of us.</span>
              </p>
              
              {/* Added more vertical spacing with mt-12 (was mt-8) */}
              <div className="border-t border-gray-200 pt-6 mt-12">
                <h3 className="text-2xl font-serif font-bold text-red-600 mb-4">Why Now?</h3>
                <p className="text-gray-700 mb-4 text-lg">
                  Customer Success is at a crossroads.
                </p>
                <p className="text-gray-700 mb-4 text-lg">
                  In an era of layoffs, AI overload, and NRR obsession, it's never been more urgent to reset the strategy and reclaim what CS is meant to be:
                  <span className="block font-medium text-navy-dark mt-2 text-lg">
                    A growth engine. A trust accelerator. A business multiplier.
                  </span>
                </p>
                <p className="font-medium text-center text-xl text-red-600 mt-6">
                  That's why Churn Is Dead exists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer - Newsletter form removed */}
      <footer className="py-12 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center pt-8">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-serif font-black mb-2">
                <span className="underline-red">Churn</span> Is Dead
              </h2>
              <p className="text-sm text-gray-300">
                © 2025 Churn Is Dead. All rights reserved.
              </p>
            </div>
            
            <div className="flex gap-6">
              <a 
                href="https://www.linkedin.com/in/kuber-s-79521946/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <button 
                onClick={() => setIsContactOpen(true)} 
                className="text-gray-300 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
                aria-label="Contact Us"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Contact Dialog */}
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
    </div>
  );
};

export default About;
