import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { ArrowRight } from "lucide-react";

const StartHere = () => {
  useEffect(() => {
    import("@/utils/seoMeta").then(({ applyRouteSeo }) =>
      applyRouteSeo({
        title: "Start Here | Churn Is Dead",
        description: "New to Churn Is Dead? Choose the Customer Success problem on your desk, follow a focused reading path, and run one practical tool.",
        path: "/start",
      })
    );
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content">

      {/* Header */}
      <section className="pt-28 pb-10 md:pt-36 md:pb-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-3">
              New here? Start here.
            </h1>
            <p className="text-lg text-gray-600">
              Read one issue. Try one tool. Subscribe only if it earns a place in your week.
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
                <strong className="text-navy-dark">Churn Is Dead</strong> is a weekly publication for people working in Customer Success. Every Tuesday, you get one clear argument, a practical way forward, and something useful for your team.
              </p>
              <p>
                The premise is simple: most CS advice is too vague to be useful. "Build relationships." "Prove your value." "Be strategic." None of that tells you what to do Monday morning.
              </p>
              <p>
                It is meant to be used, not admired. Expect honest questions, clear thinking, checklists, worksheets, and tools you can try with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-cream/40 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl font-black text-navy-dark">The simplest way in.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ["01", "Read one issue", "Choose the problem closest to the work on your desk.", "/newsletters", "Browse the issues"],
                ["02", "Try one tool", "Take a checklist or worksheet and use it with a real account or team.", "/playbook", "Choose a free tool"],
                ["03", "Decide if it helps", "If the work is useful, join the Tuesday email. If not, everything stays open.", "#subscribe", "See the weekly promise"],
              ].map(([number, title, copy, href, label]) => (
                <article key={number} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <span className="font-serif text-2xl font-black text-red-600">{number}</span>
                  <h3 className="mt-4 font-sans text-lg font-bold text-navy-dark">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{copy}</p>
                  <a href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-600">{label} <ArrowRight className="h-4 w-4" /></a>
                </article>
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
              Want something useful now?
            </h2>
            <p className="text-gray-500 mb-6">
              Choose a free worksheet, inspect an example call analysis, or check how AI may change your role.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/ai-exposure-score" className="inline-flex items-center gap-2 rounded-lg bg-navy-dark px-5 py-3 font-semibold text-white hover:bg-navy-dark/90">Take the AI score <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/cs-analyzer/demo" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-navy-dark hover:border-navy-dark">Inspect an analysis</Link>
              <Link to="/playbook" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-navy-dark hover:border-navy-dark">Choose a playbook</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section id="subscribe" className="scroll-mt-28 py-14 md:py-20 bg-navy-dark">
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
      </main>

      <Footer />
    </div>
  );
};

export default StartHere;
