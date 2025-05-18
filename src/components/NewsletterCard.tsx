
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Handshake, DollarSign, Target } from "lucide-react";

interface NewsletterCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category?: string;
  id?: string;
  slug?: string;
}

const NewsletterCard = ({ title, excerpt, date, readTime, category, slug }: NewsletterCardProps) => {
  // Define category styles and icons
  const getCategoryBadge = () => {
    if (!category) return null;
    
    let icon = null;
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-700";
    
    switch (category) {
      case "Trust":
        icon = <Handshake className="h-3 w-3 mr-1" />;
        bgColor = "bg-blue-100";
        textColor = "text-blue-700";
        break;
      case "Revenue":
        icon = <DollarSign className="h-3 w-3 mr-1" />;
        bgColor = "bg-green-100";
        textColor = "text-green-700";
        break;
      case "Outcomes":
        icon = <Target className="h-3 w-3 mr-1" />;
        bgColor = "bg-amber-100";
        textColor = "text-amber-700";
        break;
    }
    
    return (
      <Badge variant="outline" className={`flex items-center ${bgColor} ${textColor} border-none py-1 px-2`}>
        {icon}
        {category}
      </Badge>
    );
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2 bg-gray-50 border-b border-gray-100">
        {category && (
          <div className="mb-2">
            {getCategoryBadge()}
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
          <Link to={`/newsletter/${slug || encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`}>
            Read Full Newsletter →
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewsletterCard;
