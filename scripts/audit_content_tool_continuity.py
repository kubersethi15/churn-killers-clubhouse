"""Audit the route between published issues and the tools they promise (CG-10).

Answers three questions, counts only:

1. How many published issues offer the reader a next action at all?
2. How many of the vault's tools can be traced back to the issue that produced
   them?
3. Which issues promise a resource in the body but do not link one? Those are
   repairs. Issues that promise nothing are NOT repairs, and this script does
   not report them as such, because adding a call to action where the author
   offered none is manufacturing demand rather than serving it.

Usage:
  SUPABASE_SERVICE_KEY=... python3 scripts/audit_content_tool_continuity.py
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
MANIFEST = REPO_ROOT / "public" / "pdfs" / "manifest.json"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://xtwxemlxzbnadkkrvozr.supabase.co")
KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

# A real offer of something to take away. Deliberately narrow: bare words like
# "audit" or "playbook" appear constantly in ordinary CS prose ("automated
# playbooks") and matching them produces false positives that lead straight to
# manufactured calls to action.
PROMISE_RE = re.compile(
    r"(?i)\b(download|grab (the|your)|free (tool|template|worksheet)|"
    r"worksheet below|template below|use the attached|get the (framework|template|worksheet))\b"
)
TOOL_LINK_RE = re.compile(r"(?i)(/pdfs/|/playbook)")


def fetch_newsletters() -> list[dict]:
    if not KEY:
        raise SystemExit("Set SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY.")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/newsletters"
        "?select=slug,title,content,published_date&order=published_date.desc",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"Supabase returned HTTP {exc.code}.") from None


def main() -> int:
    rows = fetch_newsletters()
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    live = []
    for r in rows:
        try:
            when = datetime.fromisoformat(str(r.get("published_date", "")).replace("Z", "+00:00"))
        except ValueError:
            continue
        if when.tzinfo is None:
            when = when.replace(tzinfo=timezone.utc)
        if when <= now:
            live.append(r)

    linked, promises_unlinked, silent = [], [], []
    for r in live:
        body = r.get("content") or ""
        has_link = bool(TOOL_LINK_RE.search(body))
        promises = bool(PROMISE_RE.search(body))
        if has_link:
            linked.append(r["slug"])
        elif promises:
            promises_unlinked.append(r["slug"])
        else:
            silent.append(r["slug"])

    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else []
    mapped = [e for e in manifest if e.get("newsletter_slug")]

    print(f"Published issues: {len(live)}")
    print(f"  link a tool:                    {len(linked)}")
    print(f"  promise a tool but link none:   {len(promises_unlinked)}  <- repairs")
    print(f"  offer no next action:           {len(silent)}")
    print()
    print(f"Vault tools in manifest: {len(manifest)}")
    print(f"  traceable to an issue:          {len(mapped)}")
    print(f"  orphaned from their issue:      {len(manifest) - len(mapped)}")

    if promises_unlinked:
        print("\nREPAIRS: promised a resource, linked nothing")
        for s in sorted(promises_unlinked):
            print(f"  {s}")
    else:
        print("\nNo repairs found. Every issue that promises a resource links one.")

    print(
        "\nIssues offering no next action are listed as a count only. They are not\n"
        "repairs. Adding a call to action the author never made is manufacturing\n"
        "demand, and the sprint stop rule forbids it."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
