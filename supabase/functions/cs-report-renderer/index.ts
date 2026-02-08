import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildReportHtml } from "./template-html.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------------------------------------------------------------------------
// Deterministic HTML report generator — no AI dependency
// Produces enterprise-grade, print-ready HTML from the frozen report snapshot.
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { report, visibility, title, finalizedAt } = body;

    if (!report)
      return jsonResp({ error: "Missing report payload" }, 400);

    console.log("[cs-report-renderer] Building deterministic HTML report...");

    const html = buildReportHtml({
      report,
      visibility: visibility || {},
      title: title || "Analysis Report",
      finalizedAt: finalizedAt || new Date().toISOString(),
    });

    console.log(`[cs-report-renderer] HTML generated: ${html.length} chars`);

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("cs-report-renderer error:", msg);
    return jsonResp({ error: msg }, 500);
  }
});

function jsonResp(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
