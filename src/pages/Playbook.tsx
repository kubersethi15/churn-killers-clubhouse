import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Download, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { format } from "date-fns";

interface Playbook {
  id: string;
  title: string;
  description: string;
  pdf_path: string | null;
  notion_link: string | null;
  newsletter_slug: string | null;
  newsletter_title: string | null;
  published_date: string;
}

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
    description: "The exact system that helped save a $2M renewal — now used by 10+ enterprise CS teams to increase renewal predictability and expansion velocity.",
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
];

const PlaybookVault = () => {
  const [playbooks] = useState<Playbook[]>(
    STATIC_PLAYBOOKS.sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
  );
  const loading = false;

  useEffect(() => {
    document.title = "Playbook Vault | Churn Is Dead";
    window.scrollTo(0, 0);
  }, []);

  const formatDate = (dateString: string) => format(new Date(dateString), "MMM yyyy");

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Header */}
      <section className="pt-28 pb-10 md:pt-36 md:pb-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-3">
              Playbook Vault
            </h1>
            <p className="text-lg text-gray-400">
              Every framework, audit, and diagnostic we've published. Free. Always.
            </p>
          </div>
        </div>
      </section>

      {/* Playbooks List */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
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
            ) : playbooks.length === 0 ? (
              <p className="text-gray-400 py-16 text-center">No playbooks yet. Check back soon.</p>
            ) : (
              <div className="space-y-0 divide-y divide-gray-100">
                {playbooks.map((pb) => (
                  <div key={pb.id} className="py-7 first:pt-0 last:pb-0">
                    {/* Title + date */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg md:text-xl font-serif font-bold text-navy-dark leading-snug">
                        {pb.title}
                      </h3>
                      <span className="text-xs text-gray-300 flex-shrink-0 mt-1">
                        {formatDate(pb.published_date)}
                      </span>
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
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-dark hover:text-red-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View in Notion
                        </a>
                      )}
                      {pb.newsletter_slug && (
                        <>
                          <span className="text-gray-200">·</span>
                          <Link
                            to={`/newsletter/${pb.newsletter_slug}`}
                            className="text-sm text-gray-400 hover:text-navy-dark transition-colors"
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

      {/* Bottom note */}
      <section className="py-10 border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-gray-400">
              New playbook every Tuesday with each newsletter issue. 
              <Link to="/newsletters" className="text-red-600 hover:underline ml-1">Subscribe to get them first.</Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PlaybookVault;
