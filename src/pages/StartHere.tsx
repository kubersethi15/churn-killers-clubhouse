import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { ArrowRight } from "lucide-react";

const essentialIssues = [
  {
    number: "01",
    slug: "ai-didnt-kill-customer-success",
    title: "AI Didn't Kill Customer Success. It Exposed It.",
    description: "The issue that started it all. Why AI isn't replacing CS — it's revealing which parts were never defensible. Includes the AI Exposure framework.",
  },
  {
    number: "02",
    slug: "customer-success-doesnt-deserve-to-survive",
    title: "Customer Success Doesn't Deserve to Survive",
    description: "The three lies CS teams tell themselves, and the 5 Non-Negotiables of teams that are untouchable. Includes the CS Survival Audit playbook.",
  },
  {
    number: "03",
    slug: "stop-calling-yourself-strategic",
    title: "Stop Calling Yourself Strategic — You're Just Expensive",
    description: "The four levels of CS impact, from information delivery to decision architecture. Includes the Strategic Impact Scorecard.",
  },
];

const StartHere = () => {
  useEffect(() => {
    document.title = "Start Here | Churn Is Dead";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Header */}
      <section className="pt-28 pb-10 md:pt-36 md:pb-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-3">
              New here? Start here.
            </h1>
            <p className="text-lg text-gray-400">
              Three issues that capture what Churn Is Dead is about. Read these first, then decide if you want more every Tuesday.
            </p>
          </div>
        </div>
      </section>

      {/* What this is */}
      <section className="py-12 md:py-16 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-[1.0625rem] leading-relaxed text-gray-700 space-y-5">
              <p>
                <strong className="text-navy-dark">Churn Is Dead</strong> is a weekly newsletter for CS leaders at B2B SaaS companies. Every Tuesday, you get one contrarian take, one actionable framework, and one downloadable playbook.
              </p>
              <p>
                The premise is simple: most CS advice is too vague to be useful. "Build relationships." "Prove your value." "Be strategic." None of that tells you what to do Monday morning.
              </p>
              <p>
                This newsletter does. Named frameworks. Scoring rubrics. Diagnostic templates. Stuff you can run on your team this week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Issues */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
              The essential three
            </h2>

            <div className="space-y-10">
              {essentialIssues.map((issue) => (
                <Link
                  key={issue.slug}
                  to={`/newsletter/${issue.slug}`}
                  className="group block"
                >
                  <div className="flex gap-5">
                    <span className="text-2xl font-serif font-black text-red-600 flex-shrink-0 w-10 mt-0.5">
                      {issue.number}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-serif font-bold text-navy-dark leading-snug group-hover:text-red-600 transition-colors mb-2">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {issue.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 mt-3 group-hover:gap-2 transition-all">
                        Read this issue <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tool CTA */}
      <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-navy-dark mb-3">
              Want a quick diagnostic instead?
            </h2>
            <p className="text-gray-500 mb-6">
              Take the AI Exposure Score quiz. 8 questions, 2 minutes. Find out how much of your CS role is automatable today.
            </p>
            <Link
              to="/ai-exposure-score"
              className="inline-flex items-center gap-2 py-3 px-6 bg-navy-dark text-white font-semibold rounded-lg hover:bg-navy-dark/90 transition-colors"
            >
              Take the quiz <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-14 md:py-20 bg-navy-dark">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-white mb-3">
              Like what you're reading?
            </h2>
            <p className="text-gray-400 mb-8">
              New issue every Tuesday. Free. No spam. Unsubscribe anytime.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterForm
                location="footer"
                buttonVariant="vibrant-red"
                textColor="text-white"
                buttonText="Subscribe"
                subscribeText=""
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StartHere;
