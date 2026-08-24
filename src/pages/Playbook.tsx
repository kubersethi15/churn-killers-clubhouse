import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Download, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { trackGrowthEvent } from "@/utils/growthTracking";
import { mergePlaybookManifest, type PlaybookRecord } from "@/utils/playbookManifest";

type Playbook = PlaybookRecord;

const STATIC_PLAYBOOKS: Playbook[] = [
  {
    id: "8",
    title: "The 30-Minute QBR Framework",
    description: "A decision-driven QBR structure built for complex enterprise accounts. Three blocks, pre-wire playbook, strategic vs. operational calibration, and a one-page success plan that IS the meeting.",
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

const PROBLEMS = ["All", "Renewal risk", "Executive value", "AI readiness", "Operating cadence"] as const;
const KIT_FILTERS: Record<string, typeof PROBLEMS[number]> = {
  renewal: "Renewal risk",
  executive: "Executive value",
  ai: "AI readiness",
  cadence: "Operating cadence",
};

const matchesProblem = (playbook: Playbook, problem: typeof PROBLEMS[number]) => {
  if (problem === "All") return true;
  const text = `${playbook.title} ${playbook.description}`.toLowerCase();
  const terms: Record<Exclude<typeof PROBLEMS[number], "All">, string[]> = {
    "Renewal risk": ["renewal", "churn", "predictability", "momentum", "survival"],
    "Executive value": ["revenue", "strategic", "impact", "expansion", "qbr"],
    "AI readiness": ["ai", "exposure"],
    "Operating cadence": ["qbr", "framework", "momentum", "co-op"],
  };
  return terms[problem].some(term => text.includes(term));
};

const PlaybookVault = () => {
  // ?q= lets a campaign land on exactly the playbook it promised, instead of
  // dropping someone who asked for one thing onto a vault of thirty-four.
  // Mirrors the existing ?kit= behaviour below.
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return (new URLSearchParams(window.location.search).get("q") || "").slice(0, 80);
  });
  const [problem, setProblem] = useState<typeof PROBLEMS[number]>(() => {
    if (typeof window === "undefined") return "All";
    return KIT_FILTERS[new URLSearchParams(window.location.search).get("kit") || ""] || "All";
  });
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
        title: "Playbook Vault | Churn Is Dead",
        description: "Downloadable CS playbooks and audits: QBR conversion, renewal readiness, AI exposure, churn attribution, and more. Built for enterprise CS operators.",
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content">

      {/* Header */}
      <section className="pt-28 pb-10 md:pt-36 md:pb-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-3">
              Playbook Vault
            </h1>
            <p className="text-lg text-gray-600">
              Pick the operating problem. Leave with a tool you can run this week.
            </p>
          </div>
        </div>
      </section>

      {/* Playbooks List */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-10 grid gap-3 sm:grid-cols-3">
              {[
                ["Protect a renewal", "Renewal risk", "Diagnose hidden risk and customer predictability."],
                ["Prove CS value", "Executive value", "Connect CS work to decisions, revenue, and impact."],
                ["Redesign the cadence", "Operating cadence", "Replace status meetings with working systems."],
              ].map(([title, target, description]) => (
                <button key={title} type="button" onClick={() => setProblem(target as typeof PROBLEMS[number])} className="rounded-lg border border-gray-200 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-red-600 hover:shadow-sm">
                  <span className="mb-1 block font-serif text-base font-bold text-navy-dark">{title}</span>
                  <span className="block text-xs leading-relaxed text-gray-600">{description}</span>
                </button>
              ))}
            </div>
            <label htmlFor="playbook-search" className="text-[10px] uppercase tracking-[0.22em] text-red font-bold">
              Find the operating problem
            </label>
            <div className="relative mt-3 mb-10">
              <Input
                id="playbook-search"
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Renewals, QBRs, AI, metrics, expansion..."
                className="h-12 pl-11"
              />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            </div>
            <div className="mb-10 flex flex-wrap gap-2" aria-label="Filter playbooks by problem">
              {PROBLEMS.map(item => (
                <button key={item} type="button" onClick={() => setProblem(item)} aria-pressed={problem === item} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${problem === item ? "bg-navy-dark text-white" : "border border-gray-200 text-gray-700 hover:border-navy-dark"}`}>
                  {item}
                </button>
              ))}
            </div>
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
              <div className="space-y-0 divide-y divide-gray-100">
                {filteredPlaybooks.map((pb) => (
                  <div key={pb.id} className="py-7 first:pt-0 last:pb-0">
                    {/* Title + date */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg md:text-xl font-serif font-bold text-navy-dark leading-snug">
                        {pb.title}
                      </h3>
                      {pb.published_date && (
                        <span className="text-xs text-gray-600 flex-shrink-0 mt-1">
                          {formatDate(pb.published_date)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {pb.description}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      {pb.pdf_path && (
                        <a
                          href={pb.pdf_path}
                          download
                          onClick={() => void trackGrowthEvent({ eventName: "resource_open", resourceId: pb.id })}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </a>
                      )}
                      {pb.notion_link && (
                        <a
                          href={pb.notion_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => void trackGrowthEvent({ eventName: "resource_open", resourceId: pb.id })}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-dark hover:text-red-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View in Notion
                        </a>
                      )}
                      {pb.newsletter_slug && (
                        <>
                          <span className="text-gray-400">·</span>
                          <Link
                            to={`/newsletter/${pb.newsletter_slug}`}
                            className="text-sm text-gray-600 hover:text-navy-dark transition-colors"
                          >
                            From: {pb.newsletter_title}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-gray-100 bg-cream/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-red font-bold mb-3">New every Tuesday</p>
            <h2 className="text-2xl font-serif font-bold text-navy-dark mb-2">Do not wait for the archive.</h2>
            <p className="text-sm text-gray-500 mb-6">Get the argument, framework, and playbook as each issue publishes.</p>
            <NewsletterForm location="playbook" buttonVariant="vibrant-red" buttonText="Join the list" subscribeText="" />
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
};

export default PlaybookVault;
