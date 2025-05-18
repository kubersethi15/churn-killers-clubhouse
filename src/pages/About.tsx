
import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import NewsletterForm from "@/components/NewsletterForm";
import { Link } from "react-router-dom";
import { MessageSquare, User, Briefcase, Award, CheckCircle, XCircle } from "lucide-react";

const About = () => {
  useEffect(() => {
    document.title = "Churn Is Dead: Tactical Customer Success That Drives Outcomes";
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Ditch the fluff. Churn Is Dead gives you bold, battle-tested CS strategy every Tuesday — built for growth, not just retention.");
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = "Ditch the fluff. Churn Is Dead gives you bold, battle-tested CS strategy every Tuesday — built for growth, not just retention.";
      document.head.appendChild(meta);
    }
    // Add Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', "Churn Is Dead: Tactical Customer Success That Drives Outcomes");
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = "Churn Is Dead: Tactical Customer Success That Drives Outcomes";
      document.head.appendChild(meta);
    }
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', "Ditch the fluff. Churn Is Dead gives you bold, battle-tested CS strategy every Tuesday — built for growth, not just retention.");
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = "Ditch the fluff. Churn Is Dead gives you bold, battle-tested CS strategy every Tuesday — built for growth, not just retention.";
      document.head.appendChild(meta);
    }
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
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg">
              <p className="text-xl font-medium mb-6 text-navy-dark">
                Churn Is Dead isn't a newsletter. It's a wake-up call.
                <span className="block text-red-600 mt-1">A rejection of fluffy CS thought leadership.</span>
                <span className="block text-navy-dark mt-1">A rallying cry for bold, tactical, outcome-driven execution.</span>
              </p>
              
              <p className="mb-8 text-gray-700">
                After 10+ years in the CS trenches, I saw it all:
              </p>

              <ul className="space-y-4 mb-8 text-lg">
                <li className="flex items-start">
                  <XCircle size={22} className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">QBR decks collecting dust</span>
                </li>
                <li className="flex items-start">
                  <XCircle size={22} className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Check-ins with no impact</span>
                </li>
                <li className="flex items-start">
                  <XCircle size={22} className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Teams chasing renewals, not outcomes</span>
                </li>
              </ul>
              
              <p className="mb-6 text-gray-700">
                So I created Churn Is Dead — a space for battle-tested plays, contrarian thinking, and no-BS strategies that actually move the needle.
              </p>
              
              <p className="mb-6 italic border-l-4 border-red-500 pl-4 py-2 font-medium">
                💥 This isn't about inspiration. It's about implementation.<br />
                Churn isn't your North Star. Value is.
              </p>
              
              <div className="mb-8">
                <h3 className="font-semibold text-red-600 mb-4 text-xl">Every Tuesday, Here's What Lands in Your Inbox:</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold text-xl">🧠</span>
                    <span className="text-lg">What's broken (and what's actually working) in CS</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold text-xl">📦</span>
                    <span className="text-lg">Frameworks and plays you can run now</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold text-xl">🎤</span>
                    <span className="text-lg">Real stories from CS leaders in the arena (not just "influencers")</span>
                  </li>
                </ul>
              </div>
              
              {/* New subscription form moved up from bottom */}
              <div className="bg-navy-dark p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl text-white font-medium mb-4">Ready to transform your CS approach?</h3>
                <NewsletterForm location="article" className="max-w-full" />
                <p className="text-sm mt-3 text-gray-300">
                  Join 2,000+ CS leaders getting fresh insights every Tuesday.
                </p>
              </div>
              
              <p className="font-medium text-navy-dark mb-6">
                If you're done chasing renewals…<br />
                If you're ready to lead with clarity, value, and real impact…<br />
                <span className="text-red-600">Then welcome. You're one of us.</span>
              </p>
              
              <div className="border-t border-gray-200 pt-6 mt-8">
                <h3 className="text-xl font-serif font-bold text-red-600 mb-4">Why Now?</h3>
                <p className="text-gray-700 mb-4">
                  Customer Success is at a crossroads.
                </p>
                <p className="text-gray-700 mb-4">
                  In an era of layoffs, AI overload, and NRR obsession, it's never been more urgent to reset the strategy and reclaim what CS is meant to be:
                  <span className="block font-medium text-navy-dark mt-2">
                    A growth engine. A trust accelerator. A business multiplier.
                  </span>
                </p>
                <p className="font-medium text-center text-lg text-red-600 mt-6">
                  That's why Churn Is Dead exists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center mb-8">
            <h3 className="text-xl font-serif font-bold mb-6">
              Ready to transform your Customer Success approach?
            </h3>
            <NewsletterForm location="footer" className="max-w-lg w-full" />
            <p className="text-sm mt-3 text-gray-300">
              Join 2,000+ CS leaders getting fresh insights every Tuesday.
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

export default About;
