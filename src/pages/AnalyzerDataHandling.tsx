import PolicyLayout from "@/components/PolicyLayout";

const AnalyzerDataHandling = () => (
  <PolicyLayout
    title="Analyzer data handling"
    eyebrow="Before you paste a transcript"
    updated="24 August 2026"
    path="/analyzer-data-handling"
    description="A plain-language explanation of how CS Analyzer transcripts are processed, stored, and shared with AI providers."
  >
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
      <h2 className="mt-0">Redact before you upload</h2>
      <p>Replace customer and participant names, email addresses, contract identifiers, and sensitive commercial or security details. Only upload a transcript when you are authorised to do so.</p>
    </div>
    <div>
      <h2>What leaves your browser</h2>
      <p>The transcript content is sent to the Churn Is Dead backend and processed through a multi-step analysis pipeline. Depending on the pipeline step and availability, content may be sent to OpenAI, Google Gemini through the Lovable AI Gateway, and Anthropic Claude.</p>
    </div>
    <div>
      <h2>What is stored</h2>
      <p>If you save an analysis, Supabase stores the raw transcript text, the generated analysis, and account metadata so you can return to it. Saved content remains available until you delete it. Public share pages fetch only public-safe result fields and do not expose the raw transcript.</p>
    </div>
    <div>
      <h2>What not to submit</h2>
      <p>Do not submit passwords, API keys, payment-card data, health records, government identifiers, privileged legal material, or highly sensitive customer information. For enterprise or regulated use, complete your organisation's privacy, security, and vendor review first.</p>
    </div>
    <div>
      <h2>Human review is required</h2>
      <p>The report is an analytical aid. It can miss context, attribute statements incorrectly, or produce weak recommendations. Compare every important conclusion with the transcript and your knowledge of the account.</p>
    </div>
  </PolicyLayout>
);

export default AnalyzerDataHandling;
