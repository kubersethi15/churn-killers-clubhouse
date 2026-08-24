import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import ContactDialog from "@/components/ContactDialog";
import BrandMark from "@/components/BrandMark";

const Footer = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const links = [
    ["Issues", "/newsletters"],
    ["Playbooks", "/playbook"],
    ["About", "/about"],
    ["Standards", "/editorial-standards"],
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
    ["Data handling", "/analyzer-data-handling"],
  ];

  return (
    <>
      <footer className="editorial-grid-dark border-t border-white/15 bg-navy-dark py-12 text-white md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-12 border-b border-white/20 pb-12 lg:grid-cols-[1fr_1fr]">
              <div>
                <Link to="/" className="inline-flex items-center gap-3">
                  <BrandMark className="h-11 w-11 rounded-none border border-white/30" />
                  <span className="font-serif text-2xl font-black uppercase tracking-[-0.045em]">Churn Is Dead</span>
                </Link>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">Honest Customer Success thinking for people doing the work.</p>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
                {links.map(([label, href]) => <Link key={href} to={href} className="font-semibold text-white/60 transition-colors hover:text-white">{label}</Link>)}
                <button onClick={() => setIsContactOpen(true)} className="text-left font-semibold text-white/60 transition-colors hover:text-white">Contact</button>
                <a href="https://www.linkedin.com/in/kuber-cs-strategist/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-white/60 transition-colors hover:text-white">LinkedIn <ArrowUpRight className="h-3.5 w-3.5" /></a>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
              <span>© {currentYear} Churn Is Dead</span>
              <span>Independent. Direct. Useful.</span>
            </div>
          </div>
        </div>
      </footer>
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
    </>
  );
};

export default Footer;
