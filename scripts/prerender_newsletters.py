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
import re
import html as htmlmod
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
PUBLIC_DIR = REPO_ROOT / "public"
INDEX_HTML = REPO_ROOT / "index.html"
SITE_URL = "https://churnisdead.com"


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
            t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', htmlmod.escape(s[2:]))
            parts.append(f'<li>{t}</li>')
        elif s.startswith('> '):
            if in_list: parts.append('</ul>'); in_list = False
            parts.append(f'<blockquote>{htmlmod.escape(s[2:])}</blockquote>')
        elif s.startswith('[CTA'):
            continue
        else:
            if in_list: parts.append('</ul>'); in_list = False
            t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', htmlmod.escape(s))
            parts.append(f'<p>{t}</p>')
    if in_list: parts.append('</ul>')
    return '\n      '.join(parts)


def build_page(base_html, nl):
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
      "url": "https://www.linkedin.com/in/kubersethi/",
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
    noscript = f"""
  <noscript>
    <div style="max-width:680px;margin:40px auto;padding:0 16px;font-family:Georgia,serif;line-height:1.7;color:#1a1a1a">
      <p style="font-size:11px;letter-spacing:3px;color:#C8553D;font-weight:bold;text-transform:uppercase">CHURN IS DEAD</p>
      <h1 style="font-family:Helvetica,Arial,sans-serif;font-size:32px">{title_esc}</h1>
      <p style="color:#999;font-size:13px">{nl['read_time']} · {nl['category']}</p>
      {article_html}
      <hr>
      <p style="font-size:13px;color:#999">By <strong>Kuber Sethi</strong> · <a href="{SITE_URL}/newsletters">All issues</a> · <a href="{SITE_URL}/start">Subscribe</a></p>
    </div>
  </noscript>"""
    result = result.replace('<div id="root"></div>', '<div id="root"></div>' + noscript)

    return result


def main():
    print("Pre-rendering newsletter pages (hybrid)...")
    base_html = INDEX_HTML.read_text()
    newsletters = extract_newsletters()
    print(f"  Found {len(newsletters)} newsletters")

    generated = 0
    for slug, nl in newsletters.items():
        if not nl.get('content'):
            print(f"  Skip {slug} (no content)")
            continue
        out_dir = PUBLIC_DIR / "newsletter" / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(build_page(base_html, nl))
        generated += 1
        print(f"  ✓ /newsletter/{slug}/")

    print(f"  {generated} pages generated")


if __name__ == "__main__":
    main()
