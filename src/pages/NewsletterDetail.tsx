
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

type Newsletter = {
  id: string;
  title: string;
  content: string;
  published_date: string;
  read_time: string;
  category: string | null;
};

const NewsletterDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsletter = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("newsletters")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) {
          console.error("Error fetching newsletter:", error);
          setError("Newsletter not found");
          return;
        }

        setNewsletter(data as Newsletter);
        document.title = `${data.title} | Churn Is Dead`;
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNewsletter();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Format the newsletter content to support various styling elements
  const formatContent = (content: string) => {
    if (!content) return "";

    // Step 1: Process headers with markdown-like syntax
    let formattedContent = content
      // Format H2 (##)
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      // Format H3 (###)
      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      // Format H4 (####)
      .replace(/#### (.*?)(\n|$)/g, '<h4 class="text-lg font-bold mt-5 mb-2">$1</h4>');

    // Step 2: Process block elements
    formattedContent = formattedContent
      // Format blockquotes
      .replace(/> (.*?)(\n|$)/g, '<blockquote class="border-l-4 border-navy pl-4 italic my-6 text-gray-700">$1</blockquote>')
      // Format horizontal rule
      .replace(/---+/g, '<hr class="my-8 border-t border-gray-200" />');

    // Step 3: Process text formatting
    formattedContent = formattedContent
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Step 4: Process lists
    formattedContent = formattedContent
      // Convert unordered lists
      .replace(/^\* (.*?)$/gm, '<li class="ml-6 list-disc mb-2">$1</li>')
      // Convert ordered lists
      .replace(/^\d+\. (.*?)$/gm, '<li class="ml-6 list-decimal mb-2">$1</li>');

    // Cleanup: Wrap lists in appropriate tags
    formattedContent = formattedContent
      .replace(/<li class="ml-6 list-disc mb-2">(.*?)(<\/li>[\s\n]*<li class="ml-6 list-disc mb-2">.*?)*<\/li>/gs, '<ul class="my-4">$&</ul>')
      .replace(/<li class="ml-6 list-decimal mb-2">(.*?)(<\/li>[\s\n]*<li class="ml-6 list-decimal mb-2">.*?)*<\/li>/gs, '<ol class="my-4">$&</ol>');

    // Step 5: Process paragraphs - split by newlines and wrap in paragraph tags if not already processed
    const paragraphs = formattedContent.split('\n\n');
    formattedContent = paragraphs.map(paragraph => {
      // Skip already processed elements (tags)
      if (paragraph.trim().startsWith('<') && paragraph.trim().endsWith('>')) {
        return paragraph;
      }
      
      // Skip empty paragraphs
      if (paragraph.trim() === '') {
        return '';
      }
      
      // Process pull quotes with a special syntax [QUOTE] text [/QUOTE]
      if (paragraph.includes('[QUOTE]') && paragraph.includes('[/QUOTE]')) {
        return paragraph
          .replace(/\[QUOTE\](.*?)\[\/QUOTE\]/g, 
            '<div class="my-8 px-6 py-4 bg-gray-50 border-l-4 border-navy-light italic text-xl text-gray-700 font-serif">$1</div>');
      }
      
      // Wrap normal paragraphs
      return `<p class="mb-6 leading-relaxed">${paragraph}</p>`;
    }).join('');

    return formattedContent;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <Button
            variant="ghost"
            className="text-white mb-8 hover:text-white hover:bg-navy-light"
            asChild
          >
            <Link to="/newsletters">
              <ArrowLeft size={16} className="mr-2" /> Back to Newsletters
            </Link>
          </Button>

          {loading ? (
            <div className="text-center py-8">
              <p>Loading newsletter...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <h1 className="text-3xl md:text-5xl font-serif font-black mb-6">
                {error}
              </h1>
              <Button asChild>
                <Link to="/newsletters">Browse All Newsletters</Link>
              </Button>
            </div>
          ) : newsletter ? (
            <div className="max-w-3xl mx-auto">
              {newsletter.category && (
                <div className="text-sm font-medium text-red-400 uppercase tracking-wide mb-4">
                  {newsletter.category}
                </div>
              )}
              <h1 className="text-3xl md:text-5xl font-serif font-black mb-6">
                {newsletter.title}
              </h1>
              <div className="flex items-center gap-3 text-gray-300 mb-6">
                <span>{formatDate(newsletter.published_date)}</span>
                <span>•</span>
                <span>{newsletter.read_time}</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {!loading && !error && newsletter && (
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
      )}
      
      <footer className="py-12 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-serif font-black mb-2">
                <span className="underline-red">Churn</span> Is Dead
              </h2>
              <p className="text-sm text-gray-300">
                © 2025 Churn Is Dead. All rights reserved.
              </p>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsletterDetail;
