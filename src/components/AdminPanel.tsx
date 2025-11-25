
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isPreviewMode, enablePreviewMode, disablePreviewMode } from "@/utils/preview";

const AdminPanel = () => {
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cronSetup, setCronSetup] = useState(false);
const { toast } = useToast();
  const [preview, setPreview] = useState(false);

  // Automatically set up the cron job when component loads
  useEffect(() => {
    const setupAutomaticCron = async () => {
      try {
        console.log("Auto-setting up cron job for weekly newsletter delivery");
        
        const { data, error } = await supabase.functions.invoke('setup-cron-job', {
          body: {},
        });

        if (error) {
          console.error("Auto cron setup error:", error);
          return;
        }

        console.log("Auto cron setup successful:", data);
        setCronSetup(true);
        
        toast({
          title: "Newsletter Automation Active!",
          description: "Newsletter will be sent tonight at 11 PM AEST and every Tuesday thereafter",
        });
      } catch (error: any) {
        console.error("Error in auto cron setup:", error);
      }
    };

    setupAutomaticCron();
  }, [toast]);

  useEffect(() => {
    setPreview(isPreviewMode());
  }, []);

  const sendTestNewsletter = async () => {
    if (!testEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address for the test",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Sending test newsletter to:", testEmail);
      
      const { data, error } = await supabase.functions.invoke('send-latest-newsletter', {
        body: { testEmail },
      });

      console.log("Response data:", data);
      console.log("Response error:", error);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to invoke function");
      }

      toast({
        title: "Test email sent!",
        description: `Newsletter test sent to ${testEmail}`,
      });
      setTestEmail("");
    } catch (error: any) {
      console.error("Error sending test newsletter:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test newsletter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendToAllSubscribers = async () => {
    if (!confirm("🚨 FINAL CONFIRMATION: This will send the latest newsletter to ALL subscribers RIGHT NOW. Are you absolutely sure?")) {
      return;
    }

    setLoading(true);
    try {
      console.log("🚀 SENDING NEWSLETTER TO ALL SUBSCRIBERS NOW!");
      
      const { data, error } = await supabase.functions.invoke('send-latest-newsletter', {
        body: {},
      });

      console.log("Newsletter send response data:", data);
      console.log("Newsletter send response error:", error);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to invoke function");
      }

      toast({
        title: "🎉 Newsletter Sent Successfully!",
        description: data?.message || "Newsletter has been sent to all subscribers",
      });
    } catch (error: any) {
      console.error("Error sending newsletter:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to send newsletter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupCronJob = async () => {
    if (!confirm("This will setup the weekly newsletter cron job. Continue?")) {
      return;
    }

    setLoading(true);
    try {
      console.log("Setting up cron job");
      
      const { data, error } = await supabase.functions.invoke('setup-cron-job', {
        body: {},
      });

      console.log("Cron setup response data:", data);
      console.log("Cron setup response error:", error);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to setup cron job");
      }

      setCronSetup(true);
      toast({
        title: "Cron job setup complete!",
        description: "Weekly newsletter scheduling has been configured",
      });
    } catch (error: any) {
      console.error("Error setting up cron job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to setup cron job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelCronJob = async () => {
    if (!confirm("Cancel the weekly newsletter cron job? No more newsletters will be sent automatically.")) {
      return;
    }

    setLoading(true);
    try {
      console.log("Cancelling cron job");
      
      const { data, error } = await supabase.functions.invoke('setup-cron-job', {
        body: { action: 'unschedule' },
      });

      console.log("Cron cancel response data:", data);
      console.log("Cron cancel response error:", error);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to cancel cron job");
      }

      setCronSetup(false);
      toast({
        title: "Cron job cancelled",
        description: "Weekly newsletter scheduling has been stopped",
      });
    } catch (error: any) {
      console.error("Error cancelling cron job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel cron job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePreview = () => {
    enablePreviewMode(6);
    setPreview(true);
    toast({
      title: "Preview mode enabled",
      description: "Future-dated posts are visible only to you for 6 hours.",
    });
    setTimeout(() => window.location.reload(), 300);
  };

  const handleDisablePreview = () => {
    disablePreviewMode();
    setPreview(false);
    toast({ title: "Preview mode disabled" });
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <h3 className="text-lg font-semibold mb-4 text-navy-dark">Admin Panel</h3>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">Preview Mode {preview ? 'On' : 'Off'}</p>
            <p className="text-xs text-blue-700">When enabled, future-dated posts are visible only in this browser.</p>
          </div>
          {preview ? (
            <Button size="sm" variant="outline" onClick={handleDisablePreview}>Disable</Button>
          ) : (
            <Button size="sm" onClick={handleEnablePreview}>Enable</Button>
          )}
        </div>
      </div>
      
      {cronSetup && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">✅ Newsletter Automation Active</p>
          <p className="text-xs text-green-600 mt-1">Sending tonight at 11 PM AEST and every Tuesday thereafter</p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* PROMINENT SEND NOW BUTTON */}
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <h4 className="font-bold text-red-800 mb-2">🚀 Send Latest Newsletter</h4>
          <p className="text-sm text-red-700 mb-3">Send the latest newsletter to ALL subscribers immediately</p>
          <Button
            onClick={sendToAllSubscribers}
            disabled={loading}
            variant="vibrant-red"
            className="w-full font-bold text-lg py-3"
          >
            {loading ? "🔄 Sending..." : "📧 SEND TO ALL SUBSCRIBERS NOW"}
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Test Email</label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your-email@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={sendTestNewsletter}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? "..." : "Test"}
            </Button>
          </div>
        </div>

        {cronSetup ? (
          <Button
            onClick={cancelCronJob}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            {loading ? "Cancelling..." : "❌ Cancel Weekly Newsletter"}
          </Button>
        ) : (
          <Button
            onClick={setupCronJob}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? "Setting up..." : "Setup Cron Job"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
