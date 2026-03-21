
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

interface NewsletterFormProps {
  location?: "hero" | "footer" | "article" | "mid-article";
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
  textColor = "text-gray-700",
  buttonText = "Subscribe",
  subscribeText
}: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle input change event
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if email already exists in subscribers
      const { data: existingSubscriber, error: checkError } = await supabase
        .from('subscribers')
        .select('email')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // This is an actual error, not just "no rows returned"
        console.error("Error checking for existing subscriber:", checkError);
        throw checkError;
      }

      if (existingSubscriber) {
        // Handle case where user is already subscribed - show a friendly message
        toast.info("You're already subscribed!", {
          description: "You'll continue to receive our newsletter.",
        });
        setEmail("");
        setIsLoading(false);
        return;
      }

      // Insert new subscriber
      const { error: insertError } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (insertError) {
        // Check if this is a duplicate key violation
        if (insertError.code === '23505') {
          // This is a duplicate email - handle gracefully
          toast.info("You're already subscribed!", {
            description: "You'll continue to receive our newsletter.",
          });
          setEmail("");
          setIsLoading(false);
          return;
        }
        
        throw insertError;
      }

      // Send welcome email with better error handling
      try {
        console.log("Calling welcome email function for:", email);
        const response = await fetch("https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }), // Make sure email is correctly passed in the body
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        console.log("Welcome email function response:", result);
        
        // Check for errors in the response
        if (result.error || !result.success) {
          console.error("Welcome email API error:", result);
          // We still consider the subscription successful, but log the email error
        }
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
        <div className="flex-1 relative">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={handleEmailChange}
            required
            className={`h-12 px-4 py-3 text-base ${isHero ? "text-black" : ""} ${inputClass}`}
          />
          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
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
      {subscribeText !== "" && (
        <p className={`text-xs mt-2.5 text-center ${textColor === "text-gray-700" ? "text-gray-500" : "text-white/70"}`}>
          {subscribeText || "Join 150+ CS leaders getting tactical frameworks every Tuesday."}
        </p>
      )}
    </div>
  );
};

export default NewsletterForm;
