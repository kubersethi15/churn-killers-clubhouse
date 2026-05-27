import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  ShieldCheck,
  TrendingUp,
  Activity,
  Gavel,
  CheckCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PipelineAgent {
  id: string;
  label: string;
  description: string;
  detail: string;
  icon: React.ReactNode;
  durationMs: number;
}

const PIPELINE_AGENTS: PipelineAgent[] = [
  {
    id: "preprocessor",
    label: "Preprocessor",
    description: "Mapping speakers & extracting evidence",
    detail: "Identifying speaker roles, tagging evidence anchors, and building the conversation structure",
    icon: <Search className="w-4 h-4" />,
    durationMs: 7000,
  },
  {
    id: "evidence",
    label: "Evidence Extractor",
    description: "Cataloging facts, risks & commitments",
    detail: "Extracting verbatim quotes, observed facts, explicit risks, and stakeholder commitments",
    icon: <ShieldCheck className="w-4 h-4" />,
    durationMs: 11000,
  },
  {
    id: "commercial",
    label: "Commercial Strategist",
    description: "Assessing revenue threats & opportunities",
    detail: "Analyzing commercial signals, renewal risk indicators, and expansion potential",
    icon: <TrendingUp className="w-4 h-4" />,
    durationMs: 12000,
  },
  {
    id: "adoption",
    label: "Adoption Diagnostician",
    description: "Evaluating product usage & value gaps",
    detail: "Reviewing adoption signals, value narrative gaps, and feature utilization patterns",
    icon: <Activity className="w-4 h-4" />,
    durationMs: 12000,
  },
  {
    id: "judge",
    label: "Judge & Enforcer",
    description: "Synthesizing final report with confidence scores",
    detail: "Cross-referencing all analyst outputs, resolving conflicts, and building the executive report",
    icon: <Gavel className="w-4 h-4" />,
    durationMs: 10000,
  },
];

// Total simulated duration — the UI will hold at ~95% until the real response arrives
const TOTAL_SIMULATED_MS = PIPELINE_AGENTS.reduce((s, a) => s + a.durationMs, 0);

type AgentStatus = "pending" | "active" | "complete";

interface AgentState {
  status: AgentStatus;
  progress: number; // 0–100
}

const AgentCard = ({ agent, state, index }: { agent: PipelineAgent; state: AgentState; index: number }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    className={cn(
      "relative rounded-xl border px-4 py-3 transition-colors duration-500",
      state.status === "active" && "border-red/30 bg-red/[0.03] shadow-sm",
      state.status === "complete" && "border-emerald-200 bg-emerald-50/50",
      state.status === "pending" && "border-border bg-muted/30 opacity-60"
    )}
  >
    {/* Active-state breathing edge */}
    {state.status === "active" && (
      <motion.div
        className="absolute inset-0 rounded-xl border border-red/40 pointer-events-none"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    )}
    <div className="flex items-start gap-3 relative">
      <motion.div
        layout
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-500",
          state.status === "active" && "bg-red/10 text-red",
          state.status === "complete" && "bg-emerald-100 text-emerald-600",
          state.status === "pending" && "bg-muted text-muted-foreground"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {state.status === "complete" ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <CheckCircle className="w-4 h-4" />
            </motion.div>
          ) : state.status === "active" ? (
            <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          ) : (
            <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {agent.icon}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={cn(
              "text-sm font-semibold transition-colors duration-500",
              state.status === "active" && "text-navy-dark",
              state.status === "complete" && "text-emerald-700",
              state.status === "pending" && "text-muted-foreground"
            )}
          >
            {agent.label}
          </h4>
          <AnimatePresence>
            {state.status === "complete" && (
              <motion.span
                key="done"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide"
              >
                Done
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <p
          className={cn(
            "text-xs mt-0.5 transition-colors duration-500",
            state.status === "active" ? "text-foreground/70" : "text-muted-foreground"
          )}
        >
          {state.status === "active" ? agent.detail : agent.description}
        </p>
        <AnimatePresence>
          {state.status === "active" && (
            <motion.div
              key="bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <Progress value={state.progress} className="h-1" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </motion.div>
);

export const AnalyzingProgress = () => {
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(() =>
    Object.fromEntries(PIPELINE_AGENTS.map((a) => [a.id, { status: "pending", progress: 0 }]))
  );
  const [overallProgress, setOverallProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>();

  // Timer for elapsed display
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulated progress animation
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      let cumulative = 0;

      const newStates: Record<string, AgentState> = {};
      for (const agent of PIPELINE_AGENTS) {
        const agentStart = cumulative;
        // Commercial (index 2) and Adoption (index 3) run in parallel
        const isParallel = agent.id === "adoption";
        const effectiveStart = isParallel
          ? PIPELINE_AGENTS.slice(0, 2).reduce((s, a) => s + a.durationMs, 0) // same start as commercial
          : agentStart;
        const agentEnd = effectiveStart + agent.durationMs;

        if (elapsed < effectiveStart) {
          newStates[agent.id] = { status: "pending", progress: 0 };
        } else if (elapsed >= agentEnd) {
          newStates[agent.id] = { status: "complete", progress: 100 };
        } else {
          const agentProgress = Math.min(
            95, // Cap at 95% so it doesn't look "done" before it is
            ((elapsed - effectiveStart) / agent.durationMs) * 100
          );
          newStates[agent.id] = { status: "active", progress: agentProgress };
        }

        if (!isParallel) {
          cumulative += agent.durationMs;
        }
      }

      setAgentStates(newStates);

      // Overall progress: cap at 95% to avoid false "complete" state
      const overallPct = Math.min(95, (elapsed / TOTAL_SIMULATED_MS) * 100);
      setOverallProgress(overallPct);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-12">
      {/* Editorial header */}
      <div className="text-center mb-10">
        <div className="relative w-14 h-14 mx-auto mb-5">
          <motion.div
            className="absolute inset-0 rounded-full bg-red/10"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="relative w-14 h-14 rounded-full bg-red/10 flex items-center justify-center"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-3 h-3 rounded-full bg-red" />
          </motion.div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-red font-bold mb-2">
          Reading the call
        </p>
        <h2 className="text-2xl md:text-3xl font-serif font-black text-navy-dark mb-2 leading-tight tracking-tight">
          Five agents are pulling this apart.
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Evidence first, then commercial risk, then adoption, then a final pass that anchors every claim to a quote.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8 px-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {formatTime(elapsedSeconds)} elapsed
          </span>
          <motion.span
            key={Math.round(overallProgress / 5)}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="tabular-nums"
          >
            {Math.round(overallProgress)}%
          </motion.span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Agent Cards */}
      <div className="space-y-3">
        {/* Sequential agents: Preprocessor, Evidence */}
        {PIPELINE_AGENTS.filter(a => a.id !== "commercial" && a.id !== "adoption" && a.id !== "judge").map((agent, i) => {
          const state = agentStates[agent.id];
          return (
            <AgentCard key={agent.id} agent={agent} state={state} index={i} />
          );
        })}

        {/* Parallel group: Commercial + Adoption */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-xl border border-dashed border-emerald-200/70 bg-emerald-50/20 p-3 space-y-3"
        >
          <div className="flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Running in parallel
            </span>
          </div>
          {PIPELINE_AGENTS.filter(a => a.id === "commercial" || a.id === "adoption").map((agent, i) => {
            const state = agentStates[agent.id];
            return (
              <AgentCard key={agent.id} agent={agent} state={state} index={i + 2} />
            );
          })}
        </motion.div>

        {/* Judge */}
        {PIPELINE_AGENTS.filter(a => a.id === "judge").map((agent) => {
          const state = agentStates[agent.id];
          return (
            <AgentCard key={agent.id} agent={agent} state={state} index={4} />
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        Typically completes in 30–50 seconds
      </p>
    </div>
  );
};
