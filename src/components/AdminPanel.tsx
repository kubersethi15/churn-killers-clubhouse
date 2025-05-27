
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      const { data, error } = await supabase.functions.invoke('send-latest-newsletter', {
        body: { testEmail }
      });

      if (error) throw error;

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
      const { data, error } = await supabase.functions.invoke('send-latest-newsletter');

      if (error) throw error;

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

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <h3 className="text-lg font-semibold mb-4 text-navy-dark">Admin Panel</h3>
      
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
              Test
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
      </div>
    </div>
  );
};

export default AdminPanel;
