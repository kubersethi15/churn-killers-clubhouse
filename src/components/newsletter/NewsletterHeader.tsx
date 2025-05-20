
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Newsletter } from "@/types/newsletter";

type NewsletterHeaderProps = {
  newsletter: Newsletter | null;
  loading: boolean;
  error: string | null;
  formatDate: (dateString: string) => string;
};

const NewsletterHeader = ({ newsletter, loading, error, formatDate }: NewsletterHeaderProps) => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-navy-dark text-white">
      <div className="container mx-auto px-4 md:px-6">
        <Button
          variant="ghost"
          className="text-white mb-8 hover:text-white hover:bg-navy-light"
          asChild
        >
          <Link to="/newsletters">
            <ArrowLeft size={16} className="mr-2" /> Back to Newsletters
          </Link>
        </Button>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading newsletter...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <h1 className="text-3xl md:text-5xl font-serif font-black mb-6">
              {error}
            </h1>
            <p className="mb-6 text-gray-300">
              The newsletter you're looking for could not be found. It may have been removed or the link might be incorrect.
            </p>
            <Button asChild>
              <Link to="/newsletters">Browse All Newsletters</Link>
            </Button>
          </div>
        ) : newsletter ? (
          <div className="max-w-3xl mx-auto">
            {newsletter.category && (
              <div className="text-sm font-medium text-red-400 uppercase tracking-wide mb-4">
                {newsletter.category}
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-serif font-black mb-6">
              {newsletter.title}
            </h1>
            <div className="flex items-center gap-3 text-gray-300 mb-6">
              <span>{formatDate(newsletter.published_date)}</span>
              <span>•</span>
              <span>{newsletter.read_time}</span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default NewsletterHeader;
