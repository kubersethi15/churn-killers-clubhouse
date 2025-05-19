
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterFormProps {
  location?: "hero" | "footer" | "article";
  className?: string;
  title?: string;
  description?: string;
  buttonVariant?: "cream" | "outline-red" | "soft-red" | "white";
  textColor?: string;
  buttonText?: string;
  subscribeText?: string;
}

const NewsletterForm = ({ 
  location = "hero", 
  className = "",
  title,
  description, 
  buttonVariant = "outline-red",
  textColor = "text-gray-700", // Default text color
  buttonText = "Let's Kill Churn →",  // Changed default to unified CTA
  subscribeText
}: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if email already exists in subscribers
      const { data: existingSubscriber } = await supabase
        .from('subscribers')
        .select('email')
        .eq('email', email)
        .single();

      if (existingSubscriber) {
        toast.info("You're already subscribed!", {
          description: "You'll continue to receive our newsletter.",
        });
        setEmail("");
        setIsLoading(false);
        return;
      }

      // Insert new subscriber
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) throw error;

      toast.success("You're subscribed!", {
        description: "Thanks for joining. The next issue lands in your inbox soon.",
      });
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Subscription failed", {
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFooter = location === "footer";
  
  // Apply special styling for footer to match the reference image
  const inputClass = isFooter 
    ? "bg-transparent border-gray-600 text-white placeholder:text-gray-400" 
    : "bg-white border-gray-200";

  // Define button styling based on location and variant
  const getButtonVariant = () => {
    if (location === "hero") return "navy";
    if (location === "footer") return "outline-red";
    return buttonVariant;
  };

  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className={`text-xl font-medium mb-3 ${textColor}`}>{title}</h3>}
      {description && <p className={`text-sm mb-4 ${textColor === "text-gray-700" ? "opacity-80" : ""} ${textColor}`}>{description}</p>}
      
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`h-12 px-4 py-3 text-base ${inputClass}`}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          variant={getButtonVariant()}
          size="xl-wide"
          className="font-medium min-w-[140px] shadow-sm transition-all text-white"
        >
          {isLoading ? "Subscribing..." : buttonText}
        </Button>
      </form>
      {subscribeText && (
        <p className={`text-xs mt-2 text-center ${textColor === "text-gray-700" ? "text-gray-600" : "text-white/80"}`}>
          {subscribeText}
        </p>
      )}
    </div>
  );
};

export default NewsletterForm;
