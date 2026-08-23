import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { applyRouteSeo } from "@/utils/seoMeta";

type PolicyLayoutProps = {
  title: string;
  description: string;
  path: string;
  eyebrow: string;
  updated: string;
  children: ReactNode;
};

const PolicyLayout = ({ title, description, path, eyebrow, updated, children }: PolicyLayoutProps) => {
  useEffect(() => {
    applyRouteSeo({ title: `${title} | Churn Is Dead`, description, path });
    window.scrollTo(0, 0);
  }, [description, path, title]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content">
        <section className="pt-28 pb-10 md:pt-36 md:pb-14 border-b border-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-[10px] uppercase tracking-[0.22em] text-red font-bold mb-3">{eyebrow}</p>
              <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-4">{title}</h1>
              <p className="text-gray-600">Last updated {updated}</p>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <article className="max-w-2xl mx-auto space-y-8 text-gray-700 leading-relaxed policy-content">
              {children}
              <div className="pt-8 border-t border-gray-200 flex flex-wrap gap-5 text-sm font-semibold">
                <Link to="/privacy" className="text-red-600 hover:text-red-700">Privacy</Link>
                <Link to="/terms" className="text-red-600 hover:text-red-700">Terms</Link>
                <Link to="/analyzer-data-handling" className="text-red-600 hover:text-red-700">Analyzer data handling</Link>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PolicyLayout;
