import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import { topicHubBySlug } from "@/data/topicHubs";
import { trackGrowthEvent } from "@/utils/growthTracking";
import { applyRouteSeo } from "@/utils/seoMeta";

const TopicHub = () => {
  const { slug = "" } = useParams();
  const topic = topicHubBySlug[slug];

  useEffect(() => {
    if (!topic) return;
    applyRouteSeo({
      title: `${topic.title} | Churn Is Dead`,
      description: `${topic.description} Explore practical issues and one operating tool for experienced Customer Success leaders.`,
      path: `/topics/${topic.slug}`,
    });
    void trackGrowthEvent({ eventName: "resource_open", resourceId: `topic:${topic.slug}` });
    window.scrollTo(0, 0);
  }, [topic]);

  if (!topic) return <Navigate to="/topics" replace />;
  const availableReads = topic.reads.filter((read) => !read.availableFrom || new Date(read.availableFrom) <= new Date());

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content">
        <section className="border-b border-gray-100 bg-navy-dark pb-14 pt-28 text-white md:pb-20 md:pt-36">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <Link to="/topics" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white"><ArrowLeft className="h-4 w-4" /> All topics</Link>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">{topic.eyebrow}</p>
              <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">{topic.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">{topic.description}</p>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-100 bg-cream/40 py-10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">the decision</p>
              <p className="font-serif text-2xl font-bold leading-snug text-navy-dark md:text-3xl">{topic.decision}</p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">operating principles</p>
                <div className="space-y-4">
                  {topic.principles.map((principle) => (
                    <div key={principle} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 flex-none text-red-600" /><p className="leading-relaxed text-gray-700">{principle}</p></div>
                  ))}
                </div>
                <div className="mt-8 rounded-xl bg-navy-dark p-6 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">run the tool</p>
                  <h2 className="mt-3 font-serif text-2xl font-black">{topic.tool.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-gray-300">{topic.tool.description}</p>
                  <Link to={topic.tool.href} onClick={() => void trackGrowthEvent({ eventName: "resource_open", resourceId: `topic-tool:${topic.slug}` })} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-red-300">{topic.tool.label} <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>

              <div>
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">essential reads</p>
                <div className="divide-y divide-gray-200 border-y border-gray-200">
                  {availableReads.map((read, index) => (
                    <Link key={read.slug} to={`/newsletter/${read.slug}`} className="group grid grid-cols-[3rem_1fr_auto] gap-4 py-6">
                      <span className="font-serif text-2xl font-black text-red-600">0{index + 1}</span>
                      <span>
                        <span className="block font-serif text-xl font-bold leading-snug text-navy-dark transition-colors group-hover:text-red-600">{read.title}</span>
                        <span className="mt-2 block text-sm leading-relaxed text-gray-600">{read.description}</span>
                      </span>
                      <ArrowRight className="mt-1 h-5 w-5 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-red-600" />
                    </Link>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-relaxed text-gray-500">Archive note: issues published before August 2026 predate the current evidence-led editorial package. Their operating ideas remain available, but historical anecdotes and numerical claims have not all been re-verified.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-navy-dark py-14 text-white md:py-18">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-black">Keep building the operating system.</h2>
              <p className="mb-7 mt-3 text-gray-300">One decision, one framework, and one usable tool every Tuesday.</p>
              <div className="mx-auto max-w-md"><NewsletterForm location="footer" buttonVariant="vibrant-red" textColor="text-white" buttonText="Join the Tuesday list" subscribeText="" /></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TopicHub;
