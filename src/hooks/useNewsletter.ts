
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
          // Try different normalization approaches
          const normalizeSlug = (s: string) => s.trim().toLowerCase().replace(/[\n\r\s]+/g, '-');
          const normalizedRequestedSlug = normalizeSlug(slug);
          
          // Remove common prefixes like "the-" for comparison
          const removeCommonPrefixes = (s: string) => {
            return s.replace(/^(the-|a-|an-)/, '');
          };
          
          const matchingNewsletter = allNewsletters.find(newsletter => {
            const dbSlug = newsletter.slug || '';
            const normalizedDbSlug = normalizeSlug(dbSlug);
            
            // Try multiple matching strategies
            const strategies = [
              // Exact normalized match
              () => normalizedDbSlug === normalizedRequestedSlug,
              // Match with common prefixes removed
              () => removeCommonPrefixes(normalizedDbSlug) === removeCommonPrefixes(normalizedRequestedSlug),
              // Match if one contains the other (after removing prefixes)
              () => {
                const dbWithoutPrefix = removeCommonPrefixes(normalizedDbSlug);
                const requestedWithoutPrefix = removeCommonPrefixes(normalizedRequestedSlug);
                return dbWithoutPrefix === requestedWithoutPrefix || 
                       dbWithoutPrefix.includes(requestedWithoutPrefix) ||
                       requestedWithoutPrefix.includes(dbWithoutPrefix);
              }
            ];
            
            return strategies.some(strategy => strategy());
          });
          
          if (matchingNewsletter) {
            console.log("Found matching newsletter:", matchingNewsletter);
            setNewsletter(matchingNewsletter as Newsletter);
            document.title = `${matchingNewsletter.title} | Churn Is Dead`;
            setError(null);
          } else {
            console.error("Newsletter not found with slug:", slug);
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
