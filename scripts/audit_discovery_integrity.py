#!/usr/bin/env python3
"""Audit crawlability and metadata for every URL in a sitemap.

The audit is read-only. It prints an aggregate summary and writes URL-level JSON
only when ``--json-output`` is explicitly supplied.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


USER_AGENT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"


def normalise_url(url: str) -> str:
    return url.rstrip("/")


def inspect_html(url: str, status: int, final_url: str, html: str) -> dict[str, object]:
    canonical_match = re.search(
        r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', html, re.IGNORECASE
    )
    robots_match = re.search(
        r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']*)', html, re.IGNORECASE
    )
    description_match = re.search(
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)',
        html,
        re.IGNORECASE,
    )
    title_match = re.search(r"<title>([^<]*)</title>", html, re.IGNORECASE)
    canonical = canonical_match.group(1) if canonical_match else None
    robots = robots_match.group(1) if robots_match else None
    is_issue = bool(re.search(r"/newsletter/[a-z0-9-]+/?$", url))
    semantic_dead = bool(
        status == 200
        and (
            re.search(r"newsletter not found|issue unavailable", html, re.IGNORECASE)
            or (is_issue and 'id="ci-newsletter"' not in html)
        )
    )
    return {
        "url": url,
        "status": status,
        "final": final_url,
        "redirected": normalise_url(final_url) != normalise_url(url),
        "canonical": canonical,
        "canonical_ok": normalise_url(canonical or "") == normalise_url(url),
        "robots": robots,
        "noindex": bool(robots and "noindex" in robots.lower()),
        "jsonld": len(re.findall(r"application/ld\+json", html, re.IGNORECASE)),
        "title": (title_match.group(1) if title_match else "")[:70],
        "desc_len": len(description_match.group(1)) if description_match else 0,
        "semantic_dead": semantic_dead,
    }


def fetch_url(url: str) -> dict[str, object]:
    try:
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(request, timeout=30) as response:
            html = response.read().decode("utf-8", "replace")
            return inspect_html(url, response.status, response.geturl(), html)
    except Exception as exc:  # network failures must remain visible in the audit
        return {"url": url, "status": f"ERR {exc}"}


def urls_from_sitemap(sitemap_url: str) -> list[str]:
    request = urllib.request.Request(sitemap_url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        root = ET.fromstring(response.read())
    return [node.text.strip() for node in root.findall("{*}url/{*}loc") if node.text]


def summarise(results: list[dict[str, object]]) -> tuple[dict[str, list[dict[str, object]]], int]:
    groups = {
        "non-200": [row for row in results if row.get("status") != 200],
        "redirected": [row for row in results if row.get("redirected")],
        "canonical mismatch": [
            row for row in results if row.get("status") == 200 and not row.get("canonical_ok")
        ],
        "noindex": [row for row in results if row.get("noindex")],
        "no JSON-LD": [
            row for row in results if row.get("status") == 200 and row.get("jsonld") == 0
        ],
        "no meta description": [
            row for row in results if row.get("status") == 200 and row.get("desc_len") == 0
        ],
        "semantic dead page": [row for row in results if row.get("semantic_dead")],
    }
    blockers = sum(
        len(groups[name])
        for name in ("non-200", "redirected", "canonical mismatch", "noindex", "no meta description", "semantic dead page")
    )
    return groups, blockers


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group()
    source.add_argument(
        "--sitemap-url",
        default="https://churnisdead.com/sitemap.xml",
        help="Sitemap to audit (default: the live Churn Is Dead sitemap)",
    )
    source.add_argument("--url-file", type=Path, help="Newline-delimited URL file")
    parser.add_argument("--json-output", type=Path, help="Optional path for URL-level evidence")
    parser.add_argument("--workers", type=int, default=6)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    urls = (
        [line.strip() for line in args.url_file.read_text(encoding="utf-8").splitlines() if line.strip()]
        if args.url_file
        else urls_from_sitemap(args.sitemap_url)
    )
    if not urls:
        print("FAIL: no URLs found", file=sys.stderr)
        return 2

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        results = list(executor.map(fetch_url, urls))

    groups, blockers = summarise(results)
    print(f"checked {len(results)} URLs")
    for label, rows in groups.items():
        print(f"  {label + ':':22}{len(rows)}")

    if args.json_output:
        args.json_output.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")

    for label, rows in groups.items():
        if rows:
            print(f"\n{label.upper()}:")
            for row in rows[:12]:
                print(f"  {row['url']}  status={row.get('status')} canonical={row.get('canonical', '')}")
    return 1 if blockers else 0


if __name__ == "__main__":
    raise SystemExit(main())
