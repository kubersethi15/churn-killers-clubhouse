import { motion } from "framer-motion";
import { skeletonPulse } from "@/lib/motion";

/**
 * Loading skeleton matched to V2ReportRenderer's actual structure.
 * Used on the public share viewer while fetching a report.
 *
 * Looks like content arriving, not "wait for it" — the user sees the
 * shape of what's coming before the content lands.
 */
export const ReportSkeleton = () => (
  <motion.div
    variants={skeletonPulse}
    initial="initial"
    animate="animate"
    className="space-y-5"
  >
    {/* Masthead */}
    <div className="pb-4 border-b border-navy-dark/10 space-y-2">
      <div className="h-3 w-32 rounded bg-navy-dark/10" />
      <div className="h-7 w-3/4 rounded bg-navy-dark/15" />
      <div className="h-3 w-48 rounded bg-navy-dark/10" />
    </div>

    {/* Executive snapshot block */}
    <div className="rounded-lg border border-navy-dark/10 bg-white p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-navy-dark/10" />
          <div className="h-5 w-64 rounded bg-navy-dark/15" />
        </div>
        <div className="h-6 w-16 rounded-md bg-navy-dark/10" />
      </div>
      <div className="space-y-2 pb-5 border-b border-navy-dark/5">
        <div className="h-4 w-full rounded bg-navy-dark/10" />
        <div className="h-4 w-11/12 rounded bg-navy-dark/10" />
        <div className="h-4 w-3/4 rounded bg-navy-dark/10" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-navy-dark/10" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="h-7 w-7 rounded bg-red/15" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-full rounded bg-navy-dark/10" />
              <div className="h-3 w-5/6 rounded bg-navy-dark/10" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Two more section placeholders */}
    {[0, 1].map((i) => (
      <div key={i} className="rounded-lg border border-navy-dark/10 bg-white p-6 space-y-3">
        <div className="h-4 w-48 rounded bg-navy-dark/15" />
        <div className="h-3 w-full rounded bg-navy-dark/10" />
        <div className="h-3 w-11/12 rounded bg-navy-dark/10" />
        <div className="h-3 w-4/5 rounded bg-navy-dark/10" />
      </div>
    ))}
  </motion.div>
);
