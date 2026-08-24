import type { PlaybookRecord } from "@/utils/playbookManifest";

const COPY_OVERRIDES: Record<string, { title: string; description: string }> = {
  "pdf-the_silence_ledger_audit_churnisdead": {
    title: "Digital CS Follow-up Check",
    description: "See who received your digital journey, who acted, who went quiet, and what to do next.",
  },
};

export const playbookDisplayTitle = (playbook: PlaybookRecord) =>
  COPY_OVERRIDES[playbook.id]?.title ?? playbook.title;

export const playbookDisplayDescription = (playbook: PlaybookRecord) => {
  const override = COPY_OVERRIDES[playbook.id]?.description;
  if (override) return override;

  if (/^Download .+ worksheet from the Churn Is Dead archive\.?$/i.test(playbook.description.trim())) {
    return "A practical worksheet you can use with a real account or team.";
  }

  return playbook.description;
};
