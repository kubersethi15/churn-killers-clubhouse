import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsletterForm from "@/components/NewsletterForm";
import { Newsletter } from "@/types/newsletter";

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
  // Split content to inject mid-article CTA
  const formattedContent = formatContent(newsletter.content);
  const newsletterUrl = `https://churnisdead.com/newsletter/${newsletter.slug}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(newsletterUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(newsletter.title + ' — from the Churn Is Dead newsletter')}&url=${encodeURIComponent(newsletterUrl)}`;

  // Find a good midpoint to inject a CTA (after ~40% of paragraphs)
  const paragraphs = formattedContent.split('</p>');
  const midPoint = Math.floor(paragraphs.length * 0.4);
  let beforeMid = '';
  let afterMid = '';
  if (paragraphs.length > 6) {
    beforeMid = paragraphs.slice(0, midPoint).join('</p>') + '</p>';
    afterMid = paragraphs.slice(midPoint).join('</p>');
  }
  const hasMidSplit = paragraphs.length > 6;

  const midArticleCta = (
    <div className="my-10 py-6 px-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
      <p className="text-sm font-semibold text-navy-dark mb-1">
        Getting value from this? Don't miss the next one.
      </p>
      <p className="text-xs text-gray-400 mb-4">
        Join 2,000+ CS leaders. New framework every Tuesday.
      </p>
      <div className="max-w-xs mx-auto">
        <NewsletterForm
          location="mid-article"
          buttonVariant="vibrant-red"
          buttonText="Subscribe"
          subscribeText=""
        />
      </div>
    </div>
  );

  const shareBar = (
    <div className="my-8 flex items-center justify-center gap-3">
      <span className="text-xs text-gray-400 mr-1">Share this:</span>
      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] text-white text-xs font-semibold rounded hover:bg-opacity-90 transition-colors"
      >
        LinkedIn
      </a>
      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-opacity-90 transition-colors"
      >
        X
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(newsletterUrl);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded hover:bg-gray-50 transition-colors"
      >
        Copy Link
      </button>
    </div>
  );

  const fullContent = (
    <>
      {/* Main article content with mid-article CTA */}
      {hasMidSplit ? (
        <>
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: beforeMid }}
          />
          {midArticleCta}
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: afterMid }}
          />
        </>
      ) : (
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      )}

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
          Enjoyed this? There's more every Tuesday.
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Frameworks, hard truths, and plays you can run this week.
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
