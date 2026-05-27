import { useState, useMemo, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import { Search, ChevronUp, ChevronDown, X, AlertTriangle, TrendingUp, Target, Sparkles, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FloatingSelectionMenu,
  buildDefaultTranscriptActions,
  type HighlightKind,
} from "./FloatingSelectionMenu";
import { useToast } from "@/hooks/use-toast";

interface TranscriptViewerProps {
  transcript: string;
  /** Optional ref so parent can scroll to / focus the viewer */
  viewerRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Searchable transcript viewer.
 *
 *  - Splits the transcript into lines (preserving timestamp / speaker markers)
 *  - Fuzzy-searches via Fuse.js on demand
 *  - Renders each line; matched lines get a highlight wash; the *active* match
 *    gets a stronger red wash and is scrolled into view
 *  - Keyboard: ⌘F focuses the search, Enter / ⌘G next match, Shift+⌘G prev
 *  - Esc clears the search
 */
export const TranscriptViewer = ({ transcript, viewerRef }: TranscriptViewerProps) => {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  /**
   * Per-line highlight kind (risk / opportunity / action). Local state only —
   * not persisted to the DB yet (that's on the roadmap when we ship persisted
   * annotations). Indexed by line index.
   */
  const [highlights, setHighlights] = useState<Record<number, HighlightKind>>({});
  const [askDialog, setAskDialog] = useState<{ open: boolean; text: string }>({
    open: false,
    text: "",
  });

  // Split transcript into lines, keeping blank lines so the original layout
  // is preserved. Empty trailing lines are dropped.
  const lines = useMemo(() => {
    if (!transcript) return [] as string[];
    const split = transcript.split(/\r?\n/);
    // trim trailing blanks for cleaner rendering
    while (split.length && split[split.length - 1].trim() === "") split.pop();
    return split;
  }, [transcript]);

  // Build a Fuse index over non-empty lines, but remember each line's original
  // index so we can highlight in place.
  const fuse = useMemo(() => {
    const docs = lines
      .map((text, originalIndex) => ({ text, originalIndex }))
      .filter((d) => d.text.trim().length > 0);
    return new Fuse(docs, {
      keys: ["text"],
      threshold: 0.35,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [lines]);

  const matches = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [] as number[];
    const results = fuse.search(query.trim()).slice(0, 200);
    return results.map((r) => r.item.originalIndex);
  }, [query, fuse]);

  // Reset active match when query changes
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Scroll active match into view
  useEffect(() => {
    if (matches.length === 0) return;
    const targetLine = matches[activeIdx];
    const el = lineRefs.current[targetLine];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIdx, matches]);

  // Global keybinds while the viewer is mounted
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Only respond when not typing in another input (unless it's our own)
      const target = e.target as HTMLElement;
      const inOwnInput = target === inputRef.current;
      const inOtherInput =
        !inOwnInput &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // ⌘F / Ctrl+F → focus search
      if ((e.key === "f" || e.key === "F") && (e.metaKey || e.ctrlKey)) {
        // Only intercept if user isn't deliberately searching the page
        if (inOtherInput) return;
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      // ⌘G / Ctrl+G → next match
      if ((e.key === "g" || e.key === "G") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (matches.length === 0) return;
        setActiveIdx((i) => (e.shiftKey ? (i - 1 + matches.length) % matches.length : (i + 1) % matches.length));
        return;
      }

      // While focused in our own input
      if (inOwnInput) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (matches.length === 0) return;
          setActiveIdx((i) => (e.shiftKey ? (i - 1 + matches.length) % matches.length : (i + 1) % matches.length));
        } else if (e.key === "Escape") {
          setQuery("");
          (target as HTMLInputElement).blur();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [matches]);

  const matchSet = useMemo(() => new Set(matches), [matches]);
  const activeLineIdx = matches[activeIdx];

  return (
    <div ref={viewerRef} className="flex flex-col">
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-card border-b border-report-border px-4 py-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the transcript… (⌘F to focus, Enter for next)"
            className="pl-8 pr-8 h-8 text-sm font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums min-w-[80px] justify-end">
          {query.trim().length >= 2 ? (
            <>
              {matches.length > 0 ? (
                <span>
                  {activeIdx + 1} / {matches.length}
                </span>
              ) : (
                <span>No matches</span>
              )}
              <button
                onClick={() => matches.length && setActiveIdx((i) => (i - 1 + matches.length) % matches.length)}
                disabled={matches.length === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
                aria-label="Previous match"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => matches.length && setActiveIdx((i) => (i + 1) % matches.length)}
                disabled={matches.length === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-30"
                aria-label="Next match"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Lines */}
      <div className="p-4 max-h-[700px] overflow-y-auto">
        <div ref={transcriptRef} className="font-mono text-[13px] leading-relaxed text-report-text relative">
          {lines.length === 0 ? (
            <p className="text-muted-foreground italic font-sans">No transcript available.</p>
          ) : (
            lines.map((line, idx) => {
              const isMatch = matchSet.has(idx);
              const isActive = idx === activeLineIdx;
              const highlight = highlights[idx];
              return (
                <div
                  key={idx}
                  ref={(el) => (lineRefs.current[idx] = el)}
                  className={cn(
                    "rounded px-1.5 -mx-1.5 transition-colors",
                    isActive
                      ? "bg-red/15 ring-1 ring-red/40"
                      : isMatch
                      ? "bg-amber-100/60 dark:bg-amber-900/30"
                      : "",
                    // Highlight strata stack with search but use a subtle underline accent
                    highlight === "risk" && "border-l-2 border-red pl-2",
                    highlight === "opportunity" && "border-l-2 border-emerald-500 pl-2",
                    highlight === "action" && "border-l-2 border-amber-500 pl-2"
                  )}
                  data-line-index={idx}
                >
                  {line.length === 0 ? "\u00a0" : line}
                </div>
              );
            })
          )}

          {/* Highlight-to-ask floating menu, scoped to the transcript */}
          <FloatingSelectionMenu
            containerRef={transcriptRef}
            actions={buildDefaultTranscriptActions({
              onCopy: async (text) => {
                try {
                  await navigator.clipboard.writeText(text);
                  toast({ title: "Copied", description: `${text.slice(0, 60)}${text.length > 60 ? "…" : ""}` });
                } catch {
                  toast({ title: "Couldn't copy", variant: "destructive" });
                }
              },
              onSearch: (text) => {
                setQuery(text.length > 40 ? text.slice(0, 40) : text);
                inputRef.current?.focus();
              },
              onHighlight: (text, kind) => {
                // Find which line(s) contain this selection
                const idxs: number[] = [];
                lines.forEach((line, i) => {
                  if (line.includes(text) || text.includes(line.trim())) idxs.push(i);
                });
                if (idxs.length === 0) {
                  toast({
                    title: "Couldn't pin highlight",
                    description: "Try selecting within a single line.",
                  });
                  return;
                }
                setHighlights((prev) => {
                  const next = { ...prev };
                  idxs.forEach((i) => {
                    next[i] = kind;
                  });
                  return next;
                });
                window.getSelection()?.removeAllRanges();
                const label = kind === "risk" ? "Risk" : kind === "opportunity" ? "Opportunity" : "Action";
                toast({ title: `Marked as ${label}`, description: `${idxs.length} line${idxs.length > 1 ? "s" : ""}.` });
              },
            })}
            onAsk={(text) => {
              setAskDialog({ open: true, text });
              window.getSelection()?.removeAllRanges();
            }}
          />
        </div>
      </div>

      {/* "Ask about this" dialog — stub until chat-over-document ships */}
      <Dialog open={askDialog.open} onOpenChange={(open) => setAskDialog((s) => ({ ...s, open }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-black text-navy-dark">
              Ask about this snippet
            </DialogTitle>
            <DialogDescription>
              Conversational follow-ups (chat-over-document) are on the roadmap. For now you can grab the snippet and use it in your CRM, Slack, or the next CSM 1:1.
            </DialogDescription>
          </DialogHeader>
          <blockquote className="font-mono text-[13px] leading-relaxed text-navy-dark border-l-2 border-red pl-3 py-1 my-2 bg-red/[0.03]">
            &ldquo;{askDialog.text}&rdquo;
          </blockquote>
          <div className="flex items-center gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`"${askDialog.text}"`);
                  toast({ title: "Copied as quote" });
                  setAskDialog({ open: false, text: "" });
                } catch {
                  /* no-op */
                }
              }}
            >
              <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
              Copy as quote
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-red hover:bg-red-dark"
              onClick={() => setAskDialog({ open: false, text: "" })}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
