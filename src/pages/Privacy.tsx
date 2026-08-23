import PolicyLayout from "@/components/PolicyLayout";

const Privacy = () => (
  <PolicyLayout
    title="Privacy"
    eyebrow="Your information"
    updated="24 August 2026"
    path="/privacy"
    description="How Churn Is Dead collects, uses, stores, and shares information across the newsletter and CS Analyzer."
  >
    <div>
      <h2>What we collect</h2>
      <p>When you subscribe, create an account, contact us, or use the CS Analyzer, we collect the information you provide. This can include your name, email address, role, contact message, call transcript, and analysis results. We also record basic product activity such as page visits and resource opens to understand what is useful.</p>
    </div>
    <div>
      <h2>How we use it</h2>
      <p>We use this information to deliver the newsletter, operate accounts and tools, respond to messages, save analyses you choose to keep, improve the site, protect the service, and meet legal obligations. We do not sell personal information.</p>
    </div>
    <div>
      <h2>Services involved</h2>
      <p>Supabase provides authentication and database storage. Resend supports transactional and newsletter email. The CS Analyzer uses external AI providers to process transcript content; the current provider details are explained on the Analyzer Data Handling page.</p>
    </div>
    <div>
      <h2>Retention and control</h2>
      <p>Subscriber and account records remain while the relationship is active or as needed to operate the service. Saved analyses—including the transcript text and generated result—remain until you delete them or ask us to do so, subject to any limited retention needed for security or legal obligations.</p>
    </div>
    <div>
      <h2>Your choices</h2>
      <p>You can unsubscribe through any newsletter email. You can delete saved analyses in the product. For access, correction, or deletion requests, use the site contact form and identify the email address connected to your account.</p>
    </div>
  </PolicyLayout>
);

export default Privacy;
