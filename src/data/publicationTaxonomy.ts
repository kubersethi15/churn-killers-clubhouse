export const PROBLEM_DOMAINS = [
  "All",
  "Renewal economics",
  "Decision-grade measurement",
  "AI and role design",
  "CS operating systems",
  "Health score alternatives",
] as const;

export type ProblemDomain = (typeof PROBLEM_DOMAINS)[number];
export type AudiencePath = "All readers" | "Run accounts" | "Lead the function" | "Move into leadership";
export type EditorialFormat = "Decision teardown" | "Operating system" | "Evidence brief";

type PublicationItem = { title: string; excerpt?: string | null; category?: string | null };

const textFor = (item: PublicationItem) => `${item.title} ${item.excerpt ?? ""} ${item.category ?? ""}`.toLowerCase();

export const problemDomainFor = (item: PublicationItem): Exclude<ProblemDomain, "All"> => {
  const text = textFor(item);
  if (/health score|health-score|momentum|intervention trigger/.test(text)) return "Health score alternatives";
  if (/\bai\b|automation|agent|role|title|supervisor|team design/.test(text)) return "AI and role design";
  if (/renew|nrr|pricing|contract|expansion|commercial|revenue/.test(text)) return "Renewal economics";
  if (/metric|measure|data|evidence|forecast|usage|predict|signal|cfo/.test(text)) return "Decision-grade measurement";
  return "CS operating systems";
};

export const editorialFormatFor = (item: PublicationItem): EditorialFormat => {
  const text = textFor(item);
  if (/evidence|data|metric|research|forecast|usage|score|signal/.test(text)) return "Evidence brief";
  if (/framework|playbook|system|model|packet|ledger|map|review|planning|kickoff|onboarding/.test(text)) return "Operating system";
  return "Decision teardown";
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
    "Renewal economics": {
      role: "CSM · CS leader · Renewals",
      time: "15 to 25 min",
      useWhen: "A renewal judgement feels confident but the commercial evidence is scattered.",
      outcome: "A clearer decision record with owners, unknowns, and the next customer action.",
    },
    "Decision-grade measurement": {
      role: "CS leader · CS Ops",
      time: "15 to 20 min",
      useWhen: "The dashboard reports activity but does not tell the team what to do next.",
      outcome: "A smaller set of signals connected to explicit interventions.",
    },
    "AI and role design": {
      role: "CS leader · CSM · CS Ops",
      time: "20 min",
      useWhen: "The team is adopting AI without redesigning judgement, ownership, or role boundaries.",
      outcome: "A bounded view of what to automate, what to retain, and who stays accountable.",
    },
    "CS operating systems": {
      role: "CSM · CS leader",
      time: "15 to 30 min",
      useWhen: "A recurring customer problem depends on memory, meetings, or informal escalation.",
      outcome: "A repeatable operating record with inputs, decisions, owners, and review dates.",
    },
    "Health score alternatives": {
      role: "CSM · CS leader · CS Ops",
      time: "15 to 20 min",
      useWhen: "A red, amber, or green score is visible but the required intervention is not.",
      outcome: "An observable trigger, response owner, and reset condition.",
    },
  } as const;
  return { problem, ...configurations[problem] };
};
