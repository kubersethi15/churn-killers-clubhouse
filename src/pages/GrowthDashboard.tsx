import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type SignupRow = { source?: string; page?: string; campaign?: string; week?: string; signups: number };
type ResourceRow = { resource: string; opens: number };
type PulseRow = { answer: string; responses: number };
type VariantRow = { source: string; medium: string; campaign: string; variant: string; visits: number; signups: number };
type DashboardData = {
  subscribers: { total: number; new_7_days: number; new_30_days: number; previous_30_days: number };
  funnel_30_days: {
    page_views: number;
    form_views: number;
    form_submits: number;
    signup_successes: number;
    shares: number;
    resource_opens: number;
    starter_kit_views: number;
    topic_views: number;
    analyzer_demo_views: number;
  };
  sources_30_days: SignupRow[];
  signup_pages_30_days: SignupRow[];
  campaigns_30_days: SignupRow[];
  weekly_growth: SignupRow[];
  top_resources_30_days: ResourceRow[];
  reader_pulse_30_days: PulseRow[];
  content_variants_30_days: VariantRow[];
};

const MetricCard = ({ label, value, note, suffix = "" }: { label: string; value: number; note: string; suffix?: string }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5">
    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{label}</p>
    <p className="font-serif text-3xl font-black text-navy-dark">{value}{suffix}</p>
    <p className="mt-1 text-xs text-gray-500">{note}</p>
  </div>
);

const RankedList = ({ title, rows, labelKey, valueKey = "signups" }: { title: string; rows: Array<SignupRow | ResourceRow | PulseRow>; labelKey: "source" | "page" | "campaign" | "week" | "resource" | "answer"; valueKey?: "signups" | "opens" | "responses" }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-6">
    <h2 className="mb-5 font-serif text-lg font-bold text-navy-dark">{title}</h2>
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={`${String(row[labelKey as keyof typeof row])}-${index}`} className="flex items-center justify-between gap-4 text-sm">
          <span className="truncate text-gray-600">{String(row[labelKey as keyof typeof row] ?? "unknown").replaceAll("_", " ")}</span>
          <span className="font-semibold text-navy-dark">{Number(row[valueKey as keyof typeof row] ?? 0)}</span>
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-gray-500">No measured activity yet.</p>}
    </div>
  </section>
);

const VariantTable = ({ rows }: { rows: VariantRow[] }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-6">
    <h2 className="mb-2 font-serif text-lg font-bold text-navy-dark">Distribution variants, 30 days</h2>
    <p className="mb-5 text-xs text-gray-500">Compare qualified visits and subscriptions only after each variant has enough traffic to judge.</p>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-gray-200 text-[10px] uppercase tracking-[0.16em] text-gray-500">
          <tr><th className="pb-3 pr-4">Channel</th><th className="pb-3 pr-4">Campaign</th><th className="pb-3 pr-4">Variant</th><th className="pb-3 pr-4 text-right">Visits</th><th className="pb-3 pr-4 text-right">Signups</th><th className="pb-3 text-right">Rate</th></tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const rate = row.visits > 0 ? `${Math.round((row.signups / row.visits) * 100)}%` : "—";
            return (
              <tr key={`${row.source}:${row.medium}:${row.campaign}:${row.variant}`} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 text-gray-600">{row.source} / {row.medium}</td>
                <td className="py-3 pr-4 text-gray-600">{row.campaign}</td>
                <td className="py-3 pr-4 font-semibold text-navy-dark">{row.variant.replaceAll("_", " ")}</td>
                <td className="py-3 pr-4 text-right text-gray-600">{row.visits}</td>
                <td className="py-3 pr-4 text-right font-semibold text-navy-dark">{row.signups}</td>
                <td className="py-3 text-right text-gray-600">{rate}</td>
              </tr>
            );
          })}
          {rows.length === 0 && <tr><td colSpan={6} className="py-5 text-gray-500">No tagged variants yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>
);

const GrowthDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [dashboardResult, variantResult] = await Promise.all([
        supabase.rpc("get_growth_dashboard"),
        supabase.rpc("get_growth_variant_dashboard"),
      ]);
      if (dashboardResult.error) {
        setError(dashboardResult.error.message);
        return;
      }
      if (variantResult.error) setVariantError(variantResult.error.message);
      setData({
        ...(dashboardResult.data as unknown as Omit<DashboardData, "content_variants_30_days">),
        content_variants_30_days: variantResult.error ? [] : variantResult.data as unknown as VariantRow[],
      });
    };
    void load();
  }, []);

  if (error) return <main className="min-h-screen p-24 text-center text-red">Growth data unavailable: {error}</main>;
  if (!data) return <main className="min-h-screen p-24 text-center text-gray-500">Loading growth data...</main>;

  const funnel = data.funnel_30_days;
  const formConversion = funnel.form_views > 0 ? Math.round((funnel.signup_successes / funnel.form_views) * 100) : 0;
  const growthChange = data.subscribers.new_30_days - data.subscribers.previous_30_days;
  const readout = [
    growthChange < 0
      ? `Subscriber pace is down ${Math.abs(growthChange)} versus the previous 30-day window. Prioritise distribution and offer clarity.`
      : `Subscriber pace is up ${growthChange} versus the previous 30-day window. Identify which source and page produced the lift.`,
    funnel.form_views > 0
      ? `${formConversion}% of measured form viewers subscribed. Compare this by page before changing every CTA at once.`
      : "The acquisition baseline is still forming. Avoid declaring a winning CTA until form-view data accumulates.",
    funnel.resource_opens > funnel.signup_successes
      ? "Readers are using tools after discovery. Keep the article-to-playbook path prominent."
      : "Tool activation trails signup activity. The welcome email and Starter Kit should be the next activation test.",
  ];

  return (
    <main className="min-h-screen bg-cream/30 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-red">Aggregate only</p>
            <h1 className="font-serif text-3xl font-black text-navy-dark md:text-4xl">Growth and activation</h1>
            <p className="mt-2 text-sm text-gray-600">Internal decision signals. Not universal benchmarks.</p>
          </div>
          <Link to="/admin" className="text-sm font-semibold text-gray-600 hover:text-navy-dark">Admin home</Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Active subscribers" value={data.subscribers.total} note="Current list" />
          <MetricCard label="New in 30 days" value={data.subscribers.new_30_days} note="Current window" />
          <MetricCard label="Previous 30 days" value={data.subscribers.previous_30_days} note="Comparison window" />
          <MetricCard label="New in 7 days" value={data.subscribers.new_7_days} note="Recent pace" />
          <MetricCard label="Form conversion" value={formConversion} suffix="%" note="Measured views to signups" />
        </div>

        <section className="mb-8 rounded-xl bg-navy-dark p-6 text-white">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">operator readout</p>
          <div className="grid gap-5 md:grid-cols-3">
            {readout.map((item, index) => <p key={item} className="text-sm leading-relaxed text-gray-200"><span className="mr-2 font-serif text-xl font-black text-red-400">0{index + 1}</span>{item}</p>)}
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-5 font-serif text-lg font-bold text-navy-dark">Measured journey, last 30 days</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-9">
            {Object.entries(funnel).map(([label, value]) => (
              <div key={label}>
                <p className="font-serif text-2xl font-black text-navy-dark">{value}</p>
                <p className="mt-1 text-xs text-gray-500">{label.replaceAll("_", " ")}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RankedList title="Signup sources, 30 days" rows={data.sources_30_days} labelKey="source" />
          <RankedList title="Signup pages, 30 days" rows={data.signup_pages_30_days} labelKey="page" />
          <RankedList title="Campaigns, 30 days" rows={data.campaigns_30_days} labelKey="campaign" />
          <RankedList title="Top tools and topics" rows={data.top_resources_30_days} labelKey="resource" valueKey="opens" />
          <RankedList title="Reader pulse" rows={data.reader_pulse_30_days} labelKey="answer" valueKey="responses" />
          <RankedList title="Weekly growth" rows={data.weekly_growth} labelKey="week" />
          <div className="md:col-span-2 lg:col-span-3">
            {variantError && <p className="mb-3 text-xs text-amber-700">Variant attribution is waiting for its database update. The rest of the dashboard remains current.</p>}
            <VariantTable rows={data.content_variants_30_days} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default GrowthDashboard;
