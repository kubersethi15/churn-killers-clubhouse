import { useState } from "react";
import { Check } from "lucide-react";
import { trackGrowthEvent } from "@/utils/growthTracking";

const PULSE_KEY = "cid_reader_pulse_2026_q3";
const options = [
  ["renewal", "Make renewal risk actionable"],
  ["product", "Get Product to decide on friction"],
  ["value", "Prove customer value to executives"],
  ["ai", "Redesign CS work around AI"],
  ["capacity", "Fix team capacity and ownership"],
] as const;

const ReaderPulse = () => {
  const [answer, setAnswer] = useState(() => typeof window === "undefined" ? "" : window.localStorage.getItem(PULSE_KEY) || "");

  const choose = (value: string) => {
    if (answer) return;
    setAnswer(value);
    window.localStorage.setItem(PULSE_KEY, value);
    void trackGrowthEvent({ eventName: "reader_pulse_response", resourceId: `reader-pulse:${value}` });
  };

  return (
    <section className="border-y border-gray-100 bg-white py-14 md:py-18" aria-labelledby="reader-pulse-title">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-red-600">reader pulse</p>
          <h2 id="reader-pulse-title" className="font-serif text-3xl font-black text-navy-dark">What decision is hardest right now?</h2>
          <p className="mt-3 text-gray-600">One click. No email attached. The aggregate result shapes future research.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {options.map(([value, label]) => {
              const selected = answer === value;
              return (
                <button key={value} type="button" onClick={() => choose(value)} disabled={Boolean(answer)} className={`flex min-h-12 items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors ${selected ? "border-navy-dark bg-navy-dark text-white" : "border-gray-200 bg-white text-navy-dark hover:border-red-400 disabled:cursor-default disabled:opacity-60"}`}>
                  {label}{selected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
          {answer && <p className="mt-5 text-sm font-semibold text-navy-dark" aria-live="polite">Recorded. The result will be reported only in aggregate.</p>}
        </div>
      </div>
    </section>
  );
};

export default ReaderPulse;
