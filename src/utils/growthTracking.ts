import { supabase } from "@/integrations/supabase/client";

export type GrowthEventName =
  | "page_view"
  | "form_view"
  | "form_submit"
  | "signup_success"
  | "signup_duplicate"
  | "signup_error"
  | "content_share"
  | "resource_open";

type Attribution = {
  landingPage: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
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

const sessionId = () => {
  if (typeof window === "undefined") return crypto.randomUUID();
  const current = window.sessionStorage.getItem(SESSION_KEY);
  if (current) return current;
  const next = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
};

export const getGrowthAttribution = (): Attribution => {
  if (typeof window === "undefined") {
    return { landingPage: "/", source: null, medium: null, campaign: null, referrerHost: null };
  }

  const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Attribution;
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
    referrerHost,
  };
  window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  return attribution;
};

export const currentContentSlug = () => {
  const match = safePath().match(/^\/newsletter\/([^/]+)/);
  return match?.[1]?.slice(0, 160) ?? null;
};

export const trackGrowthEvent = async ({
  eventName,
  pagePath = safePath(),
  contentSlug = currentContentSlug(),
  signupLocation = null,
  resourceId = null,
}: GrowthEvent) => {
  if (import.meta.env.DEV) return;
  const attribution = getGrowthAttribution();
  const { error } = await supabase.from("growth_events").insert({
    session_id: sessionId(),
    event_name: eventName,
    page_path: pagePath.slice(0, 300),
    content_slug: clean(contentSlug, 160),
    signup_location: clean(signupLocation, 80),
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign,
    referrer_host: attribution.referrerHost,
    resource_id: clean(resourceId, 180),
  });

  if (error && import.meta.env.DEV) {
    console.warn("Growth event was not recorded", error.message);
  }
};
