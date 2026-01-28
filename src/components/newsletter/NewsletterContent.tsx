import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";
import { Newsletter } from "@/types/newsletter";
import { useContentAccess } from "@/hooks/useContentAccess";
import ContentGate from "@/components/ContentGate";

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

// Helper to get partial content (first ~30%)
function getPartialContent(content: string, percentage: number = 30): string {
  // Split by paragraph markers
  const paragraphs = content.split(/\n\n+/);
  const totalLength = content.length;
  const targetLength = Math.floor(totalLength * (percentage / 100));
  
  let partialContent = '';
  let currentLength = 0;
  
  for (const paragraph of paragraphs) {
    if (currentLength + paragraph.length > targetLength && currentLength > 0) {
      break;
    }
    partialContent += paragraph + '\n\n';
    currentLength += paragraph.length;
  }
  
  return partialContent.trim();
}

const NewsletterContent = ({ newsletter, formatContent, vaultResources = [] }: NewsletterContentProps) => {
  const { accessLevel, isLoading } = useContentAccess();
  
  // Check if this newsletter has associated vault resources
  const isKickoffNewsletter = newsletter.slug.includes("the-perfect-kickoff-call");
  const isTimelineNewsletter = newsletter.slug.includes("their-timeline-not-yours");
  const isUsageNewsletter = newsletter.slug.includes("usage-is-not-success");
  const isQuestionNewsletter = newsletter.slug.includes("the-question-that-s-breaking-your-cs-team") || 
                               newsletter.slug.includes("the-question-thats-breaking-your-cs-team") ||
                               newsletter.slug.includes("question-breaking-cs-team") ||
                               newsletter.slug.includes("co-op-renewal-framework");
  const isExpansionNewsletter = newsletter.slug.includes("the-expansion-moment-hiding-in-plain-sight");

  // Show loading state while determining access
  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Full content for authenticated users and bots
  const fullContent = (
    <>
      <div 
        className="article-content"
        dangerouslySetInnerHTML={{ 
          __html: formatContent(newsletter.content)
        }} 
      />
      
      {/* Vault Resources Section - Right after content ends */}
      {vaultResources.length > 0 && (
        <div className="my-12 p-8 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-2xl font-serif font-bold text-navy-dark mb-6 text-center">
            📂 Related Vault Resources
          </h3>
          <div className="space-y-4">
            {vaultResources.map((resource, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border">
                <h4 className="text-xl font-semibold text-navy-dark mb-2">
                  {resource.title}
                </h4>
                <p className="text-gray-600 mb-4">
                  {resource.description}
                </p>
                <div className="flex gap-3">
                  <Button variant="vibrant-red" asChild>
                    <a href={resource.notionLink} target="_blank" rel="noopener noreferrer">
                      View in Notion <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/playbook">
                      View All Vault Resources
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CO-OP Framework Playbook Vault Card - Before Reader Spotlight */}
      {isQuestionNewsletter && (
        <div className="my-12 p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100">
          <div className="text-center">
            <h3 className="text-2xl font-serif font-bold text-navy-dark mb-4">
              🚀 Get the Complete CO-OP Framework
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              The exact system that helped save that $2M renewal and is now being used by 10+ enterprise CS teams to increase renewal predictability and expansion velocity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="vibrant-red" asChild>
                <a 
                  href="https://www.notion.so/CO-OP-Framework-2235d0709c998059a8a4dc2c18393b25?source=copy_link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View CO-OP Framework <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/playbook">
                  Browse All Playbook Resources →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Playbook Vault CTA - Only show for specific newsletters */}
      {isKickoffNewsletter && (
        <div className="my-10 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-4">🛠 Want the exact tool I use before every kickoff?</h2>
          <p className="mb-6">
            Grab the <strong>Kickoff Re-Discovery Checklist</strong> — my pre-call system to align internally, validate goals, and earn trust before the first customer call.
          </p>
          <Button variant="vibrant-red" asChild>
            <Link to="/playbook">👉 Access the Playbook Vault</Link>
          </Button>
        </div>
      )}

      {/* Timeline Negotiator CTA */}
      {isTimelineNewsletter && (
        <div className="my-10 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">🗓️ The 3-Part Timeline Negotiator</h2>
          <p className="mb-6">
            Grab the <strong>Timeline Negotiator</strong> — my framework for negotiating realistic timelines that build trust with customers and internal stakeholders.
          </p>
          <Button variant="vibrant-red" asChild>
            <Link to="/playbook">👉 Access the Playbook Vault</Link>
          </Button>
        </div>
      )}

      {/* Value Story Slide CTA */}
      {isUsageNewsletter && (
        <div className="my-10 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">📊 The Value Story Slide</h2>
          <p className="mb-6">
            Grab the <strong>Value Story Slide</strong> — a 1-slide QBR format that ties usage → outcomes → business value, with example metrics by persona and how to quantify impact even without hard ROI numbers.
          </p>
          <Button variant="vibrant-red" asChild>
            <Link to="/playbook">👉 Access the Playbook Vault</Link>
          </Button>
        </div>
      )}

      {/* Question Breaking CS Team CTA */}
      {isQuestionNewsletter && (
        <div className="my-10 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">🚀 The CO-OP Framework</h2>
          <p className="mb-6">
            Grab the <strong>CO-OP Framework</strong> — the exact system that helped save that $2M renewal and is now being used by 10+ enterprise CS teams to increase renewal predictability and expansion velocity.
          </p>
          <Button variant="vibrant-red" asChild>
            <Link to="/playbook">👉 Access the Playbook Vault</Link>
          </Button>
        </div>
      )}

      {/* Expansion Moment CTA */}
      {isExpansionNewsletter && (
        <div className="my-10 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">📈 The Expansion Signal Tracker</h2>
          <p className="mb-6">
            Grab the <strong>Expansion Signal Tracker</strong> — my framework for identifying and capturing expansion moments that are hiding in plain sight within your customer interactions.
          </p>
          <Button variant="vibrant-red" asChild>
            <Link to="/playbook">👉 Access the Playbook Vault</Link>
          </Button>
        </div>
      )}
      
      <div className="my-12 p-6 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="text-xl font-bold mb-4">Want more like this?</h3>
        <p className="mb-6">
          Join the weekly newsletter and get tactical CS insights delivered to your inbox.
        </p>
        <NewsletterForm location="article" />
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-200">
        <Button asChild>
          <Link to="/newsletters">← Browse All Newsletters</Link>
        </Button>
      </div>
    </>
  );

  // Partial content teaser for non-authenticated users
  const partialContent = getPartialContent(newsletter.content, 30);
  const teaserContent = (
    <div 
      className="article-content"
      dangerouslySetInnerHTML={{ 
        __html: formatContent(partialContent)
      }} 
    />
  );

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto prose prose-lg">
          {accessLevel === 'full' ? (
            fullContent
          ) : (
            <ContentGate 
              teaserContent={teaserContent}
              title="Continue reading with a free account"
              description="Sign up to unlock full newsletters, AI-powered CS tools, and tactical playbooks."
            >
              {fullContent}
            </ContentGate>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterContent;
