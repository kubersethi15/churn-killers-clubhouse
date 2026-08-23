#!/usr/bin/env python3
"""Replace development entrypoints in copied newsletter pages after Vite builds.

Newsletter HTML files live under ``public/newsletter`` so crawlers receive
article-specific metadata and JSON-LD. Vite copies those nested HTML files as
static assets; it does not transform their ``/src/main.tsx`` entrypoint. This
post-build step injects the compiled CSS and JavaScript tags from
``dist/index.html`` into every copied newsletter page.
"""

from __future__ import annotations

import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = REPO_ROOT / "dist"
DIST_INDEX = DIST_DIR / "index.html"
NEWSLETTER_DIR = DIST_DIR / "newsletter"

DEV_ENTRY_RE = re.compile(
    r'\s*<script[^>]+src="https://cdn\.gpteng\.co/gptengineer\.js"[^>]*></script>'
    r'|\s*<script[^>]+src="/src/main\.tsx"[^>]*></script>',
    re.IGNORECASE,
)
BUILT_TAG_RE = re.compile(
    r'<script\b[^>]*\bsrc="/assets/[^"]+"[^>]*></script>'
    r'|<link\b[^>]*\bhref="/assets/[^"]+"[^>]*>',
    re.IGNORECASE,
)


def main() -> None:
    if not DIST_INDEX.exists():
        raise SystemExit("dist/index.html does not exist; run Vite before this script")

    built_index = DIST_INDEX.read_text(encoding="utf-8")
    built_tags = "\n    ".join(BUILT_TAG_RE.findall(built_index))
    if "/assets/" not in built_tags or "<script" not in built_tags:
        raise SystemExit("Could not find the compiled Vite entrypoint in dist/index.html")

    pages = sorted(NEWSLETTER_DIR.glob("*/index.html"))
    if not pages:
        raise SystemExit("No pre-rendered newsletter pages found in dist/newsletter")

    updated = 0
    for page in pages:
        source = page.read_text(encoding="utf-8")
        cleaned, removed = DEV_ENTRY_RE.subn("", source)
        if removed == 0 and "/src/main.tsx" in source:
            raise SystemExit(f"Could not remove development entrypoint from {page}")

        # The static page has its own article metadata; only inject the compiled
        # runtime and stylesheet immediately before the closing head tag.
        if built_tags not in cleaned:
            cleaned = cleaned.replace("</head>", f"    {built_tags}\n  </head>", 1)

        if "/src/main.tsx" in cleaned or "cdn.gpteng.co/gptengineer.js" in cleaned:
            raise SystemExit(f"Development entrypoint remains in {page}")

        page.write_text(cleaned, encoding="utf-8")
        updated += 1

    print(f"Fixed production entrypoints in {updated} newsletter pages")


if __name__ == "__main__":
    main()
