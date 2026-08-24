#!/usr/bin/env python3
"""Fail the build when a public route ships generic or uncrawlable HTML."""

from __future__ import annotations

import re
import json
from pathlib import Path

from prerender_public_routes import ORIGIN, ROUTES


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def main() -> None:
    errors: list[str] = []
    titles: dict[str, str] = {}

    for route in ROUTES:
        path = DIST / route / "index.html"
        if not path.exists():
            errors.append(f"/{route}: missing index.html")
            continue

        source = path.read_text(encoding="utf-8")
        title_match = re.search(r"<title>(.*?)</title>", source, flags=re.DOTALL)
        description_match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', source)
        canonical_match = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', source)
        title = title_match.group(1).strip() if title_match else ""
        description = description_match.group(1).strip() if description_match else ""
        canonical = canonical_match.group(1).strip() if canonical_match else ""
        expected = f"{ORIGIN}/{route}"

        if not title:
            errors.append(f"/{route}: missing title")
        elif title in titles:
            errors.append(f"/{route}: duplicate title also used by /{titles[title]}")
        else:
            titles[title] = route
        if len(description) < 60:
            errors.append(f"/{route}: missing or weak description")
        if canonical != expected:
            errors.append(f"/{route}: canonical is {canonical!r}, expected {expected!r}")
        if "<h1" not in source or "<noscript>" not in source:
            errors.append(f"/{route}: missing semantic no-script fallback")
        if 'data-seo="homepage-jsonld"' in source:
            errors.append(f"/{route}: homepage JSON-LD leaked onto a non-home route")

    homepage = DIST / "index.html"
    if not homepage.exists():
        errors.append("/: missing index.html")
    else:
        homepage_source = homepage.read_text(encoding="utf-8")
        matches = re.findall(
            r'<script type="application/ld\+json" data-seo="homepage-jsonld">(.*?)</script>',
            homepage_source,
        )
        if len(matches) != 1:
            errors.append(f"/: expected one static homepage JSON-LD block, found {len(matches)}")
        else:
            try:
                graph = json.loads(matches[0]).get("@graph", [])
                types = {item.get("@type") for item in graph}
                if types != {"WebSite", "Organization", "Person"}:
                    errors.append(f"/: homepage JSON-LD types are incomplete: {sorted(types)}")
            except (json.JSONDecodeError, AttributeError):
                errors.append("/: homepage JSON-LD is invalid")

    archive_path = DIST / "newsletters" / "index.html"
    if archive_path.exists():
        archive_source = archive_path.read_text(encoding="utf-8")
        archive_slugs = set(re.findall(r'href="/newsletter/([a-z0-9-]+)"', archive_source))
        generated_slugs = {path.parent.name for path in (DIST / "newsletter").glob("*/index.html")}
        missing_links = sorted(generated_slugs - archive_slugs)
        stale_links = sorted(archive_slugs - generated_slugs)
        if missing_links:
            errors.append(f"/newsletters: generated issues missing from crawlable archive: {', '.join(missing_links)}")
        if stale_links:
            errors.append(f"/newsletters: crawlable archive links unavailable issues: {', '.join(stale_links)}")
        if not archive_slugs:
            errors.append("/newsletters: no crawlable issue links")

    for article_path in sorted((DIST / "newsletter").glob("*/index.html")):
        slug = article_path.parent.name
        article_source = article_path.read_text(encoding="utf-8")
        if 'id="ci-newsletter"' not in article_source:
            errors.append(f"/newsletter/{slug}: missing hydratable article payload")
        if re.search(r"newsletter not found|issue unavailable", article_source, re.IGNORECASE):
            errors.append(f"/newsletter/{slug}: semantic not-found copy in successful article page")

    if errors:
        raise SystemExit("Public route checks failed:\n- " + "\n- ".join(errors))
    print(f"Validated {len(ROUTES)} crawlable public routes")


if __name__ == "__main__":
    main()
