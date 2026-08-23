import PolicyLayout from "@/components/PolicyLayout";

const Terms = () => (
  <PolicyLayout
    title="Terms of use"
    eyebrow="Using Churn Is Dead"
    updated="24 August 2026"
    path="/terms"
    description="Terms for using the Churn Is Dead website, newsletter, playbooks, diagnostics, and CS Analyzer."
  >
    <div>
      <h2>Educational use</h2>
      <p>Churn Is Dead publishes educational material for Customer Success professionals. Articles, playbooks, diagnostics, and AI-generated reports are not legal, financial, employment, security, or compliance advice. Apply professional judgment and verify important decisions.</p>
    </div>
    <div>
      <h2>Your responsibilities</h2>
      <p>Only submit information you are authorised to use. Do not upload secrets, regulated personal data, payment details, health information, authentication credentials, or confidential customer information that is not necessary for the analysis. Redact names and sensitive details before using the CS Analyzer.</p>
    </div>
    <div>
      <h2>AI output</h2>
      <p>AI systems can be incomplete or wrong. Analyzer results are working material, not a definitive assessment of a person, customer, renewal, or account. You are responsible for reviewing the source transcript and validating the output before relying on it.</p>
    </div>
    <div>
      <h2>Content and availability</h2>
      <p>You may use the public playbooks in your own Customer Success work. Do not resell, republish, or represent Churn Is Dead material as your own. Features may change, be interrupted, or be withdrawn. Access may be limited when misuse threatens users or the service.</p>
    </div>
    <div>
      <h2>Contact</h2>
      <p>Questions, corrections, and rights requests can be sent through the contact form linked in the footer.</p>
    </div>
  </PolicyLayout>
);

export default Terms;
