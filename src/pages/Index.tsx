import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { supabase } from "@/integrations/supabase/client";
import { isPreviewMode } from "@/utils/preview";
import { formatContent as formatNewsletterContent } from "@/utils/formatUtils";

const FEATURED_REFRESH = {
  title: "Your Digital CS Programme Cannot Tell You Who Needs Help",
  excerpt: "A simple way to see who received your digital journey, who acted, who went quiet, and when a person should step in.",
  category: "Digital Customer Success",
  read_time: "8 min read",
};

type Newsletter = {
  id: string;
  title: string;
  excerpt: string;
  published_date: string;
  read_time: string;
  category: string | null;
  slug: string;
};

const facts = [
  ["10+ years", "working in CS"],
  ["40+", "published issues"],
  ["32", "practical tools"],
  ["~8,200", "LinkedIn followers"],
];

const promises = [
  ["01", "The hard truth", "A direct argument with visible sourcing when it relies on external facts."],
  ["02", "A way forward", "A clear approach you can adapt to the team and customers you actually have."],
  ["03", "Something useful", "A checklist, worksheet, or review you can use without handing over your email."],
];

const Index = () => {
  const [latestNewsletter, setLatestNewsletter] = useState<Newsletter | null>(null);
  const [recentNewsletters, setRecentNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    import("@/utils/seoMeta").then(({ applyRouteSeo }) =>
      applyRouteSeo({
        title: "Churn Is Dead | Honest Customer Success Thinking",
        description: "A direct weekly Customer Success newsletter by Kuber Sethi. Honest arguments, useful ways forward, and practical tools for people doing the work.",
        path: "/",
      }),
    );
    return () => document.querySelector('script[data-seo="homepage-jsonld"]')?.remove();
  }, []);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        let query = supabase.from("newsletters").select("*").order("published_date", { ascending: false }).limit(4);
        if (!isPreviewMode()) query = query.lte("published_date", new Date().toISOString());
        const { data, error } = await query;
        if (error) {
          console.error("Error fetching newsletters:", error);
          return;
        }
        if (data?.length) {
          const first = data[0] as Newsletter;
          setLatestNewsletter(first.slug === "digital-cs-coverage-silence" ? { ...first, ...FEATURED_REFRESH } : first);
          setRecentNewsletters(data.slice(1) as Newsletter[]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsletters();
  }, []);

  const formatDate = (dateString: string) => format(new Date(dateString), "MMMM d, yyyy");
  const reveal = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <div className="min-h-screen bg-[#f3efe7] text-navy-dark">
      <Header />
      <main id="main-content">
        <section className="editorial-grid relative min-h-[820px] overflow-hidden bg-navy-dark pb-12 pt-28 text-white md:min-h-[900px] md:pb-16 md:pt-36">
          <div className="signal-orbit" aria-hidden="true" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-[1280px]">
              <motion.div {...reveal} className="flex items-center justify-between border-b border-white/20 pb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-white/60 md:text-xs">
                <span>Independent Customer Success publication</span>
                <span className="hidden sm:block">New every Tuesday</span>
              </motion.div>

              <div className="relative py-12 md:py-16">
                <motion.p {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="mb-7 max-w-xl text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                  Honest thinking for people doing the work
                </motion.p>
                <motion.h1 {...reveal} transition={{ ...reveal.transition, delay: 0.15 }} className="editorial-display max-w-[1160px] font-serif font-black uppercase leading-[0.79] tracking-[-0.065em]">
                  <span className="block">The CS</span>
                  <span className="block md:pl-[8vw]">newsletter</span>
                  <span className="relative block">that doesn't<span className="hero-strike" aria-hidden="true" /></span>
                  <span className="block pl-[5vw] italic text-red-500 md:pl-[14vw]">sugarcoat it.</span>
                </motion.h1>
                <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.25 }} className="mt-12 grid gap-9 border-t border-white/20 pt-8 lg:grid-cols-[1fr_1.15fr] lg:items-end">
                  <p className="max-w-xl text-lg leading-relaxed text-white/70 md:text-2xl">Every Tuesday: one sharp take, a practical way forward, and something useful for your team.</p>
                  <div className="max-w-xl lg:justify-self-end">
                    <NewsletterForm location="hero" buttonVariant="vibrant-red" textColor="text-white" buttonText="Subscribe" subscribeText="" />
                    <div className="mt-4 flex items-center justify-between text-xs text-white/45">
                      <span>Free. No gated downloads.</span>
                      <ArrowDownRight className="h-5 w-5 text-red-500" aria-hidden="true" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Publication facts" className="overflow-hidden bg-red-600 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-[1280px] grid-cols-2 md:grid-cols-4">
              {facts.map(([value, label]) => (
                <div key={label} className="border-white/25 px-3 py-7 first:pl-0 odd:border-r md:border-r md:px-7 md:py-9 md:last:border-r-0">
                  <strong className="block font-serif text-3xl font-black tracking-tight md:text-4xl">{value}</strong>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-navy-dark/15 py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-[1280px]">
              <div className="mb-12 grid items-end gap-6 border-b-2 border-navy-dark pb-5 md:grid-cols-[1fr_auto]">
                <div><p className="editorial-kicker">Read this first</p><h2 className="mt-2 font-serif text-4xl font-black uppercase leading-none tracking-[-0.045em] md:text-6xl">The latest issue</h2></div>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-gray-500">No. 01 / Latest</span>
              </div>

              {loading ? (
                <div className="h-[420px] animate-pulse bg-white/60" />
              ) : latestNewsletter ? (
                <Link to={`/newsletter/${latestNewsletter.slug}`} className="group grid overflow-hidden border-2 border-navy-dark bg-white transition-transform duration-500 motion-safe:hover:-translate-y-1 lg:grid-cols-[0.95fr_1.55fr]">
                  <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-red-600 p-7 text-white md:p-10 lg:min-h-[520px]">
                    <div className="issue-rings" aria-hidden="true" />
                    <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.24em]">{latestNewsletter.category || "Customer Success"}</span>
                    <div className="relative z-10"><span className="font-serif text-[7rem] font-black leading-none tracking-[-0.08em] md:text-[10rem]">01</span><p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-white/75">A hard question. A practical response. Something you can use.</p></div>
                  </div>
                  <article className="flex min-h-[420px] flex-col justify-between p-7 md:p-12 lg:p-16">
                    <div>
                      <p className="mb-7 font-mono text-xs uppercase tracking-[0.16em] text-gray-500">{formatDate(latestNewsletter.published_date)} / {latestNewsletter.read_time}</p>
                      <h3 className="max-w-3xl font-serif text-4xl font-black leading-[0.98] tracking-[-0.045em] transition-colors group-hover:text-red-600 md:text-6xl lg:text-7xl">{latestNewsletter.title}</h3>
                      <div className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl" dangerouslySetInnerHTML={{ __html: latestNewsletter.excerpt ? formatNewsletterContent(latestNewsletter.excerpt) : "" }} />
                    </div>
                    <span className="mt-12 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.14em]">Read the issue <ArrowRight className="h-5 w-5 text-red-600 transition-transform group-hover:translate-x-2" /></span>
                  </article>
                </Link>
              ) : <p className="py-20 text-center text-gray-600">No issues yet.</p>}
            </div>
          </div>
        </section>

        {recentNewsletters.length > 0 && (
          <section className="bg-white py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6"><div className="mx-auto max-w-[1280px]">
              <div className="mb-10 flex items-end justify-between border-b border-navy-dark/30 pb-4"><h2 className="font-serif text-3xl font-black uppercase tracking-[-0.04em] md:text-5xl">Keep reading</h2><Link to="/newsletters" className="hidden items-center gap-2 text-xs font-black uppercase tracking-[0.14em] hover:text-red-600 sm:inline-flex">All issues <ArrowRight className="h-4 w-4" /></Link></div>
              <div className="grid border-y border-navy-dark/20 md:grid-cols-3 md:divide-x md:divide-navy-dark/20">
                {recentNewsletters.map((newsletter, index) => (
                  <Link key={newsletter.id} to={`/newsletter/${newsletter.slug}`} className="group flex min-h-[310px] flex-col justify-between border-b border-navy-dark/20 py-7 md:border-b-0 md:px-7 md:first:pl-0 md:last:pr-0">
                    <div><div className="mb-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-gray-500"><span>{String(index + 2).padStart(2, "0")}</span><span>{newsletter.read_time}</span></div><h3 className="font-serif text-2xl font-black leading-[1.08] tracking-[-0.025em] transition-colors group-hover:text-red-600 md:text-3xl">{newsletter.title}</h3></div>
                    <div className="mt-10 flex items-center justify-between"><span className="text-xs font-semibold text-gray-500">{formatDate(newsletter.published_date)}</span><ArrowDownRight className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" /></div>
                  </Link>
                ))}
              </div>
            </div></div>
          </section>
        )}

        <section className="editorial-grid-dark bg-navy-dark py-20 text-white md:py-32">
          <div className="container mx-auto px-4 md:px-6"><div className="mx-auto max-w-[1280px]"><div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div><p className="editorial-kicker text-red-400">Every Tuesday</p><h2 className="mt-4 max-w-lg font-serif text-5xl font-black uppercase leading-[0.92] tracking-[-0.055em] md:text-7xl">Less noise. More nerve.</h2><p className="mt-7 max-w-md text-lg leading-relaxed text-white/60">No fluff. No “just checking in.” Just a hard question, a useful way to think about it, and something you can put to work.</p></div>
            <div className="border-t border-white/25">
              {promises.map(([number, title, description]) => <div key={number} className="grid gap-3 border-b border-white/25 py-7 sm:grid-cols-[80px_1fr_1.3fr] sm:items-baseline"><span className="font-serif text-4xl font-black text-red-500">{number}</span><h3 className="text-lg font-black uppercase tracking-[-0.02em]">{title}</h3><p className="text-sm leading-relaxed text-white/55">{description}</p></div>)}
              <Link to="/playbook" className="mt-9 inline-flex items-center gap-3 border-b-2 border-red-500 pb-2 text-sm font-black uppercase tracking-[0.14em] transition-colors hover:text-red-400">Use a free playbook <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div></div></div>
        </section>

        <section className="overflow-hidden bg-[#ded7cc] py-20 md:py-0">
          <div className="container mx-auto px-4 md:px-6"><div className="mx-auto grid max-w-[1280px] items-stretch md:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-[420px] overflow-hidden bg-red-600 md:min-h-[650px]"><div className="absolute inset-0 translate-x-8 translate-y-10 border-2 border-white/50" aria-hidden="true" /><img src="/kuber-sethi.jpg" alt="Kuber Sethi" width="800" height="800" className="absolute inset-0 h-full w-full object-cover object-top grayscale mix-blend-multiply contrast-125" /><div className="absolute inset-0 bg-red-600/25 mix-blend-color" aria-hidden="true" /><span className="absolute bottom-5 left-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">Kuber Sethi / Customer Success strategist</span></div>
            <div className="flex flex-col justify-center py-14 md:py-20 md:pl-16 lg:pl-24"><p className="editorial-kicker">Written by someone doing the work</p><h2 className="mt-5 max-w-2xl font-serif text-4xl font-black leading-[0.98] tracking-[-0.045em] md:text-6xl">Strong opinions. Honest evidence. Useful help.</h2><p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-700">Churn Is Dead takes difficult CS questions, says what most teams avoid, and gives you a practical next step.</p><Link to="/about" className="mt-9 inline-flex w-fit items-center gap-3 border-b-2 border-navy-dark pb-2 text-sm font-black uppercase tracking-[0.14em] hover:text-red-600">Why it exists <ArrowRight className="h-4 w-4" /></Link></div>
          </div></div>
        </section>

        <section className="relative overflow-hidden bg-red-600 py-20 text-white md:py-28">
          <div className="absolute -right-10 -top-36 select-none font-serif text-[24rem] font-black leading-none text-white/[0.07]" aria-hidden="true">C</div>
          <div className="container relative mx-auto px-4 md:px-6"><div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">The next issue lands Tuesday</p><h2 className="mt-4 max-w-4xl font-serif text-5xl font-black uppercase leading-[0.86] tracking-[-0.06em] md:text-8xl">Stop hoping your accounts renew.</h2></div>
            <div><p className="mb-7 text-xl leading-relaxed text-white/80">Start doing the work that makes renewals less surprising.</p><NewsletterForm location="footer" buttonVariant="navy" textColor="text-white" buttonText="Subscribe" subscribeText="" /><p className="mt-4 text-xs text-white/65">The weekly issue and practical tools remain free.</p></div>
          </div></div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
