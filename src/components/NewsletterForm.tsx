
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

interface NewsletterFormProps {
  location?: "hero" | "footer";
  className?: string;
}

const NewsletterForm = ({ location = "hero", className = "" }: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulating API call
    setTimeout(() => {
      toast.success("You're subscribed!", {
        description: "Thanks for joining. The next issue lands in your inbox soon.",
      });
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  const isHero = location === "hero";

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
            isHero ? "bg-white border-gray-200" : "bg-white/90"
          } h-12 px-4 text-base`}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading}
        className={`${
          isHero 
            ? "bg-red-600 hover:bg-red-700 text-white" 
            : "bg-navy-dark hover:bg-navy text-white"
        } h-12 px-6 font-medium min-w-[140px]`}
      >
        {isLoading ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
};

export default NewsletterForm;
