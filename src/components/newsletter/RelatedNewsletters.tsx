import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/formatUtils";

interface RelatedNewslettersProps {
  currentSlug: string;
  category?: string;
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
 * Shows the issues most topically related to the one being read.
 *
 * The set is computed at build time by scripts/related_graph.py and embedded in
 * the prerendered page as #ci-related-issues, so the rendered DOM matches the
 * crawlable HTML and needs no Supabase round-trip. The previous behaviour --
 * the 3 most recent issues in the same category -- left 23 of 46 published
 * issues with no inbound internal link at all and rewrote the graph weekly.
 *
 * The Supabase query remains as a fallback for dev and for any page served
 * before the prerender step has run.
 */
type EmbeddedRelated = {
  currentSlug: string;
  hub: string | null;
  items: NewsletterCard[];
};

const readEmbeddedRelated = (currentSlug: string): EmbeddedRelated | null => {
  if (typeof document === "undefined") return null;
  const node = document.getElementById("ci-related-issues");
  if (!node?.textContent) return null;
  try {
    const parsed = JSON.parse(node.textContent) as EmbeddedRelated;
    return parsed?.currentSlug === currentSlug && parsed.items?.length ? parsed : null;
  } catch {
    return null;
  }
};

const RelatedNewsletters = ({ currentSlug, category, limit = 3 }: RelatedNewslettersProps) => {
  // The document payload belongs to the statically rendered route. A
  // client-side navigation can reuse the same document, so ignore the payload
  // unless it explicitly matches the issue now on screen.
  const embedded = useMemo(() => readEmbeddedRelated(currentSlug), [currentSlug]);
  const [items, setItems] = useState<NewsletterCard[]>(embedded?.items ?? []);
  const [loading, setLoading] = useState(!embedded);
  const hubSlug = embedded?.hub ?? null;

  useEffect(() => {
    // The build-time graph is authoritative when present.
    if (embedded) {
      setItems(embedded.items);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchRecent = async () => {
      try {
        const nowIso = new Date().toISOString();
        let query = supabase
          .from("newsletters")
          .select("slug, title, excerpt, published_date, read_time, category")
          .lte("published_date", nowIso)
          .neq("slug", currentSlug)
          .order("published_date", { ascending: false });

        if (category) query = query.eq("category", category);
        const { data, error } = await query.limit(limit);

        if (error) {
          console.error("Failed to load related newsletters:", error);
        } else if (data) {
          if (data.length > 0) {
            setItems(data as NewsletterCard[]);
          } else if (category) {
            const { data: fallback } = await supabase
              .from("newsletters")
              .select("slug, title, excerpt, published_date, read_time, category")
              .lte("published_date", nowIso)
              .neq("slug", currentSlug)
              .order("published_date", { ascending: false })
              .limit(limit);
            setItems((fallback || []) as NewsletterCard[]);
          }
        }
      } catch (err) {
        console.error("RelatedNewsletters fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, [category, currentSlug, limit, embedded]);

  if (loading || items.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-200 mt-12">
      <p className="text-xs font-bold tracking-widest text-red-700 uppercase mb-2">
        Keep Reading
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900">
        More on this problem
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
          className="inline-block text-sm font-semibold text-red-700 hover:underline"
        >
          See all issues
        </Link>
        {hubSlug && (
          <Link
            to={`/topics/${hubSlug}`}
            className="inline-block ml-6 text-sm font-semibold text-red-700 hover:underline"
          >
            More on this topic
          </Link>
        )}
      </div>
    </section>
  );
};

export default RelatedNewsletters;
