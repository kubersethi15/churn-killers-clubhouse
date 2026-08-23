# Churn Is Dead editorial contract

The website is the canonical publication. LinkedIn is an optional manual adaptation. No other channel publishes automatically.

Every issue must pass these gates before it can be staged:

1. The topic solves a real operating decision for an experienced CS leader.
2. Precise facts, benchmarks, quotations, and external claims are visibly sourced and mapped in `evidence.json`.
3. Kuber's first-person experience is used only when it appears in `author-experience.md`.
4. Illustrative examples are labelled and cannot imply a real customer result.
5. The article is normally 1,300 to 1,800 words and includes one usable operating tool.
6. The playbook implements the article rather than summarising it.
7. A named approval exists in `approval.json`.
8. The deterministic validator passes before Supabase is changed.
9. Metadata names one portfolio format, one reader decision, and one primary CTA.
10. External distribution has its own approval record and never publishes automatically.

## Editorial mix

Across an eight-issue window, balance constructive operating systems, leadership, commercial mechanics, AI implications, measurement, and occasional evidence-led teardown pieces. Avoid repeated title formulas.

## Status model

- `pending`: researched or drafted, but not authorised for publication.
- `approved`: explicitly approved by Kuber and eligible for deterministic staging.
- `staged`: present in Supabase with a future publication date.
- `published`: publication time has passed and the public route is available.

The repository package records approval. Supabase stores the delivery copy. GitHub Actions does not generate prose.
