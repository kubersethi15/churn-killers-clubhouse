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

const QBR_PLAYBOOK: PlaybookRecord = {
  id: "8",
  title: "The 30-Minute QBR: Three Slides",
  description: "The complete template: the customer's goal, what was achieved, and what happens next including where support is needed.",
  pdf_path: "/pdfs/30-Minute-QBR-Framework-ChurnIsDead.pdf",
  notion_link: null,
  newsletter_slug: null,
  newsletter_title: null,
  published_date: "2026-03-13T00:00:00Z",
};

const qbrSlides = [
  {
    number: "01",
    title: "The customer's goal",
    summary: "Start with the outcome the customer cares about and show how the last three months aligned to it.",
    details: ["The customer's stated goal", "How the quarter aligned, drifted, or changed", "The context the room needs"],
  },
  {
    number: "02",
    title: "What was achieved",
    summary: "Show what moved. Keep the evidence close to the outcome instead of presenting an activity report.",
    details: ["The outcome achieved", "The evidence behind it", "What did not move and why"],
  },
  {
    number: "03",
    title: "What happens next",
    summary: "End on the next priority or decision, with a clear owner and the support required.",
    details: ["The next priority or decision", "The owner and date", "Where support is needed"],
  },
];

const PlaybookWorkspace = () => {
  const { playbookId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const fallbackTitle = searchParams.get("title") || "Churn Is Dead working session";
  const [record, setRecord] = useState<PlaybookRecord | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    if (playbookId === "8" || playbookId === "pdf-30-minute-qbr-framework-churnisdead") {
      setRecord(QBR_PLAYBOOK);
      return;
    }
    fetch("/pdfs/manifest.json")
      .then(response => response.ok ? response.json() : [])
      .then((rows: PlaybookRecord[]) => setRecord(rows.find(row => row.id === playbookId) ?? null))
      .catch(() => setRecord(null));
  }, [playbookId]);

  const title = record ? playbookDisplayTitle(record) : fallbackTitle;
  const description = record ? playbookDisplayDescription(record) : undefined;
  const intro = description ?? "Work through the questions below and leave with a clear next step.";
  const isQbr = playbookId === "8" || playbookId === "pdf-30-minute-qbr-framework-churnisdead";

  useEffect(() => {
    if (isQbr) {
      applyRouteSeo({
        title: "The 30-Minute QBR: Three Slides | Churn Is Dead",
        description: "A free two-page QBR template: the customer's goal, what was achieved, and what happens next including where support is needed.",
        path: `/playbook/${playbookId}`,
      });
      return;
    }
    applyRouteSeo({ title: `${title} | Working View | Churn Is Dead`, description: `Complete ${title} in a private, printable working view. Nothing entered here is transmitted or saved.`, path: `/playbook/${playbookId}` });
  }, [isQbr, playbookId, title]);

  if (isQbr) {
    return (
      <div className="min-h-screen bg-[#f3efe7]">
        <Header />
        <main id="main-content">
          <section className="editorial-grid-dark border-b border-white/15 bg-navy-dark pb-14 pt-28 text-white md:pb-20 md:pt-36">
            <div className="container mx-auto px-4 md:px-6">
              <div className="mx-auto max-w-5xl">
                <Link to="/playbook" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition-colors hover:text-white">
                  <ArrowLeft className="h-4 w-4" /> Back to playbooks
                </Link>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-400">Free two-page template</p>
                <h1 className="mt-4 max-w-4xl font-serif text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] md:text-7xl">The 30-minute QBR: three slides</h1>
                <p className="mt-7 max-w-2xl border-l-2 border-red-500 pl-5 text-lg leading-relaxed text-white/70">
                  This is the whole structure. Three slides. Thirty minutes. No diagnostic and no generic questionnaire.
                </p>
                <a href={QBR_PLAYBOOK.pdf_path || undefined} download className="mt-9 inline-flex items-center gap-2 bg-red-600 px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-700">
                  <Download className="h-4 w-4" /> Download the template
                </a>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-20">
            <div className="container mx-auto px-4 md:px-6">
              <div className="mx-auto max-w-5xl">
                <div className="grid gap-5 md:grid-cols-3">
                  {qbrSlides.map(slide => (
                    <article key={slide.number} className="border-2 border-navy-dark bg-white p-6 shadow-[6px_6px_0_0_hsl(var(--red))] md:p-7">
                      <span className="font-serif text-5xl font-black text-red-600">{slide.number}</span>
                      <h2 className="mt-5 font-serif text-2xl font-black leading-tight text-navy-dark">{slide.title}</h2>
                      <p className="mt-4 text-sm leading-relaxed text-gray-700">{slide.summary}</p>
                      <ul className="mt-6 space-y-3 border-t border-navy-dark/15 pt-5 text-sm text-gray-600">
                        {slide.details.map(detail => <li key={detail}>{detail}</li>)}
                      </ul>
                    </article>
                  ))}
                </div>

                <div className="mt-12 grid gap-8 border-t-2 border-navy-dark pt-10 md:grid-cols-[1fr_1.4fr] md:items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-600">How to use it</p>
                    <h2 className="mt-3 font-serif text-4xl font-black leading-tight text-navy-dark">Put these three slides in your deck. Remove the rest.</h2>
                  </div>
                  <div className="space-y-5 text-base leading-relaxed text-gray-700">
                    <p>Move through the slides in order. Keep the conversation tied to the customer's goal, not your internal activity.</p>
                    <p>Do not end until the next priority or decision has an owner, a date, and the support required to move it.</p>
                    <a href={QBR_PLAYBOOK.pdf_path || undefined} download className="inline-flex items-center gap-2 border-b-2 border-navy-dark pb-2 text-sm font-black uppercase tracking-[0.1em] text-navy-dark transition-colors hover:border-red-600 hover:text-red-600">
                      <Download className="h-4 w-4" /> Download the two-page PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

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
