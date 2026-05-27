# CS Analyzer — Roadmap

This document captures the **vision** for the CS Analyzer and tracks which capabilities are built versus on the horizon. It's the source of truth for "what would put this product in the top 1%" — used by future Claude / Claude Code sessions when picking scope, and by Kuber when prioritizing based on user signal.

Last updated: 2026-05-27 (post launch-polish-motion PR).

---

## North star

A transcript analyzer that **out-Granolas Granola** for CS leaders specifically. The five moves that separate a top-1% AI product from the rest of the pack:

1. **Generative UI streaming** — AI returns React components (RiskCard, QuoteCard, TimelineEvent), not text. Each one streams in via Vercel AI SDK (`streamUI` / `streamObject`) and animates on mount. The processing screen *is* the demo.
2. **Highlight-to-ask in transcript** — Select any text → floating menu (Explain · Find similar · Add to report). Granola/Notion/Arc move.
3. **Block-editor reports with AI diff suggestions** — Tiptap or BlockNote. Slash commands (`/risk`, `/quote`, `/chart`, `/exec-summary`). Inline AI edits with diff-before-accept.
4. **Multi-transcript pattern finding** — Drop 5 transcripts, "find patterns across these calls." The killer feature competitors don't have.
5. **Print-quality PDF export** — `react-pdf` or `pdfme`, not html2pdf hacks. Exec audiences judge on PDF polish.

If forced to ship only one of these per quarter, do them in this order.

---

## Capability inventory

Legend: ✅ shipped · ⚠️ partial · 🛠️ in-flight · ❌ not started

### AI architecture
| Item | Status | Notes |
|---|---|---|
| Generative UI streaming via Vercel AI SDK | ❌ | The single biggest gap from "top 1%." Frontend currently waits for a complete JSON pipeline result. Should stream `RiskCard`/`QuoteCard`/`TimelineEvent` React components from the model as it works. |
| Streaming reasoning panel (collapsible "thinking") | ❌ | Cursor/Perplexity pattern. Free trust win. Currently we have a static `DebugSection`. |
| Chat over the document (`useChat` w/ transcript context) | ❌ | Sidebar where users ask follow-ups about *this* transcript. |
| Multi-document mode — pattern finding across N transcripts | ❌ | Killer feature. Drop 5 transcripts, find patterns. |
| Per-customer memory (preferred report style, tone, structure) | ❌ | Subtle but huge for retention. |

### File ingest
| Item | Status | Notes |
|---|---|---|
| `react-dropzone` full-viewport drop target | ❌ | Current `<input type=file>` is a 40px upload link. Whole page should react on dragenter. |
| `uppy` for resumable / multi-source (Drive, Dropbox) / large files | ❌ | |
| Paste-anywhere (⌘V creates a new analysis) | ❌ | Granola does this for text. We should for transcripts + URLs (Zoom/Fathom share links). |
| Per-file progress (parsing → transcribing → analyzing) | ❌ | One file, one global loader today. |
| `wavesurfer.js` waveform + click-to-seek synced with transcript | ❌ | No audio support at all today. |

### Processing UI
| Item | Status | Notes |
|---|---|---|
| Streaming insight cards as the AI finds them | ❌ | Top 1% pattern: "Found 3 risk signals... Found churn intent..." each one a card animating in. Same energy as Claude's tool-use UI. |
| Live transcript annotation during processing | ❌ | Two-pane view, AI highlights moments as it processes. People will record screen videos of this. |
| Multi-stage named phases | ✅ | 5 agents with explicit names. |
| Specific status copy ("Reading 47 minutes... Cross-referencing last QBR...") | ✅ | Each agent already has a `detail` string. |
| Editorial motion on the wait screen | ✅ | Shipped in polish PR — staggered cards, breathing edges, spring checkmarks. |

### Analysis view (the core product surface)
| Item | Status | Notes |
|---|---|---|
| Two-pane transcript + analysis with linked scrolling | ❌ | Currently tabbed: Analysis / Builder / Transcript. Top 1% has them side-by-side, scroll-linked, click-to-jump. |
| Perplexity-style inline citation chips | ⚠️ | `EvidenceChip` exists but it's click-to-drawer, not hover-preview inline. Each claim should have a tiny `[1]` chip that hovers a quote popover. |
| Highlight-to-ask floating menu | 🛠️ | UI shipped this PR (copy, mark, search). AI explain action is still ❌. |
| Transcript fuzzy search (`fuse.js` / `orama`) | ✅ | Shipped this PR — Cmd+F inside the transcript with keyboard nav. |
| `floating-ui` for popover/menu positioning | ⚠️ | Radix uses it under the hood. Custom positioning for the highlight-menu uses native CSS for now. |

### Report editor (the 10x perceived-value zone)
| Item | Status | Notes |
|---|---|---|
| Tiptap / BlockNote block editor | ❌ | Reports are read-only render today. There's a `ReportBuilder` tab but it's section toggles, not a block editor. |
| Slash commands (`/risk`, `/quote`, `/chart`, `/exec-summary`) | ❌ | |
| AI inline edits with diff-before-accept | ❌ | `react-diff-viewer` or `prosemirror-diff`. |
| Saved templates (Standard QBR / Executive Brief / Renewal Risk Memo) | ❌ | Ship 3 great defaults. |
| Live preview pane while editing | ❌ | |

### Export & sharing
| Item | Status | Notes |
|---|---|---|
| `react-pdf` / `pdfme` true PDF generation | ❌ | Current: HTML → browser print dialog → save as PDF. Functional but not exec-grade. |
| Production print stylesheet | ⚠️ | `cs-report-renderer` has some print CSS. Not battle-tested. |
| One-click destinations (Markdown / Slack / Notion / Email) | ❌ | Only PDF + clipboard copy today. Each should have its own keyboard shortcut. |
| Public share links | ✅ | Shipped PR #1. |
| Password / expiry on shares | ❌ | Public-or-private only today. Vercel/Linear-tier polish. |

### Cross-cutting moves
| Item | Status | Notes |
|---|---|---|
| cmdk command palette | ✅ | Shipped polish PR. |
| Context-aware ⌘K (commands change per route) | ✅ | Shipped this PR — on transcript page: "Jump to objection," "Find pricing discussion." On report: report-specific commands. |
| `tinykeys` for hotkey bindings | ❌ | Current uses raw `keydown` listeners. |
| Report version history / diff / restore | ❌ | Every save = a version. |
| `?` opens a beautiful shortcuts overlay | ❌ | "This team cares" signal. |
| Real-time collab (`yjs` / `tldraw/sync`) | ❌ | Long horizon. |

### Aesthetics
| Item | Status | Notes |
|---|---|---|
| Geist Mono for transcript / quote text | ✅ | Shipped this PR. |
| Color-coded highlight strata (risk=red wash, opportunity=green wash, action=amber underline) | ⚠️ | Risk severity colors exist on risk items. Not yet on transcript itself. |
| Thinking cursor pulse (not three bouncing dots) | ✅ | Red-dot pulse on AnalyzingProgress. Linear-style. |
| Spring physics on pane transitions | ⚠️ | `framer-motion` available; pane physics will apply when we ship the two-pane layout. |
| `prosemirror-highlight` or Tiptap marks for highlight system | ❌ | Depends on shipping the block editor first. |

---

## What this means for prioritization

When picking the next scope, the order I'd argue for:

1. **Validate the current product with real users for 2+ weeks before adding anything from the AI architecture / report editor sections.** Most of this vision is irrelevant if subscribers don't open the analyzer at all.
2. **If users come and stick:** ship the **generative UI streaming** rewrite. This is the architectural unlock for everything else (chat-over-doc, multi-doc, streaming reasoning all build on it).
3. **If users come but don't share reports:** ship **highlight-to-ask AI** + **chat over the document** — both leverage the existing pipeline output rather than rewriting it.
4. **If users come and DO share reports:** ship **print-quality PDF** + **one-click destinations** + **password/expiry on shares** — the distribution polish.
5. **Tiptap report editor is a long bet** — only worth doing once you have evidence users actually want to edit, not just consume.

The vision document this roadmap is based on lives in the `userMemories` of Claude sessions and at the top of CLAUDE.md. Future sessions should refer to it before suggesting net-new analyzer features.
