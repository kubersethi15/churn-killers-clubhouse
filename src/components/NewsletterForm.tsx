
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterFormProps {
  location?: "hero" | "footer" | "article";
  className?: string;
}

const NewsletterForm = ({ location = "hero", className = "" }: NewsletterFormProps) => {
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

  const isHero = location === "hero";
  const isArticle = location === "article";
  const isFooter = location === "footer";

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${className} flex flex-col sm:flex-row gap-3`}
    >
      <div className="flex-1">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`${
            isHero || isArticle ? "bg-white border-gray-200" : "bg-white/90"
          } h-12 px-4 text-base shadow-sm`}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading}
        className={`${
          isFooter
            ? "bg-white text-red-600 hover:bg-gray-100 hover:text-red-700 border border-white"
            : "bg-cream text-red-600 hover:bg-white hover:text-red-700 border border-white" 
        } h-12 px-6 font-medium min-w-[140px] shadow-md transition-all`}
      >
        {isLoading ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
};

export default NewsletterForm;
