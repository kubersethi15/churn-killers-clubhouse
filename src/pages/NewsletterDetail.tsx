
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import { useNewsletter } from "@/hooks/useNewsletter";
import { formatDate, formatContent } from "@/utils/formatUtils";
import NewsletterHeader from "@/components/newsletter/NewsletterHeader";
import NewsletterContent from "@/components/newsletter/NewsletterContent";
import NewsletterFooter from "@/components/newsletter/NewsletterFooter";
import NewsletterSEO from "@/components/newsletter/NewsletterSEO";
import ReadingProgressBar from "@/components/newsletter/ReadingProgressBar";
import RelatedNewsletters from "@/components/newsletter/RelatedNewsletters";

const NewsletterDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { newsletter, loading, error } = useNewsletter(slug);

  // Check if this newsletter has associated vault resources
  const getVaultResources = (slug: string | undefined) => {
    if (slug === "customer-predictability-revolution" || slug === "the-customer-predictability-revolution") {
      return [
        {
          title: "Customer Predictability Index (CPI) Framework",
          description: "A tiered framework to assess and improve customer predictability across trust, engagement, and outcomes.",
          notionLink: "https://www.notion.so/Customer-Predictability-Index-CPI-Framework-Tiered-Guide-2015d0709c9980b18354e3512b86ebff"
        }
      ];
    }
    if (slug === "customer-momentum-framework" || slug === "the-customer-momentum-framework" || slug === "customer-momentum-over-health-score") {
      return [
        {
          title: "Customer Momentum Framework",
          description: "A strategic framework to identify, track, and accelerate customer momentum across the entire lifecycle.",
          notionLink: "https://www.notion.so/Customer-Momentum-Framework-20a5d0709c9980259ea4c3fdcc0b38b1"
        },
        {
          title: "CO-OP Framework", 
          description: "A structured collaboration framework for improving renewal predictability and expansion conversations.",
          notionLink: "https://www.notion.so/CO-OP-Framework-2235d0709c998059a8a4dc2c18393b25?source=copy_link"
        }
      ];
    }
    return [];
  };

  const vaultResources = getVaultResources(slug);

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgressBar />
      <NewsletterSEO newsletter={newsletter} />
      <Header />
      <main id="main-content">
        <article>
          <NewsletterHeader
            newsletter={newsletter}
            loading={loading}
            error={error}
            formatDate={formatDate}
          />
          {!loading && !error && newsletter && (
          <NewsletterContent 
            newsletter={newsletter} 
            formatContent={formatContent} 
            vaultResources={vaultResources}
          />
          )}
        </article>
        {!loading && !error && newsletter && slug && (
          <RelatedNewsletters currentSlug={slug} category={newsletter.category || undefined} />
        )}
      </main>
      
      <NewsletterFooter />
    </div>
  );
};

export default NewsletterDetail;
