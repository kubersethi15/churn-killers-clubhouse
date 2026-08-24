import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import ReaderPulse from "@/components/ReaderPulse";
import { topicHubs } from "@/data/topicHubs";
import { applyRouteSeo } from "@/utils/seoMeta";

const Topics = () => {
  useEffect(() => {
    applyRouteSeo({
      title: "Customer Success Topics | Churn Is Dead",
      description: "Find practical Churn Is Dead guidance on renewals, measurement, health scores, AI, and the messy work between CS and the rest of the company.",
      path: "/topics",
    });
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content">
        <section className="border-b border-gray-100 bg-navy-dark pb-16 pt-28 text-white md:pb-20 md:pt-36">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">problem-led library</p>
              <h1 className="max-w-2xl font-serif text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">Start with the problem you are facing.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">{topicHubs.length} recurring Customer Success problems. Each collection helps you understand the issue and gives you something practical to try.</p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
              {topicHubs.map((topic, index) => (
                <Link key={topic.slug} to={`/topics/${topic.slug}`} className="group rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-red-300 md:p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <span className="font-serif text-3xl font-black text-red-600">0{index + 1}</span>
                    <ArrowRight className="h-5 w-5 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-red-600" />
                  </div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">{topic.eyebrow}</p>
                  <h2 className="font-serif text-2xl font-black text-navy-dark transition-colors group-hover:text-red-600 md:text-3xl">{topic.title}</h2>
                  <p className="mt-3 leading-relaxed text-gray-600">{topic.description}</p>
                  <p className="mt-6 border-l-2 border-red-500 pl-4 text-sm font-semibold leading-relaxed text-navy-dark">{topic.decision}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <ReaderPulse />

        <section className="border-t border-gray-100 bg-cream/40 py-14 md:py-18">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-3xl font-black text-navy-dark">One difficult CS problem every Tuesday.</h2>
              <p className="mb-7 mt-3 text-gray-600">The full issue and tool arrive together. No gated archive.</p>
              <div className="mx-auto max-w-md"><NewsletterForm location="footer" buttonVariant="vibrant-red" buttonText="Join the Tuesday list" subscribeText="" /></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Topics;
