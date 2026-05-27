import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { V2ReportRenderer } from "@/components/cs-analyzer/report-v2/V2ReportRenderer";
import { DEMO_REPORT, DEMO_EVIDENCE_ANCHORS } from "@/data/demoReport";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CSAnalyzerDemo = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Example Report | CS Analyzer | Churn Is Dead";
  }, []);

  const runCtaHref = user ? "/cs-analyzer" : "/auth?from=/cs-analyzer";
  const runCtaLabel = user ? "Run your own analysis" : "Sign in to run your own analysis";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Editorial intro band */}
        <section className="border-b border-navy-dark/10 bg-cream/40">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14">
            <p className="text-[10px] uppercase tracking-[0.22em] text-red font-bold mb-3">
              Example Report
            </p>
            <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-4 leading-[1.05] tracking-tight">
              This is what the analyzer
              <br />
              actually <span className="underline-red">produces</span>.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-6">
              A real transcript was run through the same five-agent pipeline you'd use. Names changed, structure intact. Scroll through, then run one of your own.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to={runCtaHref}
                className="inline-flex items-center gap-2 py-2.5 px-5 bg-red text-white text-sm font-semibold rounded-lg hover:bg-red-dark transition-colors"
              >
                {runCtaLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-muted-foreground">
                Takes ~45 seconds. Free while we're testing.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-navy-dark/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground/70 mb-1">Customer</p>
                <p className="font-semibold text-navy-dark">Meridian Financial Group</p>
              </div>
              <div>
                <p className="text-muted-foreground/70 mb-1">Scenario</p>
                <p className="font-semibold text-navy-dark">Renewal at risk</p>
              </div>
              <div>
                <p className="text-muted-foreground/70 mb-1">Transcript length</p>
                <p className="font-semibold text-navy-dark">~28 minutes</p>
              </div>
              <div>
                <p className="text-muted-foreground/70 mb-1">Analyzer pipeline</p>
                <p className="font-semibold text-navy-dark">5 specialist agents</p>
              </div>
            </div>
          </div>
        </section>

        {/* The actual report */}
        <section className="bg-background">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <V2ReportRenderer
              report={DEMO_REPORT}
              evidenceAnchors={DEMO_EVIDENCE_ANCHORS}
              title="Renewal call — Meridian Financial Group (SIEM consolidation review)"
              createdAt={DEMO_REPORT.meta.generated_at_iso}
            />
          </div>
        </section>

        {/* Bottom CTA — after they've read */}
        <section className="border-t border-navy-dark/10 bg-navy-dark text-white">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-black mb-3 leading-tight">
              Got a call transcript you're staring at?
            </h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Paste it in. Get back what you'd write if you had three more hours and a clearer head.
            </p>
            <Link
              to={runCtaHref}
              className="inline-flex items-center gap-2 py-3 px-6 bg-red text-white text-sm font-semibold rounded-lg hover:bg-red-dark transition-colors"
            >
              {runCtaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CSAnalyzerDemo;
