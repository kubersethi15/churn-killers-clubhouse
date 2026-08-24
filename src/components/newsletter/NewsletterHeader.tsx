import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Newsletter } from "@/types/newsletter";

type NewsletterHeaderProps = {
  newsletter: Newsletter | null;
  loading: boolean;
  error: string | null;
  formatDate: (dateString: string) => string;
};

const NewsletterHeader = ({ newsletter, loading, error, formatDate }: NewsletterHeaderProps) => {
  const displayCategory = newsletter?.slug === "digital-cs-coverage-silence"
    ? "Digital Customer Success"
    : newsletter?.category;

  return (
    <section className="editorial-grid-dark relative overflow-hidden border-b border-white/15 bg-navy-dark pb-14 pt-28 text-white md:pb-20 md:pt-40">
      <div className="signal-orbit opacity-30" aria-hidden="true" />
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative mx-auto max-w-[1100px]">
          {/* Back link */}
          <Link 
            to="/newsletters" 
            className="mb-10 inline-flex items-center gap-2 border-b border-white/30 pb-1 text-xs font-bold uppercase tracking-[0.12em] text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            All Issues
          </Link>

          {loading ? (
            <div className="py-8">
              <div className="h-10 w-3/4 bg-gray-100 rounded animate-pulse mb-4" />
              <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : error ? (
            <div className="py-8">
              <h1 className="mb-4 font-serif text-4xl font-black uppercase text-white">
                Newsletter not found
              </h1>
              <p className="mb-6 text-white/60">{error}</p>
              <Link to="/newsletters" className="text-red-600 font-semibold text-sm hover:underline">
                Browse all issues
              </Link>
            </div>
          ) : newsletter ? (
            <div>
              {displayCategory && (
                <span className="mb-5 block text-[10px] font-black uppercase tracking-[0.24em] text-red-400">
                  {displayCategory}
                </span>
              )}
              <h1 className="mb-8 max-w-5xl font-serif text-5xl font-black leading-[0.95] tracking-[-0.055em] text-white md:text-7xl lg:text-8xl">
                {newsletter.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 border-t border-white/20 pt-5 text-xs font-semibold uppercase tracking-[0.08em] text-white/50">
                <Link to="/about" className="inline-flex items-center gap-3 text-white/70 hover:text-white">
                  <img
                    src="/kuber-sethi.jpg"
                    alt=""
                    width="36"
                    height="36"
                    className="h-10 w-10 rounded-none border border-white/30 object-cover grayscale"
                    loading="lazy"
                  />
                  <span>By Kuber Sethi</span>
                </Link>
                <span className="text-white/20">/</span>
                <span>{formatDate(newsletter.published_date)}</span>
                <span className="text-white/20">/</span>
                <span>{newsletter.read_time}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default NewsletterHeader;
