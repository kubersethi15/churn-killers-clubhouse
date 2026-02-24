import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";

const About = () => {
  useEffect(() => {
    document.title = "About | Churn Is Dead";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Churn Is Dead: weekly CS frameworks by Kuber Sethi. Hard truths, tactical plays, and no fluff.");
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header */}
      <section className="pt-28 pb-10 md:pt-36 md:pb-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-3">
              About
            </h1>
            <p className="text-lg text-gray-400">
              Why this exists and who writes it.
            </p>
          </div>
        </div>
      </section>
      
      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            
            {/* The Story */}
            <div className="prose-custom">
              <div className="text-[1.0625rem] leading-[1.75] text-gray-700">

                <h2 className="text-xl md:text-2xl font-serif font-bold text-navy-dark mt-0 mb-4">
                  The short version
                </h2>
                <p className="mb-5">
                  Churn Is Dead is a weekly newsletter for enterprise CS leaders who are tired of vague advice and ready for frameworks that actually work.
                </p>
                <p className="mb-5">
                  Every Tuesday, you get one issue. One contrarian take. One named framework. One downloadable playbook. No filler.
                </p>

                <hr className="my-10 border-0 border-t border-gray-200" />

                <h2 className="text-xl md:text-2xl font-serif font-bold text-navy-dark mb-4">
                  The longer version
                </h2>
                <p className="mb-5">
                  I'm <strong className="text-navy-dark">Kuber Sethi</strong>. I've spent 10+ years in Customer Success, mostly in enterprise environments where a single renewal can be worth millions and the politics are always more complex than the product.
                </p>
                <p className="mb-5">
                  During that time, I watched the CS industry develop a habit of confusing activity with impact. QBR decks that nobody reads. Health scores that predict nothing. Check-in calls where both parties wonder why they're there. Teams that measure themselves by meetings attended instead of decisions influenced.
                </p>
                <p className="mb-5">
                  The layoffs of 2024 and 2025 weren't a surprise. They were the logical outcome of a function that struggled to prove its value in financial terms.
                </p>
                <p className="mb-5">
                  I started Churn Is Dead because I believed the answer wasn't more inspirational LinkedIn posts about "the power of customer relationships." The answer was tactical, measurable, sometimes uncomfortable frameworks that force CS teams to confront the gap between what they do and what actually drives retention and expansion.
                </p>

                <hr className="my-10 border-0 border-t border-gray-200" />

                <h2 className="text-xl md:text-2xl font-serif font-bold text-navy-dark mb-4">
                  What you'll find here
                </h2>
                
                <div className="space-y-4 my-6">
                  <div className="flex gap-4">
                    <span className="text-xl font-serif font-black text-red-600 flex-shrink-0 w-8">01</span>
                    <div>
                      <p className="font-semibold text-navy-dark mb-0.5">Hard truths the industry avoids</p>
                      <p className="text-sm text-gray-500">Every issue opens with something uncomfortable. If it doesn't challenge a sacred cow, it doesn't ship.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-xl font-serif font-black text-red-600 flex-shrink-0 w-8">02</span>
                    <div>
                      <p className="font-semibold text-navy-dark mb-0.5">Named, actionable frameworks</p>
                      <p className="text-sm text-gray-500">Not abstract principles. Specific systems with steps, scoring rubrics, and implementation guides you can run this week.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-xl font-serif font-black text-red-600 flex-shrink-0 w-8">03</span>
                    <div>
                      <p className="font-semibold text-navy-dark mb-0.5">Downloadable playbooks</p>
                      <p className="text-sm text-gray-500">Every issue comes with a diagnostic PDF. Print it. Run it on your team. Score yourself honestly.</p>
                    </div>
                  </div>
                </div>

                <hr className="my-10 border-0 border-t border-gray-200" />

                <h2 className="text-xl md:text-2xl font-serif font-bold text-navy-dark mb-4">
                  Who this is for
                </h2>
                <p className="mb-5">
                  CSMs, CS Directors, VPs of Customer Success, and CROs at B2B SaaS companies. Particularly those managing enterprise accounts where the stakes are high and the margin for error is thin.
                </p>
                <p className="mb-5">
                  If you've ever sat in a QBR wondering if anything you presented will change a single decision your customer makes, this newsletter is for you.
                </p>
                <p className="mb-5">
                  If you've ever been told "just prove your value" without anyone explaining what that means in dollar terms, this newsletter is for you.
                </p>

                <hr className="my-10 border-0 border-t border-gray-200" />

                <h2 className="text-xl md:text-2xl font-serif font-bold text-navy-dark mb-4">
                  The rules
                </h2>
                <p className="mb-5">
                  Every issue follows three rules:
                </p>
                <p className="mb-3">
                  <strong className="text-navy-dark">No fluff.</strong> If it doesn't lead to a measurable action, it doesn't make the cut.
                </p>
                <p className="mb-3">
                  <strong className="text-navy-dark">No sacred cows.</strong> If the industry consensus is wrong, we say so. With evidence.
                </p>
                <p className="mb-5">
                  <strong className="text-navy-dark">No gatekeeping.</strong> Every framework, template, and playbook is free. Always.
                </p>

              </div>
            </div>

            {/* Subscribe */}
            <div className="mt-14 py-10 px-8 bg-navy-dark rounded-lg text-center">
              <h3 className="text-xl font-serif font-bold text-white mb-2">
                Ready?
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                New issue every Tuesday. Free forever.
              </p>
              <div className="max-w-sm mx-auto">
                <NewsletterForm 
                  location="article" 
                  buttonVariant="vibrant-red"
                  textColor="text-white"
                  buttonText="Subscribe"
                  subscribeText=""
                />
              </div>
            </div>

            {/* Bottom nav */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between text-sm">
              <Link to="/newsletters" className="font-semibold text-navy-dark hover:text-red-600 transition-colors">
                Read the issues
              </Link>
              <Link to="/playbook" className="font-semibold text-navy-dark hover:text-red-600 transition-colors">
                Playbook Vault
              </Link>
            </div>

          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;
