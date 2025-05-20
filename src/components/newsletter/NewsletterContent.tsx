
import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import NewsletterForm from "@/components/NewsletterForm";
import { Newsletter } from "@/types/newsletter";

type NewsletterContentProps = {
  newsletter: Newsletter;
  formatContent: (content: string) => string;
};

const NewsletterContent = ({ newsletter, formatContent }: NewsletterContentProps) => {
  // Check if this is the specific newsletter we want to add the playbook link to
  const isKickoffNewsletter = newsletter.slug.includes("the-perfect-kickoff-call");

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto prose prose-lg">
          {/* Article intro section */}
          <div className="text-xl font-medium text-gray-700 mb-10 leading-relaxed">
            {newsletter.content.split('\n\n')[0]}
          </div>
          
          <Separator className="my-8" />
          
          {/* Article main content with enhanced formatting */}
          <div 
            className="article-content" 
            dangerouslySetInnerHTML={{ 
              __html: formatContent(newsletter.content.split('\n\n').slice(1).join('\n\n')) 
            }} 
          />
          
          {/* Playbook Vault CTA - Only show for the specific newsletter */}
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
        </div>
      </div>
    </section>
  );
};

export default NewsletterContent;
