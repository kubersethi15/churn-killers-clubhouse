import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { StakeholderEntry } from "./types";

interface StakeholderMatrixProps {
  stakeholders: StakeholderEntry[];
}

/**
 * Power × Stance 2x2 matrix — the consultant Power/Interest Grid that
 * separates a top-1% CS tool from a generic one.
 *
 * Layout:
 *   Y axis: Power (Low → High)
 *   X axis: Stance (Resistant → Supportive)
 *
 * Quadrants are labeled in the corners with the recommended treatment for
 * stakeholders in that zone (Champion / Manage Closely / Keep Informed /
 * Monitor). Stakeholders are plotted as labeled dots with small
 * deterministic offsets to prevent label collision when multiple cluster
 * in the same quadrant.
 *
 * Pure SVG — no charting library needed, keeps bundle size flat and gives
 * us full control over the editorial styling.
 */

// Normalize categorical values to plot coordinates (0–1)
const STANCE_X: Record<string, number> = {
  resistant: 0.15,
  skeptical: 0.32,
  unknown: 0.5,
  neutral: 0.55,
  supportive: 0.85,
};

const POWER_Y: Record<string, number> = {
  low: 0.18,
  medium: 0.5,
  high: 0.82,
};

const POWER_COLOR: Record<string, string> = {
  high: "#0f1a2e", // navy-dark
  medium: "#475569",
  low: "#94a3b8",
};

const STANCE_RING: Record<string, string> = {
  supportive: "#10b981", // emerald-500
  neutral: "#64748b",
  skeptical: "#dc2626", // red-600
  resistant: "#991b1b",
  unknown: "#cbd5e1",
};

interface PlottedStakeholder {
  s: StakeholderEntry;
  x: number; // pixel coord in plot area
  y: number;
}

// SVG viewBox dimensions
const W = 700;
const H = 480;
const PLOT_X = 80;
const PLOT_Y = 40;
const PLOT_W = W - PLOT_X - 30;
const PLOT_H = H - PLOT_Y - 70;

const plotPoint = (stance: string, power: string): { x: number; y: number } => {
  const sx = STANCE_X[stance] ?? STANCE_X.unknown;
  const py = POWER_Y[power] ?? POWER_Y.medium;
  return {
    x: PLOT_X + sx * PLOT_W,
    y: PLOT_Y + (1 - py) * PLOT_H, // invert because SVG y grows downward
  };
};

/**
 * Spread stakeholders that share the same quadrant so their labels don't
 * stack. Deterministic offset based on index within the cluster.
 */
const computeLayout = (stakeholders: StakeholderEntry[]): PlottedStakeholder[] => {
  // Bucket by quadrant (stance + power combo)
  const buckets = new Map<string, StakeholderEntry[]>();
  stakeholders.forEach((s) => {
    const key = `${s.stance}|${s.power}`;
    const arr = buckets.get(key) || [];
    arr.push(s);
    buckets.set(key, arr);
  });

  const plotted: PlottedStakeholder[] = [];
  buckets.forEach((arr) => {
    const base = plotPoint(arr[0].stance, arr[0].power);
    arr.forEach((s, i) => {
      // Spiral offsets — tight cluster, deterministic
      if (i === 0) {
        plotted.push({ s, x: base.x, y: base.y });
      } else {
        const angle = (i * 137.5 * Math.PI) / 180; // golden-angle distribution
        const radius = 16 + i * 8;
        plotted.push({
          s,
          x: base.x + Math.cos(angle) * radius,
          y: base.y + Math.sin(angle) * radius,
        });
      }
    });
  });

  return plotted;
};

export const StakeholderMatrix = ({ stakeholders }: StakeholderMatrixProps) => {
  const plotted = useMemo(() => computeLayout(stakeholders), [stakeholders]);

  if (stakeholders.length === 0) return null;

  return (
    <div className="rounded-lg border border-report-border bg-white p-5">
      <div className="mb-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-red font-semibold mb-1">
          Power × Stance
        </p>
        <h4 className="font-serif text-lg font-bold text-report-heading leading-tight">
          Who matters, and where they stand.
        </h4>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Stakeholder power and stance matrix"
      >
        {/* Quadrant background tints — subtle */}
        <rect
          x={PLOT_X}
          y={PLOT_Y}
          width={PLOT_W / 2}
          height={PLOT_H / 2}
          fill="#fef2f2"
          opacity={0.5}
        />
        <rect
          x={PLOT_X + PLOT_W / 2}
          y={PLOT_Y}
          width={PLOT_W / 2}
          height={PLOT_H / 2}
          fill="#ecfdf5"
          opacity={0.6}
        />
        <rect
          x={PLOT_X}
          y={PLOT_Y + PLOT_H / 2}
          width={PLOT_W / 2}
          height={PLOT_H / 2}
          fill="#f8fafc"
          opacity={0.6}
        />
        <rect
          x={PLOT_X + PLOT_W / 2}
          y={PLOT_Y + PLOT_H / 2}
          width={PLOT_W / 2}
          height={PLOT_H / 2}
          fill="#f0fdf4"
          opacity={0.4}
        />

        {/* Grid axes */}
        <line
          x1={PLOT_X}
          y1={PLOT_Y + PLOT_H / 2}
          x2={PLOT_X + PLOT_W}
          y2={PLOT_Y + PLOT_H / 2}
          stroke="#cbd5e1"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={PLOT_X + PLOT_W / 2}
          y1={PLOT_Y}
          x2={PLOT_X + PLOT_W / 2}
          y2={PLOT_Y + PLOT_H}
          stroke="#cbd5e1"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* Outer border */}
        <rect
          x={PLOT_X}
          y={PLOT_Y}
          width={PLOT_W}
          height={PLOT_H}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={1.5}
        />

        {/* Quadrant labels (corner-positioned, editorial) */}
        <text
          x={PLOT_X + 10}
          y={PLOT_Y + 22}
          className="font-serif"
          fontSize={13}
          fontWeight={700}
          fill="#991b1b"
        >
          Manage closely
        </text>
        <text
          x={PLOT_X + 10}
          y={PLOT_Y + 38}
          fontSize={10}
          fill="#7f1d1d"
          opacity={0.7}
        >
          High power · against you
        </text>

        <text
          x={PLOT_X + PLOT_W - 10}
          y={PLOT_Y + 22}
          textAnchor="end"
          className="font-serif"
          fontSize={13}
          fontWeight={700}
          fill="#065f46"
        >
          Champions
        </text>
        <text
          x={PLOT_X + PLOT_W - 10}
          y={PLOT_Y + 38}
          textAnchor="end"
          fontSize={10}
          fill="#064e3b"
          opacity={0.7}
        >
          High power · with you
        </text>

        <text
          x={PLOT_X + 10}
          y={PLOT_Y + PLOT_H - 26}
          className="font-serif"
          fontSize={13}
          fontWeight={700}
          fill="#475569"
        >
          Monitor
        </text>
        <text
          x={PLOT_X + 10}
          y={PLOT_Y + PLOT_H - 12}
          fontSize={10}
          fill="#64748b"
          opacity={0.8}
        >
          Low power · against you
        </text>

        <text
          x={PLOT_X + PLOT_W - 10}
          y={PLOT_Y + PLOT_H - 26}
          textAnchor="end"
          className="font-serif"
          fontSize={13}
          fontWeight={700}
          fill="#0f766e"
        >
          Keep informed
        </text>
        <text
          x={PLOT_X + PLOT_W - 10}
          y={PLOT_Y + PLOT_H - 12}
          textAnchor="end"
          fontSize={10}
          fill="#115e59"
          opacity={0.8}
        >
          Low power · with you
        </text>

        {/* Y axis label */}
        <text
          x={20}
          y={PLOT_Y + PLOT_H / 2}
          fontSize={11}
          fontWeight={600}
          fill="#475569"
          transform={`rotate(-90, 20, ${PLOT_Y + PLOT_H / 2})`}
          textAnchor="middle"
        >
          POWER →
        </text>
        <text x={PLOT_X - 8} y={PLOT_Y + 8} fontSize={10} fill="#64748b" textAnchor="end">
          High
        </text>
        <text x={PLOT_X - 8} y={PLOT_Y + PLOT_H} fontSize={10} fill="#64748b" textAnchor="end">
          Low
        </text>

        {/* X axis label */}
        <text
          x={PLOT_X + PLOT_W / 2}
          y={H - 22}
          fontSize={11}
          fontWeight={600}
          fill="#475569"
          textAnchor="middle"
        >
          STANCE →
        </text>
        <text x={PLOT_X} y={PLOT_Y + PLOT_H + 16} fontSize={10} fill="#64748b">
          Resistant
        </text>
        <text
          x={PLOT_X + PLOT_W}
          y={PLOT_Y + PLOT_H + 16}
          fontSize={10}
          fill="#64748b"
          textAnchor="end"
        >
          Supportive
        </text>

        {/* Plotted stakeholders */}
        {plotted.map(({ s, x, y }, idx) => {
          const fill = POWER_COLOR[s.power] || POWER_COLOR.medium;
          const ring = STANCE_RING[s.stance] || STANCE_RING.unknown;
          const r = s.power === "high" ? 9 : s.power === "medium" ? 7 : 5.5;
          // Decide if label goes left or right of the dot to keep it inside the plot
          const labelOnRight = x < PLOT_X + PLOT_W * 0.72;
          const labelX = labelOnRight ? x + r + 4 : x - r - 4;
          const labelAnchor = labelOnRight ? "start" : "end";
          return (
            <g key={`${s.name_or_title}-${idx}`}>
              <circle
                cx={x}
                cy={y}
                r={r + 2.5}
                fill="none"
                stroke={ring}
                strokeWidth={1.8}
                opacity={0.85}
              />
              <circle cx={x} cy={y} r={r} fill={fill} />
              <text
                x={labelX}
                y={y + 3.5}
                fontSize={11}
                fontWeight={500}
                fill="#0f1a2e"
                textAnchor={labelAnchor}
                style={{ paintOrder: "stroke", stroke: "rgba(255,255,255,0.85)", strokeWidth: 3 }}
              >
                {s.name_or_title}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-report-muted">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: POWER_COLOR.high }} />
          <span>High power</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: POWER_COLOR.medium }} />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: POWER_COLOR.low }} />
          <span>Low</span>
        </div>
        <span className="text-muted-foreground/40">·</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border-2" style={{ borderColor: STANCE_RING.supportive }} />
          <span>Supportive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border-2" style={{ borderColor: STANCE_RING.skeptical }} />
          <span>Skeptical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full border-2" style={{ borderColor: STANCE_RING.neutral }} />
          <span>Neutral</span>
        </div>
      </div>
    </div>
  );
};
