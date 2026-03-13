#!/usr/bin/env python3
"""
Churn Is Dead — Cross-Post Generator
Generates Medium and Hashnode versions of each newsletter.
- Slightly rewritten intro (not duplicate content)
- Canonical URL pointing back to churnisdead.com
- CTA driving readers to subscribe on the main site

Output: distribution/{slug}/medium.md and distribution/{slug}/hashnode.md

These are copy-paste ready. You upload manually to Medium/Hashnode with the
canonical URL set to the original newsletter.
"""

import anthropic
import json
import re
import os
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
DISTRIBUTION_DIR = REPO_ROOT / "distribution"
SITE_URL = "https://churnisdead.com"


def extract_newsletters():
    newsletters = {}
    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        content = f.read_text()
        if 'INSERT INTO public.newsletters' not in content:
            continue
        vals = re.search(r"VALUES\s*\(\s*(?:E)?'([^']*(?:''[^']*)*)',\s*'([^']+)'", content)
        if not vals:
            continue
        title = vals.group(1).replace("''", "'")
        slug = vals.group(2)
        
        content_match = re.search(r"E'((?:[^'\\]|\\.|'')*)'", content)
        full_content = ""
        if content_match:
            raw = content_match.group(1)
            full_content = raw.replace("''", "'").replace("\\n", "\n").replace("\\t", "\t").replace("\\'", "'")
        
        if full_content:
            newsletters[slug] = {'title': title, 'slug': slug, 'content': full_content}
    return newsletters


def call_claude(system_prompt, user_prompt, max_tokens=4000):
    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    return message.content[0].text


def generate_crosspost(title, slug, content):
    system = """You are rewriting a newsletter for cross-posting to Medium and Hashnode.

Rules:
- Rewrite the opening 2-3 paragraphs so it's not duplicate content (Google penalizes exact copies)
- Keep the core frameworks, insights, and structure intact
- Add a "This was originally published in my Churn Is Dead newsletter" note at the top
- End with a CTA to subscribe at churnisdead.com/start
- Keep the same voice: direct, contrarian, enterprise-focused
- Do NOT use excessive em dashes
- Return ONLY the markdown. No JSON wrapping."""

    user = f"""Rewrite this newsletter for Medium/Hashnode cross-posting:

Title: {title}
Original URL: {SITE_URL}/newsletter/{slug}

Content:
{content[:6000]}

Return the rewritten markdown with:
1. Attribution note at top
2. Rewritten intro (first 2-3 paragraphs)
3. Rest of content mostly unchanged
4. Subscribe CTA at bottom"""

    return call_claude(system, user)


def main():
    if not os.environ.get('ANTHROPIC_API_KEY'):
        print("ERROR: ANTHROPIC_API_KEY not set.")
        return

    print("Generating cross-posts for Medium/Hashnode...")
    newsletters = extract_newsletters()

    for slug, nl in newsletters.items():
        dist_dir = DISTRIBUTION_DIR / slug
        
        # Skip if cross-posts already exist
        if (dist_dir / "medium.md").exists():
            print(f"  Skip {slug} (cross-posts exist)")
            continue

        print(f"  Generating: {nl['title']}")
        try:
            crosspost = generate_crosspost(nl['title'], slug, nl['content'])
            
            dist_dir.mkdir(parents=True, exist_ok=True)

            # Medium version
            medium_header = f"""---
title: "{nl['title']}"
canonical_url: {SITE_URL}/newsletter/{slug}
tags: customer-success, saas, enterprise, cs-leadership, churn
---

"""
            (dist_dir / "medium.md").write_text(medium_header + crosspost)

            # Hashnode version (same content, different frontmatter)
            hashnode_header = f"""---
title: "{nl['title']}"
canonical: {SITE_URL}/newsletter/{slug}
tags: customer-success, saas, enterprise, leadership
---

"""
            (dist_dir / "hashnode.md").write_text(hashnode_header + crosspost)
            
            # Also copy to public/distribution for the dashboard
            pub_dist = REPO_ROOT / "public" / "distribution" / slug
            pub_dist.mkdir(parents=True, exist_ok=True)
            (pub_dist / "medium.md").write_text(medium_header + crosspost)
            (pub_dist / "hashnode.md").write_text(hashnode_header + crosspost)

            print(f"  ✓ {slug} (Medium + Hashnode)")

        except Exception as e:
            print(f"  ERROR for {slug}: {e}")

    print("Done!")


if __name__ == "__main__":
    main()
