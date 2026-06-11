// Lightweight per-route SEO helper.
// Sets <title>, meta description, canonical, and og:title/description/url
// so each route has its own unique metadata rather than inheriting from index.html.

export type RouteSeo = {
  title: string;
  description: string;
  /** Path including leading slash, e.g. "/about" */
  path: string;
};

const SITE_ORIGIN = "https://churnisdead.com";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function applyRouteSeo({ title, description, path }: RouteSeo) {
  const url = `${SITE_ORIGIN}${path}`;
  document.title = title;
  setMeta("name", "description", description);
  setCanonical(url);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
}
