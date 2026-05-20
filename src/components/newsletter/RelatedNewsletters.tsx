import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/formatUtils";

interface RelatedNewslettersProps {
  currentSlug: string;
  limit?: number;
}

interface NewsletterCard {
  slug: string;
  title: string;
  excerpt: string;
  published_date: string;
  read_time: string;
  category: string;
}

/**
 * Shows the 3 most recent newsletters (excluding the one currently being read).
 * Designed to live at the bottom of NewsletterDetail to drive pages-per-session
 * and prevent the dead-end reading experience.
 */
const RelatedNewsletters = ({ currentSlug, limit = 3 }: RelatedNewslettersProps) => {
  const [items, setItems] = useState<NewsletterCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const nowIso = new Date().toISOString();
        const { data, error } = await supabase
          .from("newsletters")
          .select("slug, title, excerpt, published_date, read_time, category")
          .lte("published_date", nowIso)
          .neq("slug", currentSlug)
          .order("published_date", { ascending: false })
          .limit(limit);

        if (error) {
          console.error("Failed to load related newsletters:", error);
        } else if (data) {
          setItems(data as NewsletterCard[]);
        }
      } catch (err) {
        console.error("RelatedNewsletters fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, [currentSlug, limit]);

  if (loading || items.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-200 mt-12">
      <p className="text-xs font-bold tracking-widest text-[#C8553D] uppercase mb-2">
        Keep Reading
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900">
        Recent issues
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((nl) => (
          <Link
            key={nl.slug}
            to={`/newsletter/${nl.slug}`}
            className="group block p-5 border border-gray-200 rounded-lg hover:border-[#C8553D] hover:shadow-md transition-all bg-white"
          >
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">
              {nl.category || "Strategy"}
            </p>
            <h3 className="text-base font-semibold mb-2 text-gray-900 group-hover:text-[#C8553D] transition-colors leading-snug">
              {nl.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-3 leading-relaxed">
              {nl.excerpt}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(nl.published_date)} · {nl.read_time || "9 min read"}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          to="/newsletters"
          className="inline-block text-sm font-semibold text-[#C8553D] hover:underline"
        >
          See all issues →
        </Link>
      </div>
    </section>
  );
};

export default RelatedNewsletters;
