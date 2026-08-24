
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Check, Copy, Mail, Send } from "lucide-react";
import { currentContentSlug, getGrowthAttribution, growthSessionId, trackGrowthEvent } from "@/utils/growthTracking";
import { buildSubscriberReferral } from "@/utils/referralLinks";
import { Link } from "react-router-dom";

interface NewsletterFormProps {
  location?: "hero" | "footer" | "article" | "mid-article" | "playbook" | "start" | "subscribe";
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        void trackGrowthEvent({ eventName: "form_view", signupLocation: location });
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [location]);

  // Handle input change event
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    void trackGrowthEvent({ eventName: "form_submit", signupLocation: location });

    try {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const newsletterSlugMatch = currentContentSlug();
      const sourcePage = newsletterSlugMatch
        ? `newsletter:${newsletterSlugMatch}`
        : (currentPath || '/').replace(/^\/$/, 'homepage');
      const attribution = getGrowthAttribution();

      const insertPayload = {
        email: normalizedEmail,
        source_page: sourcePage,
        external_referrer: attribution.referrerHost,
        signup_location: location,
        landing_page: attribution.landingPage,
        utm_source: attribution.source,
        utm_medium: attribution.medium,
        utm_campaign: attribution.campaign,
        utm_content: attribution.content,
        acquisition_session_id: growthSessionId(),
      };
      const result = await supabase.from('subscribers').insert([insertPayload]);
      const insertError = result.error;

      if (insertError) {
        if (insertError.code === '23505') {
          void trackGrowthEvent({ eventName: "signup_duplicate", signupLocation: location });
          try {
            await fetch("https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/request-newsletter-reactivation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: normalizedEmail,
                source: attribution.source,
                medium: attribution.medium,
                campaign: attribution.campaign,
                content: attribution.content,
                sourcePage,
              }),
            });
          } catch (reactivationError) {
            console.error("Reactivation request failed", reactivationError);
          }
          toast.info("Check your inbox", {
            description: "If you previously unsubscribed, we sent a secure rejoin link. Otherwise, you're already on the list.",
          });
          setEmail("");
          return;
        }
        throw insertError;
      }

      void trackGrowthEvent({ eventName: "signup_success", signupLocation: location });

      // Send welcome email with better error handling
      try {
        const response = await fetch("https://xtwxemlxzbnadkkrvozr.supabase.co/functions/v1/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: normalizedEmail }),
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        
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
        description: "You are on the list. New frameworks publish every Tuesday.",
      });
      setEmail("");
      setIsSubscribed(true);
    } catch (error) {
      console.error("Error subscribing:", error);
      void trackGrowthEvent({ eventName: "signup_error", signupLocation: location });
      toast.error("Subscription failed", {
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFooter = location === "footer";
  const isHero = location === "hero";
  const referral = buildSubscriberReferral(
    typeof window === "undefined" ? "/" : window.location.pathname,
    `post_signup_${location}`,
  );
  const referralShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referral.linkedinUrl)}`;

  const sharePrivately = async () => {
    const event = { eventName: "content_share" as const, resourceId: `subscriber_referral:private:${referral.campaign}` };
    if (navigator.share) {
      try {
        await navigator.share({ title: "Churn Is Dead", text: "One evidence-led Customer Success operating system and practical playbook every Tuesday.", url: referral.privateUrl });
        void trackGrowthEvent(event);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(referral.privateMessage);
    void trackGrowthEvent(event);
    toast.success("Ready-to-send note copied");
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referral.copyUrl);
      void trackGrowthEvent({ eventName: "content_share", resourceId: `subscriber_referral:copy:${referral.campaign}` });
      toast.success("Referral link copied");
    } catch {
      toast.error("Could not copy the link", { description: "Use Send privately instead." });
    }
  };
  
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
      
      {isSubscribed ? (
        <div className={`rounded-lg border p-4 text-left ${textColor === "text-gray-700" ? "border-gray-200 bg-gray-50" : "border-white/20 bg-white/5"}`} aria-live="polite">
          <p className={`flex items-center gap-2 text-sm font-semibold ${textColor}`}><Check className="h-4 w-4 text-emerald-500" /> You’re on the Tuesday list.</p>
          <p className={`mt-1 text-xs ${textColor === "text-gray-700" ? "text-gray-600" : "text-white/70"}`}>Know one CS operator facing the same problem? Send them the page that convinced you.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => void sharePrivately()} className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold ${textColor === "text-gray-700" ? "border-gray-300 text-navy-dark" : "border-white/30 text-white"}`}><Send className="h-3.5 w-3.5" /> Send privately</button>
            <a href={referralShareUrl} target="_blank" rel="noopener noreferrer" onClick={() => void trackGrowthEvent({ eventName: "content_share", resourceId: `subscriber_referral:linkedin:${referral.campaign}` })} className="rounded-md bg-[#0A66C2] px-3 py-2 text-xs font-semibold text-white">Share on LinkedIn</a>
            <button type="button" onClick={() => void copyReferralLink()} className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold ${textColor === "text-gray-700" ? "border-gray-300 text-navy-dark" : "border-white/30 text-white"}`}><Copy className="h-3.5 w-3.5" /> Copy link</button>
          </div>
        </div>
      ) : (
      <form
        ref={formRef}
        onSubmit={handleSubmit} 
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <div className="flex-1 relative">
          <Input
            type="email"
            aria-label="Your email address"
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
      )}
      {subscribeText !== "" && (
        <p className={`text-xs mt-2.5 text-center ${textColor === "text-gray-700" ? "text-gray-500" : "text-white/70"}`}>
          {subscribeText || "Join CS leaders getting tactical frameworks every Tuesday."}
        </p>
      )}
      <p className={`mt-2 text-center text-[11px] ${textColor === "text-gray-700" ? "text-gray-500" : "text-white/70"}`}>
        By subscribing, you agree to receive the weekly email. See our <Link to="/privacy" className="underline underline-offset-2 hover:text-red-500">privacy policy</Link>. Unsubscribe anytime.
      </p>
    </div>
  );
};

export default NewsletterForm;
