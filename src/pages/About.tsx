import { useEffect } from "react";
import { ArrowRight, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import { applyRouteSeo } from "@/utils/seoMeta";

const credentials = [
  ["10+ years", "Across support, CSM roles, and CS executive leadership."],
  ["Built the function", "Led CS teams and built KPI, training, development, and team-metric systems."],
  ["Ran the work", "Built a thirty-minute, three-slide quarterly review around goals, results, and the next decision."],
];

const About = () => {
  useEffect(() => {
    applyRouteSeo({
      title: "About Kuber Sethi | Churn Is Dead",
      description: "Kuber Sethi has spent more than ten years across support, CSM roles, and CS executive leadership. Read why he created Churn Is Dead.",
      path: "/about",
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f3efe7]">
      <Header />
      <main id="main-content">
        <section className="editorial-grid-dark relative overflow-hidden border-b border-white/10 bg-navy-dark pb-16 pt-28 text-white md:pb-20 md:pt-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[1fr_360px] lg:items-center">
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">About Kuber</p>
                <h1 className="max-w-4xl font-serif text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-7xl">I write about the CS decisions most advice avoids.</h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">I am Kuber Sethi. I have spent more than ten years in Customer Success, moving from support into CSM roles and then into CS executive leadership.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="https://www.linkedin.com/in/kuber-cs-strategist/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-white hover:bg-red-700"><Linkedin className="h-4 w-4" /> Follow on LinkedIn</a>
                  <Link to="/newsletters" className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-white hover:border-white">Read the issues <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
              <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden border-2 border-white/30 bg-red-600 shadow-[16px_16px_0_0_hsl(var(--red))]">
                <img
                  src="/kuber-sethi.jpg"
                  alt="Kuber Sethi, founder and editor of Churn Is Dead"
                  width="800"
                  height="800"
                  className="h-full w-full object-cover grayscale mix-blend-luminosity contrast-125"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-navy-dark/90 p-4 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-300">Kuber Sethi</p>
                  <p className="mt-1 text-sm text-gray-300">Customer Success operator and editor</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/25 bg-red-600 py-8 text-white">
          <div className="container mx-auto px-4 md:px-6"><div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {credentials.map(([title, detail]) => <div key={title} className="border-l border-white/40 pl-4"><p className="font-serif text-2xl font-black text-white">{title}</p><p className="mt-1 text-sm leading-relaxed text-white/70">{detail}</p></div>)}
          </div></div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="max-w-2xl text-[1.0625rem] leading-[1.75] text-gray-700">
                <h2 className="font-serif text-3xl font-black text-navy-dark">Why Churn Is Dead exists</h2>
                <p className="mt-5">CS has a habit of rewarding visible activity. The deck was delivered. The call happened. The health score changed colour. The customer still has not made a useful decision.</p>
                <p className="mt-5">I built this publication to close that gap. Every issue should help an experienced CS person see a difficult problem more clearly and leave with something useful for a real account or team.</p>
                <p className="mt-5">My own view changed along the way. I used to believe a strong product could carry an account through anything. I was burnt several times relying on the product. Relationships carry accounts through problems product quality does not. Good CS needs to see both.</p>

                <div className="editorial-grid-dark my-10 border-l-8 border-red-600 bg-navy-dark p-6 text-white md:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">A review I rebuilt</p>
                  <h3 className="mt-3 font-serif text-2xl font-black">The thirty-minute, three-slide quarterly review</h3>
                  <ol className="mt-6 grid gap-4">
                    {["The customer's goal and how the last three months aligned to it.", "What was achieved.", "What happens next, including where support is needed."].map((item, index) => (
                      <li key={item} className="flex gap-4"><span className="font-serif text-xl font-black text-red-300">0{index + 1}</span><span className="text-sm leading-relaxed text-gray-200">{item}</span></li>
                    ))}
                  </ol>
                </div>

                <h2 className="font-serif text-3xl font-black text-navy-dark">Who it is for</h2>
                <p className="mt-5">It is for CSMs, CS leaders, and people moving into leadership who want a clearer answer than “be more strategic.” You do not need to learn a special method or vocabulary before the work becomes useful.</p>

                <h2 className="mt-10 font-serif text-3xl font-black text-navy-dark">The publishing rules</h2>
                <div className="mt-6 grid gap-5">
                  {[["01", "Show the evidence", "External facts link to their sources. Proposals and illustrative scenarios are labelled."], ["02", "Keep it human", "Kuber owns the final judgement. Tools can support research and production, but they do not become the author."], ["03", "Make it useful", "Every flagship issue should help the reader think more clearly and leave them with something they can use."]].map(([number, title, copy]) => (
                    <div key={number} className="flex gap-5 border-t border-gray-200 pt-5"><span className="font-serif text-2xl font-black text-red-600">{number}</span><div><h3 className="font-sans text-base font-bold text-navy-dark">{title}</h3><p className="mt-1 text-sm leading-relaxed text-gray-600">{copy}</p></div></div>
                  ))}
                </div>
              </div>

              <aside className="h-fit border-2 border-navy-dark bg-white p-6 shadow-[7px_7px_0_0_hsl(var(--red))] lg:sticky lg:top-28">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-600">Publication facts</p>
                <dl className="mt-5 space-y-5"><div><dt className="text-xs text-gray-500">Cadence</dt><dd className="mt-1 font-semibold text-navy-dark">Every Tuesday</dd></div><div><dt className="text-xs text-gray-500">LinkedIn reach</dt><dd className="mt-1 font-semibold text-navy-dark">Roughly 8,200 followers</dd></div><div><dt className="text-xs text-gray-500">Core access</dt><dd className="mt-1 font-semibold text-navy-dark">The weekly issue and practical tools remain free</dd></div></dl>
                <div className="mt-6 border-t border-gray-200 pt-6"><Link to="/start" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">See where to start <ArrowRight className="h-4 w-4" /></Link></div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-navy-dark py-14 text-white md:py-18"><div className="container mx-auto px-4 md:px-6"><div className="mx-auto max-w-2xl text-center"><h2 className="font-serif text-3xl font-black">One difficult CS problem every Tuesday.</h2><p className="mb-7 mt-3 text-gray-300">The weekly issue and practical tools remain free.</p><div className="mx-auto max-w-md"><NewsletterForm location="article" buttonVariant="vibrant-red" textColor="text-white" buttonText="Subscribe" subscribeText="" /></div></div></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
