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
  return (
    <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link 
            to="/newsletters" 
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy-dark transition-colors mb-8"
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
              <h1 className="text-3xl font-serif font-black text-navy-dark mb-4">
                Newsletter not found
              </h1>
              <p className="text-gray-500 mb-6">{error}</p>
              <Link to="/newsletters" className="text-red-600 font-semibold text-sm hover:underline">
                Browse all issues
              </Link>
            </div>
          ) : newsletter ? (
            <div>
              {newsletter.category && (
                <span className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-4 block">
                  {newsletter.category}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark leading-[1.1] mb-5">
                {newsletter.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>By Kuber Sethi</span>
                <span className="text-gray-300">·</span>
                <span>{formatDate(newsletter.published_date)}</span>
                <span className="text-gray-300">·</span>
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
