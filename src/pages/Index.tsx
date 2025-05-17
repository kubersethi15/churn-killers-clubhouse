
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import ArticleCard from "@/components/ArticleCard";
import TestimonialCard from "@/components/TestimonialCard";
import { MessageSquare, FileText, Linkedin, Share2 } from "lucide-react";

const Index = () => {
  useEffect(() => {
    document.title = "Churn Is Dead | No-BS Customer Success Strategies";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section with Brand Story Hook */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block text-xs uppercase tracking-wider border border-red-500/30 rounded-full px-3 py-1 mb-5 bg-red-500/10 text-red-400">
              A newsletter that doesn't waste your time
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 animate-fade-in">
              Stop Managing Churn.<br />
              <span className="text-red-500">Start Owning Revenue.</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
              Because while everyone else is building "customer health" dashboards, you're trying to 
              deliver actual value that moves the revenue needle.
            </p>
            <NewsletterForm className="max-w-lg mx-auto" />
            
            <div className="mt-8 pt-8 border-t border-white/10 text-sm text-gray-300 flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                <p>Join 2,000+ CS leaders who refuse to manage churn</p>
              </div>
              <div className="flex items-center gap-3">
                <a href="https://www.linkedin.com/share" target="_blank" className="hover:text-red-400 transition-colors">
                  <Linkedin size={18} className="inline-block" />
                </a>
                <a href="#" className="hover:text-red-400 transition-colors">
                  <Share2 size={18} className="inline-block" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why This Exists - Brand Story Hook */}
      <section className="py-10 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <blockquote className="text-lg md:text-xl font-serif italic text-navy-dark text-center">
              "After a decade watching CS teams drown in dashboards and 'best practices' that never move the needle, 
              I built the resource I wish I'd had: where signal beats noise and outcomes matter more than health scores."
              <footer className="mt-4 font-sans text-sm text-gray-600">
                — Alex Mitchell, Founder
              </footer>
            </blockquote>
          </div>
        </div>
      </section>
      
      {/* Social Proof */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-80">
            <p className="text-navy-dark font-medium">Trusted by CS teams at:</p>
            <span className="text-gray-500 font-bold">Company Logo</span>
            <span className="text-gray-500 font-bold">Company Logo</span>
            <span className="text-gray-500 font-bold">Company Logo</span>
            <span className="text-gray-500 font-bold">Company Logo</span>
          </div>
        </div>
      </section>
      
      {/* Lead Magnet */}
      <section className="py-14 bg-navy-dark/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-5">
              <FileText size={24} className="text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-600 uppercase tracking-wide">Free Download</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 text-navy-dark">
              5 Contrarian CS Plays That Actually Drive Net Revenue Retention
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              The playbook every CS leader needs to become a revenue driver instead of a cost center.
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-6">
              Get The Playbook
            </Button>
          </div>
        </div>
      </section>
      
      {/* Insights Section */}
      <section id="insights" className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-navy-dark">
              Field-Tested Insights
            </h2>
            <p className="text-lg text-gray-700">
              No recycled advice or feel-good platitudes. Just battle-hardened tactics that work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ArticleCard 
              title="The 'Trusted Advisor' Trap and How to Escape It" 
              excerpt="Why most CSMs fail to influence revenue conversations and the tactical shift that puts you in the driver's seat." 
              date="May 10, 2025" 
              readTime="6 min read" 
              category="Strategy"
            />
            <ArticleCard 
              title="QBRs Are Dead: The Executive Dialogue Framework" 
              excerpt="Stop delivering data dumps nobody cares about. Here's the 3-part structure that turns executives into your biggest champions." 
              date="May 3, 2025" 
              readTime="8 min read" 
              category="Execution"
            />
            <ArticleCard 
              title="How to Forecast Expansion Without Hoping and Praying" 
              excerpt="The signal-based expansion model we used to hit 124% net revenue retention at Vectra without salespeople." 
              date="April 26, 2025" 
              readTime="5 min read" 
              category="Revenue"
            />
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="outline" className="border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white">
              View All Insights
            </Button>
          </div>
        </div>
      </section>
      
      {/* Value Proposition - Updated for CS Leaders */}
      <section className="py-20 md:py-28 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-red-600 rounded-full p-5 flex-shrink-0">
                <MessageSquare size={32} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  For CS leaders tired of firefighting and ready to lead.
                </h2>
                <p className="text-lg text-gray-200 mb-6">
                  In an industry where "relationship management" is celebrated but revenue impact is what gets you 
                  a seat at the table, we deliver frameworks that help you escape the reactive trap, prove your value, 
                  and finally get ahead of the renewal cycle.
                </p>
                <NewsletterForm location="footer" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Strategic Services Section */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-navy-dark">
              Beyond the Newsletter
            </h2>
            <p className="text-lg text-gray-700">
              For CS organizations ready to transform from cost centers to growth engines.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-serif font-bold mb-3 text-navy-dark">Advisory Sessions</h3>
              <p className="text-gray-700 mb-4">
                One-on-one strategic guidance for CS leaders navigating complex growth and team challenges.
              </p>
              <div className="text-sm font-medium text-red-600">Coming Soon</div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-serif font-bold mb-3 text-navy-dark">CS Team Workshops</h3>
              <p className="text-gray-700 mb-4">
                Interactive frameworks to transform how your team approaches customer value delivery and expansion.
              </p>
              <div className="text-sm font-medium text-red-600">Coming Soon</div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-serif font-bold mb-3 text-navy-dark">Growth Roadmaps</h3>
              <p className="text-gray-700 mb-4">
                Personalized plans for CS organizations ready to scale impact, influence, and revenue contribution.
              </p>
              <div className="text-sm font-medium text-red-600">Coming Soon</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials - Updated */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-navy-dark">
              From CS Leaders in the Trenches
            </h2>
            <p className="text-lg text-gray-700">
              Practitioners who've applied these frameworks in the real world.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TestimonialCard 
              quote="After years of attending CS conferences and reading the same rehashed content, Alex's approach was like oxygen. The framework on driving expansion from the value gap completely changed our renewal conversations."
              author="Sarah Jennings"
              role="VP of Customer Success"
              company="SaaS Corp"
            />
            <TestimonialCard 
              quote="In an industry drowning in feel-good metrics that executives don't care about, this newsletter delivers the frameworks I actually use to demonstrate CS's revenue impact. No fluff, just results."
              author="David Chen"
              role="Director of Customer Success"
              company="GrowthTech"
            />
          </div>
        </div>
      </section>
      
      {/* About Section - Updated for Author Credibility */}
      <section id="about" className="py-20 md:py-28 bg-navy-dark/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-navy-dark text-center">
              About Churn Is Dead
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p>
                When CS teams are trapped between mounting executive expectations and legacy playbooks that 
                don't deliver results, something has to change. That's why I created Churn Is Dead.
              </p>
              
              <p>
                After years of leading Customer Success across global tech organizations like Vectra, training teams 
                on value delivery, and presenting QBRs to CISOs and CTOs who didn't care about our 
                "customer health" metrics, I realized what was missing: 
                <strong> a bullshit-free approach focused on customer outcomes that actually move the business forward.</strong>
              </p>
              
              <p>
                Each week, I share the frameworks, contrarian perspectives, and real case studies that helped me 
                build and scale CS organizations across tech, broadcast media, SaaS platforms, and cybersecurity.
              </p>
              
              <p>
                No platitudes. No recycled advice. Just battle-tested strategies from someone who's been in the trenches.
              </p>
              
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm flex flex-col md:flex-row gap-6 items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex-shrink-0">
                  {/* Placeholder for author photo */}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl mb-2 text-navy-dark">Alex Mitchell</h3>
                  <p className="text-gray-700 mb-3">
                    CS leader with 15+ years of experience scaling customer operations and driving 
                    revenue outcomes across global technology companies. Previously led CS teams at Vectra AI, building 
                    frameworks that consistently delivered 120%+ net revenue retention.
                  </p>
                  <a href="https://linkedin.com" target="_blank" className="inline-flex items-center text-navy-dark hover:text-red-600 font-medium">
                    <Linkedin size={16} className="mr-2" /> Connect on LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA - Updated for Conversion */}
      <section className="py-16 md:py-20 bg-red-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
              Ready to stop managing churn and start driving value?
            </h2>
            <p className="text-lg mb-8">
              Join CS leaders who are transforming their approach with actionable frameworks delivered weekly.
            </p>
            <NewsletterForm className="max-w-lg mx-auto" />
            <div className="mt-6 flex justify-center space-x-4">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">
                Get the Free Playbook
              </Button>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">
                Share With Your Team
              </Button>
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

export default Index;
