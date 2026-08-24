const SITE_ORIGIN = "https://churnisdead.com";

const publicPath = (pathname: string) => {
  const publicRoutes = new Set([
    "/",
    "/about",
    "/ai-exposure-score",
    "/cs-analyzer/demo",
    "/editorial-standards",
    "/newsletters",
    "/playbook",
    "/start",
    "/subscribe",
    "/topics",
  ]);
  if (publicRoutes.has(pathname)) {
    return pathname;
  }
  if (/^\/newsletter\/[a-z0-9-]+$/.test(pathname) || /^\/topics\/[a-z0-9-]+$/.test(pathname)) {
    return pathname;
  }
  return "/";
};

const campaignForPath = (pathname: string) => {
  const newsletter = pathname.match(/^\/newsletter\/([a-z0-9-]+)$/)?.[1];
  if (newsletter) return newsletter;
  if (pathname === "/") return "homepage";
  return pathname.slice(1).replaceAll("/", "-") || "homepage";
};

export const buildSubscriberReferral = (pathname: string, placement: string) => {
  const destinationPath = publicPath(pathname);
  const campaign = campaignForPath(destinationPath);
  const safePlacement = placement.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 80) || "unknown";
  const base = new URL(destinationPath, SITE_ORIGIN);
  base.searchParams.set("utm_source", "subscriber_referral");
  base.searchParams.set("utm_medium", "share");
  base.searchParams.set("utm_campaign", campaign);

  const withVariant = (variant: string) => {
    const url = new URL(base);
    url.searchParams.set("utm_content", `${safePlacement}_${variant}`);
    return url.toString();
  };

  const privateUrl = withVariant("private");
  return {
    campaign,
    linkedinUrl: withVariant("linkedin"),
    copyUrl: withVariant("copy"),
    privateUrl,
    privateMessage: `One Customer Success resource worth keeping: Churn Is Dead publishes one evidence-led operating system and practical playbook every Tuesday. ${privateUrl}`,
  };
};
