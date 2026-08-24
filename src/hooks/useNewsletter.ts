
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Newsletter } from "@/types/newsletter";
import { isPreviewMode } from "@/utils/preview";

const isNewsletter = (value: unknown, slug: string): value is Newsletter => {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<Newsletter>;
  return row.slug === slug && typeof row.title === "string" && typeof row.content === "string";
};

const readEmbeddedNewsletter = (slug: string): Newsletter | null => {
  const node = document.getElementById("ci-newsletter");
  if (!node?.textContent) return null;
  try {
    const parsed: unknown = JSON.parse(node.textContent);
    return isNewsletter(parsed, slug) ? parsed : null;
  } catch {
    return null;
  }
};

const fetchPrerenderedNewsletter = async (slug: string): Promise<Newsletter | null> => {
  const embedded = readEmbeddedNewsletter(slug);
  if (embedded) return embedded;
  try {
    const catalogResponse = await fetch("/newsletter/catalog.json", {
      headers: { Accept: "application/json" },
    });
    if (catalogResponse.ok) {
      const catalog: unknown = await catalogResponse.json();
      if (Array.isArray(catalog)) {
        const exact = catalog.find((row) => isNewsletter(row, slug));
        if (exact && isNewsletter(exact, slug)) return exact;
      }
    }

    const response = await fetch(`/newsletter/${encodeURIComponent(slug)}/index.html`, {
      headers: { Accept: "text/html" },
    });
    if (!response.ok) return null;
    const documentCopy = new DOMParser().parseFromString(await response.text(), "text/html");
    const payload = documentCopy.getElementById("ci-newsletter")?.textContent;
    if (!payload) return null;
    const parsed: unknown = JSON.parse(payload);
    return isNewsletter(parsed, slug) ? parsed : null;
  } catch {
    return null;
  }
};

export const useNewsletter = (slug: string | undefined) => {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNewsletter = async () => {
      if (!slug) {
        setError("No slug provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log(`Fetching newsletter with slug: "${slug}"`);

        // The checked-in publication package is canonical for public reading.
        // It can be newer and more complete than the delivery database, and it
        // also preserves migration-era issues that never reached that table.
        const prerendered = await fetchPrerenderedNewsletter(slug);
        if (prerendered) {
          setNewsletter(prerendered);
          document.title = `${prerendered.title} | Churn Is Dead`;
          setError(null);
          setLoading(false);
          return;
        }
        
        // Fall back to the delivery database for preview-only or unpublished
        // records that are intentionally absent from the public catalogue.
        let exactQuery = supabase
          .from("newsletters")
          .select("*")
          .eq("slug", slug);
        if (!isPreviewMode()) {
          exactQuery = exactQuery.lte("published_date", new Date().toISOString());
        }
        const { data: exactMatch, error: exactError } = await exactQuery.maybeSingle();
          
        if (exactMatch) {
          console.log("Found newsletter with exact slug match");
          setNewsletter(exactMatch as Newsletter);
          document.title = `${exactMatch.title} | Churn Is Dead`;
          setError(null);
          setLoading(false);
          return;
        }

        // If no exact match, try fuzzy matching
        console.log("No exact match found, trying fuzzy matching");
        
        let listQuery = supabase
          .from("newsletters")
          .select("*");
        if (!isPreviewMode()) {
          listQuery = listQuery.lte("published_date", new Date().toISOString());
        }
        const { data: allNewsletters, error: listError } = await listQuery;
          
        if (listError) {
          console.error("Error fetching newsletters list:", listError);
          throw listError;
        }

        if (allNewsletters) {
          // Enhanced normalization function
          const normalizeSlug = (s: string) => {
            return s.trim()
              .toLowerCase()
              .replace(/[\n\r\s]+/g, '-')
              .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
              .replace(/-+/g, '-') // Replace multiple hyphens with single
              .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
          };
          
          const normalizedRequestedSlug = normalizeSlug(slug);
          
          // Enhanced matching strategies
          const matchingNewsletter = allNewsletters.find(newsletter => {
            const dbSlug = newsletter.slug || '';
            const normalizedDbSlug = normalizeSlug(dbSlug);
            
            // Strategy 1: Exact normalized match
            if (normalizedDbSlug === normalizedRequestedSlug) {
              console.log("Match found with strategy 1 - exact normalized");
              return true;
            }
            
            // Strategy 2: Remove common words and prefixes
            const removeCommonWords = (s: string) => {
              return s.replace(/^(the-|a-|an-|that-|thats-)/g, '')
                    .replace(/-the-|-a-|-an-|-that-|-thats-/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
            };
            
            const dbWithoutCommon = removeCommonWords(normalizedDbSlug);
            const requestedWithoutCommon = removeCommonWords(normalizedRequestedSlug);
            
            if (dbWithoutCommon === requestedWithoutCommon) {
              console.log("Match found with strategy 2 - common words removed");
              return true;
            }
            
            // Strategy 3: Partial matching (one contains the other)
            if (dbWithoutCommon.length > 5 && requestedWithoutCommon.length > 5) {
              if (dbWithoutCommon.includes(requestedWithoutCommon) || 
                  requestedWithoutCommon.includes(dbWithoutCommon)) {
                console.log("Match found with strategy 3 - partial match");
                return true;
              }
            }
            
            // Strategy 4: Word-based matching (split by hyphens and match significant words)
            const dbWords = normalizedDbSlug.split('-').filter(word => word.length > 2);
            const requestedWords = normalizedRequestedSlug.split('-').filter(word => word.length > 2);
            
            if (dbWords.length >= 3 && requestedWords.length >= 3) {
              const matchingWords = dbWords.filter(word => requestedWords.includes(word));
              if (matchingWords.length >= Math.min(3, Math.min(dbWords.length, requestedWords.length) * 0.6)) {
                console.log("Match found with strategy 4 - word-based matching");
                return true;
              }
            }
            
            return false;
          });
          
          if (matchingNewsletter) {
            console.log("Found matching newsletter:", matchingNewsletter);
            setNewsletter(matchingNewsletter as Newsletter);
            document.title = `${matchingNewsletter.title} | Churn Is Dead`;
            setError(null);
          } else {
            console.error("Newsletter not found with slug:", slug);
            console.log("Available newsletters:", allNewsletters.map(n => ({ title: n.title, slug: n.slug })));
            setError("Newsletter not found");
            
            toast({ title: "Issue unavailable", description: "This issue could not be loaded.", variant: "destructive" });
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNewsletter();
    }
  }, [slug, toast]);

  return { newsletter, loading, error };
};
