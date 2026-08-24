export type TopicRead = {
  slug: string;
  title: string;
  description: string;
  availableFrom?: string;
};

export type TopicHub = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  decision: string;
  principles: string[];
  reads: TopicRead[];
  tool: {
    title: string;
    description: string;
    href: string;
    label: string;
  };
};

export const topicHubs: TopicHub[] = [
  {
    slug: "renewal-economics",
    eyebrow: "commercial mechanics",
    title: "Renewal economics",
    description: "Separate the work CS can influence from the commercial mechanics it does not control.",
    decision: "What evidence and cross-functional action would make this renewal more predictable?",
    principles: [
      "Name the customer decision and its date.",
      "Separate product, pricing, contract, adoption, and relationship risk.",
      "Give every intervention an owner outside CS when the cause sits outside CS.",
    ],
    reads: [
      {
        slug: "renewal-not-yours-change-order-is",
        title: "The Renewal Is Not Yours to Own. The Change Order Is.",
        description: "A clearer boundary between relationship work and the commercial decision process.",
      },
      {
        slug: "you-dont-own-nrr-you-rent-it-from-pricing",
        title: "You Don't Own NRR. You Rent It From Pricing.",
        description: "Use an NRR control map before treating one number as a CS performance score.",
      },
      {
        slug: "renewal-clause-lawyers-wrote-cs-forgot",
        title: "The Renewal Clause Your Lawyers Wrote and Your CS Team Forgot",
        description: "Bring contractual timing into the operating rhythm before it becomes an escalation.",
      },
    ],
    tool: {
      title: "Renewal Rescue Kit",
      description: "Use the Vault's renewal and risk tools to map causes, owners, evidence, and the next customer decision.",
      href: "/playbook?kit=renewal",
      label: "Open the renewal kit",
    },
  },
  {
    slug: "measurement-decisions",
    eyebrow: "measurement",
    title: "Measurement that changes a decision",
    description: "Replace decorative dashboards with signals that tell the team when to intervene and what to do next.",
    decision: "Which signal would cause a different action this week?",
    principles: [
      "Define the decision before choosing the metric.",
      "Keep observed evidence separate from inferred risk.",
      "Measure latency and movement, not only static colour states.",
    ],
    reads: [
      {
        slug: "renewal-cliff-data-intelligence-blind-spot",
        title: "The Renewal Cliff Nobody Charted",
        description: "A practical way to separate visible account risk from structural causes outside the CS dashboard.",
      },
      {
        slug: "fire-your-qbr-heres-what-to-do-instead",
        title: "The 30-Minute Monthly Business Review",
        description: "Turn review time into a compact operating decision instead of a reporting ritual.",
      },
      {
        slug: "cs-metrics-performance-theater",
        title: "Your CS Metrics Are Performance Theater",
        description: "A challenge to metrics that look reassuring but do not change an intervention.",
      },
    ],
    tool: {
      title: "QBR Replacement Kit",
      description: "Use a smaller review format that forces decisions, owners, and customer-facing follow-through.",
      href: "/playbook?kit=executive",
      label: "Open the review kit",
    },
  },
  {
    slug: "ai-role-design",
    eyebrow: "AI and team design",
    title: "AI and defensible CS work",
    description: "Redesign the role around judgment, evidence, and decisions instead of protecting every current task.",
    decision: "Which parts of the role should AI support, and which decisions still need accountable human judgment?",
    principles: [
      "Automate preparation before automating judgment.",
      "Keep evidence attached to every generated recommendation.",
      "Redesign decision rights before redesigning job titles.",
    ],
    reads: [
      {
        slug: "csm-title-liability-rebrand-wont-fix-it",
        title: "The CSM Title Is Now a Liability",
        description: "Why role clarity matters more than changing the label on the same work.",
      },
      {
        slug: "ai-customer-success-firing-people",
        title: "Your AI Customer Success Strategy Is Actually Firing People",
        description: "A test for whether an AI programme improves customer decisions or only removes capacity.",
      },
      {
        slug: "ai-wont-save-customer-success",
        title: "AI Won't Save Customer Success. It'll Finish It Off.",
        description: "The case for rebuilding weak operating work before applying automation to it.",
      },
    ],
    tool: {
      title: "AI-ready CS role kit",
      description: "Start with the directional AI Exposure Score, then use the related playbooks to redesign the work.",
      href: "/ai-exposure-score",
      label: "Assess the role",
    },
  },
  {
    slug: "operating-systems",
    eyebrow: "CS operations",
    title: "Customer Success operating systems",
    description: "Turn recurring cross-functional friction into explicit inputs, decisions, owners, and customer communication.",
    decision: "What repeatable operating mechanism would remove ambiguity from this customer problem?",
    principles: [
      "Bring prepared evidence, not unstructured urgency.",
      "Name who owns the decision and who owns the customer consequence.",
      "Record the state, owner, answer date, and next communication.",
    ],
    reads: [
      {
        slug: "stealing-sprint-planning-from-engineering",
        title: "What Sprint Planning Can Teach CS About Product Friction",
        description: "A sourced Product Friction Review for turning customer problems into explicit Product decisions.",
        availableFrom: "2026-08-25T08:00:00+00:00",
      },
      {
        slug: "onboarding-only-renewal-you-control",
        title: "Onboarding Isn't the Start of Retention",
        description: "Treat onboarding as an operating proof point, not a calendar stage.",
      },
      {
        slug: "fire-your-qbr-what-to-do-instead",
        title: "Stop Scheduling Success: The Continuous CS Operating Model",
        description: "Replace calendar-driven activity with a clearer rhythm for customer decisions and evidence.",
      },
      {
        slug: "cs-platform-org-chart-you-cant-edit",
        title: "How CS Platforms Quietly Became Org Charts You Can't Edit",
        description: "Use tooling decisions to expose ownership gaps instead of automating around them.",
      }
    ],
    tool: {
      title: "CS operating review kit",
      description: "Choose the review, audit, or decision tool that matches the cross-functional problem on your desk.",
      href: "/playbook?kit=cadence",
      label: "Open the operating kit",
    },
  },
  {
    slug: "health-score-alternatives",
    eyebrow: "risk signals",
    title: "Customer health score alternatives",
    description: "Replace static account colours with observed movement, outcome evidence, and intervention signals that lead to action.",
    decision: "What observed change would make us intervene differently this week?",
    principles: [
      "Start with observable customer movement, not a composite colour.",
      "Keep usage, outcomes, confidence, and commercial risk separate.",
      "Pair every signal with an owner, a next action, and a review date.",
    ],
    reads: [
      {
        slug: "case-against-customer-health-scores",
        title: "The Case Against Customer Health Scores",
        description: "Diagnose why blended scores create confidence without identifying the intervention the account needs.",
      },
      {
        slug: "usage-is-not-success",
        title: "Usage Is Not Success",
        description: "Separate product activity from the customer outcome and renewal evidence it is supposed to support.",
      },
      {
        slug: "health-scores-are-astrology",
        title: "Health Scores Are Astrology for CS Teams",
        description: "Replace a static status with a broader view of customer predictability and changing behaviour.",
      },
    ],
    tool: {
      title: "Customer Predictability Audit",
      description: "Use the Vault's renewal-risk tools to inspect momentum, evidence, causes, and the next customer decision.",
      href: "/playbook?kit=renewal",
      label: "Open the predictability tools",
    },
  },
];

export const topicHubBySlug = Object.fromEntries(topicHubs.map((topic) => [topic.slug, topic]));
