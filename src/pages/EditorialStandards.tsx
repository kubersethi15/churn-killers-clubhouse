import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ContactDialog from "@/components/ContactDialog";
import { applyRouteSeo } from "@/utils/seoMeta";

const STANDARDS = [
  {
    number: "01",
    title: "Evidence before certainty",
    body: "Precise claims, benchmarks, quotations, and outside research must link to a source. Primary research and official guidance come first. Opinion is labelled as opinion.",
  },
  {
    number: "02",
    title: "A human owns every issue",
    body: "Codex can support research, evidence mapping, structure, and production. Kuber reviews and approves the argument, the claims, the playbook, and the final public copy before publication.",
  },
  {
    number: "03",
    title: "Experience is not invented",
    body: "First-person customer stories and results are used only when Kuber has confirmed them. Illustrative examples are labelled and never presented as real customer outcomes.",
  },
  {
    number: "04",
    title: "The website is canonical",
    body: "Churn Is Dead publishes here first. LinkedIn and Medium versions are optional adaptations. They point back to the original and do not change the evidence or conclusion.",
  },
  {
    number: "05",
    title: "Corrections stay visible",
    body: "If a material fact, source, or conclusion changes, the article is corrected and a dated note explains what changed. Quiet edits are reserved for spelling and formatting.",
  },
];

const EditorialStandards = () => {
  const [contactOpen, setContactOpen] = useState(false);
  useEffect(() => {
    applyRouteSeo({
      title: "Editorial Standards | Churn Is Dead",
      description: "How Churn Is Dead researches, reviews, publishes, and corrects its evidence-led Customer Success newsletter.",
      path: "/editorial-standards",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content">
        <section className="pt-28 pb-10 md:pt-36 md:pb-14 border-b border-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-[10px] uppercase tracking-[0.22em] text-red font-bold mb-3">How the work gets made</p>
              <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-4">Editorial standards</h1>
              <p className="text-lg text-gray-500 leading-relaxed">
                Strong opinions need stronger operating discipline. These are the rules behind every researched issue and playbook.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto divide-y divide-gray-100">
              {STANDARDS.map(standard => (
                <article key={standard.number} className="py-8 first:pt-0 flex gap-5">
                  <span className="text-2xl font-serif font-black text-red flex-shrink-0">{standard.number}</span>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-navy-dark mb-2">{standard.title}</h2>
                    <p className="text-gray-600 leading-relaxed">{standard.body}</p>
                  </div>
                </article>
              ))}

              <div className="pt-10">
                <h2 className="text-xl font-serif font-bold text-navy-dark mb-3">Report a correction</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Found a claim that is wrong, outdated, or missing context? Send the article URL, the disputed claim, and the best available source through the contact form.
                </p>
                <div className="flex flex-wrap items-center gap-5">
                  <button onClick={() => setContactOpen(true)} className="font-semibold text-red hover:text-red-dark transition-colors">
                    Submit a correction
                  </button>
                  <Link to="/about" className="font-semibold text-gray-500 hover:text-navy-dark transition-colors">
                    About Kuber and Churn Is Dead
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default EditorialStandards;
