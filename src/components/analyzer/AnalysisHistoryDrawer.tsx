import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalyses, Analysis } from "@/hooks/useAnalyses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  FileText,
  Presentation,
  Target,
  MessageSquare,
  Trash2,
  Loader2,
  History,
  Plus,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AnalysisHistoryDrawerProps {
  onSelectAnalysis: (analysis: Analysis) => void;
  onNewAnalysis: () => void;
  selectedAnalysisId?: string;
}

const analysisTypeIcons: Record<string, React.ReactNode> = {
  "call-transcript": <MessageSquare className="h-4 w-4" />,
  "qbr-deck": <Presentation className="h-4 w-4" />,
  "success-plan": <Target className="h-4 w-4" />,
  "health-assessment": <FileText className="h-4 w-4" />,
};

export const AnalysisHistoryDrawer = ({
  onSelectAnalysis,
  onNewAnalysis,
  selectedAnalysisId,
}: AnalysisHistoryDrawerProps) => {
  const { user } = useAuth();
  const { analyses, isLoading, deleteAnalysis, renameAnalysis } = useAnalyses();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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
    if (editingId) return; // Don't select while editing
    onSelectAnalysis(analysis);
  };

  const handleNewAndClose = () => {
    onNewAnalysis();
    setIsOpen(false);
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-background border-r">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left font-serif">Analysis History</SheetTitle>
          <SheetDescription className="text-left text-sm">
            Browse and manage your saved analyses
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 border-b">
          <Button
            onClick={handleNewAndClose}
            className="w-full bg-red hover:bg-red-dark text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          {!user ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in to save and view your analysis history
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/auth", { state: { from: "/cs-analyzer" } });
                }}
                className="w-full"
              >
                Sign In
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No analyses yet. Start by creating a new analysis.
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => handleSelect(analysis)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors group cursor-pointer
                    ${selectedAnalysisId === analysis.id 
                      ? "bg-red/10 border border-red/20" 
                      : "hover:bg-muted"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-0.5">
                      {analysisTypeIcons[analysis.analysis_type] || (
                        <FileText className="h-4 w-4" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      {editingId === analysis.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, analysis.id)}
                            className="h-7 text-sm py-1 px-2"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={(e) => saveEdit(e, analysis.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={cancelEditing}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium truncate">
                            {analysis.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={(e) => startEditing(e, analysis)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
