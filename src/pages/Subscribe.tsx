import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";
import Footer from "@/components/Footer";

const delivery = [
  {
    number: "01",
    title: "A hard truth worth testing",
    description: "A clear argument grounded in visible evidence when it relies on external facts.",
  },
  {
    number: "02",
    title: "A practical way forward",
    description: "A clear view of the problem, who needs to act, and what to do next.",
  },
  {
    number: "03",
    title: "A tool you can run",
    description: "A practical checklist, worksheet, or review to use with your team that week.",
  },
];

const Subscribe = () => {
  useEffect(() => {
    import("@/utils/seoMeta").then(({ applyRouteSeo }) =>
      applyRouteSeo({
        title: "Subscribe to Churn Is Dead | Customer Success Newsletter",
        description: "Get one honest Customer Success take and one practical tool every Tuesday. Free, direct, and written for people doing the work.",
        path: "/subscribe",
      }),
    );
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-white/10 bg-navy-dark text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-5 md:px-6">
          <Link to="/" className="font-serif text-xl font-black md:text-2xl" aria-label="Churn Is Dead — Home">
            <span className="decoration-red-500 decoration-4 underline underline-offset-4">Churn</span> Is Dead
          </Link>
          <Link to="/newsletters" className="text-sm font-semibold text-white/70 transition-colors hover:text-white">
            Browse issues
          </Link>
        </div>
      </header>

      <main id="main-content">
        <section className="relative overflow-hidden bg-navy-dark pb-16 pt-14 text-white md:pb-24 md:pt-20">
          <div className="absolute -right-24 top-4 h-80 w-80 rounded-full border border-red-500/20" aria-hidden="true" />
          <div className="absolute -right-10 top-20 h-56 w-56 rounded-full border border-white/10" aria-hidden="true" />
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
              <div>
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                  One honest Customer Success email every Tuesday
                </p>
                <h1 className="max-w-3xl font-serif text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                  Customer Success advice should survive contact with a renewal.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">
                  Every Tuesday, Churn Is Dead takes one difficult CS problem, says what most teams avoid, and gives you a practical next step.
                </p>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-300">
                  <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-red-400" /> 40+ published issues</span>
                  <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-red-400" /> One useful email a week</span>
                  <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-red-400" /> Free to join</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white p-6 text-navy-dark shadow-2xl shadow-black/20 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Get the full newsletter</p>
                <h2 className="mt-3 font-serif text-2xl font-black sm:text-3xl">Get Tuesday&apos;s issue by email.</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  The complete issue and its practical resources—without relying on a social feed to show them to you.
                </p>
                <div className="mt-7">
                  <NewsletterForm
                    location="subscribe"
                    buttonVariant="vibrant-red"
                    buttonText="Get the Tuesday issue"
                    subscribeText="Free. Unsubscribe anytime."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-100 bg-cream/40 py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-5xl">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">What you will get</p>
                <h2 className="mt-3 font-serif text-3xl font-black text-navy-dark md:text-4xl">
                  Useful enough to take into your next team meeting.
                </h2>
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {delivery.map((item) => (
                  <article key={item.number} className="rounded-xl border border-gray-200 bg-white p-6">
                    <span className="font-serif text-3xl font-black text-red-600">{item.number}</span>
                    <h3 className="mt-5 text-xl font-bold text-navy-dark">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Built for the work</p>
                <h2 className="mt-3 font-serif text-3xl font-black text-navy-dark md:text-4xl">
                  For CS people who need useful help, not another slogan.
                </h2>
              </div>
              <div className="space-y-5 text-base leading-relaxed text-gray-600">
                <p>Read it if you work on renewals, expansion, customer outcomes, team meetings, CS metrics, or how AI should help your team.</p>
                <p>Skip it if you want recycled listicles, invented certainty or another reminder to “be more strategic.”</p>
                <Link to="/editorial-standards" className="inline-flex items-center gap-2 font-semibold text-red-600 hover:text-red-700">
                  See how each issue is researched <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-navy-dark py-14 text-white md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">Next issue: Tuesday</p>
              <h2 className="mt-3 font-serif text-3xl font-black md:text-4xl">See the problem clearly. Make the next move with confidence.</h2>
              <p className="mx-auto mt-4 max-w-xl text-gray-300">Join the email list and get the complete Churn Is Dead issue every week.</p>
              <div className="mx-auto mt-8 max-w-md">
                <NewsletterForm
                  location="subscribe"
                  buttonVariant="vibrant-red"
                  textColor="text-white"
                  buttonText="Subscribe free"
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

export default Subscribe;
