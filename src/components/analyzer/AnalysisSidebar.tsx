import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalyses, Analysis } from "@/hooks/useAnalyses";
import { Button } from "@/components/ui/button";
import { AllAnalysesModal } from "./AllAnalysesModal";
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
  Search,
  PanelLeft,
  MessagesSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const RECENTS_COUNT = 6;

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
  const [allAnalysesOpen, setAllAnalysesOpen] = useState(false);

  const recentAnalyses = analyses.slice(0, RECENTS_COUNT);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    const { error } = await deleteAnalysis(id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Analysis deleted" });
      if (selectedAnalysisId === id) onNewAnalysis();
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
    if (!editingTitle.trim()) return;
    setIsSaving(true);
    const { error } = await renameAnalysis(id, editingTitle.trim());
    if (error) {
      toast({ title: "Failed to rename", description: error.message, variant: "destructive" });
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
    <>
      <aside
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out shrink-0 border-r h-full",
          isCollapsed
            ? "w-12 bg-background border-border"
            : "w-64 bg-navy-dark border-white/10"
        )}
      >
        {isCollapsed ? (
          /* ── Collapsed: Claude-style icon rail ── */
          <div className="flex flex-col items-center py-3 gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewAnalysis}
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="New Analysis"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAllAnalysesOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Search analyses"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAllAnalysesOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="All analyses"
            >
              <MessagesSquare className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* ── Expanded: nav items + recents ── */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-3 h-14 border-b border-white/10 shrink-0">
              <span className="text-white/80 text-sm font-medium tracking-wide uppercase">
                CS Analyzer
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                title="Collapse sidebar"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Nav items */}
            <div className="px-2 pt-2 space-y-0.5 shrink-0">
              <Button
                onClick={onNewAnalysis}
                variant="ghost"
                className="w-full h-9 justify-start gap-2.5 px-3 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="text-sm">New Analysis</span>
              </Button>
              <Button
                onClick={() => setAllAnalysesOpen(true)}
                variant="ghost"
                className="w-full h-9 justify-start gap-2.5 px-3 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="text-sm">Search</span>
              </Button>
              <Button
                onClick={() => setAllAnalysesOpen(true)}
                variant="ghost"
                className="w-full h-9 justify-start gap-2.5 px-3 text-white/70 hover:text-white hover:bg-white/10"
              >
                <MessagesSquare className="h-4 w-4 shrink-0" />
                <span className="text-sm">All Analyses</span>
              </Button>
            </div>

            {/* Recents */}
            {!user ? (
              <div className="p-4 text-center mt-4">
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
            ) : recentAnalyses.length === 0 ? (
              <div className="p-4 text-center mt-2">
                <p className="text-sm text-white/50">
                  No analyses yet. Start by creating a new analysis.
                </p>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0 mt-2">
                <p className="px-3 text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1">
                  Recents
                </p>
                <div className="px-2 space-y-0.5 flex-1 overflow-y-auto">
                  {recentAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      onClick={() => handleSelect(analysis)}
                      className={cn(
                        "w-full text-left rounded-md transition-colors group cursor-pointer px-3 py-2",
                        selectedAnalysisId === analysis.id
                          ? "bg-white/15"
                          : "hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-white/50 mt-0.5 shrink-0">
                          {analysisTypeIcons[analysis.analysis_type] || <FileText className="h-4 w-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          {editingId === analysis.id ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, analysis.id)}
                                className="h-7 text-sm py-1 px-2 bg-white/10 border border-white/20 text-white rounded w-full outline-none"
                                autoFocus
                              />
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-white hover:bg-white/10" onClick={(e) => saveEdit(e, analysis.id)} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 text-green-400" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-white hover:bg-white/10" onClick={cancelEditing}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-white/90 truncate leading-tight">
                                {analysis.title}
                              </p>
                              <p className="text-xs text-white/40 mt-0.5">
                                {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                              </p>
                            </>
                          )}
                        </div>
                        {editingId !== analysis.id && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10" onClick={(e) => startEditing(e, analysis)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-red-light hover:bg-white/10" onClick={(e) => handleDelete(e, analysis.id)} disabled={deletingId === analysis.id}>
                              {deletingId === analysis.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* "All Analyses" footer link */}
                {analyses.length > RECENTS_COUNT && (
                  <div className="px-2 py-2 border-t border-white/10 shrink-0">
                    <Button
                      onClick={() => setAllAnalysesOpen(true)}
                      variant="ghost"
                      className="w-full h-8 text-xs text-white/50 hover:text-white hover:bg-white/10"
                    >
                      View all {analyses.length} analyses
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* All Analyses Modal */}
      <AllAnalysesModal
        open={allAnalysesOpen}
        onOpenChange={setAllAnalysesOpen}
        analyses={analyses}
        selectedAnalysisId={selectedAnalysisId}
        onSelectAnalysis={onSelectAnalysis}
        onNewAnalysis={onNewAnalysis}
        onDeleteAnalysis={deleteAnalysis}
        onRenameAnalysis={renameAnalysis}
      />
    </>
  );
};
