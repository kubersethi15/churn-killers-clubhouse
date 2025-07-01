
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Newsletter } from "@/types/newsletter";

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
        
        // First, try exact match
        const { data: exactMatch, error: exactError } = await supabase
          .from("newsletters")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
          
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
        
        const { data: allNewsletters, error: listError } = await supabase
          .from("newsletters")
          .select("*");
          
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
            
            toast({
              title: "Newsletter not found",
              description: `Could not find newsletter with slug: "${slug}"`,
              variant: "destructive",
            });
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
