# CLAUDE.md — Working in this repo

This is Kuber Sethi's repo for [churnisdead.com](https://churnisdead.com) — the **Churn Is Dead** newsletter and the **CS Analyzer** product. Read this first before touching anything.

---

## Stack — what's installed, what to reach for

The UI stack is **already comprehensive**. Before installing anything new, check `package.json` — most things you'd want are already here. The default move is to *use* the existing stack, not bolt on alternatives.

### Component foundation
- **shadcn/ui** — the components live in `src/components/ui`. Owned in-repo. Edit them directly when needed; don't wrap them in pointless abstractions. Install new ones via `npx shadcn@latest add <component>`, not by copy-pasting from the docs.
- **Radix UI primitives** — used under shadcn. Reach for these only if you need lower-level accessibility behavior shadcn doesn't expose.

### Motion & micro-interactions
- **framer-motion** — default choice for any animation more complex than a hover. Stagger reveals, layout transitions, AnimatePresence for mount/unmount. Use this *liberally*; it's most of the difference between "shipped" and "polished."
- **@formkit/auto-animate** — drop-in animations for any list that adds/removes/reorders items. Use it any time you map over an array and render `<li>`s or cards. ~3KB, no API to learn.
- **tailwindcss-animate** — for declarative class-based animations when Motion is overkill (e.g., a single `animate-fade-in`).
- **Always respect `prefers-reduced-motion`.** Either via Motion's `useReducedMotion()` hook or by guarding animations behind `motion-safe:` Tailwind variants.

### Polish kit
- **sonner** — toasts. The `Toaster as Sonner` is already mounted in `App.tsx`. Use the `toast` function from `sonner` directly for richer animations and stacking. Don't use the older `@/components/ui/use-toast` for new code unless an existing flow demands consistency.
- **vaul** — bottom sheets and drawers, especially on mobile. Use for any modal-ish flow on small screens where a dialog feels heavy.
- **cmdk** — command palette / ⌘K. Use for power-user shortcuts, search-anywhere, and quick navigation.
- **react-resizable-panels** — split layouts (like the analyzer's sidebar + main panel).
- **embla-carousel-react** — carousels.
- **next-themes** — dark mode without FOUC. Not currently used but installed.

### Charts
- **recharts** — default for any chart. Pairs with shadcn's `<ChartContainer>` wrapper in `src/components/ui/chart.tsx`.
- If you need anything custom or D3-flavored later, install `visx` rather than `Tremor` (Tremor's a heavy dashboard kit; visx is composable primitives).

### Forms & data
- **react-hook-form + zod** — the standard combo. shadcn's `<Form>` components assume this; don't roll custom form state.
- **@tanstack/react-query** — already used. Use it for any async data; don't recreate it with raw `useEffect`.
- **TanStack Table** is *not* installed. If you need a real data table (sortable, filterable, paginated), install `@tanstack/react-table` and style with shadcn primitives. Don't reach for AG Grid or MUI.

### Icons & visuals
- **lucide-react** — the only icon set. Don't dump inline SVGs and don't add a second icon library.

### Style utilities
- **clsx + tailwind-merge** via the `cn()` helper in `src/lib/utils.ts`. Use it for any conditional className. Never use string concatenation with template literals — it leads to merge bugs.
- **class-variance-authority (cva)** — already used in shadcn variants. Use it for any component with multiple visual variants.

---

## Voice & copy — Kuber's editorial voice

This is non-negotiable. Most of what makes Churn Is Dead distinctive is the voice. AI-flavored microcopy ruins it.

**Do:**
- Direct sentences. Short. Periods.
- The reader is a senior CS operator who's seen the bullshit. Talk to them like that.
- Editorial typography: `font-serif` (Playfair Display) for headings, lowercase eyebrow labels in red uppercase tracked-out style, body in sans.
- Cream backgrounds (`bg-cream/30` or `bg-cream/40`) for soft sections; navy-dark for emphasis sections; red as the accent that does ~one job per surface.
- Numbered editorial lists rendered as big serif "01 / 02 / 03" — not bullets.

**Don't:**
- "Get personalized insights" / "Powered by AI" / "Let's dive in" / "In today's landscape"
- "Analysis complete!" exclamations
- Bot icons, sparkle icons used as primary illustrations, chatbot framing for tools
- Dashed-border cards as a layout choice
- Hashtags or emojis in any copy that ships
- Em dashes inside copy (Kuber's house style; use commas/colons/periods)
- Generic encouragement: no "amazing", "great job", etc.

**Mandatory style rules for LinkedIn copy or marketing text:**
- No hashtags, no emojis, no symmetrical structure
- No arrow bullet lists (`→` as a bullet — primary AI tell)
- Posts should feel typed on a phone after a long day
- Preserve intentional small imperfections (lowercase, "tbh", missing apostrophes) — don't "correct" them
- Brand voice: senior operator who's done tolerating it. Precise, not angry.

---

## Design tokens

Defined in `tailwind.config.ts` and `src/index.css`:

| Token | Use |
|---|---|
| `navy-dark` | Body text, primary headings, dark-mode surfaces |
| `navy`, `navy-light` | Secondary text and surfaces |
| `red` (default 358/85/52) | Single accent. Use for: red eyebrow labels, the `underline-red` decoration, accent buttons, the active state in nav, "01/02/03" numerals in reports |
| `red-dark` | Hover states on red buttons |
| `cream` | Soft section backgrounds |
| `report-*` | Tokens used inside the analyzer's report renderer — keep these scoped to that surface |
| `font-serif` | Playfair Display — headings, editorial accents, big numerals |
| `font-sans` | Inter — body, UI, default |

Patterns:
- Editorial eyebrow: `text-[10px] uppercase tracking-[0.22em] text-red font-bold`
- Editorial h1: `font-serif font-black text-navy-dark leading-[1.05] tracking-tight`
- Red underline accent in headings: `<span className="underline-red">...</span>` (the class is defined globally)

---

## Architecture notes

### Repo layout
- `src/pages/` — top-level pages, each maps to a route in `src/App.tsx`
- `src/components/` — reusable components; subdirectories for feature areas
- `src/components/ui/` — shadcn primitives (don't rename or wrap)
- `src/components/cs-analyzer/` — analyzer UI; `report-v2/` holds the report renderer pieces
- `src/hooks/` — custom hooks
- `src/utils/` — pure utilities (file parsing, formatters)
- `src/data/` — static data (e.g., demo report seed)
- `src/integrations/supabase/` — Supabase client + generated types
- `supabase/functions/` — Deno edge functions (analyzer pipeline lives here)
- `scripts/` — Python scripts that generate the weekly newsletter

### Supabase
- Project ID: `xtwxemlxzbnadkkrvozr` (region ap-southeast-2)
- Use the Supabase MCP tools (`apply_migration`, `execute_sql`) for schema changes, not raw SQL strings in chat
- Anon key works for client reads when RLS allows; service-role key required for server-side inserts (e.g., Python scripts)
- Always: write migration → verify with `execute_sql` → only then update `src/integrations/supabase/types.ts`

### Newsletter pipeline
- Generated weekly via GitHub Actions (Sunday)
- 3-stage prompt pipeline in `scripts/generate_newsletter.py` (research → topic selection → writing with quality gate)
- Inserts to Supabase via REST API with service-role key
- Distribution files written to `distribution/<slug>/{linkedin_posts.md,linkedin_newsletter.md,community_posts.md}`

---

## Working defaults

1. **Branch and PR.** Never commit directly to main. Lovable auto-deploys on push to main. Always: branch → commits → PR for Kuber to review → merge → deploy.
2. **Atomic commits.** One concern per commit. Conventional commits (`feat:`, `fix:`, `polish:`, `chore:`). Body explains *why* not just *what*.
3. **Show the plan before writing code** for any task touching more than ~3 files. Kuber explicitly prefers this.
4. **Challenge scope.** If a request looks like it's drifting into infrastructure-over-audience or feature-creep, push back honestly. Kuber wants critique, not validation.
5. **PII safety in shared/public surfaces.** The `analyses` table has `is_public` and `public_share_id` columns. Public read queries must explicitly select only `id, title, results, created_at, public_share_id` — *never* `input_text` (raw transcripts contain customer PII).
6. **Voice over conventions.** If a stack pattern conflicts with Kuber's editorial voice (e.g., shadcn's default `<Toast>` says "Success!"), prefer the voice. Override the pattern.
7. **Reduced motion.** Every animation respects `prefers-reduced-motion`. Use Motion's `useReducedMotion()` or `motion-safe:` Tailwind variants.

---

## What's NOT in this repo

Don't recreate any of these without asking — they may exist as separate projects or deliberately omitted:

- Email infra (uses Resend via Supabase Edge Functions; don't add a second email lib)
- Analytics (none installed; Kuber decided against Plausible for now)
- Cookie consent / GDPR banners (none currently)
- A second CMS (Supabase is the CMS; don't add Sanity/Contentful)
- Auth provider other than Supabase Auth

---

## When in doubt

Read `userMemories` if available, then ask. Kuber prefers a direct question over a guess that wastes a build cycle.
