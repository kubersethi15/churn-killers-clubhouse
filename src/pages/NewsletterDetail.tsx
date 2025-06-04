
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
          />
          
          {vaultResources.length > 0 && (
            <section className="py-12 bg-gray-50">
              <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
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
              </div>
            </section>
          )}
        </>
      )}
      
      <NewsletterFooter />
    </div>
  );
};

export default NewsletterDetail;
