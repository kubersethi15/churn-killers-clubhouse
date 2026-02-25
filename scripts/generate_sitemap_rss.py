#!/usr/bin/env python3
"""
Generate sitemap.xml and rss.xml from newsletter data in migrations.
Run after generate_newsletter.py or standalone.
"""

import re
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
PUBLIC_DIR = REPO_ROOT / "public"

SITE_URL = "https://churnisdead.com"


def extract_newsletters():
    """Extract newsletter metadata from migration files."""
    newsletters = {}

    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        content = f.read_text()

        # Match INSERT with column order: title, slug, content, excerpt, read_time, category, published_date
        # OR: title, slug, excerpt, content, published_date, read_time, category
        # Just extract what we can reliably get
        
        # Look for INSERT INTO newsletters with VALUES
        if 'INSERT INTO public.newsletters' not in content:
            # Check for UPDATE statements only
            for m in re.finditer(
                r"UPDATE public\.newsletters SET published_date = '([^']+)' WHERE slug = '([^']+)'",
                content
            ):
                slug = m.group(2)
                if slug in newsletters:
                    newsletters[slug]['published_date'] = m.group(1)
            continue

        # Extract column order from INSERT statement
        col_match = re.search(r'INSERT INTO public\.newsletters \(([^)]+)\)', content)
        if not col_match:
            continue
        
        columns = [c.strip() for c in col_match.group(1).split(',')]
        
        # Extract VALUES — get title and slug which are always the first two simple strings
        vals_match = re.search(r"VALUES\s*\(\s*(?:E)?'([^']*(?:''[^']*)*)',\s*'([^']+)'", content)
        if not vals_match:
            continue
        
        title = vals_match.group(1).replace("''", "'")
        slug = vals_match.group(2)
        
        # Extract published_date — find the date pattern in the VALUES
        date_match = re.search(r"'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^']*)'", content)
        
        # Extract excerpt — look for the excerpt after the big content blob
        # Try to find a short string that looks like an excerpt (< 300 chars, after content)
        excerpt = title  # fallback
        excerpt_matches = re.findall(r"(?:E)?'([^']{20,250}(?:''[^']{0,100})*)'", content)
        for em in excerpt_matches:
            clean = em.replace("''", "'")
            # Skip if it looks like content (has newlines/markdown)
            if '\\n' not in em and '#' not in em and len(clean) < 250:
                excerpt = clean
                break

        newsletters[slug] = {
            'title': title,
            'slug': slug,
            'excerpt': excerpt,
            'published_date': date_match.group(1) if date_match else '2026-01-01T00:00:00+00:00',
            'read_time': '9 min read',
            'category': 'Strategy',
        }

        # Apply any UPDATE statements in the same file
        for m in re.finditer(
            r"UPDATE public\.newsletters SET published_date = '([^']+)' WHERE slug = '([^']+)'",
            content
        ):
            s = m.group(2)
            if s in newsletters:
                newsletters[s]['published_date'] = m.group(1)

    # Also scan all files for UPDATE statements (dates might be fixed in later migrations)
    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        content = f.read_text()
        for m in re.finditer(
            r"UPDATE public\.newsletters SET published_date = '([^']+)' WHERE slug = '([^']+)'",
            content
        ):
            slug = m.group(2)
            if slug in newsletters:
                newsletters[slug]['published_date'] = m.group(1)

    # Add newsletters that were inserted outside migrations (e.g. via Lovable/Supabase UI)
    if 'ai-didnt-kill-customer-success' not in newsletters:
        newsletters['ai-didnt-kill-customer-success'] = {
            'title': "AI Didn't Kill Customer Success. It Exposed It.",
            'slug': 'ai-didnt-kill-customer-success',
            'excerpt': "Every CS leader is being asked: how much of Customer Success can we automate now? The answer reveals more than you think.",
            'published_date': '2026-01-13T08:00:00+00:00',
            'read_time': '5 minutes',
            'category': 'Trust',
        }

    return newsletters


def generate_sitemap(newsletters):
    """Generate sitemap.xml."""
    today = datetime.utcnow().strftime("%Y-%m-%d")

    urls = [
        (f"{SITE_URL}/", today, "1.0", "weekly"),
        (f"{SITE_URL}/newsletters", today, "0.9", "weekly"),
        (f"{SITE_URL}/playbook", today, "0.8", "weekly"),
        (f"{SITE_URL}/about", "2026-02-24", "0.5", "monthly"),
    ]

    for nl in newsletters.values():
        date = nl['published_date'][:10]
        urls.append((
            f"{SITE_URL}/newsletter/{nl['slug']}",
            date,
            "0.8",
            "monthly"
        ))

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for loc, lastmod, priority, freq in urls:
        xml += f"  <url>\n"
        xml += f"    <loc>{loc}</loc>\n"
        xml += f"    <lastmod>{lastmod}</lastmod>\n"
        xml += f"    <changefreq>{freq}</changefreq>\n"
        xml += f"    <priority>{priority}</priority>\n"
        xml += f"  </url>\n"
    xml += "</urlset>\n"

    path = PUBLIC_DIR / "sitemap.xml"
    path.write_text(xml)
    print(f"   Sitemap: {path} ({len(urls)} URLs)")
    return path


def generate_rss(newsletters):
    """Generate RSS feed."""
    # Sort by date descending
    sorted_nls = sorted(
        newsletters.values(),
        key=lambda x: x['published_date'],
        reverse=True
    )

    # Only include published (past dates)
    now = datetime.utcnow().isoformat()
    sorted_nls = [nl for nl in sorted_nls if nl['published_date'][:19] <= now[:19]]

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    xml += '  <channel>\n'
    xml += '    <title>Churn Is Dead</title>\n'
    xml += f'    <link>{SITE_URL}</link>\n'
    xml += '    <description>Weekly CS frameworks for enterprise Customer Success leaders. Hard truths, tactical plays, and downloadable playbooks.</description>\n'
    xml += '    <language>en</language>\n'
    xml += '    <managingEditor>kuber@churnisdead.com (Kuber Sethi)</managingEditor>\n'
    xml += f'    <lastBuildDate>{datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S +0000")}</lastBuildDate>\n'
    xml += f'    <atom:link href="{SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n'

    for nl in sorted_nls[:20]:  # Last 20 issues
        pub_date = datetime.fromisoformat(nl['published_date'].replace('+00:00', '+00:00').replace('Z', '+00:00'))
        rfc_date = pub_date.strftime("%a, %d %b %Y %H:%M:%S +0000")
        title_escaped = nl['title'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        excerpt_escaped = nl['excerpt'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

        xml += '    <item>\n'
        xml += f'      <title>{title_escaped}</title>\n'
        xml += f'      <link>{SITE_URL}/newsletter/{nl["slug"]}</link>\n'
        xml += f'      <guid isPermaLink="true">{SITE_URL}/newsletter/{nl["slug"]}</guid>\n'
        xml += f'      <pubDate>{rfc_date}</pubDate>\n'
        xml += f'      <description>{excerpt_escaped}</description>\n'
        if nl.get('category'):
            cat = nl['category'].replace('&', '&amp;')
            xml += f'      <category>{cat}</category>\n'
        xml += '    </item>\n'

    xml += '  </channel>\n'
    xml += '</rss>\n'

    path = PUBLIC_DIR / "rss.xml"
    path.write_text(xml)
    print(f"   RSS feed: {path} ({len(sorted_nls)} items)")
    return path


def main():
    print("Generating sitemap + RSS...")
    newsletters = extract_newsletters()
    print(f"   Found {len(newsletters)} newsletters")
    generate_sitemap(newsletters)
    generate_rss(newsletters)
    print("   Done!")


if __name__ == "__main__":
    main()
