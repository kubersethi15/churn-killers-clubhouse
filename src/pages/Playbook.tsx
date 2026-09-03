import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { trackGrowthEvent } from "@/utils/growthTracking";
import { mergePlaybookManifest, type PlaybookRecord } from "@/utils/playbookManifest";
import { playbookDisplayDescription, playbookDisplayTitle } from "@/utils/playbookDisplay";

type Playbook = PlaybookRecord;

const STATIC_PLAYBOOKS: Playbook[] = [
  {
    id: "8",
    title: "The 30-Minute QBR: Three Slides",
    description: "The complete template: the customer's goal, what was achieved, and what happens next including where support is needed.",
    pdf_path: "/pdfs/30-Minute-QBR-Framework-ChurnIsDead.pdf",
    notion_link: null,
    newsletter_slug: null,
    newsletter_title: null,
    published_date: "2026-03-13T00:00:00Z",
  },
  {
    id: "1",
    title: "Customer Predictability Index (CPI) Framework",
    description: "A tiered framework to assess and improve customer predictability across trust, engagement, and outcomes.",
    pdf_path: "/pdfs/Customer_Predictability_Audit_ChurnIsDead.pdf",
    notion_link: "https://www.notion.so/Customer-Predictability-Index-CPI-Framework-Tiered-Guide-2015d0709c9980b18354e3512b86ebff",
    newsletter_slug: "customer-predictability-revolution",
    newsletter_title: "The Customer Predictability Revolution",
    published_date: "2025-06-10T00:00:00Z",
  },
  {
    id: "2",
    title: "Customer Momentum Framework",
    description: "A strategic framework to identify, track, and accelerate customer momentum across the entire lifecycle.",
    pdf_path: null,
    notion_link: "https://www.notion.so/Customer-Momentum-Framework-20a5d0709c9980259ea4c3fdcc0b38b1",
    newsletter_slug: "customer-momentum-over-health-score",
    newsletter_title: "Customer Momentum Over Health Score",
    published_date: "2025-06-03T00:00:00Z",
  },
  {
    id: "3",
    title: "CO-OP Framework",
    description: "A practical operating framework for improving renewal predictability and creating clearer expansion decisions.",
    pdf_path: null,
    notion_link: "https://www.notion.so/CO-OP-Framework-2235d0709c998059a8a4dc2c18393b25",
    newsletter_slug: "customer-momentum-over-health-score",
    newsletter_title: "Customer Momentum Over Health Score",
    published_date: "2025-06-03T00:00:00Z",
  },
  {
    id: "4",
    title: "AI Exposure Audit",
    description: "Diagnose how exposed your CS team is to AI-driven disruption and build a resilience plan.",
    pdf_path: "/pdfs/AI_Exposure_Audit_ChurnIsDead.pdf",
    notion_link: null,
    newsletter_slug: "ai-didnt-kill-customer-success",
    newsletter_title: "AI Didn't Kill Customer Success. It Exposed It.",
    published_date: "2026-01-13T00:00:00Z",
  },
  {
    id: "5",
    title: "CS Survival Audit",
    description: "Assess whether your CS function is positioned to survive the next round of cuts.",
    pdf_path: "/pdfs/CS_Survival_Audit_ChurnIsDead.pdf",
    notion_link: null,
    newsletter_slug: null,
    newsletter_title: null,
    published_date: "2025-05-20T00:00:00Z",
  },
  {
    id: "6",
    title: "Revenue Readiness Audit",
    description: "Evaluate your CS team's readiness to drive revenue through expansion and retention.",
    pdf_path: "/pdfs/Revenue_Readiness_Audit_ChurnIsDead.pdf",
    notion_link: null,
    newsletter_slug: null,
    newsletter_title: null,
    published_date: "2025-05-20T00:00:00Z",
  },
  {
    id: "7",
    title: "Strategic Impact Audit",
    description: "Measure and communicate CS's strategic impact to the executive team.",
    pdf_path: "/pdfs/Strategic_Impact_Audit_ChurnIsDead.pdf",
    notion_link: null,
    newsletter_slug: null,
    newsletter_title: null,
    published_date: "2025-05-20T00:00:00Z",
  },
  {
    id: "9",
    title: "Timeline Negotiator",
    description: "Negotiate realistic onboarding timelines that build trust with customers and internal stakeholders.",
    pdf_path: null,
    notion_link: "https://www.notion.so/Timeline-Negotiator-1f95d0709c99808e8926eaeff56ef138",
    newsletter_slug: "their-timeline-not-yours",
    newsletter_title: "Their Timeline, Not Yours",
    published_date: "2025-05-22T12:02:44Z",
  },
  {
    id: "10",
    title: "Kickoff Re-Discovery Checklist",
    description: "Align internally, validate goals, and earn trust before the first customer kickoff call.",
    pdf_path: null,
    notion_link: "https://www.notion.so/Kickoff-Re-Discovery-Checklist-1f95d0709c9980cfb35ae653901a6661",
    newsletter_slug: "the-perfect-kickoff-call",
    newsletter_title: "The Perfect Kickoff Call (Doesn't Start in the Calendar)",
    published_date: "2025-05-20T12:00:49Z",
  },
  {
    id: "11",
    title: "Kickoff Agenda Blueprint",
    description: "Lead high-trust kickoff calls across doers, managers, and executives.",
    pdf_path: null,
    notion_link: "https://www.notion.so/Kickoff-Agenda-Blueprint-1f95d0709c9980e1a233cdd529187a6e",
    newsletter_slug: "the-perfect-kickoff-call",
    newsletter_title: "The Perfect Kickoff Call (Doesn't Start in the Calendar)",
    published_date: "2025-05-20T12:00:49Z",
  },
];

const PROBLEMS = ["All", "Renewal risk", "Executive value", "AI readiness", "Meetings and workflows"] as const;
const KIT_FILTERS: Record<string, typeof PROBLEMS[number]> = {
  renewal: "Renewal risk",
  executive: "Executive value",
  ai: "AI readiness",
  cadence: "Meetings and workflows",
};

const matchesProblem = (playbook: Playbook, problem: typeof PROBLEMS[number]) => {
  if (problem === "All") return true;
  const text = `${playbook.title} ${playbook.description}`.toLowerCase();
  const terms: Record<Exclude<typeof PROBLEMS[number], "All">, string[]> = {
    "Renewal risk": ["renewal", "churn", "predictability", "momentum", "survival"],
    "Executive value": ["revenue", "strategic", "impact", "expansion", "qbr"],
    "AI readiness": ["ai", "exposure"],
    "Meetings and workflows": ["qbr", "framework", "momentum", "co-op"],
  };
  return terms[problem].some(term => text.includes(term));
};

const Playbooks = () => {
  // ?q= lets a campaign land on exactly the playbook it promised, instead of
  // dropping someone who asked for one thing onto a library of thirty-four.
  // Mirrors the existing ?kit= behaviour below.
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return (new URLSearchParams(window.location.search).get("q") || "").slice(0, 80);
  });
  const [problem, setProblem] = useState<typeof PROBLEMS[number]>(() => {
    if (typeof window === "undefined") return "All";
    return KIT_FILTERS[new URLSearchParams(window.location.search).get("kit") || ""] || "All";
  });
  const [visibleCount, setVisibleCount] = useState(12);
  const [playbooks, setPlaybooks] = useState<Playbook[]>(
    STATIC_PLAYBOOKS.sort((a, b) => {
      if (!a.published_date) return 1;
      if (!b.published_date) return -1;
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
    })
  );
  const loading = false;

  useEffect(() => {
    import("@/utils/seoMeta").then(({ applyRouteSeo }) =>
      applyRouteSeo({
        title: "Free Customer Success Playbooks | Churn Is Dead",
        description: "Free Customer Success checklists, worksheets, and audits for renewals, executive reviews, AI, churn analysis, and team leadership.",
        path: "/playbook",
      })
    );
    window.scrollTo(0, 0);

    fetch("/pdfs/manifest.json")
      .then(response => response.ok ? response.json() : [])
      .then((archive: Playbook[]) => {
        setPlaybooks(current => mergePlaybookManifest(current, archive));
      })
      .catch(error => console.warn("Playbook archive manifest unavailable", error));
  }, []);

  const formatDate = (dateString: string) => format(new Date(dateString), "MMM yyyy");
  const filteredPlaybooks = playbooks.filter(playbook => {
    const searchable = `${playbook.title} ${playbook.description} ${playbook.newsletter_title ?? ""}`.toLowerCase();
    return searchable.includes(query.trim().toLowerCase()) && matchesProblem(playbook, problem);
  });
  const visiblePlaybooks = filteredPlaybooks.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#f3efe7]">
      <Header />
      <main id="main-content">

      {/* Header */}
      <section className="editorial-grid-dark relative overflow-hidden border-b border-white/15 bg-navy-dark pb-14 pt-28 text-white md:pb-20 md:pt-40">
        <div className="signal-orbit opacity-40" aria-hidden="true" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative mx-auto max-w-[1100px]">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-red-400">Free. Open. Built to use.</p>
            <h1 className="max-w-5xl font-serif text-5xl font-black uppercase leading-[0.84] tracking-[-0.06em] md:text-8xl lg:text-9xl">
              Free Customer Success playbooks
            </h1>
            <p className="mt-8 max-w-xl border-l-2 border-red-500 pl-5 text-lg leading-relaxed text-white/65 md:text-xl">
              Free checklists and worksheets for real Customer Success work.
            </p>
          </div>
        </div>
      </section>

      {/* Playbooks List */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 border-2 border-navy-dark bg-white p-5 shadow-[8px_8px_0_0_hsl(var(--red))] md:p-7">
            <label htmlFor="playbook-search" className="text-[10px] uppercase tracking-[0.22em] text-red font-bold">
              Find a playbook
            </label>
            <div className="relative mt-3 mb-5">
              <Input
                id="playbook-search"
                type="search"
                value={query}
                onChange={event => {
                  setQuery(event.target.value);
                  setVisibleCount(12);
                }}
                placeholder="Renewals, QBRs, AI, metrics, expansion..."
                className="h-14 rounded-none border-gray-300 pl-11 text-base focus-visible:ring-red-600"
              />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Filter playbooks by problem">
              {PROBLEMS.map(item => (
                <button key={item} type="button" onClick={() => { setProblem(item); setVisibleCount(12); }} aria-pressed={problem === item} className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${problem === item ? "bg-navy-dark text-white" : "border border-gray-300 text-gray-700 hover:border-navy-dark"}`}>
                  {item}
                </button>
              ))}
            </div></div>
            {loading ? (
              <div className="space-y-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-5 w-2/3 bg-gray-100 rounded mb-2" />
                    <div className="h-4 w-full bg-gray-50 rounded mb-1" />
                    <div className="h-4 w-1/2 bg-gray-50 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredPlaybooks.length === 0 ? (
              <p className="text-gray-600 py-16 text-center">No playbook matches that problem yet.</p>
            ) : (
              <div className="divide-y divide-navy-dark/20 border-y-2 border-navy-dark">
                {visiblePlaybooks.map((pb, index) => {
                  const displayTitle = playbookDisplayTitle(pb);
                  const displayDescription = playbookDisplayDescription(pb);
                  return (
                    <Link
                      key={pb.id}
                      to={`/playbook/${encodeURIComponent(pb.id)}?title=${encodeURIComponent(displayTitle)}`}
                      onClick={() => void trackGrowthEvent({ eventName: "resource_open", resourceId: pb.id })}
                      className="group block transition-colors hover:bg-white"
                    >
                      <article className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-start gap-4 py-7 md:grid-cols-[70px_minmax(0,1fr)_auto] md:gap-6 md:px-5">
                        <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-red-600">{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          <h3 className="font-serif text-2xl font-black leading-tight tracking-[-0.025em] text-navy-dark transition-colors group-hover:text-red-600 md:text-3xl">
                            {displayTitle}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                            {displayDescription}
                          </p>
                          {pb.published_date && (
                            <span className="mt-3 block text-xs text-gray-500">
                              {formatDate(pb.published_date)}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="mt-1 h-6 w-6 flex-none text-navy-dark transition-transform group-hover:translate-x-2 group-hover:text-red-600" aria-hidden="true" />
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
            {visibleCount < filteredPlaybooks.length && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(count => count + 12)}
                  className="border-2 border-navy-dark px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-navy-dark transition-colors hover:bg-navy-dark hover:text-white"
                >
                  Show more playbooks
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="editorial-grid-dark border-t border-white/15 bg-navy-dark py-16 text-white md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-serif text-4xl font-black uppercase leading-none tracking-[-0.045em] md:text-6xl">Want the next playbook?</h2>
            <p className="mb-7 mt-5 text-sm text-white/55">Get the Tuesday issue and its practical tool by email.</p>
            <NewsletterForm location="playbook" buttonVariant="vibrant-red" buttonText="Join the list" subscribeText="" />
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
};

export default Playbooks;
