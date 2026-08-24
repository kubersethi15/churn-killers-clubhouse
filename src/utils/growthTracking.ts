import { supabase } from "@/integrations/supabase/client";

export type GrowthEventName =
  | "page_view"
  | "form_view"
  | "form_submit"
  | "signup_success"
  | "signup_duplicate"
  | "signup_error"
  | "share_intent"
  | "content_share"
  | "resource_open"
  | "reader_pulse_response";

type Attribution = {
  landingPage: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  referrerHost: string | null;
};

type GrowthEvent = {
  eventName: GrowthEventName;
  pagePath?: string;
  contentSlug?: string | null;
  signupLocation?: string | null;
  resourceId?: string | null;
};

const SESSION_KEY = "cid_growth_session";
const ATTRIBUTION_KEY = "cid_growth_attribution";

const clean = (value: string | null, maxLength: number) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
};

const safePath = () => {
  if (typeof window === "undefined") return "/";
  return (window.location.pathname || "/").slice(0, 300);
};

const referrerHostname = () => {
  if (typeof document === "undefined" || !document.referrer) return null;
  try {
    const hostname = new URL(document.referrer).hostname.toLowerCase();
    return hostname === window.location.hostname.toLowerCase() ? null : hostname.slice(0, 255);
  } catch {
    return null;
  }
};

export const growthSessionId = () => {
  if (typeof window === "undefined") return crypto.randomUUID();
  const current = window.sessionStorage.getItem(SESSION_KEY);
  if (current) return current;
  const next = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
};

export const getGrowthAttribution = (): Attribution => {
  if (typeof window === "undefined") {
    return { landingPage: "/", source: null, medium: null, campaign: null, content: null, referrerHost: null };
  }

  const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<Attribution>;
      return {
        landingPage: parsed.landingPage ?? "/",
        source: parsed.source ?? null,
        medium: parsed.medium ?? null,
        campaign: parsed.campaign ?? null,
        content: parsed.content ?? null,
        referrerHost: parsed.referrerHost ?? null,
      };
    } catch {
      window.sessionStorage.removeItem(ATTRIBUTION_KEY);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const referrerHost = referrerHostname();
  const attribution: Attribution = {
    landingPage: safePath(),
    source: clean(params.get("utm_source"), 120) ?? referrerHost ?? "direct",
    medium: clean(params.get("utm_medium"), 120),
    campaign: clean(params.get("utm_campaign"), 160),
    content: clean(params.get("utm_content"), 160),
    referrerHost,
  };
  window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  return attribution;
};

export const currentContentSlug = () => {
  const match = safePath().match(/^\/newsletter\/([^/]+)/);
  return match?.[1]?.slice(0, 160) ?? null;
};

// Only the live site may write growth events.
//
// import.meta.env.DEV alone is not enough. It is false in any production build,
// including one served by `vite preview` from localhost, so every agent or
// developer who builds the site and clicks through it was writing events to the
// production table as an indistinguishable reader. That contaminates CID-001,
// the LinkedIn funnel, CID-006, referral measurement and the costly-problem
// ledger, all of which read this table.
//
// This is an allowlist rather than a localhost blocklist. It fails closed: an
// unrecognised host records nothing, which loses data. A blocklist fails open,
// which silently poisons it. Missing data is visible; poisoned data is not.
const PRODUCTION_HOSTS = new Set(["churnisdead.com", "www.churnisdead.com"]);

const isProductionSite = () => {
  if (typeof window === "undefined") return false;
  return PRODUCTION_HOSTS.has(window.location.hostname.toLowerCase());
};

export const trackGrowthEvent = async ({
  eventName,
  pagePath = safePath(),
  contentSlug = currentContentSlug(),
  signupLocation = null,
  resourceId = null,
}: GrowthEvent) => {
  if (import.meta.env.DEV) return;
  if (!isProductionSite()) return;
  const attribution = getGrowthAttribution();
  const { error } = await supabase.from("growth_events").insert({
    session_id: growthSessionId(),
    event_name: eventName,
    page_path: pagePath.slice(0, 300),
    content_slug: clean(contentSlug, 160),
    signup_location: clean(signupLocation, 80),
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign,
    utm_content: attribution.content,
    referrer_host: attribution.referrerHost,
    resource_id: clean(resourceId, 180),
  });

  if (error && import.meta.env.DEV) {
    console.warn("Growth event was not recorded", error.message);
  }
};
