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
  buttonVariant?: "cream" | "outline-red" | "soft-red" | "white" | "vibrant-red" | "navy";
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

      // Send welcome email with better error handling
      try {
        console.log("Calling welcome email function for:", email);
        const response = await fetch("https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Welcome email API error:", errorData);
          throw new Error(`API returned ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log("Welcome email function response:", result);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Log but don't disrupt user experience if email sending fails
      }

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
  const isHero = location === "hero";
  
  // Apply special styling for footer to match the reference image
  const inputClass = isFooter 
    ? "bg-white border-gray-200 text-navy-dark placeholder:text-gray-500" 
    : "bg-white border-gray-200";

  // Define button styling based on location and variant
  const getButtonVariant = () => {
    if (isHero) return "vibrant-red"; // Hero location uses vibrant-red
    if (isFooter) return "navy"; // Footer uses navy brand color
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
          className={`font-medium min-w-[140px] shadow-sm transition-all ${isHero ? "text-white !bg-red-600 hover:!bg-red-700" : ""}`}
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
