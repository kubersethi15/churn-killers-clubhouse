import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsletterForm from "@/components/NewsletterForm";
import { Newsletter } from "@/types/newsletter";
import { trackGrowthEvent } from "@/utils/growthTracking";

type VaultResource = {
  title: string;
  description: string;
  notionLink: string;
};

type NewsletterContentProps = {
  newsletter: Newsletter;
  formatContent: (content: string) => string;
  vaultResources?: VaultResource[];
};

const NewsletterContent = ({ newsletter, formatContent, vaultResources = [] }: NewsletterContentProps) => {
  const rawFormattedContent = formatContent(newsletter.content);
  const headings: { id: string; label: string }[] = [];
  const formattedContent = rawFormattedContent.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attributes: string, innerHtml: string) => {
    const label = innerHtml.replace(/<[^>]+>/g, "").trim();
    const baseId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "section";
    const id = headings.some(item => item.id === baseId) ? `${baseId}-${headings.length + 1}` : baseId;
    headings.push({ id, label });
    return `<h2${attributes} id="${id}">${innerHtml}</h2>`;
  });
  const newsletterUrl = `https://churnisdead.com/newsletter/${newsletter.slug}`;
  const referralBaseUrl = `${newsletterUrl}?utm_source=reader_referral&utm_medium=share&utm_campaign=${encodeURIComponent(newsletter.slug)}`;
  const referralLinkedInUrl = `${referralBaseUrl}&utm_content=article_linkedin`;
  const referralCopyUrl = `${referralBaseUrl}&utm_content=article_copy`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLinkedInUrl)}`;
  const usesCurrentEditorialStandard = /##\s+Sources and methodology/i.test(newsletter.content);

  const shareBar = (
    <div className="my-8 flex items-center justify-center gap-3">
      <span className="text-xs text-gray-600 mr-1">Share this:</span>
      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => void trackGrowthEvent({ eventName: "content_share", resourceId: "linkedin" })}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] text-white text-xs font-semibold rounded hover:bg-opacity-90 transition-colors"
      >
        LinkedIn
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(referralCopyUrl);
          void trackGrowthEvent({ eventName: "content_share", resourceId: "copy_link" });
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded hover:bg-gray-50 transition-colors"
      >
        Copy Link
      </button>
    </div>
  );

  const fullContent = (
    <>
      {!usesCurrentEditorialStandard && (
        <aside className="mb-10 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          <strong>Archive note:</strong> This issue predates the evidence ledger introduced in August 2026. Treat uncited benchmarks and examples as editorial analysis, not independently verified findings.
        </aside>
      )}
      {headings.length >= 4 && (
        <nav aria-label="In this issue" className="mb-10 rounded-lg border border-gray-200 bg-gray-50 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-red-600">In this issue</p>
          <ol className="space-y-2">
            {headings.map((heading, index) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`} className="text-sm text-gray-700 hover:text-red-600">
                  <span className="mr-2 font-mono text-xs text-gray-500">{String(index + 1).padStart(2, "0")}</span>{heading.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="article-content" dangerouslySetInnerHTML={{ __html: formattedContent }} />

      {/* Share bar */}
      {shareBar}
      
      {/* Vault Resources */}
      {vaultResources.length > 0 && (
        <div className="my-14 p-8 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-xl font-serif font-bold text-navy-dark mb-6">
            Related Resources
          </h3>
          <div className="space-y-4">
            {vaultResources.map((resource, index) => (
              <div key={index} className="bg-white p-5 rounded-lg border border-gray-100">
                <h4 className="font-semibold text-navy-dark mb-1.5">{resource.title}</h4>
                <p className="text-sm text-gray-500 mb-3">{resource.description}</p>
                <a 
                  href={resource.notionLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => void trackGrowthEvent({ eventName: "resource_open", resourceId: resource.title })}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline"
                >
                  Open in Notion <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscribe CTA */}
      <div className="my-14 py-10 px-8 bg-navy-dark rounded-lg text-center">
        <h3 className="text-xl font-serif font-bold text-white mb-2">
          Useful enough to try with your team?
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Get one honest CS take and one practical tool every Tuesday.
        </p>
        <div className="max-w-sm mx-auto">
          <NewsletterForm 
            location="article" 
            buttonVariant="vibrant-red"
            textColor="text-white"
            buttonText="Subscribe"
            subscribeText=""
          />
        </div>
      </div>
      
      {/* Navigation */}
      <div className="mt-14 pt-8 border-t border-gray-200 flex items-center justify-between">
        <Link 
          to="/newsletters" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy-dark hover:text-red-600 transition-colors"
        >
          All Issues
        </Link>
        <Link 
          to="/playbook" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy-dark hover:text-red-600 transition-colors"
        >
          Playbook Vault <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto prose-custom">
          {fullContent}
        </div>
      </div>
    </section>
  );
};

export default NewsletterContent;
