#!/usr/bin/env python3
"""
Churn Is Dead — SEO Pre-renderer (Hybrid Approach)

Generates /newsletter/{slug}/index.html files that are the SPA's index.html
but with pre-filled meta tags, JSON-LD, and noscript article content.

Bots see: correct title, OG tags, JSON-LD, full article in noscript
Users see: the SPA loads normally (same scripts)
No redirects, no conflicts.

Run: python scripts/prerender_newsletters.py
Output: public/newsletter/{slug}/index.html
"""

import json
import os
import re
import html as htmlmod
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from editorial_issue import SLUG_RE, approved_newsletters
from newsletter_catalog import load_newsletter_catalog
from related_graph import build_related_graph, hub_for_slug, load_hub_membership

REPO_ROOT = Path(__file__).parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
PUBLIC_DIR = REPO_ROOT / "public"
INDEX_HTML = REPO_ROOT / "index.html"
SITE_URL = "https://churnisdead.com"

# Live DB read so REST-inserted issues (not just migration-seeded ones) get prerendered.
# The anon/publishable key is public (already shipped in the frontend bundle), safe here.
SUPABASE_URL_DEFAULT = "https://xtwxemlxzbnadkkrvozr.supabase.co"
SUPABASE_ANON_DEFAULT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d3hlbWx4emJuYWRra3J2b3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NTUzNDAsImV4cCI6MjA2MzAzMTM0MH0.FX3zb-zai6KIM24eW4pckqWLNIg0HFCPil8cJW7l3t4"


def fetch_live_newsletters():
    """Fetch published newsletters from the live Supabase DB so REST-inserted issues
    (which never get a migration file) are prerendered too. Degrades gracefully:
    on any failure, returns {} and the caller falls back to migration-seeded entries."""
    base = os.environ.get("SUPABASE_URL", SUPABASE_URL_DEFAULT).rstrip("/")
    key = (os.environ.get("SUPABASE_ANON_KEY")
           or os.environ.get("SUPABASE_PUBLISHABLE_KEY")
           or SUPABASE_ANON_DEFAULT)
    url = (f"{base}/rest/v1/newsletters"
           "?select=title,slug,excerpt,content,published_date,read_time,category"
           "&order=published_date.desc&limit=200")
    req = urllib.request.Request(url, headers={"apikey": key, "Authorization": f"Bearer {key}"})
    out = {}
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"  Live DB fetch failed ({e}); falling back to migrations only")
        return out
    for r in rows:
        slug = r.get("slug")
        if not slug or not SLUG_RE.fullmatch(slug):
            if slug:
                print(f"  Skip unsafe live slug: {slug!r}")
            continue
        out[slug] = {
            "title": r.get("title") or "",
            "slug": slug,
            "excerpt": r.get("excerpt") or r.get("title") or "",
            "content": r.get("content") or "",
            "published_date": r.get("published_date") or "2026-01-01T00:00:00+00:00",
            "read_time": r.get("read_time") or "9 min read",
            "category": r.get("category") or "Strategy",
        }
    print(f"  Live DB: {len(out)} newsletters")
    return out


def extract_newsletters():
    newsletters = {}
    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        content = f.read_text()
        if 'INSERT INTO public.newsletters' not in content:
            for m in re.finditer(r"UPDATE public\.newsletters SET published_date = '([^']+)' WHERE slug = '([^']+)'", content):
                if m.group(2) in newsletters:
                    newsletters[m.group(2)]['published_date'] = m.group(1)
            continue

        vals_match = re.search(r"VALUES\s*\(\s*(?:E)?'([^']*(?:''[^']*)*)',\s*'([^']+)'", content)
        if not vals_match:
            continue
        title = vals_match.group(1).replace("''", "'")
        slug = vals_match.group(2)

        content_match = re.search(r"E'((?:[^'\\]|\\.|'')*)'", content)
        full_content = ""
        if content_match:
            raw = content_match.group(1)
            full_content = raw.replace("''", "'").replace("\\n", "\n").replace("\\t", "\t").replace("\\'", "'")

        excerpt = title
        for em in re.findall(r"(?:E)?'([^']{30,300}(?:''[^']{0,100})*)'", content):
            clean = em.replace("''", "'")
            if '\\n' not in em and '##' not in em and len(clean) <= 250 and clean != title and clean != slug and len(clean) > 30:
                excerpt = clean
                break

        date_match = re.search(r"'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^']*)'", content)
        cat_match = re.search(r"'(Strategy|Leadership|Trust|Operations|AI|Revenue)'", content)
        rt_match = re.search(r"'(\d+ min read)'", content)

        newsletters[slug] = {
            'title': title, 'slug': slug, 'excerpt': excerpt, 'content': full_content,
            'published_date': date_match.group(1) if date_match else '2026-01-01T00:00:00+00:00',
            'read_time': rt_match.group(1) if rt_match else '9 min read',
            'category': cat_match.group(1) if cat_match else 'Strategy',
        }
        for m in re.finditer(r"UPDATE public\.newsletters SET published_date = '([^']+)' WHERE slug = '([^']+)'", content):
            if m.group(2) in newsletters:
                newsletters[m.group(2)]['published_date'] = m.group(1)

    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        for m in re.finditer(r"UPDATE public\.newsletters SET published_date = '([^']+)' WHERE slug = '([^']+)'", f.read_text()):
            if m.group(2) in newsletters:
                newsletters[m.group(2)]['published_date'] = m.group(1)
    return newsletters


def inline_md(text):
    escaped = htmlmod.escape(text)

    def replace_link(match):
        label, url = match.group(1), htmlmod.unescape(match.group(2))
        if not (url.startswith("https://") or url.startswith("http://") or url.startswith("/")):
            return match.group(0)
        return f'<a href="{htmlmod.escape(url, quote=True)}">{label}</a>'

    escaped = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', replace_link, escaped)
    return re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', escaped)


def md_to_html(md):
    parts, in_list = [], False
    for line in md.split('\n'):
        s = line.strip()
        if not s:
            if in_list: parts.append('</ul>'); in_list = False
            continue
        if s.startswith('## '):
            if in_list: parts.append('</ul>'); in_list = False
            parts.append(f'<h2>{htmlmod.escape(s[3:].strip("* "))}</h2>')
        elif s.startswith('### '):
            if in_list: parts.append('</ul>'); in_list = False
            parts.append(f'<h3>{htmlmod.escape(s[4:].strip("* "))}</h3>')
        elif s in ('---', '***'):
            if in_list: parts.append('</ul>'); in_list = False
            parts.append('<hr>')
        elif s.startswith(('- ', '* ')):
            if not in_list: parts.append('<ul>'); in_list = True
            t = inline_md(s[2:])
            parts.append(f'<li>{t}</li>')
        elif s.startswith('> '):
            if in_list: parts.append('</ul>'); in_list = False
            parts.append(f'<blockquote>{inline_md(s[2:])}</blockquote>')
        elif s.startswith('[CTA'):
            continue
        else:
            if in_list: parts.append('</ul>'); in_list = False
            t = inline_md(s)
            parts.append(f'<p>{t}</p>')
    if in_list: parts.append('</ul>')
    return '\n      '.join(parts)


def build_page(base_html, nl, related=None, hub_slug=None, catalog=None):
    title_esc = htmlmod.escape(nl['title'])
    desc_esc = htmlmod.escape(nl['excerpt'])
    slug = nl['slug']
    url = f"{SITE_URL}/newsletter/{slug}"
    og_img = f"{SITE_URL}/og/{slug}.png"
    pub = nl['published_date']
    wc = len(nl['content'].split())

    result = base_html

    # Replace title
    result = re.sub(r'<title>[^<]*</title>', f'<title>{title_esc} | Churn Is Dead</title>', result, count=1)

    # Replace meta description
    result = re.sub(r'<meta name="description" content="[^"]*"', f'<meta name="description" content="{desc_esc}"', result, count=1)

    # Replace canonical URL (base points to /, we need it pointing to the newsletter)
    result = re.sub(r'<link rel="canonical" href="[^"]*"', f'<link rel="canonical" href="{url}"', result, count=1)

    # Replace OG tags
    result = re.sub(r'<meta property="og:title" content="[^"]*"', f'<meta property="og:title" content="{title_esc} | Churn Is Dead"', result, count=1)
    result = re.sub(r'<meta property="og:description" content="[^"]*"', f'<meta property="og:description" content="{desc_esc}"', result, count=1)
    result = re.sub(r'<meta property="og:url" content="[^"]*"', f'<meta property="og:url" content="{url}"', result, count=1)
    result = re.sub(r'<meta property="og:type" content="[^"]*"', f'<meta property="og:type" content="article"', result, count=1)
    result = re.sub(r'<meta property="og:image" content="[^"]*"', f'<meta property="og:image" content="{og_img}"', result, count=1)

    # Replace Twitter tags
    result = re.sub(r'<meta name="twitter:title" content="[^"]*"', f'<meta name="twitter:title" content="{title_esc} | Churn Is Dead"', result, count=1)
    result = re.sub(r'<meta name="twitter:description" content="[^"]*"', f'<meta name="twitter:description" content="{desc_esc}"', result, count=1)
    result = re.sub(r'<meta name="twitter:image" content="[^"]*"', f'<meta name="twitter:image" content="{og_img}"', result, count=1)

    # Inject article meta + JSON-LD before </head> (canonical already replaced above)
    inject_head = f"""
  <meta property="article:author" content="Kuber Sethi">
  <meta property="article:published_time" content="{pub}">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": {json.dumps(nl['title'])},
    "description": {json.dumps(nl['excerpt'])},
    "image": "{og_img}",
    "datePublished": "{pub}",
    "dateModified": "{pub}",
    "wordCount": {wc},
    "url": "{url}",
    "mainEntityOfPage": {{ "@type": "WebPage", "@id": "{url}" }},
    "author": {{
      "@type": "Person",
      "name": "Kuber Sethi",
      "url": "https://www.linkedin.com/in/kuber-cs-strategist/",
      "jobTitle": "Customer Success Leader"
    }},
    "publisher": {{
      "@type": "Organization",
      "name": "Churn Is Dead",
      "url": "{SITE_URL}",
      "logo": {{ "@type": "ImageObject", "url": "{SITE_URL}/favicon.png" }}
    }}
  }}
  </script>"""
    result = result.replace('</head>', inject_head + '\n  </head>')

    # Inject noscript article after <div id="root">
    article_html = md_to_html(nl['content'])
    archive_note = ""
    try:
        if (
            datetime.fromisoformat(pub.replace('Z', '+00:00')) < datetime(2026, 8, 25, tzinfo=timezone.utc)
            and "## Sources and methodology" not in (nl.get("content") or "")
        ):
            archive_note = '<p><strong>Archive note:</strong> This issue predates the evidence ledger introduced in August 2026. Treat uncited benchmarks and examples as editorial analysis, not independently verified findings.</p>'
    except ValueError:
        archive_note = ""
    archive_markup = f"      {archive_note}\n" if archive_note else ""
    # Crawlable lateral links. Previously each issue offered only "All issues"
    # and "Subscribe", so half the archive had no inbound internal link at all
    # and the rest pooled on the three newest issues per category.
    related_records = []
    for related_slug in (related or []):
        record = (catalog or {}).get(related_slug)
        if not record:
            continue
        related_records.append({
            "slug": related_slug,
            "title": record.get("title", ""),
            "excerpt": record.get("excerpt", ""),
            "category": record.get("category") or "Strategy",
            "read_time": record.get("read_time") or "9 min read",
            "published_date": record.get("published_date", ""),
        })

    if related_records:
        links = "".join(
            f'<li style="margin-bottom:8px"><a href="{SITE_URL}/newsletter/{r["slug"]}">'
            f'{htmlmod.escape(r["title"])}</a></li>'
            for r in related_records
        )
        hub_link = (
            f'<p style="font-size:14px"><a href="{SITE_URL}/topics/{hub_slug}">'
            f'More on this topic</a></p>' if hub_slug else ""
        )
        related_markup = (
            '<nav aria-label="Related issues" style="margin:32px 0">'
            '<h2 style="font-family:Helvetica,Arial,sans-serif;font-size:18px">Keep reading</h2>'
            f'<ul style="padding-left:18px">{links}</ul>{hub_link}</nav>'
        )
    else:
        related_markup = ""

    # Same set the React component renders, so the rendered DOM matches the
    # prerendered HTML without a Supabase round-trip inside the render budget.
    payload = json.dumps(
        {"currentSlug": slug, "hub": hub_slug, "items": related_records},
        ensure_ascii=False,
    )
    payload = payload.replace("</", "<\\/")
    article_payload = json.dumps(
        {
            "id": f"static-{slug}",
            "title": nl["title"],
            "slug": slug,
            "excerpt": nl.get("excerpt") or nl["title"],
            "content": nl.get("content") or "",
            "published_date": nl["published_date"],
            "read_time": nl.get("read_time") or "9 min read",
            "category": nl.get("category") or "Strategy",
        },
        ensure_ascii=False,
    ).replace("</", "<\\/")
    result = result.replace(
        "</head>",
        f'<script type="application/json" id="ci-newsletter">{article_payload}</script>\n'
        f'  <script type="application/json" id="ci-related-issues">{payload}</script>\n  </head>',
        1,
    )

    noscript = f"""
  <noscript>
    <div style="max-width:680px;margin:40px auto;padding:0 16px;font-family:Georgia,serif;line-height:1.7;color:#1a1a1a">
      <p style="font-size:11px;letter-spacing:3px;color:#C8553D;font-weight:bold;text-transform:uppercase">CHURN IS DEAD</p>
      <h1 style="font-family:Helvetica,Arial,sans-serif;font-size:32px">{title_esc}</h1>
      <p style="color:#999;font-size:13px">{nl['read_time']} · {nl['category']}</p>
{archive_markup}      {article_html}
      <hr>
      {related_markup}
      <p style="font-size:13px;color:#999">By <strong>Kuber Sethi</strong> · <a href="{SITE_URL}/newsletters">All issues</a> · <a href="{SITE_URL}/start">Subscribe</a></p>
    </div>
  </noscript>"""
    result = result.replace('<div id="root"></div>', '<div id="root"></div>' + noscript)

    return result


def main():
    print("Pre-rendering newsletter pages (hybrid)...")
    base_html = INDEX_HTML.read_text()
    newsletters = load_newsletter_catalog()
    print(f"  {len(newsletters)} newsletters (migrations + live DB + approved packages)")

    # Internal link graph over issues that are actually live. Built once so
    # every page links to a stable, topical set instead of the newest three.
    now_for_graph = datetime.now(timezone.utc)
    live_items = []
    for graph_slug, record in newsletters.items():
        try:
            when = datetime.fromisoformat(str(record.get('published_date', '')).replace('Z', '+00:00'))
        except ValueError:
            continue
        if when.tzinfo is None:
            when = when.replace(tzinfo=timezone.utc)
        if when <= now_for_graph and record.get('content'):
            live_items.append(dict(record, slug=graph_slug))
    hub_membership = load_hub_membership()
    related_graph = build_related_graph(live_items, membership=hub_membership)
    print(f"  internal link graph: {len(related_graph)} issues, "
          f"{sum(len(v) for v in related_graph.values())} lateral links")

    generated = 0
    now = datetime.now(timezone.utc)
    public_catalog = []
    for slug, nl in newsletters.items():
        if not SLUG_RE.fullmatch(slug):
            print(f"  Skip unsafe slug: {slug!r}")
            continue
        try:
            published_at = datetime.fromisoformat(nl['published_date'].replace('Z', '+00:00'))
        except ValueError:
            print(f"  Skip {slug} (invalid publication date)")
            continue
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)
        if published_at > now:
            # A previously generated file may contain an early or superseded
            # draft. Remove it so future issues are unavailable before launch.
            held_page = PUBLIC_DIR / "newsletter" / slug / "index.html"
            if held_page.exists():
                held_page.unlink()
                try:
                    held_page.parent.rmdir()
                except OSError:
                    pass
            print(f"  Hold {slug} until {nl['published_date']}")
            continue
        if not nl.get('content'):
            print(f"  Skip {slug} (no content)")
            continue
        public_catalog.append({
            "id": f"static-{slug}",
            "title": nl["title"],
            "slug": slug,
            "excerpt": nl.get("excerpt") or nl["title"],
            "published_date": nl["published_date"],
            "read_time": nl.get("read_time") or "9 min read",
            "category": nl.get("category") or "Strategy",
        })
        out_dir = PUBLIC_DIR / "newsletter" / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(
            build_page(
                base_html,
                nl,
                related=related_graph.get(slug, []),
                hub_slug=hub_for_slug(slug, hub_membership),
                catalog=newsletters,
            )
        )
        generated += 1
        print(f"  ✓ /newsletter/{slug}/")

    public_catalog.sort(key=lambda row: row["published_date"], reverse=True)
    catalog_dir = PUBLIC_DIR / "newsletter"
    catalog_dir.mkdir(parents=True, exist_ok=True)
    (catalog_dir / "catalog.json").write_text(
        json.dumps(public_catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"  {generated} pages generated; catalog {len(public_catalog)} issues")


if __name__ == "__main__":
    main()
