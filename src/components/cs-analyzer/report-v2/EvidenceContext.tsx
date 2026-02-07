import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportTypography } from "../report/reportStyles";
import type { EvidenceAnchor } from "./types";

interface EvidenceContextValue {
  anchors: EvidenceAnchor[];
  openDrawer: (anchorId: string) => void;
}

const EvidenceContext = createContext<EvidenceContextValue>({
  anchors: [],
  openDrawer: () => {},
});

export const useEvidence = () => useContext(EvidenceContext);

interface EvidenceProviderProps {
  anchors: EvidenceAnchor[];
  children: ReactNode;
}

export const EvidenceProvider = ({ anchors, children }: EvidenceProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnchorId, setSelectedAnchorId] = useState<string | null>(null);

  const openDrawer = useCallback((anchorId: string) => {
    setSelectedAnchorId(anchorId);
    setIsOpen(true);
  }, []);

  const selectedAnchor = anchors.find((a) => a.id === selectedAnchorId);

  // Find adjacent anchors for navigation
  const currentIdx = anchors.findIndex((a) => a.id === selectedAnchorId);

  return (
    <EvidenceContext.Provider value={{ anchors, openDrawer }}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[440px] bg-card">
          <SheetHeader className="border-b border-report-border pb-4">
            <SheetTitle className={cn(reportTypography.sectionTitle, "flex items-center gap-2")}>
              <Quote className="w-4 h-4 text-navy-dark" />
              Evidence Anchor
            </SheetTitle>
          </SheetHeader>
          {selectedAnchor ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-navy-dark text-white text-sm font-semibold font-sans">
                  {selectedAnchor.id}
                </span>
                <span className={reportTypography.labelSmall}>Verbatim excerpt</span>
              </div>
              <blockquote className="relative pl-4 border-l-2 border-navy-dark/30">
                <p className={cn(reportTypography.bodyText, "italic leading-relaxed")}>
                  "{selectedAnchor.quote}"
                </p>
              </blockquote>
              {/* Navigation between anchors */}
              <div className="flex items-center justify-between pt-4 border-t border-report-border">
                <button
                  onClick={() => currentIdx > 0 && openDrawer(anchors[currentIdx - 1].id)}
                  disabled={currentIdx <= 0}
                  className={cn(
                    "text-sm font-sans text-navy-dark/60 hover:text-navy-dark disabled:opacity-30 disabled:cursor-not-allowed",
                  )}
                >
                  Previous
                </button>
                <span className={reportTypography.labelSmall}>
                  {currentIdx + 1} of {anchors.length}
                </span>
                <button
                  onClick={() => currentIdx < anchors.length - 1 && openDrawer(anchors[currentIdx + 1].id)}
                  disabled={currentIdx >= anchors.length - 1}
                  className="text-sm font-sans text-navy-dark/60 hover:text-navy-dark disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p className={cn(reportTypography.bodyMuted, "mt-6")}>No anchor selected</p>
          )}
        </SheetContent>
      </Sheet>
    </EvidenceContext.Provider>
  );
};
