import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AnalysisGroup {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const useAnalysisGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<AnalysisGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!user) {
      setGroups([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("analysis_groups")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      console.error("Error fetching groups:", fetchError);
    } else {
      setGroups((data as AnalysisGroup[]) || []);
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (name: string): Promise<{ data: AnalysisGroup | null; error: Error | null }> => {
    if (!user) {
      return { data: null, error: new Error("Not authenticated") };
    }

    const { data, error: insertError } = await supabase
      .from("analysis_groups")
      .insert({
        user_id: user.id,
        name: name.trim(),
      })
      .select()
      .single();

    if (insertError) {
      return { data: null, error: insertError as Error };
    }

    setGroups((prev) => [...prev, data as AnalysisGroup].sort((a, b) => a.name.localeCompare(b.name)));

    return { data: data as AnalysisGroup, error: null };
  };

  const deleteGroup = async (id: string): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    const { error: deleteError } = await supabase
      .from("analysis_groups")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return { error: deleteError as Error };
    }

    setGroups((prev) => prev.filter((g) => g.id !== id));

    return { error: null };
  };

  const renameGroup = async (id: string, newName: string): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    const { error: updateError } = await supabase
      .from("analysis_groups")
      .update({ name: newName.trim() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      return { error: updateError as Error };
    }

    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name: newName.trim() } : g)).sort((a, b) => a.name.localeCompare(b.name))
    );

    return { error: null };
  };

  return {
    groups,
    isLoading,
    error,
    fetchGroups,
    createGroup,
    deleteGroup,
    renameGroup,
  };
};
