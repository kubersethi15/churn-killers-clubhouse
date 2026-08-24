import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

type Tool = {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  time: string;
};

const tools: Tool[] = [
  {
    path: "/qbr-score",
    eyebrow: "QBR diagnostic",
    title: "QBR Effectiveness Score",
    description:
      "Is your quarterly business review driving decisions, or is it theater? Eight questions about the last review you ran, scored against the 30-minute three-block framework.",
    time: "2 minutes · no email for the result",
  },
  {
    path: "/ai-exposure-score",
    eyebrow: "AI exposure diagnostic",
    title: "AI Exposure Score",
    description:
      "How much of your CS role is exposed to automation, and where does the defensible, decision-shaping work actually sit? A directional self-assessment for CS operators.",
    time: "2 minutes · no email for the result",
  },
  {
    path: "/cs-analyzer/demo",
    eyebrow: "Product demo",
    title: "CS Analyzer",
    description:
      "See how a raw customer call transcript becomes risk signals, adoption gaps, and expansion triggers. Try the sample report without uploading anything.",
    time: "Sample report · no upload",
  },
];

const Tools = () => {
  useEffect(() => {
    import("@/utils/seoMeta").then(({ applyRouteSeo }) =>
      applyRouteSeo({
        title: "CS Tools & Diagnostics | Churn Is Dead",
        description:
          "Free interactive tools for Customer Success operators: score your QBR, gauge your AI exposure, and analyze a customer call. No signup for the result.",
        path: "/tools",
      })
    );
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content" className="pt-28 pb-20 md:pt-36">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-red font-serif-none">
              Tools
            </p>
            <h1 className="mb-5 text-4xl font-serif font-black leading-[1.05] tracking-tight text-navy-dark md:text-6xl">
              Run the test, not the theory.
            </h1>
            <p className="mb-12 text-lg leading-relaxed text-gray-700">
              Short, honest self-checks you can run on your own work in a
              couple of minutes. Each one gives you a score and one practical
              next move. No signup for the result.
            </p>

            <div className="grid gap-5">
              {tools.map((t) => (
                <Link
                  key={t.path}
                  to={t.path}
                  className="group block rounded-xl border border-gray-200 p-6 md:p-8 transition-all hover:border-red hover:shadow-md bg-white"
                >
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red">
                    {t.eyebrow}
                  </p>
                  <h2 className="mb-2 text-2xl font-serif font-bold text-navy-dark group-hover:text-red-600 transition-colors">
                    {t.title}
                  </h2>
                  <p className="mb-4 text-[0.9375rem] leading-relaxed text-gray-600">
                    {t.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t.time}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-dark group-hover:text-red-600 transition-colors">
                      Open <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-14 rounded-xl bg-cream/40 p-8 text-center">
              <p className="mb-2 text-lg font-serif font-bold text-navy-dark">
                The thinking behind these tools arrives every Tuesday.
              </p>
              <p className="mb-5 text-sm text-gray-600">
                Churn Is Dead is a weekly publication for people working in CS. One
                sharp take and one practical tool you can use.
              </p>
              <Link
                to="/start"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Start here <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tools;
