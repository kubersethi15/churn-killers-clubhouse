
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category?: string;
}

const ArticleCard = ({ title, excerpt, date, readTime, category }: ArticleCardProps) => {
  return (
    <Card className="h-full flex flex-col border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
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
      
      <CardContent className="flex-grow">
        <p className="text-gray-700">{excerpt}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <Button variant="link" className="p-0 text-navy-dark hover:text-red-600 font-medium">
          Read More →
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <span className="sr-only">Share</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-red-600">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;
