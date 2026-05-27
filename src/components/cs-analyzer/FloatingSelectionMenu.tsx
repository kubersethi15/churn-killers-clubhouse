import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Search,
  AlertTriangle,
  TrendingUp,
  Target,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { popIn } from "@/lib/motion";

export type HighlightKind = "risk" | "opportunity" | "action";

export interface SelectionAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  className?: string;
  onSelect: (selectedText: string) => void;
}

interface FloatingSelectionMenuProps {
  /** Element to listen for selections inside (e.g. the transcript container). */
  containerRef: React.RefObject<HTMLElement>;
  actions: SelectionAction[];
  /** Callback fired when the user opens "Ask about this". Receives selected text. */
  onAsk?: (selectedText: string) => void;
  /** Minimum number of chars for the menu to appear. */
  minSelectionLength?: number;
}

/**
 * Floating menu that appears above the user's text selection within
 * `containerRef`. Uses native getBoundingClientRect on the selection range
 * to position itself. Disappears on click-outside or Esc.
 */
export const FloatingSelectionMenu = ({
  containerRef,
  actions,
  onAsk,
  minSelectionLength = 3,
}: FloatingSelectionMenuProps) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const updateFromSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setPosition(null);
      setSelectedText("");
      return;
    }

    const text = sel.toString().trim();
    if (text.length < minSelectionLength) {
      setPosition(null);
      setSelectedText("");
      return;
    }

    const range = sel.getRangeAt(0);
    // Only proceed if the selection is inside our container
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setPosition(null);
      setSelectedText("");
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      // Sometimes the selection rect collapses; ignore
      return;
    }

    // Position above the selection, horizontally centered on the selection.
    // Coords are page coords (account for scroll).
    setPosition({
      top: rect.top + window.scrollY - 8, // sit just above the selection
      left: rect.left + rect.width / 2 + window.scrollX,
    });
    setSelectedText(text);
  }, [containerRef, minSelectionLength]);

  useEffect(() => {
    const onSelectionChange = () => {
      // Debounce slightly so we react after the user finishes a drag
      window.requestAnimationFrame(updateFromSelection);
    };
    const onScroll = () => updateFromSelection();
    const onResize = () => updateFromSelection();
    const onMouseDown = (e: MouseEvent) => {
      // Click inside the menu shouldn't dismiss it
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.getSelection()?.removeAllRanges();
        setPosition(null);
        setSelectedText("");
      }
    };

    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [updateFromSelection]);

  const visible = position !== null && selectedText.length >= minSelectionLength;

  return (
    <AnimatePresence>
      {visible && position && (
        <motion.div
          ref={menuRef}
          variants={popIn}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
            transform: "translate(-50%, -100%)",
            zIndex: 50,
          }}
          className="pointer-events-auto"
          onMouseDown={(e) => e.preventDefault() /* don't lose selection */}
        >
          <div className="flex items-center gap-0.5 rounded-lg border border-navy-dark/15 bg-navy-dark text-white shadow-lg shadow-black/20 px-1 py-1">
            {actions.map((action) => (
              <button
                key={action.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  action.onSelect(selectedText);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium hover:bg-white/10 transition-colors",
                  action.className
                )}
                title={action.label}
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
            {onAsk && (
              <>
                <div className="w-px h-4 bg-white/15 mx-0.5" />
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onAsk(selectedText)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-red bg-red/10 hover:bg-red/20 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden sm:inline">Ask about this</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Default action set for the transcript: Copy, Search-this-in-transcript,
 * Mark as risk / opportunity / action.
 *
 * Pages provide their own onSearch / onHighlight / onAsk callbacks.
 */
export const buildDefaultTranscriptActions = ({
  onCopy,
  onSearch,
  onHighlight,
}: {
  onCopy: (text: string) => void;
  onSearch: (text: string) => void;
  onHighlight: (text: string, kind: HighlightKind) => void;
}): SelectionAction[] => [
  {
    id: "copy",
    label: "Copy",
    icon: <Copy className="w-3 h-3" />,
    onSelect: onCopy,
  },
  {
    id: "search",
    label: "Find similar",
    icon: <Search className="w-3 h-3" />,
    onSelect: onSearch,
  },
  {
    id: "risk",
    label: "Risk",
    icon: <AlertTriangle className="w-3 h-3" />,
    className: "hover:text-red-300",
    onSelect: (text) => onHighlight(text, "risk"),
  },
  {
    id: "opportunity",
    label: "Opportunity",
    icon: <TrendingUp className="w-3 h-3" />,
    className: "hover:text-emerald-300",
    onSelect: (text) => onHighlight(text, "opportunity"),
  },
  {
    id: "action",
    label: "Action",
    icon: <Target className="w-3 h-3" />,
    className: "hover:text-amber-300",
    onSelect: (text) => onHighlight(text, "action"),
  },
];
