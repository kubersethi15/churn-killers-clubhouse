import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles,
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
    <div className="animate-fade-in max-w-2xl mx-auto py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full bg-red/10 animate-ping opacity-30" />
          <div className="relative w-16 h-16 rounded-full bg-red/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-red animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-dark mb-2">
          Your analysis is underway
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Five specialized AI agents are reviewing your transcript from different angles to build a comprehensive report.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8 px-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {formatTime(elapsedSeconds)} elapsed
          </span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Agent Cards */}
      <div className="space-y-3">
        {PIPELINE_AGENTS.map((agent) => {
          const state = agentStates[agent.id];
          const isParallel = agent.id === "commercial" || agent.id === "adoption";
          const showParallelStart = agent.id === "commercial";
          const showParallelEnd = agent.id === "adoption";

          return (
            <div key={agent.id}>
              {/* Parallel group opening */}
              {showParallelStart && (
                <div className="flex items-center gap-2 mb-2 mt-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Running in parallel
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              {/* Indent parallel agents into a nested block */}
              <div className={cn(isParallel && "ml-6")}>
                <div
                  className={cn(
                    "relative rounded-xl border px-4 py-3 transition-all duration-500",
                    state.status === "active" &&
                      "border-red/30 bg-red/[0.03] shadow-sm",
                    state.status === "complete" &&
                      "border-emerald-200 bg-emerald-50/50",
                    state.status === "pending" &&
                      "border-border bg-muted/30 opacity-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-500",
                        state.status === "active" && "bg-red/10 text-red",
                        state.status === "complete" && "bg-emerald-100 text-emerald-600",
                        state.status === "pending" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {state.status === "complete" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : state.status === "active" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        agent.icon
                      )}
                    </div>

                    {/* Content */}
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
                        {state.status === "complete" && (
                          <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wide">
                            Done
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-0.5 transition-colors duration-500",
                          state.status === "active" ? "text-foreground/70" : "text-muted-foreground"
                        )}
                      >
                        {state.status === "active" ? agent.detail : agent.description}
                      </p>

                      {/* Per-agent progress bar (only when active) */}
                      {state.status === "active" && (
                        <div className="mt-2">
                          <Progress value={state.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parallel group closing divider */}
              {showParallelEnd && (
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
            </div>
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
