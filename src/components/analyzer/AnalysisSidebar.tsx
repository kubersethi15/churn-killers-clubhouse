import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalyses, Analysis } from "@/hooks/useAnalyses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Presentation,
  Target,
  MessageSquare,
  Trash2,
  Loader2,
  Plus,
  Pencil,
  Check,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AnalysisSidebarProps {
  onSelectAnalysis: (analysis: Analysis) => void;
  onNewAnalysis: () => void;
  selectedAnalysisId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const analysisTypeIcons: Record<string, React.ReactNode> = {
  "call-transcript": <MessageSquare className="h-4 w-4" />,
  "qbr-deck": <Presentation className="h-4 w-4" />,
  "success-plan": <Target className="h-4 w-4" />,
  "health-assessment": <FileText className="h-4 w-4" />,
};

export const AnalysisSidebar = ({
  onSelectAnalysis,
  onNewAnalysis,
  selectedAnalysisId,
  isCollapsed,
  onToggleCollapse,
}: AnalysisSidebarProps) => {
  const { user } = useAuth();
  const { analyses, isLoading, deleteAnalysis, renameAnalysis } = useAnalyses();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);

    const { error } = await deleteAnalysis(id);

    if (error) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Analysis deleted",
        description: "The analysis has been removed.",
      });
      if (selectedAnalysisId === id) {
        onNewAnalysis();
      }
    }

    setDeletingId(null);
  };

  const handleSelect = (analysis: Analysis) => {
    if (editingId) return;
    onSelectAnalysis(analysis);
  };

  const startEditing = (e: React.MouseEvent, analysis: Analysis) => {
    e.stopPropagation();
    setEditingId(analysis.id);
    setEditingTitle(analysis.title);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editingTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const { error } = await renameAnalysis(id, editingTitle.trim());

    if (error) {
      toast({
        title: "Failed to rename",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Renamed",
        description: "Analysis title updated.",
      });
    }

    setIsSaving(false);
    setEditingId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(e as unknown as React.MouseEvent, id);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditingTitle("");
    }
  };

  return (
    <aside
      className={cn(
        "bg-navy-dark flex flex-col transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-14" : "w-64"
      )}
    >
      {/* Sidebar Header - matches main header height */}
      <div className="flex items-center justify-between px-3 h-14 border-b border-white/10">
        {!isCollapsed && (
          <span className="text-white/80 text-sm font-medium tracking-wide uppercase">
            History
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "h-8 w-8 text-white/60 hover:text-white hover:bg-white/10",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Analysis List */}
      <ScrollArea className="flex-1">
        {!user ? (
          <div className={cn("p-4 text-center", isCollapsed && "hidden")}>
            <p className="text-sm text-white/50 mb-4">
              Sign in to save and view your analysis history
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth", { state: { from: "/cs-analyzer" } })}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
          </div>
        ) : analyses.length === 0 ? (
          <div className={cn("p-4 text-center", isCollapsed && "hidden")}>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-white/40" />
            </div>
            <p className="text-sm text-white/50">
              No analyses yet. Start by creating a new analysis.
            </p>
          </div>
        ) : (
          <div className={cn("px-2 py-1 space-y-0.5", isCollapsed && "px-2")}>
            {/* New Analysis button when collapsed */}
            {isCollapsed && (
              <Button
                onClick={onNewAnalysis}
                variant="ghost"
                size="icon"
                className="w-full h-10 mb-2 text-white/60 hover:text-white hover:bg-white/10"
                title="New Analysis"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => handleSelect(analysis)}
                className={cn(
                  "w-full text-left rounded-md transition-colors group cursor-pointer",
                  selectedAnalysisId === analysis.id
                    ? "bg-white/15"
                    : "hover:bg-white/10",
                  isCollapsed ? "p-2 flex justify-center" : "px-3 py-2"
                )}
                title={isCollapsed ? analysis.title : undefined}
              >
                {isCollapsed ? null : (
                  <div className="flex items-start gap-2.5">
                    <span className="text-white/50 mt-0.5 shrink-0">
                      {analysisTypeIcons[analysis.analysis_type] || (
                        <FileText className="h-4 w-4" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      {editingId === analysis.id ? (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, analysis.id)}
                            className="h-7 text-sm py-1 px-2 bg-white/10 border-white/20 text-white"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-white hover:bg-white/10"
                            onClick={(e) => saveEdit(e, analysis.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 text-green-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-white hover:bg-white/10"
                            onClick={cancelEditing}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-white/90 truncate leading-tight">
                            {analysis.title}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">
                            {formatDistanceToNow(new Date(analysis.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </>
                      )}
                    </div>
                    {editingId !== analysis.id && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10"
                          onClick={(e) => startEditing(e, analysis)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-white/40 hover:text-red-light hover:bg-white/10"
                          onClick={(e) => handleDelete(e, analysis.id)}
                          disabled={deletingId === analysis.id}
                        >
                          {deletingId === analysis.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
};
