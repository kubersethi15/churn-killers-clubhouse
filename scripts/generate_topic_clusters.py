#!/usr/bin/env python3
"""
Churn Is Dead — Topic Cluster Generator
For each newsletter, generates 3 supporting blog posts that:
- Target long-tail keywords related to the newsletter topic
- Interlink back to the parent newsletter
- Build topical authority for Google

Run: python scripts/generate_topic_clusters.py
Requires: ANTHROPIC_API_KEY environment variable

Output: Creates SQL migration + pre-rendered HTML pages for each cluster post
"""

import anthropic
import json
import re
import uuid
from datetime import datetime, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
PUBLIC_DIR = REPO_ROOT / "public"
SITE_URL = "https://churnisdead.com"


def get_existing_newsletters():
    """Extract newsletter titles and slugs from migrations."""
    newsletters = {}
    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        content = f.read_text()
        if 'INSERT INTO public.newsletters' not in content:
            continue
        vals = re.search(r"VALUES\s*\(\s*(?:E)?'([^']*(?:''[^']*)*)',\s*'([^']+)'", content)
        if vals:
            title = vals.group(1).replace("''", "'")
            slug = vals.group(2)
            newsletters[slug] = title
    return newsletters


def get_existing_blog_slugs():
    """Check which blog posts already exist."""
    slugs = set()
    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        content = f.read_text()
        if 'INSERT INTO public.blog_posts' in content:
            for m in re.finditer(r"'([\w-]+)'", content):
                slugs.add(m.group(1))
    # Also check generated HTML files
    blog_dir = PUBLIC_DIR / "blog"
    if blog_dir.exists():
        for d in blog_dir.iterdir():
            if d.is_dir():
                slugs.add(d.name)
    return slugs


def call_claude(system_prompt, user_prompt, max_tokens=6000):
    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    return message.content[0].text


def generate_cluster_posts(newsletter_title, newsletter_slug):
    """Generate 3 supporting blog posts for a newsletter topic."""
    
    system = """You are an SEO content strategist for "Churn Is Dead", an enterprise Customer Success newsletter by Kuber Sethi.

Generate 3 supporting blog post ideas that create a topic cluster around the parent newsletter.

Each post should:
- Target a specific long-tail keyword that someone would Google
- Be 800-1200 words
- Be practical and actionable (not fluff)
- Link back to the parent newsletter naturally
- Have a different angle from the parent (how-to, comparison, mistakes, template, etc.)

Voice: Direct, contrarian, enterprise-focused. No corporate speak. Write like you're advising a peer.

CRITICAL: Return ONLY valid JSON. No markdown fences. No explanation."""

    user = f"""Parent newsletter: "{newsletter_title}"
Parent URL: {SITE_URL}/newsletter/{newsletter_slug}

Generate 3 supporting blog posts. Return JSON array:
[
  {{
    "title": "SEO-optimized title (include target keyword naturally)",
    "slug": "url-friendly-slug",
    "target_keyword": "the primary keyword this post targets",
    "excerpt": "2-sentence description for meta tags",
    "content": "Full markdown blog post (800-1200 words). Include a natural link to the parent newsletter using [text]({SITE_URL}/newsletter/{newsletter_slug}) format. Use ## for headings. Be practical and specific.",
    "category": "Strategy|Leadership|Operations|Revenue"
  }}
]"""

    raw = call_claude(system, user)
    
    # Clean and parse JSON
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r'^```\w*\n?', '', cleaned)
        cleaned = re.sub(r'\n?```$', '', cleaned)
    
    return json.loads(cleaned)


def escape_sql(s):
    return s.replace("'", "''").replace("\\", "\\\\")


def create_blog_migration(posts, parent_slug):
    """Create a SQL migration that inserts blog posts."""
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    
    sql_parts = []
    sql_parts.append("""-- Create blog_posts table if not exists
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  target_keyword TEXT,
  parent_newsletter_slug TEXT,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_time TEXT DEFAULT '5 min read',
  category TEXT DEFAULT 'Strategy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read
DO $$ BEGIN
  CREATE POLICY "Public can read blog posts" ON public.blog_posts
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
""")

    pub_date = datetime.utcnow() + timedelta(days=1)
    
    for i, post in enumerate(posts):
        date = (pub_date + timedelta(days=i*2)).strftime("%Y-%m-%dT08:00:00+00:00")
        sql_parts.append(f"""
INSERT INTO public.blog_posts (title, slug, excerpt, content, target_keyword, parent_newsletter_slug, published_date, category)
VALUES (
  '{escape_sql(post["title"])}',
  '{escape_sql(post["slug"])}',
  '{escape_sql(post["excerpt"])}',
  E'{escape_sql(post["content"])}',
  '{escape_sql(post.get("target_keyword", ""))}',
  '{escape_sql(parent_slug)}',
  '{date}',
  '{escape_sql(post.get("category", "Strategy"))}'
);""")

    sql = "\n".join(sql_parts)
    fp = MIGRATIONS_DIR / f"{ts}_{uuid.uuid4()}.sql"
    fp.write_text(sql)
    print(f"  Migration: {fp.name}")
    return fp


def prerender_blog_post(post, index_html_template):
    """Generate a pre-rendered HTML page for a blog post."""
    import html as htmlmod
    
    slug = post['slug']
    title_esc = htmlmod.escape(post['title'])
    desc_esc = htmlmod.escape(post['excerpt'])
    url = f"{SITE_URL}/blog/{slug}"
    pub = post.get('published_date', datetime.utcnow().isoformat())
    wc = len(post['content'].split())
    
    # Simple markdown to HTML
    content_html = post['content']
    content_html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', content_html, flags=re.MULTILINE)
    content_html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', content_html, flags=re.MULTILINE)
    content_html = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', content_html)
    content_html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', content_html)
    content_html = re.sub(r'^- (.+)$', r'<li>\1</li>', content_html, flags=re.MULTILINE)
    content_html = re.sub(r'((?:<li>.*</li>\n?)+)', r'<ul>\1</ul>', content_html)
    # Wrap remaining lines in <p> tags
    lines = content_html.split('\n')
    processed = []
    for line in lines:
        s = line.strip()
        if not s or s.startswith('<h') or s.startswith('<ul') or s.startswith('<li') or s.startswith('</'):
            processed.append(s)
        elif s == '---':
            processed.append('<hr>')
        else:
            processed.append(f'<p>{s}</p>')
    content_html = '\n'.join(processed)

    result = index_html_template
    result = re.sub(r'<title>[^<]*</title>', f'<title>{title_esc} | Churn Is Dead</title>', result, count=1)
    result = re.sub(r'<meta name="description" content="[^"]*"', f'<meta name="description" content="{desc_esc}"', result, count=1)
    result = re.sub(r'<link rel="canonical" href="[^"]*"', f'<link rel="canonical" href="{url}"', result, count=1)
    result = re.sub(r'<meta property="og:title" content="[^"]*"', f'<meta property="og:title" content="{title_esc} | Churn Is Dead"', result, count=1)
    result = re.sub(r'<meta property="og:description" content="[^"]*"', f'<meta property="og:description" content="{desc_esc}"', result, count=1)
    result = re.sub(r'<meta property="og:url" content="[^"]*"', f'<meta property="og:url" content="{url}"', result, count=1)
    result = re.sub(r'<meta property="og:type" content="[^"]*"', f'<meta property="og:type" content="article"', result, count=1)
    result = re.sub(r'<meta name="twitter:title" content="[^"]*"', f'<meta name="twitter:title" content="{title_esc} | Churn Is Dead"', result, count=1)
    result = re.sub(r'<meta name="twitter:description" content="[^"]*"', f'<meta name="twitter:description" content="{desc_esc}"', result, count=1)

    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "Article",
        "headline": post['title'], "description": post['excerpt'],
        "datePublished": pub, "wordCount": wc, "url": url,
        "author": {"@type": "Person", "name": "Kuber Sethi", "url": "https://www.linkedin.com/in/kubersethi/"},
        "publisher": {"@type": "Organization", "name": "Churn Is Dead", "url": SITE_URL}
    }, indent=2)

    inject = f"""
  <meta property="article:author" content="Kuber Sethi">
  <script type="application/ld+json">{jsonld}</script>"""
    result = result.replace('</head>', inject + '\n  </head>')

    noscript = f"""
  <noscript>
    <div style="max-width:680px;margin:40px auto;padding:0 16px;font-family:Georgia,serif;line-height:1.7;color:#1a1a1a">
      <p style="font-size:11px;letter-spacing:3px;color:#C8553D;font-weight:bold;text-transform:uppercase">CHURN IS DEAD</p>
      <h1 style="font-family:Helvetica,Arial,sans-serif;font-size:32px">{title_esc}</h1>
      {content_html}
      <hr>
      <p style="font-size:13px;color:#999">By <strong>Kuber Sethi</strong> · <a href="{SITE_URL}/newsletters">Newsletter</a> · <a href="{SITE_URL}/start">Subscribe</a></p>
    </div>
  </noscript>"""
    result = result.replace('<div id="root"></div>', '<div id="root"></div>' + noscript)

    out_dir = PUBLIC_DIR / "blog" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(result)
    print(f"  Pre-rendered: /blog/{slug}/")


def main():
    import os
    if not os.environ.get('ANTHROPIC_API_KEY'):
        print("ERROR: ANTHROPIC_API_KEY not set. Skipping topic cluster generation.")
        return

    print("Generating topic clusters...")
    newsletters = get_existing_newsletters()
    existing_blogs = get_existing_blog_slugs()
    index_html = (REPO_ROOT / "index.html").read_text()

    # Only generate clusters for newsletters that don't have them yet
    for slug, title in newsletters.items():
        # Check if cluster posts already exist for this newsletter
        if any(slug in b for b in existing_blogs):
            print(f"  Skip {slug} (clusters exist)")
            continue

        print(f"\n  Generating clusters for: {title}")
        try:
            posts = generate_cluster_posts(title, slug)
            print(f"  Got {len(posts)} posts")
            
            # Create migration
            create_blog_migration(posts, slug)
            
            # Pre-render each post
            for post in posts:
                prerender_blog_post(post, index_html)
                
        except Exception as e:
            print(f"  ERROR: {e}")
            continue

    print("\nDone!")


if __name__ == "__main__":
    main()
