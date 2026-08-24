import { useEffect, useState } from "react";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { PlaybookRecord } from "@/utils/playbookManifest";
import { playbookDisplayDescription, playbookDisplayTitle } from "@/utils/playbookDisplay";
import { applyRouteSeo } from "@/utils/seoMeta";

const prompts = [
  ["01", "Current situation", "What is happening now? Keep observations separate from interpretation."],
  ["02", "Evidence and unknowns", "What can you verify? What is missing, stale, or only internally asserted?"],
  ["03", "Decision and owner", "What decision is required next, and who is accountable for making or progressing it?"],
  ["04", "Action and review", "What happens next? Name the action, owner, due date, and evidence that will change the decision."],
];

const PlaybookWorkspace = () => {
  const { playbookId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const fallbackTitle = searchParams.get("title") || "Churn Is Dead working session";
  const [record, setRecord] = useState<PlaybookRecord | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("/pdfs/manifest.json")
      .then(response => response.ok ? response.json() : [])
      .then((rows: PlaybookRecord[]) => setRecord(rows.find(row => row.id === playbookId) ?? null))
      .catch(() => setRecord(null));
  }, [playbookId]);

  const title = record ? playbookDisplayTitle(record) : fallbackTitle;
  const description = record ? playbookDisplayDescription(record) : undefined;
  const intro = description ?? "Work through the questions below and leave with a clear next step.";

  useEffect(() => {
    applyRouteSeo({ title: `${title} | Working View | Churn Is Dead`, description: `Complete ${title} in a private, printable working view. Nothing entered here is transmitted or saved.`, path: `/playbook/${playbookId}` });
  }, [playbookId, title]);

  return (
    <div className="min-h-screen bg-white print:bg-white">
      <div className="print:hidden"><Header /></div>
      <main id="main-content">
        <section className="border-b border-gray-100 bg-cream/40 pb-12 pt-28 print:border-0 print:bg-white print:pt-8 md:pt-36">
          <div className="container mx-auto px-4 md:px-6"><div className="mx-auto max-w-4xl">
            <Link to="/playbook" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 print:hidden"><ArrowLeft className="h-4 w-4" /> Back to playbooks</Link>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-600">Free worksheet</p>
            <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-navy-dark md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-gray-600">{intro}</p>
            <p className="mt-5 text-xs text-gray-500">Nothing entered here is sent or saved.</p>
          </div></div>
        </section>

        <section className="py-12 md:py-16"><div className="container mx-auto px-4 md:px-6"><div className="mx-auto max-w-4xl">
          <div className="grid gap-6">
            {prompts.map(([number, label, guidance], index) => <section key={number} className="break-inside-avoid rounded-2xl border border-gray-200 p-5 md:p-7"><div className="flex gap-4"><span className="font-serif text-2xl font-black text-red-600">{number}</span><div><h2 className="font-sans text-lg font-bold text-navy-dark">{label}</h2><p className="mt-1 text-sm leading-relaxed text-gray-600">{guidance}</p></div></div><label htmlFor={`workspace-${index}`} className="sr-only">{label}</label><textarea id={`workspace-${index}`} value={notes[index] || ""} onChange={event => setNotes(current => ({ ...current, [index]: event.target.value }))} placeholder="Write the decision record here..." className="mt-5 min-h-36 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-navy-dark placeholder:text-gray-400 focus:border-red-400 focus:bg-white print:min-h-44 print:bg-white" /></section>)}
          </div>
          <div className="mt-8 flex flex-wrap gap-3 print:hidden"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-navy-dark px-5 py-3 text-sm font-semibold text-white hover:bg-navy-dark/90"><Printer className="h-4 w-4" /> Print or save as PDF</button>{record?.pdf_path && <a href={record.pdf_path} download className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-navy-dark hover:border-navy-dark"><Download className="h-4 w-4" /> Download original PDF</a>}</div>
        </div></div></section>
      </main>
      <div className="print:hidden"><Footer /></div>
    </div>
  );
};

export default PlaybookWorkspace;
