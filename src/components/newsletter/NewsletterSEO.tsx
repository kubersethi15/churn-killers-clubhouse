import { useEffect } from "react";
import { Newsletter } from "@/types/newsletter";

type NewsletterSEOProps = {
  newsletter: Newsletter | null;
};

const NewsletterSEO = ({ newsletter }: NewsletterSEOProps) => {
  useEffect(() => {
    if (!newsletter) return;

    const setMeta = (property: string, content: string, isOg = false) => {
      const attr = isOg ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const title = `${newsletter.title} | Churn Is Dead`;
    document.title = title;

    // Get excerpt for description - strip any markdown
    const description = (newsletter as any).excerpt || newsletter.content.substring(0, 160).replace(/[#*_\[\]]/g, '');

    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "article", true);
    setMeta("og:url", `https://churnisdead.com/newsletter/${newsletter.slug}`, true);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://churnisdead.com/newsletter/${newsletter.slug}`;

    return () => {
      document.title = "Churn Is Dead";
    };
  }, [newsletter]);

  return null;
};

export default NewsletterSEO;
