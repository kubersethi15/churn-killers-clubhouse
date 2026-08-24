import { ArrowRight, Check, MessageSquareText, Radio, UserRoundCheck } from "lucide-react";
import { Link } from "react-router-dom";

const stages = [
  { label: "Eligible", detail: "Right account. Right role.", icon: UserRoundCheck },
  { label: "Reached", detail: "Delivery is verified.", icon: Radio },
  { label: "Responded", detail: "Useful evidence appears.", icon: MessageSquareText },
  { label: "Moved", detail: "The customer acts.", icon: Check },
];

const OperatingSystemPreview = () => (
  <div className="relative rounded-2xl border border-white/15 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-sm md:p-6">
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">This week's operating system</p>
        <h2 className="mt-2 font-serif text-2xl font-black text-white">The Silence Ledger</h2>
      </div>
      <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-300">8 min</span>
    </div>

    <div className="grid gap-2">
      {stages.map(({ label, detail, icon: Icon }, index) => (
        <div key={label} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-navy-dark/50 p-3 transition-colors hover:border-red-400/50">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-red-300"><Icon className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">{label}</p>
            <p className="text-xs text-gray-400">{detail}</p>
          </div>
          <span className="font-serif text-sm font-black text-white/30">0{index + 1}</span>
        </div>
      ))}
    </div>

    <div className="mt-4 rounded-xl bg-red-600 p-4 text-white">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">Decision trigger</p>
      <p className="mt-1 text-sm font-semibold leading-snug">When does silence require a human decision?</p>
    </div>

    <Link to="/newsletter/digital-cs-coverage-silence" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-red-300">
      See the complete system <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default OperatingSystemPreview;
