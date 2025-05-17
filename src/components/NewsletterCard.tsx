
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NewsletterCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category?: string;
  id?: number;
}

const NewsletterCard = ({ title, excerpt, date, readTime, category }: NewsletterCardProps) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2 bg-gray-50 border-b border-gray-100">
        {category && (
          <div className="text-xs font-medium text-red-600 uppercase tracking-wide">
            {category}
          </div>
        )}
        <h3 className="text-xl md:text-2xl font-serif font-bold text-navy-dark leading-tight">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{date}</span>
          <span>•</span>
          <span>{readTime}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow py-4">
        <p className="text-gray-700">{excerpt}</p>
      </CardContent>
      
      <CardFooter className="border-t border-gray-100 bg-gray-50">
        <Button 
          variant="link" 
          className="p-0 text-navy-dark hover:text-red-600 font-medium"
          asChild
        >
          <Link to={`/newsletter/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`}>
            Read Full Newsletter →
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewsletterCard;
