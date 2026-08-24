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
    description: "Understand what CS can influence in a renewal and what sits with Product, Sales, Finance, or Legal.",
    decision: "What would make this renewal less surprising, and who else needs to act?",
    principles: [
      "Name the customer decision and its date.",
      "Separate product, pricing, contract, adoption, and relationship risk.",
      "When the cause sits outside CS, give the next action to the team that can actually change it.",
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
      description: "Use the Vault's renewal and risk tools to understand the cause, involve the right people, and agree what happens next.",
      href: "/playbook?kit=renewal",
      label: "Open the renewal kit",
    },
  },
  {
    slug: "measurement-decisions",
    eyebrow: "measurement",
    title: "Numbers that help you act",
    description: "Replace reassuring dashboards with measures that help the team notice a real change and respond usefully.",
    decision: "Which change would make us do something differently this week?",
    principles: [
      "Know what action a number should inform before you track it.",
      "Separate what you observed from what you think it means.",
      "Track what changed and how quickly the team responded, not only a red, amber, or green status.",
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
      description: "Use a smaller review format that gets to the real issue, names who will act, and closes the loop with the customer.",
      href: "/playbook?kit=executive",
      label: "Open the review kit",
    },
  },
  {
    slug: "ai-role-design",
    eyebrow: "AI and team design",
    title: "AI and the work that still needs people",
    description: "Use AI for the repetitive work while protecting the judgment, trust, and difficult conversations customers still need from people.",
    decision: "What should AI help with, and where does a person still need to take responsibility?",
    principles: [
      "Automate preparation before automating judgment.",
      "Keep evidence attached to every generated recommendation.",
      "Be clear about who is responsible before changing job titles.",
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
    title: "Making CS work across teams",
    description: "Practical ways to stop customer problems getting lost between CS, Product, Sales, Support, and leadership.",
    decision: "What simple routine would stop this customer problem falling between teams again?",
    principles: [
      "Bring the facts, not just the urgency.",
      "Be clear about who decides and who speaks to the customer.",
      "Write down the answer, who owns the next step, and when the customer will hear back.",
    ],
    reads: [
      {
        slug: "stealing-sprint-planning-from-engineering",
        title: "What Sprint Planning Can Teach CS About Product Friction",
        description: "A practical review that helps CS bring Product the evidence it needs and gives customers a clear answer.",
        availableFrom: "2026-08-25T08:00:00+00:00",
      },
      {
        slug: "onboarding-only-renewal-you-control",
        title: "Onboarding Isn't the Start of Retention",
        description: "Treat onboarding as proof that the customer can make progress, not just a date on the project plan.",
      },
      {
        slug: "fire-your-qbr-what-to-do-instead",
        title: "Stop Scheduling Success. Start Helping Customers Move.",
        description: "Replace calendar-driven activity with a simpler rhythm built around what the customer needs next.",
      },
      {
        slug: "cs-platform-org-chart-you-cant-edit",
        title: "How CS Platforms Quietly Became Org Charts You Can't Edit",
        description: "Use tooling decisions to expose ownership gaps instead of automating around them.",
      }
    ],
    tool: {
      title: "Cross-team CS kit",
      description: "Choose a review, checklist, or worksheet for the customer problem that keeps bouncing between teams.",
      href: "/playbook?kit=cadence",
      label: "Open the cross-team kit",
    },
  },
  {
    slug: "health-score-alternatives",
    eyebrow: "risk signals",
    title: "Better ways to understand customer health",
    description: "Look beyond a red, amber, or green score and pay attention to what customers are actually doing, achieving, and struggling with.",
    decision: "What real customer change would make us respond differently this week?",
    principles: [
      "Start with observable customer movement, not a composite colour.",
      "Keep usage, outcomes, confidence, and commercial risk separate.",
      "For every meaningful change, agree who will respond, what they will do, and when the team will check again.",
    ],
    reads: [
      {
        slug: "health-score-is-not-an-intervention-trigger",
        title: "A Health Score Is Not an Intervention Trigger",
        description: "Turn one observed customer change into a bounded intervention rule with an owner, response, and reset condition.",
        availableFrom: "2026-09-15T08:00:00+00:00",
      },
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
      description: "Use the Vault's renewal-risk tools to understand what changed, why it matters, and what to do next.",
      href: "/playbook?kit=renewal",
      label: "Open the predictability tools",
    },
  },
];

export const topicHubBySlug = Object.fromEntries(topicHubs.map((topic) => [topic.slug, topic]));
