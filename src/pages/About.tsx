
import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, User, Briefcase, Award, CheckCircle, XCircle } from "lucide-react";

const About = () => {
  useEffect(() => {
    document.title = "About | Churn Is Dead";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-black mb-6 leading-tight">
              CS isn't about fighting churn.<br />
              <span className="text-red-500">It's about driving revenue, trust, and outcomes.</span>
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
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-md">
              <p className="text-xl font-medium mb-6 text-navy-dark">
                Churn Is Dead isn't a newsletter. It's a wake-up call.
                <span className="block text-red-600 mt-1">A rejection of fluffy CS thought leadership.</span>
                <span className="block text-navy-dark mt-1">A rallying cry for bold, tactical, outcome-driven execution.</span>
              </p>
              
              <p className="mb-8 text-gray-700">
                After 10+ years in the CS trenches, I saw it all:
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <XCircle size={20} className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">QBR decks collecting dust</span>
                </li>
                <li className="flex items-start">
                  <XCircle size={20} className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Check-ins with no impact</span>
                </li>
                <li className="flex items-start">
                  <XCircle size={20} className="text-red-500 mr-2 mt-1 flex-shrink-0" />
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
                <p className="font-semibold text-navy-dark mb-4 text-lg">What You'll Get Every Tuesday:</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold">🧠</span>
                    <span>What's broken (and what's actually working) in CS</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold">📦</span>
                    <span>Frameworks and plays you can run now</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2 font-bold">🎤</span>
                    <span>Real stories from CS leaders in the arena (not just "influencers")</span>
                  </li>
                </ul>
              </div>
              
              <p className="font-medium text-navy-dark mb-6">
                If you're done chasing renewals…<br />
                If you're ready to lead with clarity, value, and real impact…<br />
                <span className="text-red-600">Then welcome. You're one of us.</span>
              </p>
              
              <div className="border-t border-gray-200 pt-6 mt-8">
                <h3 className="text-xl font-serif font-bold text-navy-dark mb-4">Why Now?</h3>
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
      
      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
              Join the movement
            </h2>
            <p className="text-lg mb-8">
              Get weekly insights that help you drive more value, expansion, and growth.
            </p>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
              asChild
            >
              <Link to="/">
                Subscribe to the Newsletter
              </Link>
            </Button>
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

export default About;
