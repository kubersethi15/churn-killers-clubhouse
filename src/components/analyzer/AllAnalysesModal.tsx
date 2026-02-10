import { useState, useMemo } from "react";
import { Analysis } from "@/hooks/useAnalyses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Presentation,
  Target,
  MessageSquare,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X,
  Search,
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AllAnalysesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analyses: Analysis[];
  selectedAnalysisId?: string;
  onSelectAnalysis: (analysis: Analysis) => void;
  onNewAnalysis: () => void;
  onDeleteAnalysis: (id: string) => Promise<{ error: Error | null }>;
  onRenameAnalysis: (id: string, newTitle: string) => Promise<{ error: Error | null }>;
}

const analysisTypeIcons: Record<string, React.ReactNode> = {
  "call-transcript": <MessageSquare className="h-4 w-4" />,
  "qbr-deck": <Presentation className="h-4 w-4" />,
  "success-plan": <Target className="h-4 w-4" />,
  "health-assessment": <FileText className="h-4 w-4" />,
};

export const AllAnalysesModal = ({
  open,
  onOpenChange,
  analyses,
  selectedAnalysisId,
  onSelectAnalysis,
  onNewAnalysis,
  onDeleteAnalysis,
  onRenameAnalysis,
}: AllAnalysesModalProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredAnalyses = useMemo(() => {
    if (!searchQuery.trim()) return analyses;
    const q = searchQuery.toLowerCase();
    return analyses.filter((a) => a.title.toLowerCase().includes(q));
  }, [analyses, searchQuery]);

  const handleSelect = (analysis: Analysis) => {
    if (editingId) return;
    onSelectAnalysis(analysis);
    onOpenChange(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    const { error } = await onDeleteAnalysis(id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Analysis deleted" });
    }
    setDeletingId(null);
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
    const { error } = await onRenameAnalysis(id, editingTitle.trim());
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

  const handleNewAnalysis = () => {
    onNewAnalysis();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle className="text-xl font-serif">Analyses</DialogTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your analyses..."
              className="pl-9 h-10"
              autoFocus
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {filteredAnalyses.length} {filteredAnalyses.length === 1 ? "analysis" : "analyses"}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 pb-6">
            {filteredAnalyses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery ? "No analyses match your search." : "No analyses yet."}
              </p>
            ) : (
              <div className="divide-y divide-border">
                {filteredAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    onClick={() => handleSelect(analysis)}
                    className={cn(
                      "flex items-start gap-3 py-3 px-3 -mx-3 rounded-lg cursor-pointer transition-colors group",
                      selectedAnalysisId === analysis.id
                        ? "bg-accent"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span className="text-muted-foreground mt-0.5 shrink-0">
                      {analysisTypeIcons[analysis.analysis_type] || <FileText className="h-4 w-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      {editingId === analysis.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, analysis.id)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => saveEdit(e, analysis.id)} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 text-green-600" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={cancelEditing}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium truncate">{analysis.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                          </p>
                        </>
                      )}
                    </div>
                    {editingId !== analysis.id && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => startEditing(e, analysis)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-destructive"
                          onClick={(e) => handleDelete(e, analysis.id)}
                          disabled={deletingId === analysis.id}
                        >
                          {deletingId === analysis.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
