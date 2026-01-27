import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface Analysis {
  id: string;
  user_id: string;
  title: string;
  analysis_type: string;
  input_text: string;
  results: Record<string, unknown>;
  created_at: string;
}

export const useAnalyses = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = useCallback(async () => {
    if (!user) {
      setAnalyses([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      console.error("Error fetching analyses:", fetchError);
    } else {
      setAnalyses((data as Analysis[]) || []);
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAnalyses();
    
    // Listen for analysis-saved events to refresh the list
    const handleAnalysisSaved = () => {
      fetchAnalyses();
    };
    window.addEventListener('analysis-saved', handleAnalysisSaved);
    return () => window.removeEventListener('analysis-saved', handleAnalysisSaved);
  }, [fetchAnalyses]);

  const saveAnalysis = async (
    title: string,
    analysisType: string,
    inputText: string,
    results: string
  ): Promise<{ data: Analysis | null; error: Error | null }> => {
    if (!user) {
      return { data: null, error: new Error("Not authenticated") };
    }

    // Parse the results string to JSON
    const parsedResults: Json = { content: results };

    const { data, error: insertError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        title,
        analysis_type: analysisType,
        input_text: inputText,
        results: parsedResults,
      })
      .select()
      .single();

    if (insertError) {
      return { data: null, error: insertError as Error };
    }

    // Update local state
    setAnalyses((prev) => [data as Analysis, ...prev]);

    return { data: data as Analysis, error: null };
  };

  const deleteAnalysis = async (id: string): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    const { error: deleteError } = await supabase
      .from("analyses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return { error: deleteError as Error };
    }

    // Update local state
    setAnalyses((prev) => prev.filter((a) => a.id !== id));

    return { error: null };
  };

  const getAnalysis = async (id: string): Promise<{ data: Analysis | null; error: Error | null }> => {
    if (!user) {
      return { data: null, error: new Error("Not authenticated") };
    }

    const { data, error: fetchError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return { data: null, error: fetchError as Error };
    }

    return { data: data as Analysis | null, error: null };
  };

  return {
    analyses,
    isLoading,
    error,
    fetchAnalyses,
    saveAnalysis,
    deleteAnalysis,
    getAnalysis,
  };
};
