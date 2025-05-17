
import { useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, User, Briefcase, Award } from "lucide-react";

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
            <h1 className="text-4xl md:text-5xl font-serif font-black mb-6">
              About <span className="text-red-500">Churn Is Dead</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
              A movement to reimagine Customer Success as a strategic growth lever, not just a retention tool.
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
                Churn Is Dead isn't just a newsletter. It's a movement.
                <span className="block text-red-600 mt-1">A rejection of recycled CS advice, and a rallying cry for bold, outcome-driven Customer Success.</span>
              </p>
              
              <p className="mb-6 text-gray-700">
                After a decade in the trenches with B2B SaaS orgs, I saw too many smart CSMs buried under QBR decks, low-impact check-ins, and renewal anxiety. So I created this space — to deliver tactical, battle-tested frameworks that actually move the needle.
              </p>
              
              <p className="mb-6 italic border-l-4 border-red-500 pl-4 py-2">
                This isn't about fluffy thought leadership or "feel-good CS." It's about the hard truth: Churn isn't your north star. Value is.
              </p>
              
              <p className="mb-4 font-medium text-navy-dark">Each week, I break down:</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>What's broken in CS (and what's working)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Practical plays you can run today</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Stories from real CS leaders, not just "influencers"</span>
                </li>
              </ul>
              
              <p className="mb-6 text-gray-700">
                If you're tired of just fighting churn and ready to build trust, revenue, and long-term growth — this is for you.
              </p>
              
              <p className="font-medium text-lg text-center border-t border-b border-gray-200 py-4 my-6">
                No fluff. No slides. Just value, delivered every Tuesday.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Personal Bio Section */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-600 rounded-full p-3">
                  <User size={24} className="text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-dark">
                  Meet Kuber
                </h2>
              </div>
              
              <div className="space-y-6 text-gray-700">
                <p className="text-lg">
                  Hey, I'm Kuber. I've led Customer Success for high-growth B2B SaaS companies, run QBRs that actually moved revenue, and worked with CS teams across APAC, India, and global markets.
                </p>
                
                <p>
                  Before that, I was a support engineer, a NOC operator, an account manager — I know the tech, the pressure, and the politics.
                </p>
                
                <p>
                  Today, I'm building "Churn Is Dead" to challenge the status quo and arm CS pros with the frameworks, questions, and mindset to drive expansion, not just save renewals.
                </p>
                
                <p>
                  I've worked with organizations scaling from early traction to global maturity. Along the way, I've learned that trust, not templates, is what drives results.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gray-50 p-5 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase size={18} className="text-red-600" />
                    <h3 className="font-medium text-navy-dark">Experience</h3>
                  </div>
                  <p className="text-sm text-gray-700">Leadership roles in global SaaS CS teams</p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare size={18} className="text-red-600" />
                    <h3 className="font-medium text-navy-dark">Approach</h3>
                  </div>
                  <p className="text-sm text-gray-700">Practical, battle-tested frameworks</p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Award size={18} className="text-red-600" />
                    <h3 className="font-medium text-navy-dark">Focus</h3>
                  </div>
                  <p className="text-sm text-gray-700">Driving value, not just preventing churn</p>
                </div>
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
