import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Lock } from "lucide-react";

interface ContentGateProps {
  children: React.ReactNode;
  showTeaser?: boolean;
  teaserContent?: React.ReactNode;
  title?: string;
  description?: string;
}

const ContentGate = ({ 
  children, 
  showTeaser = true, 
  teaserContent,
  title = "Keep reading",
  description = "Create a free account to unlock this article."
}: ContentGateProps) => {
  return (
    <div className="relative">
      {/* Teaser content (visible portion) */}
      {showTeaser && teaserContent && (
        <div className="mb-0">
          {teaserContent}
        </div>
      )}
      
      {/* Blur overlay */}
      <div className="relative">
        {/* Blurred preview of gated content */}
        <div 
          className="blur-sm select-none pointer-events-none max-h-[300px] overflow-hidden"
          aria-hidden="true"
        >
          {children}
        </div>
        
        {/* Gradient fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white" />
        
        {/* CTA overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-md mx-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-serif font-bold text-navy-dark mb-2">
              {title}
            </h3>
            <p className="text-gray-600 mb-6">
              {description}
            </p>
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-medium w-full"
              asChild
            >
              <Link to="/auth">
                <LogIn className="w-5 h-5 mr-2" />
                Join Free
              </Link>
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Already have an account?{" "}
              <Link to="/auth" className="text-red-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGate;
