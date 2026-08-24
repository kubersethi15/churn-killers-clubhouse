import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { ArrowRight } from "lucide-react";
import { topicHubs } from "@/data/topicHubs";

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
              Pick the operating problem on your desk. You will get a focused reading path and a tool to run.
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
                <strong className="text-navy-dark">Churn Is Dead</strong> is a weekly publication for experienced CS operators. Every Tuesday, you get one clear argument, one operating model, and one downloadable playbook.
              </p>
              <p>
                The premise is simple: most CS advice is too vague to be useful. "Build relationships." "Prove your value." "Be strategic." None of that tells you what to do Monday morning.
              </p>
              <p>
                This publication is built for action. Named frameworks. Decision rubrics. Diagnostic templates. Tools you can test with your team this week.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-cream/40 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6"><div className="mx-auto max-w-5xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-red-600">Start with your role</p>
          <h2 className="font-serif text-3xl font-black text-navy-dark">Same standard. A clearer route in.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { id: "run-accounts", title: "I run accounts", copy: "Start with renewal evidence, customer movement, and the next decision you need from the account.", topic: "/topics/renewal-economics", tool: "/playbook?kit=renewal" },
              { id: "lead-function", title: "I lead the function", copy: "Start with measurement, operating cadence, and the cross-functional ownership your team needs.", topic: "/topics/measurement-decisions", tool: "/playbook?kit=executive" },
              { id: "move-into-leadership", title: "I am moving into leadership", copy: "Start with role design, judgement, and the systems that separate senior operators from task managers.", topic: "/topics/ai-role-design", tool: "/ai-exposure-score" },
            ].map((path, index) => (
              <article id={path.id} key={path.id} className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6">
                <span className="font-serif text-2xl font-black text-red-600">0{index + 1}</span>
                <h3 className="mt-4 font-sans text-lg font-bold text-navy-dark">{path.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{path.copy}</p>
                <div className="mt-5 flex flex-col gap-2 text-sm font-semibold"><Link to={path.topic} className="inline-flex items-center gap-2 text-red-600">Open the reading path <ArrowRight className="h-4 w-4" /></Link><Link to={path.tool} className="text-navy-dark hover:text-red-600">Run the first tool</Link></div>
              </article>
            ))}
          </div>
        </div></div>
      </section>

      {/* Problem-led paths */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-8">
              Pick your starting point
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {topicHubs.map((topic, index) => (
                <Link
                  key={topic.slug}
                  to={`/topics/${topic.slug}`}
                  className="group rounded-xl border border-gray-200 p-5 hover:border-red-300"
                >
                  <div className="flex gap-4">
                    <span className="text-2xl font-serif font-black text-red-600 flex-shrink-0 w-10 mt-0.5">
                      0{index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-serif font-bold text-navy-dark leading-snug group-hover:text-red-600 transition-colors mb-2">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {topic.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 mt-3 group-hover:gap-2 transition-all">
                        Open this topic <ArrowRight className="w-3.5 h-3.5" />
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
              Build a useful baseline in twenty minutes.
            </h2>
            <p className="text-gray-500 mb-6">
              Take the directional AI Exposure Score, inspect an example call analysis, or choose a practical tool from the Playbook Vault.
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
      </main>

      <Footer />
    </div>
  );
};

export default StartHere;
