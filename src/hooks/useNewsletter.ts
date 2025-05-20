
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
        
        // First, fetch all newsletters to debug what's available
        const { data: allNewsletters, error: listError } = await supabase
          .from("newsletters")
          .select("id, title, slug");
          
        if (listError) {
          console.error("Error fetching newsletters list:", listError);
        } else {
          console.log("All available newsletters:", allNewsletters);
          
          // Log the exact slugs for comparison
          allNewsletters?.forEach((nl) => {
            console.log(`Newsletter: ${nl.title}, Slug: "${nl.slug}", Length: ${nl.slug.length}`);
            
            // Check for hidden characters by logging character codes
            const charCodes = Array.from(nl.slug).map(c => c.charCodeAt(0));
            console.log(`Character codes for slug "${nl.slug}":`, charCodes);
          });
        }
        
        // Try to find the newsletter with various slug normalization approaches
        let matchingNewsletter = null;
        let data = null;
        
        // First approach: exact match
        const { data: exactMatch, error: exactError } = await supabase
          .from("newsletters")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
          
        if (exactMatch) {
          console.log("Found newsletter with exact slug match");
          data = exactMatch;
        } else {
          console.log("No exact match found, trying with normalized slugs");
          
          if (allNewsletters) {
            // Try different normalization techniques
            const normalizedSlug = slug.trim().toLowerCase().replace(/[\n\r\s]+/g, '-');
            console.log(`Normalized requested slug: "${normalizedSlug}"`);
            
            // Find a newsletter where any normalization matches
            matchingNewsletter = allNewsletters.find(newsletter => {
              const dbSlug = newsletter.slug || '';
              
              // Try multiple normalization approaches for comparison
              const normalizedDbSlug = dbSlug.trim().toLowerCase().replace(/[\n\r\s]+/g, '-');
              const simpleDbSlug = dbSlug.trim().toLowerCase().replace(/[\n\r\s]+/g, '');
              
              const isExactMatch = dbSlug === slug;
              const isTrimMatch = dbSlug.trim() === slug.trim();
              const isNormalizedMatch = normalizedDbSlug === normalizedSlug;
              const isSimpleMatch = simpleDbSlug === slug.replace(/[\n\r\s]+/g, '').toLowerCase();
              
              console.log(`Comparing "${dbSlug}" with "${slug}":`, {
                exact: isExactMatch,
                trimmed: isTrimMatch,
                normalized: isNormalizedMatch,
                simple: isSimpleMatch
              });
              
              return isExactMatch || isTrimMatch || isNormalizedMatch || isSimpleMatch;
            });
            
            if (matchingNewsletter) {
              console.log("Found matching newsletter:", matchingNewsletter);
              
              // Fetch the full newsletter details
              const { data: fullNewsletter, error: fetchError } = await supabase
                .from("newsletters")
                .select("*")
                .eq("id", matchingNewsletter.id)
                .single();
                
              if (fullNewsletter && !fetchError) {
                data = fullNewsletter;
              } else {
                console.error("Error fetching full newsletter details:", fetchError);
              }
            } else {
              console.log("No matching newsletter found with any normalization approach");
            }
          }
        }

        if (data) {
          console.log("Newsletter found:", data);
          setNewsletter(data as Newsletter);
          document.title = `${data.title} | Churn Is Dead`;
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
