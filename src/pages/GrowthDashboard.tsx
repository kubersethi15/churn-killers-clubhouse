import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type MetricRow = { source?: string; page?: string; month?: string; signups: number };
type DashboardData = {
  subscribers: { total: number; new_7_days: number; new_30_days: number };
  funnel_30_days: {
    page_views: number;
    form_views: number;
    form_submits: number;
    signup_successes: number;
    shares: number;
    resource_opens: number;
  };
  sources_30_days: MetricRow[];
  signup_pages_30_days: MetricRow[];
  monthly_growth: MetricRow[];
};

const MetricCard = ({ label, value, note, suffix = "" }: { label: string; value: number; note: string; suffix?: string }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-2">{label}</p>
    <p className="text-3xl font-serif font-black text-navy-dark">{value}{suffix}</p>
    <p className="text-xs text-gray-400 mt-1">{note}</p>
  </div>
);

const RankedList = ({ title, rows, labelKey }: { title: string; rows: MetricRow[]; labelKey: "source" | "page" | "month" }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-6">
    <h2 className="text-lg font-serif font-bold text-navy-dark mb-5">{title}</h2>
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={`${row[labelKey]}-${index}`} className="flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-600 truncate">{row[labelKey] ?? "unknown"}</span>
          <span className="font-semibold text-navy-dark">{row.signups}</span>
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
    </div>
  </section>
);

const GrowthDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const result = await supabase.rpc("get_growth_dashboard");
      if (result.error) setError(result.error.message);
      else setData(result.data as unknown as DashboardData);
    };
    void load();
  }, []);

  if (error) return <main className="min-h-screen p-24 text-center text-red">Growth data unavailable: {error}</main>;
  if (!data) return <main className="min-h-screen p-24 text-center text-gray-400">Loading growth data...</main>;

  const funnel = data.funnel_30_days;
  const formConversion = funnel.form_views > 0 ? Math.round((funnel.signup_successes / funnel.form_views) * 100) : 0;

  return (
    <main className="min-h-screen bg-cream/30 px-4 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-red font-bold mb-2">Aggregate only</p>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-navy-dark">Newsletter growth</h1>
          </div>
          <Link to="/admin" className="text-sm font-semibold text-gray-500 hover:text-navy-dark">Admin home</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard label="Active subscribers" value={data.subscribers.total} note="Current list" />
          <MetricCard label="New in 30 days" value={data.subscribers.new_30_days} note="Net active signups" />
          <MetricCard label="New in 7 days" value={data.subscribers.new_7_days} note="Recent pace" />
          <MetricCard label="Form conversion" value={formConversion} suffix="%" note="Measured form views to signups" />
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
          <h2 className="text-lg font-serif font-bold text-navy-dark mb-5">Measured funnel, last 30 days</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(funnel).map(([label, value]) => (
              <div key={label}>
                <p className="text-2xl font-serif font-black text-navy-dark">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label.replaceAll("_", " ")}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <RankedList title="Signup sources, 30 days" rows={data.sources_30_days} labelKey="source" />
          <RankedList title="Signup pages, 30 days" rows={data.signup_pages_30_days} labelKey="page" />
          <RankedList title="Monthly growth" rows={data.monthly_growth} labelKey="month" />
        </div>
      </div>
    </main>
  );
};

export default GrowthDashboard;
