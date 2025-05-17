
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  className?: string;
}

const TestimonialCard = ({ quote, author, role, company, className }: TestimonialCardProps) => {
  return (
    <div className={cn(
      "bg-white p-6 rounded-lg shadow-md border border-gray-50", 
      className
    )}>
      <div className="mb-4 text-red-600">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="opacity-80"
        >
          <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.626.41-2.23.31-.606.81-1.17 1.5-1.694l-1.48-.934c-1.702 1.17-2.552 2.33-2.552 3.482 0 .91.4 1.667 1.252 2.27.68.518 1.458.777 2.322.777.966 0 1.768-.27 2.206-.81.596-.69.394-1.77.394-2.346zm8.58 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.695-1.327-.824-.57-.144-1.063-.156-1.48-.028-.19-.972.09-1.638.41-2.217.302-.595.812-1.17 1.51-1.694l-1.48-.86c-1.72 1.14-2.57 2.32-2.57 3.45 0 .91.4 1.667 1.252 2.27.68.518 1.458.777 2.332.777.966 0 1.77-.27 2.215-.81.596-.69.394-1.77.394-2.346z" />
        </svg>
      </div>
      <blockquote className="text-lg font-medium text-gray-700 mb-6">
        {quote}
      </blockquote>
      <div className="border-t border-gray-100 pt-4">
        <p className="font-bold text-navy-dark">{author}</p>
        <p className="text-sm text-gray-600">
          {role}{company ? `, ${company}` : ''}
        </p>
      </div>
    </div>
  );
};

export default TestimonialCard;
