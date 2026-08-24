export const PROBLEM_DOMAINS = [
  "All",
  "Renewals",
  "What to measure",
  "AI and the CS role",
  "Working across teams",
  "Health scores",
] as const;

export type ProblemDomain = (typeof PROBLEM_DOMAINS)[number];
export type AudiencePath = "All readers" | "Run accounts" | "Lead the function" | "Move into leadership";
export type EditorialFormat = "Straight opinion" | "Practical guide" | "Evidence review";

type PublicationItem = { title: string; excerpt?: string | null; category?: string | null };

const textFor = (item: PublicationItem) => `${item.title} ${item.excerpt ?? ""} ${item.category ?? ""}`.toLowerCase();

export const problemDomainFor = (item: PublicationItem): Exclude<ProblemDomain, "All"> => {
  const text = textFor(item);
  if (/health score|health-score|momentum|intervention trigger/.test(text)) return "Health scores";
  if (/\bai\b|automation|agent|role|title|supervisor|team design/.test(text)) return "AI and the CS role";
  if (/renew|nrr|pricing|contract|expansion|commercial|revenue/.test(text)) return "Renewals";
  if (/metric|measure|data|evidence|forecast|usage|predict|signal|cfo/.test(text)) return "What to measure";
  return "Working across teams";
};

export const editorialFormatFor = (item: PublicationItem): EditorialFormat => {
  const text = textFor(item);
  if (/evidence|data|metric|research|forecast|usage|score|signal/.test(text)) return "Evidence review";
  if (/framework|playbook|system|model|packet|ledger|map|review|planning|kickoff|onboarding/.test(text)) return "Practical guide";
  return "Straight opinion";
};

export const audiencesFor = (item: PublicationItem): Exclude<AudiencePath, "All readers">[] => {
  const text = textFor(item);
  const roles = new Set<Exclude<AudiencePath, "All readers">>();
  if (/account|customer|kickoff|onboarding|renewal|qbr|timeline|usage|relationship/.test(text)) roles.add("Run accounts");
  if (/team|org|cfo|nrr|revenue|platform|metric|forecast|leadership|operating/.test(text)) roles.add("Lead the function");
  if (/strategic|leader|ceo|title|role|career|ai|supervisor|csm/.test(text)) roles.add("Move into leadership");
  if (roles.size === 0) roles.add("Run accounts");
  return [...roles];
};

export const playbookExperienceFor = (item: PublicationItem) => {
  const problem = problemDomainFor(item);
  const configurations = {
    "Renewals": {
      role: "CSM · CS leader · Renewals",
      time: "15 to 25 min",
      useWhen: "A renewal looks healthy but the facts are scattered across people and systems.",
      outcome: "A clearer renewal view, the missing answers, and the next customer action.",
    },
    "What to measure": {
      role: "CS leader · CS Ops",
      time: "15 to 20 min",
      useWhen: "The dashboard reports activity but nobody knows what to do next.",
      outcome: "Fewer numbers and a clearer response when something important changes.",
    },
    "AI and the CS role": {
      role: "CS leader · CSM · CS Ops",
      time: "20 min",
      useWhen: "The team is adopting AI without agreeing what people should still own.",
      outcome: "A practical view of what AI can help with and what still needs human judgement.",
    },
    "Working across teams": {
      role: "CSM · CS leader",
      time: "15 to 30 min",
      useWhen: "The same customer problem keeps bouncing between teams.",
      outcome: "A named owner, a clear next step, and a date for the customer answer.",
    },
    "Health scores": {
      role: "CSM · CS leader · CS Ops",
      time: "15 to 20 min",
      useWhen: "A health score changed but nobody agrees whether it matters.",
      outcome: "The customer change that matters, who should respond, and when to check again.",
    },
  } as const;
  return { problem, ...configurations[problem] };
};
