import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type SignupRow = { source?: string; page?: string; campaign?: string; week?: string; signups: number };
type ResourceRow = { resource: string; opens: number };
type PulseRow = { answer: string; responses: number };
type ReactivationSourceRow = { source: string; requested: number; confirmed: number };
type ReactivationData = {
  requested_30_days: number;
  confirmed_30_days: number;
  pending_30_days: number;
  sources_30_days: ReactivationSourceRow[];
};
type RetentionCohortRow = {
  cohort_week: string;
  acquired: number;
  retained_at_30_days: number;
  currently_active: number;
};
type RetentionData = {
  tracking_started_at: string;
  first_eligible_at: string;
  awaiting_maturity: number;
  eligible_acquisitions: number;
  retained_at_30_days: number;
  currently_active_after_30_days: number;
  retention_rate: number | null;
  cohorts: RetentionCohortRow[];
};
type VariantRow = {
  source: string;
  medium: string;
  campaign: string;
  variant: string;
  visits: number;
  form_view_sessions: number;
  form_submit_sessions: number;
  qualified_action_sessions: number;
  signups: number;
  active_subscribers: number;
};
type ReferralRow = {
  campaign: string;
  variant: string;
  visits: number;
  acquired: number;
  active: number;
};
type ReferralData = {
  share_action_sessions_30_days: number;
  referred_visits_30_days: number;
  acquired_30_days: number;
  active_30_days: number;
  visit_to_signup_rate: number | null;
  rows: ReferralRow[];
};
type DashboardData = {
  subscribers: {
    total: number;
    acquired_7_days: number;
    active_from_7_day_acquisitions: number;
    acquired_30_days: number;
    active_from_30_day_acquisitions: number;
    acquired_previous_30_days: number;
  };
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
  reactivation: ReactivationData;
  retention: RetentionData;
  referrals: ReferralData;
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
    <p className="mb-5 text-xs text-gray-500">Qualified sessions opened a resource, shared, answered the reader pulse, or visited the Analyzer demo. Acquired signups stay in campaign history even after an unsubscribe.</p>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="border-b border-gray-200 text-[10px] uppercase tracking-[0.16em] text-gray-500">
          <tr><th className="pb-3 pr-4">Channel</th><th className="pb-3 pr-4">Campaign</th><th className="pb-3 pr-4">Variant</th><th className="pb-3 pr-4 text-right">Visits</th><th className="pb-3 pr-4 text-right">Form views</th><th className="pb-3 pr-4 text-right">Qualified</th><th className="pb-3 pr-4 text-right">Acquired</th><th className="pb-3 pr-4 text-right">Still active</th><th className="pb-3 pr-4 text-right">Visit to action</th><th className="pb-3 text-right">Visit to signup</th></tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const signupRate = row.visits > 0 ? `${Math.round((row.signups / row.visits) * 100)}%` : "-";
            const actionRate = row.visits > 0 ? `${Math.round((row.qualified_action_sessions / row.visits) * 100)}%` : "-";
            return (
              <tr key={`${row.source}:${row.medium}:${row.campaign}:${row.variant}`} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 text-gray-600">{row.source} / {row.medium}</td>
                <td className="py-3 pr-4 text-gray-600">{row.campaign}</td>
                <td className="py-3 pr-4 font-semibold text-navy-dark">{row.variant.replaceAll("_", " ")}</td>
                <td className="py-3 pr-4 text-right text-gray-600">{row.visits}</td>
                <td className="py-3 pr-4 text-right text-gray-600">{row.form_view_sessions}</td>
                <td className="py-3 pr-4 text-right font-semibold text-navy-dark">{row.qualified_action_sessions}</td>
                <td className="py-3 pr-4 text-right font-semibold text-navy-dark">{row.signups}</td>
                <td className="py-3 pr-4 text-right text-gray-600">{row.active_subscribers}</td>
                <td className="py-3 pr-4 text-right text-gray-600">{actionRate}</td>
                <td className="py-3 text-right text-gray-600">{signupRate}</td>
              </tr>
            );
          })}
          {rows.length === 0 && <tr><td colSpan={10} className="py-5 text-gray-500">No tagged variants yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>
);

const ReferralTable = ({ data }: { data: ReferralData }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-6">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-serif text-lg font-bold text-navy-dark">Subscriber referral loop, 30 days</h2>
        <p className="mt-1 text-xs text-gray-500">Exact tagged, session-matched activity only. Direct visits are not guessed as referrals. Welcome-email share-button opens are excluded.</p>
      </div>
      <p className="text-xs font-semibold text-gray-600">Visit to signup: {data.visit_to_signup_rate === null ? "forming" : `${data.visit_to_signup_rate}%`}</p>
    </div>
    <div className="mb-6 grid gap-4 sm:grid-cols-4">
      <MetricCard label="Share-path actions" value={data.share_action_sessions_30_days} note="Unique post-signup sessions that opened or successfully copied a sharing path" />
      <MetricCard label="Referred visits" value={data.referred_visits_30_days} note="Unique tagged sessions" />
      <MetricCard label="Acquired" value={data.acquired_30_days} note="All referred signups" />
      <MetricCard label="Still active" value={data.active_30_days} note="Current status" />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="border-b border-gray-200 text-[10px] uppercase tracking-[0.16em] text-gray-500">
          <tr><th className="pb-3 pr-4">Origin</th><th className="pb-3 pr-4">Placement</th><th className="pb-3 pr-4 text-right">Visits</th><th className="pb-3 pr-4 text-right">Acquired</th><th className="pb-3 text-right">Still active</th></tr>
        </thead>
        <tbody>
          {data.rows.map(row => (
            <tr key={`${row.campaign}:${row.variant}`} className="border-b border-gray-100 last:border-0">
              <td className="py-3 pr-4 font-semibold text-navy-dark">{row.campaign.replaceAll("_", " ")}</td>
              <td className="py-3 pr-4 text-gray-600">{row.variant.replaceAll("_", " ")}</td>
              <td className="py-3 pr-4 text-right text-gray-600">{row.visits}</td>
              <td className="py-3 pr-4 text-right font-semibold text-navy-dark">{row.acquired}</td>
              <td className="py-3 text-right text-gray-600">{row.active}</td>
            </tr>
          ))}
          {data.rows.length === 0 && <tr><td colSpan={5} className="py-5 text-gray-500">No tagged referral activity yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </section>
);

const GrowthDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [reactivationError, setReactivationError] = useState<string | null>(null);
  const [retentionError, setRetentionError] = useState<string | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [dashboardResult, variantResult, reactivationResult, retentionResult, referralResult] = await Promise.all([
        supabase.rpc("get_growth_dashboard"),
        supabase.rpc("get_growth_variant_dashboard"),
        supabase.rpc("get_reactivation_dashboard"),
        supabase.rpc("get_growth_retention_dashboard"),
        supabase.rpc("get_referral_dashboard"),
      ]);
      if (dashboardResult.error) {
        setError(dashboardResult.error.message);
        return;
      }
      if (variantResult.error) setVariantError(variantResult.error.message);
      if (reactivationResult.error) setReactivationError(reactivationResult.error.message);
      if (retentionResult.error) setRetentionError(retentionResult.error.message);
      if (referralResult.error) setReferralError(referralResult.error.message);
      setData({
        ...(dashboardResult.data as unknown as Omit<DashboardData, "content_variants_30_days" | "reactivation" | "retention">),
        content_variants_30_days: variantResult.error ? [] : variantResult.data as unknown as VariantRow[],
        reactivation: reactivationResult.error
          ? { requested_30_days: 0, confirmed_30_days: 0, pending_30_days: 0, sources_30_days: [] }
          : reactivationResult.data as unknown as ReactivationData,
        retention: retentionResult.error
          ? {
            tracking_started_at: "",
            first_eligible_at: "",
            awaiting_maturity: 0,
            eligible_acquisitions: 0,
            retained_at_30_days: 0,
            currently_active_after_30_days: 0,
            retention_rate: null,
            cohorts: [],
          }
          : retentionResult.data as unknown as RetentionData,
        referrals: referralResult.error
          ? {
            share_action_sessions_30_days: 0,
            referred_visits_30_days: 0,
            acquired_30_days: 0,
            active_30_days: 0,
            visit_to_signup_rate: null,
            rows: [],
          }
          : referralResult.data as unknown as ReferralData,
      });
    };
    void load();
  }, []);

  if (error) return <main className="min-h-screen p-24 text-center text-red">Growth data unavailable: {error}</main>;
  if (!data) return <main className="min-h-screen p-24 text-center text-gray-500">Loading growth data...</main>;

  const funnel = data.funnel_30_days;
  const formConversion = funnel.form_views > 0 ? Math.round((data.subscribers.acquired_30_days / funnel.form_views) * 100) : 0;
  const growthChange = data.subscribers.acquired_30_days - data.subscribers.acquired_previous_30_days;
  const reactivationRate = data.reactivation.requested_30_days > 0
    ? Math.round((data.reactivation.confirmed_30_days / data.reactivation.requested_30_days) * 100)
    : 0;
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
          <MetricCard label="Acquired in 30 days" value={data.subscribers.acquired_30_days} note={`${data.subscribers.active_from_30_day_acquisitions} still active`} />
          <MetricCard label="Previous 30 days" value={data.subscribers.acquired_previous_30_days} note="All acquired" />
          <MetricCard label="Acquired in 7 days" value={data.subscribers.acquired_7_days} note={`${data.subscribers.active_from_7_day_acquisitions} still active`} />
          <MetricCard label="Form conversion" value={formConversion} suffix="%" note="Measured views to signups" />
        </div>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-navy-dark">30-day subscriber retention</h2>
              <p className="mt-1 text-xs text-gray-500">Exact aggregate cohort measurement starts with this release; historical retention is not guessed.</p>
            </div>
            {retentionError && <p className="text-xs text-amber-700">Retention tracking is waiting for its database update.</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-4">
            <MetricCard label="Awaiting day 30" value={data.retention.awaiting_maturity} note="New measured cohort" />
            <MetricCard label="Eligible acquisitions" value={data.retention.eligible_acquisitions} note="Reached day 30" />
            <MetricCard label="Retained at day 30" value={data.retention.retained_at_30_days} note="Exact status at maturity" />
            <MetricCard label="30-day retention" value={data.retention.retention_rate ?? 0} suffix="%" note={data.retention.retention_rate === null ? "First result after 30 days" : "Retained per eligible acquisition"} />
          </div>
          {data.retention.first_eligible_at && data.retention.eligible_acquisitions === 0 && (
            <p className="mt-4 text-xs text-gray-500">First exact cohort result can appear after {new Date(data.retention.first_eligible_at).toLocaleDateString()}.</p>
          )}
        </section>

        <section className="mb-8 rounded-xl bg-navy-dark p-6 text-white">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">operator readout</p>
          <div className="grid gap-5 md:grid-cols-3">
            {readout.map((item, index) => <p key={item} className="text-sm leading-relaxed text-gray-200"><span className="mr-2 font-serif text-xl font-black text-red-400">0{index + 1}</span>{item}</p>)}
          </div>
        </section>

        <div className="mb-8">
          {referralError && <p className="mb-3 text-xs text-amber-700">Referral reporting is waiting for its database update. Sharing remains available.</p>}
          <ReferralTable data={data.referrals} />
        </div>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-2 font-serif text-lg font-bold text-navy-dark">Measured journey, last 30 days</h2>
          <p className="mb-5 text-xs text-gray-500">Unique sessions, not repeat event rows.</p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-9">
            {Object.entries(funnel).map(([label, value]) => (
              <div key={label}>
                <p className="font-serif text-2xl font-black text-navy-dark">{value}</p>
                <p className="mt-1 text-xs text-gray-500">{label.replaceAll("_", " ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-navy-dark">Returning subscribers, 30 days</h2>
              <p className="mt-1 text-xs text-gray-500">A rejoin counts only after the reader confirms by email. Original acquisition history remains unchanged.</p>
            </div>
            {reactivationError && <p className="text-xs text-amber-700">Reactivation tracking is waiting for its database update.</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-4">
            <MetricCard label="Rejoin requests" value={data.reactivation.requested_30_days} note="Consent links sent" />
            <MetricCard label="Confirmed" value={data.reactivation.confirmed_30_days} note="Returned to active list" />
            <MetricCard label="Pending" value={data.reactivation.pending_30_days} note="Unexpired links" />
            <MetricCard label="Confirmation rate" value={reactivationRate} suffix="%" note="Confirmed per request" />
          </div>
          {data.reactivation.sources_30_days.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                  <tr><th className="pb-3">Source</th><th className="pb-3 text-right">Requested</th><th className="pb-3 text-right">Confirmed</th></tr>
                </thead>
                <tbody>
                  {data.reactivation.sources_30_days.map(row => (
                    <tr key={row.source} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 text-gray-600">{row.source.replaceAll("_", " ")}</td>
                      <td className="py-3 text-right text-gray-600">{row.requested}</td>
                      <td className="py-3 text-right font-semibold text-navy-dark">{row.confirmed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
