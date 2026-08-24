import { ArrowRight } from "lucide-react";
import { editorialFormatFor, problemDomainFor } from "@/data/publicationTaxonomy";

const flows: Record<string, string[]> = {
  "Renewal economics": ["Customer evidence", "Decision path", "Commercial owner"],
  "Decision-grade measurement": ["Observed signal", "Decision threshold", "Intervention"],
  "AI and role design": ["Automated work", "Human judgement", "Accountability"],
  "CS operating systems": ["Input", "Operating decision", "Named owner"],
  "Health score alternatives": ["Customer movement", "Trigger", "Response and reset"],
};

const EditorialVisual = ({ title, excerpt, category }: { title: string; excerpt?: string | null; category?: string | null }) => {
  const item = { title, excerpt, category };
  const problem = problemDomainFor(item);
  const format = editorialFormatFor(item);
  return (
    <figure className="my-10 overflow-hidden rounded-2xl border border-navy-dark/10 bg-cream/40 p-5 md:p-7">
      <figcaption className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-600">Issue operating map</p>
          <p className="mt-1 text-sm font-semibold text-navy-dark">{problem}</p>
        </div>
        <span className="rounded-full border border-navy-dark/10 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">{format}</span>
      </figcaption>
      <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
        {flows[problem].map((step, index) => (
          <div key={step} className="contents">
            <div className="rounded-xl border border-navy-dark/10 bg-white p-4">
              <span className="font-serif text-xl font-black text-red-600">0{index + 1}</span>
              <p className="mt-3 text-sm font-bold leading-snug text-navy-dark">{step}</p>
            </div>
            {index < 2 && <ArrowRight aria-hidden="true" className="mx-auto h-4 w-4 rotate-90 self-center text-red-500 md:rotate-0" />}
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-gray-600">Use the article to define each step for your context. The diagram is a decision aid, not a universal maturity model.</p>
    </figure>
  );
};

export default EditorialVisual;
