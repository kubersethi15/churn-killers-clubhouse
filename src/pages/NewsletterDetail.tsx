
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useNewsletter } from "@/hooks/useNewsletter";
import { formatDate, formatContent } from "@/utils/formatUtils";
import NewsletterHeader from "@/components/newsletter/NewsletterHeader";
import NewsletterContent from "@/components/newsletter/NewsletterContent";
import NewsletterFooter from "@/components/newsletter/NewsletterFooter";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const NewsletterDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { newsletter, loading, error } = useNewsletter(slug);

  // Check if this newsletter has associated vault resources
  const getVaultResources = (slug: string | undefined) => {
    if (slug === "customer-predictability-revolution") {
      return [
        {
          title: "Customer Predictability Index (CPI) Framework",
          description: "A tiered framework to assess and improve customer predictability across trust, engagement, and outcomes.",
          notionLink: "https://www.notion.so/Customer-Predictability-Index-CPI-Framework-Tiered-Guide-2015d0709c9980b18354e3512b86ebff"
        }
      ];
    }
    return [];
  };

  const vaultResources = getVaultResources(slug);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <NewsletterHeader 
        newsletter={newsletter} 
        loading={loading} 
        error={error}
        formatDate={formatDate}
      />

      {!loading && !error && newsletter && (
        <>
          <NewsletterContent 
            newsletter={newsletter} 
            formatContent={formatContent} 
            vaultResources={vaultResources}
          />
        </>
      )}
      
      <NewsletterFooter />
    </div>
  );
};

export default NewsletterDetail;
