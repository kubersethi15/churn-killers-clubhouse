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
    setMeta("og:image", `https://churnisdead.com/og/${newsletter.slug}.png`, true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:site_name", "Churn Is Dead", true);
    setMeta("article:author", "Kuber Sethi", true);
    setMeta("article:published_time", newsletter.published_date, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", `https://churnisdead.com/og/${newsletter.slug}.png`);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://churnisdead.com/newsletter/${newsletter.slug}`;

    // JSON-LD Article structured data
    const existingJsonLd = document.querySelector('script[data-seo="newsletter-jsonld"]');
    if (existingJsonLd) existingJsonLd.remove();

    const plainTextContent = newsletter.content.replace(/<[^>]*>/g, '').replace(/[#*_\[\]]/g, '').trim();
    const wordCount = plainTextContent.split(/\s+/).length;

    const jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.setAttribute("data-seo", "newsletter-jsonld");
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": newsletter.title,
      "description": description,
      "image": `https://churnisdead.com/og/${newsletter.slug}.png`,
      "datePublished": newsletter.published_date,
      "dateModified": newsletter.published_date,
      "wordCount": wordCount,
      "url": `https://churnisdead.com/newsletter/${newsletter.slug}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://churnisdead.com/newsletter/${newsletter.slug}`
      },
      "author": {
        "@type": "Person",
        "name": "Kuber Sethi",
        "url": "https://www.linkedin.com/in/kubersethi/",
        "jobTitle": "Customer Success Leader",
        "sameAs": [
          "https://www.linkedin.com/in/kubersethi/",
          "https://churnisdead.com/about"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "name": "Churn Is Dead",
        "url": "https://churnisdead.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://churnisdead.com/favicon.png"
        }
      },
      "isPartOf": {
        "@type": "Blog",
        "name": "Churn Is Dead",
        "url": "https://churnisdead.com/newsletters"
      }
    });
    document.head.appendChild(jsonLd);

    return () => {
      document.title = "Churn Is Dead";
      const cleanup = document.querySelector('script[data-seo="newsletter-jsonld"]');
      if (cleanup) cleanup.remove();
    };
  }, [newsletter]);

  return null;
};

export default NewsletterSEO;
