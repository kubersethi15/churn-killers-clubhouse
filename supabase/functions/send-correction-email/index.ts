import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const generateCorrectionEmail = (recipientEmail: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #172554; margin-top: 30px; font-size: 24px;">A Quick Note From Us 🙏</h1>
  
  <div style="font-size: 16px; line-height: 1.6; color: #333;">
    <p>Hey there,</p>
    
    <p>You may have received an email from us earlier today with our newsletter <strong>"Health Scores Are Astrology for CS Teams"</strong>.</p>
    
    <p>That issue was <strong>scheduled for March 25th</strong> and was sent early by mistake. Our apologies for the inbox clutter!</p>
    
    <p>The good news? The content is still 🔥 — so if you read it, consider yourself ahead of the curve. If you didn't, no worries — we'll send it again at the right time with the full rollout.</p>
    
    <p>In the meantime, if you missed our latest published issue <strong>"AI Didn't Kill Customer Success. It Exposed It"</strong> — it's worth your time:</p>
  </div>
  
  <div style="margin: 30px 0;">
    <a href="https://churnisdead.com/newsletter/ai-didnt-kill-customer-success" 
       style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
      Read the Latest Issue →
    </a>
  </div>
  
  <p style="font-size: 16px; line-height: 1.5; color: #333;">
    Thanks for being part of the Churn Is Dead community. We'll try to keep our scheduling gremlins under control from here on out.
  </p>
  
  <p style="font-size: 16px; line-height: 1.5; color: #333;">
    — Kuber<br>
    <em>Churn Is Dead</em>
  </p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
    <p>
      You received this email because you signed up for the Churn Is Dead newsletter.
      If you'd like to unsubscribe, please 
      <a href="mailto:unsubscribe@churnisdead.com?subject=Unsubscribe&body=Email: ${recipientEmail}" style="color: #666;">click here</a>.
    </p>
    <p style="margin-top: 10px; color: #888;">
      Churn Is Dead, Inc.<br>
      1234 Marketing Street, Suite 500<br>
      San Francisco, CA 94107
    </p>
  </div>
</div>
`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testEmail, sendToAll } = await req.json();
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("Missing RESEND_API_KEY");
    const resend = new Resend(resendApiKey);

    const subject = "Oops — That Newsletter Came Early! 🙈";

    // Test mode: send to a single address
    if (testEmail) {
      const html = generateCorrectionEmail(testEmail);
      const { error } = await resend.emails.send({
        from: "Churn Is Dead <newsletter@churnisdead.com>",
        to: [testEmail],
        subject: `[TEST] ${subject}`,
        reply_to: "support@churnisdead.com",
        html,
      });
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: `Test correction email sent to ${testEmail}` }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send to all subscribers
    if (sendToAll) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: subscribers, error: subErr } = await supabase
        .from("subscribers")
        .select("email")
        .eq("subscribed", true);

      if (subErr) throw subErr;
      
      // Filter out invalid emails
      const validSubscribers = (subscribers || []).filter(s => 
        s.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)
      );
      console.log(`${validSubscribers.length} valid subscribers (filtered ${(subscribers?.length || 0) - validSubscribers.length} invalid)`);
      
      if (!validSubscribers.length) {
        return new Response(JSON.stringify({ success: true, message: "No valid subscribers" }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const batchSize = 30;
      let sent = 0;
      for (let i = 0; i < validSubscribers.length; i += batchSize) {
        const batch = validSubscribers.slice(i, i + batchSize);
        const emails = batch.map(s => s.email);
        const html = generateCorrectionEmail(emails[0]);

        const { error } = await resend.emails.send({
          from: "Churn Is Dead <newsletter@churnisdead.com>",
          to: ["newsletter@churnisdead.com"],
          bcc: emails,
          subject,
          reply_to: "support@churnisdead.com",
          headers: {
            "List-Unsubscribe": "<mailto:unsubscribe@churnisdead.com?subject=unsubscribe>",
            "Precedence": "bulk",
            "X-Entity-Ref-ID": `correction-batch-${i}-${Date.now()}`
          },
          html,
        });
        if (error) throw error;
        sent += batch.length;
        if (i + batchSize < subscribers.length) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      return new Response(JSON.stringify({ success: true, message: `Correction email sent to ${sent} subscribers` }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Provide testEmail or sendToAll" }), {
      status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("Correction email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
