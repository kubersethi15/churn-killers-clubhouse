import { useEvidence } from "./EvidenceContext";
import { cn } from "@/lib/utils";

interface EvidenceChipProps {
  anchorIds: string[];
  className?: string;
}

export const EvidenceChip = ({ anchorIds, className }: EvidenceChipProps) => {
  const { openDrawer, anchors } = useEvidence();

  if (!anchorIds || anchorIds.length === 0) return null;

  // Filter to only show chips for anchors that actually exist with quote text
  const validIds = anchorIds.filter((id) => {
    const anchor = anchors.find((a) => a.id === id);
    return anchor && anchor.quote && anchor.quote.trim().length > 0;
  });

  if (validIds.length === 0) return null;

  return (
    <span className={cn("inline-flex flex-wrap gap-1", className)}>
      {validIds.map((id) => (
        <button
          key={id}
          onClick={() => openDrawer(id)}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold font-sans bg-navy-dark/10 text-navy-dark hover:bg-navy-dark hover:text-white transition-colors cursor-pointer"
          title={`View evidence ${id}`}
        >
          {id}
        </button>
      ))}
    </span>
  );
};
