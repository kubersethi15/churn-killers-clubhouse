
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import { useNewsletter } from "@/hooks/useNewsletter";
import { formatDate, formatContent } from "@/utils/formatUtils";
import NewsletterHeader from "@/components/newsletter/NewsletterHeader";
import NewsletterContent from "@/components/newsletter/NewsletterContent";
import NewsletterFooter from "@/components/newsletter/NewsletterFooter";

const NewsletterDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { newsletter, loading, error } = useNewsletter(slug);

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
        <NewsletterContent 
          newsletter={newsletter} 
          formatContent={formatContent} 
        />
      )}
      
      <NewsletterFooter />
    </div>
  );
};

export default NewsletterDetail;
