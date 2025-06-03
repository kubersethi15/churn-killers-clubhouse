
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cronSetup, setCronSetup] = useState(false);
  const { toast } = useToast();

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
    if (!confirm("Are you sure you want to send the newsletter to ALL subscribers now?")) {
      return;
    }

    setLoading(true);
    try {
      console.log("Sending newsletter to all subscribers");
      
      const { data, error } = await supabase.functions.invoke('send-latest-newsletter', {
        body: {},
      });

      console.log("Response data:", data);
      console.log("Response error:", error);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to invoke function");
      }

      toast({
        title: "Newsletter sent!",
        description: "Newsletter has been sent to all subscribers",
      });
    } catch (error: any) {
      console.error("Error sending newsletter:", error);
      toast({
        title: "Error",
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

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <h3 className="text-lg font-semibold mb-4 text-navy-dark">Admin Panel</h3>
      
      {cronSetup && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">✅ Newsletter Automation Active</p>
          <p className="text-xs text-green-600 mt-1">Sending tonight at 11 PM AEST and every Tuesday thereafter</p>
        </div>
      )}
      
      <div className="space-y-4">
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

        <Button
          onClick={sendToAllSubscribers}
          disabled={loading}
          variant="vibrant-red"
          className="w-full"
        >
          {loading ? "Sending..." : "Send to All Subscribers"}
        </Button>

        <Button
          onClick={setupCronJob}
          disabled={loading}
          variant="outline"
          className={`w-full ${cronSetup ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-gray-300'}`}
        >
          {loading ? "Setting up..." : cronSetup ? "✅ Cron Job Active" : "Setup Cron Job"}
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;
