# Churn Is Dead

Churn Is Dead is Kuber Sethi's evidence-led publication for Customer Success operators. The website is the canonical home for each issue. LinkedIn is an optional, manually reviewed distribution channel.

## Editorial system

The production newsletter does not call Anthropic, Gemini, or another model. Research and drafting happen in Codex before publication, with source evidence and human approval stored in a versioned issue package.

The core files are:

- `editorial/editorial-contract.md`: evidence, voice, and approval rules.
- `editorial/author-experience.md`: verified first-person experience ledger.
- `editorial/issues/<slug>/`: article, evidence, playbook, metadata, LinkedIn draft, and approval.
- `scripts/validate_editorial_issue.py`: editorial and safety checks.
- `scripts/publish_editorial_issue.py`: deterministic Supabase and asset publisher.
- `editorial/RUNBOOK.md`: weekly operating procedure and recovery steps.

## Local development

```sh
npm install
npm run dev
```

Validate an issue without publishing:

```sh
python3 scripts/validate_editorial_issue.py editorial/issues/<slug> --require-approved
python3 scripts/publish_editorial_issue.py editorial/issues/<slug> --dry-run
```

## Release model

Approved packages are staged on `main`. The website exposes an issue only when its Tuesday publication timestamp arrives. The Tuesday workflow then refreshes the static article, sitemap, RSS feed, social image, and Playbook Vault manifest. See `editorial/RUNBOOK.md` for the complete process.

## Stack

React, TypeScript, Vite, Tailwind CSS, Supabase, and GitHub Actions.
