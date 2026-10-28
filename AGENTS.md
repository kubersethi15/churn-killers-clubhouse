# Project rules

- Read CLAUDE.md before editing this project; it defines existing product and editorial constraints.
- Frontend type definitions include ES2021 while the emitted target remains ES2020, because existing code uses String.replaceAll without requiring a change to output compilation.
- Deno third-party imports use pinned esm.sh URLs rather than npm specifiers, so edge functions resolve dependencies without a local npm install.