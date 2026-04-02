#!/usr/bin/env python3
"""
Churn Is Dead — Automated Newsletter Generator v2
Runs every Sunday via GitHub Actions.
1. Calls Claude API to write newsletter + playbook structure (as JSON)
2. Uses deterministic PDF builder to create the playbook
3. Creates SQL migration for Supabase
4. Git commits everything
"""

import anthropic
import json
import os
import re
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# ─── PATHS ───
REPO_ROOT = Path(__file__).parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
PDFS_DIR = REPO_ROOT / "public" / "pdfs"


# ═══════════════════════════════════════════════════════════
# PART 1: CLAUDE API — GENERATE CONTENT
# ═══════════════════════════════════════════════════════════

def get_next_tuesday():
    today = datetime.utcnow()
    days_ahead = 1 - today.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    tuesday = today + timedelta(days=days_ahead)
    return tuesday.strftime("%Y-%m-%dT08:00:00+00:00")


def get_existing_topics():
    topics = []
    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        content = f.read_text()
        match = re.search(r"INSERT INTO public\.newsletters.*?VALUES\s*\(\s*E?'([^']+)'", content, re.DOTALL)
        if match:
            topics.append(match.group(1))
    return list(set(topics))


def call_claude(system_prompt, user_prompt, max_tokens=8000):
    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    return message.content[0].text


def generate_newsletter_and_playbook(topic_override=None):
    existing_topics = get_existing_topics()
    existing_list = "\n".join(f"- {t}" for t in existing_topics) if existing_topics else "None yet"

    if topic_override:
        topic_instruction = f"Write about this specific topic: {topic_override}"
    else:
        topic_instruction = """Pick the best topic for this week. Choose something:
- NOT covered before (see existing topics below)
- Timely and relevant to CS professionals in 2026
- Strong contrarian angle
- Lends itself to a named framework with actionable diagnostics"""

    system_prompt = """You are Kuber Sethi, author of "Churn Is Dead" newsletter for enterprise CS professionals.
Your voice: Contrarian, direct, story-driven, framework-backed, enterprise-focused, anti-fluff.
You will return a JSON response with two parts: the newsletter and the playbook structure.
CRITICAL: Return ONLY valid JSON. No markdown fences. No explanation. Just the JSON object.
WRITING STYLE RULE: Do NOT overuse em dashes (—). Use them sparingly — maximum 3-4 in the entire newsletter. Instead, use periods, commas, colons, or restructure sentences. Em dash overuse is an AI writing tell and makes the content feel generic. Prefer short punchy sentences over long dash-connected ones."""

    user_prompt = f"""EXISTING TOPICS (do NOT repeat):
{existing_list}

{topic_instruction}

Return a JSON object with this exact structure:

{{
  "metadata": {{
    "title": "Newsletter Title Here",
    "slug": "url-friendly-slug-here",
    "excerpt": "One compelling sentence for archive page, max 200 chars",
    "category": "Short category e.g. Strategy, AI & Automation, Team Design",
    "read_time": "9 min read",
    "pdf_filename": "Playbook_Name_Audit_ChurnIsDead.pdf",
    "playbook_title": "The Playbook Name Audit",
    "playbook_description": "Brief description of what the playbook contains, 1-2 sentences for the vault page"
  }},
  "newsletter_content": "FULL NEWSLETTER IN MARKDOWN. ~2500 words. Structure: ## headers, **bold**, --- breaks. Opening story, contrarian thesis, 3-5 myths/lies/failure modes, named framework with numbered components and action steps, playbook CTA, sign-off as Kuber with P.S. CTA format: [CTA link=\\"/pdfs/FILENAME.pdf\\"]Download the PLAYBOOK NAME[/CTA]",
  "playbook": {{
    "title": "The Playbook Name Audit",
    "subtitle": "One line describing what this audit does",
    "intro_text": "2-3 sentences about what this audit measures and why it matters",
    "scoring_note": "Brief note about scoring scale and what totals mean",
    "sections": [
      {{
        "number": "01",
        "title": "Section Title",
        "subtitle": "What does this section measure?",
        "description": "2-3 sentences explaining this dimension",
        "diagnostic_questions": ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"],
        "table_title": "Worksheet Title",
        "table_instruction": "Brief instruction for the table",
        "table_headers": ["Column 1", "Column 2", "Column 3", "Column 4"],
        "table_col_ratios": [0.15, 0.35, 0.25, 0.25],
        "table_rows": 8,
        "rubric": [
          ["No evidence or capability in this area", "1"],
          ["Anecdotal or inconsistent effort", "2"],
          ["Present but not systematic", "3"],
          ["Consistent and measurable", "4"],
          ["Industry-leading and deeply embedded", "5"]
        ]
      }}
    ],
    "closing_quote": "One powerful closing line that captures the newsletter thesis"
  }}
}}

IMPORTANT: Include 4-5 sections in the playbook. Make questions specific, not generic. Make rubrics specific to each section. Newsletter must be ~2500 words with full story-driven structure.
STYLE: Minimize em dashes (—) across ALL text. Max 3-4 in the newsletter, zero in playbook descriptions/questions. Use periods, commas, colons instead."""

    raw = call_claude(system_prompt, user_prompt, max_tokens=12000)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r'^```(?:json)?\s*\n?', '', raw)
        raw = re.sub(r'\n?```\s*$', '', raw)
    return json.loads(raw)


# ═══════════════════════════════════════════════════════════
# PART 2: DETERMINISTIC PDF BUILDER
# ═══════════════════════════════════════════════════════════

def build_playbook_pdf(playbook_data, metadata, output_path):
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.platypus import (
        Paragraph, Spacer, PageBreak, Table, TableStyle,
        HRFlowable, Frame, PageTemplate, BaseDocTemplate, NextPageTemplate
    )

    BLACK = HexColor("#0D0D0D")
    CHARCOAL = HexColor("#2A2A2A")
    MID_GRAY = HexColor("#6B6B6B")
    LIGHT_GRAY = HexColor("#9A9A9A")
    WHITE = HexColor("#FFFFFF")
    ACCENT = HexColor("#C8553D")
    ACCENT_DARK = HexColor("#8B3A2A")
    WARM_BG = HexColor("#F7F3F0")
    CARD_BG = HexColor("#F5F0EC")
    BORDER_LIGHT = HexColor("#D4CCC5")

    PAGE_W, PAGE_H = letter
    ML, MR, MT, MB = 0.9*inch, 0.9*inch, 0.8*inch, 0.7*inch
    CW = PAGE_W - ML - MR

    def S(name, **kw):
        defaults = {'fontName': 'Helvetica', 'fontSize': 10, 'textColor': CHARCOAL, 'leading': 16}
        defaults.update(kw)
        return ParagraphStyle(name, **defaults)

    st = {
        'brand': S('brand', fontName='Helvetica-Bold', fontSize=10, textColor=ACCENT, letterSpacing=3, spaceAfter=4),
        'sn': S('sn', fontName='Helvetica-Bold', fontSize=11, textColor=ACCENT, spaceAfter=2),
        'stitle': S('stitle', fontName='Helvetica-Bold', fontSize=18, textColor=BLACK, leading=24, spaceAfter=4),
        'ssub': S('ssub', fontSize=10, textColor=MID_GRAY, leading=14, spaceAfter=14),
        'body': S('body', spaceAfter=10),
        'bbold': S('bbold', fontName='Helvetica-Bold', textColor=BLACK, spaceAfter=6),
        'callout': S('callout', fontName='Helvetica-Oblique', textColor=ACCENT_DARK, leftIndent=12),
        'th': S('th', fontName='Helvetica-Bold', fontSize=9, textColor=WHITE, leading=13),
        'td': S('td', fontSize=9, leading=13),
        'tdb': S('tdb', fontName='Helvetica-Bold', fontSize=9, textColor=BLACK, leading=13),
        'cb': S('cb', fontSize=9.5, leading=15, spaceAfter=4),
        'sm': S('sm', fontSize=8, textColor=LIGHT_GRAY, leading=11),
        'sh': S('sh', fontName='Helvetica-Bold', fontSize=10, textColor=ACCENT, spaceAfter=4),
        'ins': S('ins', fontSize=9, textColor=MID_GRAY, leading=14, spaceAfter=10),
        'pt': S('pt', fontName='Helvetica-Bold', fontSize=14, textColor=BLACK, leading=20, spaceAfter=6),
        'se': S('se', fontName='Helvetica-Bold', fontSize=12, textColor=ACCENT, spaceAfter=4),
    }

    def sp(pts=6): return Spacer(1, pts)
    def hr_line(color=BORDER_LIGHT, t=0.5): return HRFlowable(width="100%", thickness=t, color=color, spaceBefore=8, spaceAfter=8)
    def cb_item(text): return Paragraph(f"<font face='Helvetica' size='11'>\u25a1</font>  {text}", st['cb'])

    def cbox(text):
        inner = Paragraph(text, st['callout'])
        t = Table([[inner]], colWidths=[CW - 24])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
            ('LEFTPADDING', (0,0), (-1,-1), 14), ('RIGHTPADDING', (0,0), (-1,-1), 14),
            ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LINEBEFOREDECOR', (0,0), (0,-1), 3, ACCENT),
        ]))
        return t

    def mk_table(rows, widths=None):
        if not widths:
            n = len(rows[0])
            widths = [CW/n]*n
        hdr = [Paragraph(h, st['th']) for h in rows[0]]
        data = [hdr]
        for row in rows[1:]:
            data.append([Paragraph(str(c), st['tdb'] if i == 0 else st['td']) for i, c in enumerate(row)])
        t = Table(data, colWidths=widths)
        cmds = [
            ('BACKGROUND', (0,0), (-1,0), CHARCOAL), ('TEXTCOLOR', (0,0), (-1,0), WHITE),
            ('BOTTOMPADDING', (0,0), (-1,0), 8), ('TOPPADDING', (0,0), (-1,0), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,1), (-1,-1), 7), ('BOTTOMPADDING', (0,1), (-1,-1), 7),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_LIGHT), ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]
        for i in range(1, len(data)):
            if i % 2 == 0: cmds.append(('BACKGROUND', (0,i), (-1,i), WARM_BG))
        t.setStyle(TableStyle(cmds))
        return t

    title_text = playbook_data.get('title', 'Playbook')
    def add_footer(c, doc):
        c.saveState(); c.setStrokeColor(BORDER_LIGHT); c.setLineWidth(0.3)
        c.line(ML, MB-10, PAGE_W-MR, MB-10)
        c.setFont('Helvetica', 7); c.setFillColor(LIGHT_GRAY)
        c.drawString(ML, MB-22, f"CHURN IS DEAD  \u2014  {title_text}")
        c.drawRightString(PAGE_W-MR, MB-22, f"churnisdead.com  |  Page {doc.page}")
        c.restoreState()

    doc = BaseDocTemplate(str(output_path), pagesize=letter,
        leftMargin=ML, rightMargin=MR, topMargin=MT, bottomMargin=MB,
        title=title_text, author="Kuber Sethi")
    doc.title_text = title_text
    frame = Frame(ML, MB, CW, PAGE_H-MT-MB, id='main')
    doc.addPageTemplates([
        PageTemplate(id='cover', frames=frame, onPage=lambda c,d: None),
        PageTemplate(id='content', frames=frame, onPage=add_footer),
    ])

    story = []
    pb = playbook_data

    # Cover
    story.append(sp(60))
    story.append(Paragraph("CHURN IS DEAD", ParagraphStyle('cvb', fontName='Helvetica-Bold', fontSize=12, textColor=ACCENT, letterSpacing=4)))
    story.append(sp(12))
    story.append(HRFlowable(width="30%", thickness=2, color=ACCENT, spaceBefore=0, spaceAfter=16, hAlign='LEFT'))
    ctitle = pb.get('title', 'Playbook')
    if len(ctitle) > 30 and '<br/>' not in ctitle:
        w = ctitle.split(); mid = len(w)//2
        ctitle = ' '.join(w[:mid]) + '<br/>' + ' '.join(w[mid:])
    story.append(Paragraph(ctitle, ParagraphStyle('cvt', fontName='Helvetica-Bold', fontSize=36, textColor=BLACK, leading=44)))
    story.append(sp(12))
    story.append(Paragraph(pb.get('subtitle', ''), ParagraphStyle('cvs', fontName='Helvetica', fontSize=13, textColor=MID_GRAY, leading=20)))
    story.append(sp(40))
    story.append(HRFlowable(width="100%", thickness=0.3, color=BORDER_LIGHT, spaceBefore=0, spaceAfter=16))
    for lbl, val in [["Created by", "Kuber Sethi"], ["Source", "churnisdead.com"], ["Version", f"1.0 \u2014 {datetime.utcnow().strftime('%B %Y')}"]]:
        story.append(Paragraph(f"<font face='Helvetica-Bold' color='#2A2A2A'>{lbl}:</font>  <font face='Helvetica' color='#6B6B6B'>{val}</font>",
            ParagraphStyle(f'd{lbl}', fontName='Helvetica', fontSize=9, leading=16, textColor=MID_GRAY)))
    story.append(sp(60))
    story.append(Paragraph("Block 60\u201390 minutes. Be honest. The results only matter if they\u2019re real.",
        ParagraphStyle('cvi', fontName='Helvetica-Oblique', fontSize=10, textColor=MID_GRAY, leading=16)))
    story.append(NextPageTemplate('content')); story.append(PageBreak())

    # How to use
    story.append(Paragraph("How to Use This Audit", st['pt']))
    story.append(hr_line(ACCENT, 1)); story.append(sp(6))
    story.append(Paragraph(pb.get('intro_text', ''), st['body']))
    story.append(sp(4))
    story.append(cbox(f"<b>Scoring:</b> {pb.get('scoring_note', 'Each section uses a 1\u20135 scale.')}"))
    story.append(sp(8))
    overview = [["Score", "Meaning", "Risk Level", "Action"],
        ["1", "No evidence of capability", "Critical", "Rebuild immediately"],
        ["2", "Anecdotal, inconsistent", "High", "Formalize within 60 days"],
        ["3", "Present but not systematic", "Moderate", "Strengthen and document"],
        ["4", "Consistent, measurable", "Low", "Scale and protect"],
        ["5", "Industry-leading, embedded", "Minimal", "Showcase and expand"]]
    story.append(mk_table(overview, [CW*0.1, CW*0.32, CW*0.18, CW*0.4]))
    story.append(PageBreak())

    # Sections
    sections = pb.get('sections', [])
    for sec in sections:
        story.append(sp(16)); story.append(hr_line(ACCENT, 1.5)); story.append(sp(4))
        story.append(Paragraph(f"SECTION {sec.get('number', '01')}", st['sn']))
        story.append(Paragraph(sec.get('title', ''), st['stitle']))
        if sec.get('subtitle'): story.append(Paragraph(sec['subtitle'], st['ssub']))
        story.append(sp(6))
        if sec.get('description'): story.append(Paragraph(sec['description'], st['body']))
        if sec.get('diagnostic_questions'):
            story.append(sp(4)); story.append(Paragraph("Diagnostic Questions", st['bbold']))
            for q in sec['diagnostic_questions']: story.append(cb_item(q))
        story.append(sp(8))
        if sec.get('table_title'): story.append(Paragraph(sec['table_title'], st['bbold']))
        if sec.get('table_instruction'): story.append(Paragraph(sec['table_instruction'], st['ins']))
        hdrs = sec.get('table_headers', ['Item', 'Details', 'Score', 'Notes'])
        rats = sec.get('table_col_ratios', [1.0/len(hdrs)]*len(hdrs))
        nrows = sec.get('table_rows', 8)
        tdata = [hdrs] + [[f"{i}."] + [""]*(len(hdrs)-1) for i in range(1, nrows+1)]
        story.append(mk_table(tdata, [CW*r for r in rats]))
        story.append(sp(8)); story.append(Paragraph("Score This Section", st['sh']))
        rub = sec.get('rubric', [])
        if rub: story.append(mk_table([["Criteria", "Score"]] + rub, [CW*0.78, CW*0.22]))
        story.append(sp(6)); story.append(Paragraph("<b>Your Score:  ____  / 5</b>", st['se']))
        story.append(PageBreak())

    # Final scorecard
    story.append(sp(12)); story.append(Paragraph("CHURN IS DEAD", st['brand'])); story.append(sp(4))
    story.append(Paragraph("Your Scorecard", ParagraphStyle('ftt', fontName='Helvetica-Bold', fontSize=24, textColor=BLACK, leading=30, spaceAfter=6)))
    story.append(hr_line(ACCENT, 1.5)); story.append(sp(8))
    mx = len(sections)*5
    fd = [["Dimension", "Your Score", "Max"]]
    for i, s in enumerate(sections, 1): fd.append([f"{i}. {s.get('title','')}", "____", "5"])
    fd.append(["TOTAL", "____", str(mx)])
    story.append(mk_table(fd, [CW*0.55, CW*0.225, CW*0.225]))
    story.append(sp(12))
    hi = mx
    interp = [["Total Score", "Assessment", "What It Means"],
        [f"{int(hi*0.8)}\u2013{hi}", "Uncuttable", "Embedded, measurable, strategically irreplaceable."],
        [f"{int(hi*0.6)}\u2013{int(hi*0.8)-1}", "Defensible", "Solid but gaps remain. Focus on lowest dimension."],
        [f"{int(hi*0.4)}\u2013{int(hi*0.6)-1}", "Vulnerable", "Real risk ahead. Treat as urgent."],
        [f"{len(sections)}\u2013{int(hi*0.4)-1}", "Critical", "Cannot survive scrutiny. Major changes needed."]]
    story.append(mk_table(interp, [CW*0.15, CW*0.17, CW*0.68]))
    story.append(sp(12))
    story.append(cbox("<b>What to do next:</b> Take your lowest-scoring section and build a 30-day action plan. One at a time. Then share this with leadership \u2014 not to ask permission, but to show you know where the gaps are."))
    story.append(sp(12)); story.append(hr_line(BORDER_LIGHT, 0.3)); story.append(sp(4))
    story.append(Paragraph(pb.get('closing_quote', ''), ParagraphStyle('clq', fontName='Helvetica-Oblique', fontSize=10, textColor=MID_GRAY, leading=16)))
    story.append(sp(4)); story.append(Paragraph("\u2014 Kuber", ParagraphStyle('sig2', fontName='Helvetica-Bold', fontSize=11, textColor=BLACK)))
    story.append(sp(2)); story.append(Paragraph("churnisdead.com  |  Weekly frameworks that replace hope with strategy.", st['sm']))

    doc.build(story)
    fsize = os.path.getsize(output_path)
    print(f"   PDF created: {output_path} ({fsize:,} bytes)")
    if fsize < 5000:
        raise RuntimeError(f"PDF too small ({fsize} bytes) — likely failed to build properly")


# ═══════════════════════════════════════════════════════════
# PART 3: SUPABASE API INSERT
# ═══════════════════════════════════════════════════════════

def insert_newsletter_via_api(content, meta, pub_date):
    """Insert newsletter directly into Supabase via REST API."""
    import urllib.request
    import urllib.error

    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set as GitHub secrets")

    payload = json.dumps({
        "title": meta["title"],
        "slug": meta["slug"],
        "excerpt": meta["excerpt"],
        "content": content,
        "published_date": pub_date,
        "read_time": meta.get("read_time", "9 min read"),
        "category": meta.get("category", "Strategy")
    }).encode("utf-8")

    url = f"{supabase_url.rstrip('/')}/rest/v1/newsletters"
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("apikey", service_role_key)
    req.add_header("Authorization", f"Bearer {service_role_key}")
    req.add_header("Prefer", "return=representation")

    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            result = json.loads(body)
            print(f"   ✅ Newsletter inserted into Supabase: {result[0]['id']}")
            return result[0]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else "No details"
        raise RuntimeError(f"Supabase API insert failed ({e.code}): {error_body}")


def create_migration(content, meta, pub_date, pdf_name=None):
    """Legacy: kept for reference but no longer used by main()."""
    pass


# ═══════════════════════════════════════════════════════════
# PART 4: DISTRIBUTION CONTENT GENERATOR
# ═══════════════════════════════════════════════════════════

DISTRIBUTION_DIR = REPO_ROOT / "distribution"


def generate_distribution_content(newsletter_content, meta):
    """Generate LinkedIn posts, LinkedIn newsletter edition, and community cross-posts."""

    DISTRIBUTION_DIR.mkdir(exist_ok=True)

    system_prompt = """You are Kuber Sethi, author of "Churn Is Dead" newsletter.
Your LinkedIn voice: Direct, confident, contrarian, personal. You write from experience.
You're addressing CS leaders, CSMs, VPs of Customer Success at B2B SaaS companies.
CRITICAL: Return ONLY valid JSON. No markdown fences. No explanation. Just the JSON object.
STYLE: Short punchy sentences. No em dashes. No emojis. No hashtags in the post body (only at the end)."""

    user_prompt = f"""Based on this newsletter, generate distribution content.

NEWSLETTER TITLE: {meta['title']}
NEWSLETTER SLUG: {meta['slug']}
NEWSLETTER URL: https://churnisdead.com/newsletter/{meta['slug']}
SUBSCRIBE URL: https://churnisdead.com

NEWSLETTER CONTENT (first 3000 chars):
{newsletter_content[:3000]}

Return a JSON object with this exact structure:

{{
  "linkedin_posts": [
    {{
      "day": "Tuesday",
      "hook": "First line that stops the scroll (under 15 words)",
      "body": "Full post body. 150-250 words. Standalone value. End with CTA to newsletter URL. Add 2-3 hashtags on last line.",
      "strategy": "Why this post works (for internal reference only)"
    }},
    {{
      "day": "Wednesday",
      "hook": "First line hook",
      "body": "Pure value post. No link. Framework or insight from the newsletter. Ends with a question to drive comments. 2-3 hashtags.",
      "strategy": "Why this post works"
    }},
    {{
      "day": "Thursday",
      "hook": "First line hook",
      "body": "Framework listicle or numbered takeaways. Ends with 'Link in comments' or direct URL. 2-3 hashtags.",
      "strategy": "Why this post works"
    }},
    {{
      "day": "Friday",
      "hook": "First line hook",
      "body": "Personal reflection or vulnerability. What I learned. Honest take. Ends with subscribe CTA. 2-3 hashtags.",
      "strategy": "Why this post works"
    }}
  ],
  "linkedin_newsletter": {{
    "title": "Punchy title for LinkedIn Newsletter edition (can differ from email title)",
    "body": "LinkedIn Newsletter body. 600-800 words. Include the opening story and first framework section. End with: 'I break down the full framework + a free downloadable playbook at [URL]. Subscribe to this LinkedIn newsletter for weekly editions.' Do NOT include the full newsletter. This is a teaser that drives clicks to the website."
  }},
  "community_posts": {{
    "slack_post": "Casual, peer-to-peer tone. 100-150 words. Share an insight from the newsletter as a discussion starter. End with 'I wrote more about this here: [URL]'. No self-promo vibe.",
    "reddit_post_title": "Question or statement that invites discussion (no clickbait)",
    "reddit_post_body": "200-250 words. Genuine take that stands alone. Mention the newsletter naturally at the end, not as the point of the post."
  }}
}}

IMPORTANT:
- LinkedIn posts should each be DIFFERENT angles on the newsletter topic, not repetitions
- Tuesday = hot take with newsletter link. Wednesday = pure value, no link. Thursday = framework list. Friday = personal story.
- Each post's first line must hook. Use line breaks after the hook for readability.
- Community posts should feel like a peer sharing, not a marketer promoting.
- No em dashes anywhere."""

    raw = call_claude(system_prompt, user_prompt, max_tokens=6000)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r'^```(?:json)?\s*\n?', '', raw)
        raw = re.sub(r'\n?```\s*$', '', raw)

    data = json.loads(raw)

    slug = meta['slug']
    week_dir = DISTRIBUTION_DIR / slug
    week_dir.mkdir(exist_ok=True)

    # Write LinkedIn posts
    posts_content = f"# LinkedIn Posts — {meta['title']}\n"
    posts_content += f"# Newsletter URL: https://churnisdead.com/newsletter/{slug}\n"
    posts_content += f"# Generated: {datetime.utcnow().strftime('%Y-%m-%d')}\n\n"

    for i, post in enumerate(data['linkedin_posts'], 1):
        posts_content += f"{'='*60}\n"
        posts_content += f"POST {i} — {post['day'].upper()}\n"
        posts_content += f"Strategy: {post['strategy']}\n"
        posts_content += f"{'='*60}\n\n"
        posts_content += f"{post['body']}\n\n\n"

    (week_dir / "linkedin_posts.md").write_text(posts_content)
    print(f"   LinkedIn posts: {week_dir / 'linkedin_posts.md'}")

    # Write LinkedIn Newsletter edition
    ln = data['linkedin_newsletter']
    ln_content = f"# LinkedIn Newsletter Edition\n"
    ln_content += f"# Title: {ln['title']}\n"
    ln_content += f"# Copy everything below the line into LinkedIn Newsletter editor\n\n"
    ln_content += f"---\n\n{ln['body']}\n"
    (week_dir / "linkedin_newsletter.md").write_text(ln_content)
    print(f"   LinkedIn newsletter: {week_dir / 'linkedin_newsletter.md'}")

    # Write community posts
    cp = data['community_posts']
    comm_content = f"# Community Cross-Posts — {meta['title']}\n\n"
    comm_content += f"## Slack (Gain Grow Retain / CS Insider)\n\n{cp['slack_post']}\n\n"
    comm_content += f"---\n\n## Reddit (r/CustomerSuccess)\n\n"
    comm_content += f"**Title:** {cp['reddit_post_title']}\n\n{cp['reddit_post_body']}\n"
    (week_dir / "community_posts.md").write_text(comm_content)
    print(f"   Community posts: {week_dir / 'community_posts.md'}")

    return week_dir


# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════

def main():
    topic = os.environ.get("TOPIC_OVERRIDE", "").strip() or None
    print("=" * 60)
    print("CHURN IS DEAD \u2014 Newsletter Generator v3")
    print("=" * 60)

    print("\n\U0001f4dd Generating newsletter + playbook structure...")
    data = generate_newsletter_and_playbook(topic)
    meta = data['metadata']
    content = data['newsletter_content']
    pb = data['playbook']
    print(f"   Title: {meta['title']}")
    print(f"   Sections: {len(pb.get('sections', []))}")

    Path("/tmp/newsletter_title.txt").write_text(meta['title'])
    Path("/tmp/newsletter_slug.txt").write_text(meta['slug'])

    print("\n\U0001f4c4 Building playbook PDF...")
    pdf_name = meta.get('pdf_filename', f"{meta['slug'].replace('-','_')}_ChurnIsDead.pdf")
    pdf_path = PDFS_DIR / pdf_name
    build_playbook_pdf(pb, meta, pdf_path)

    print("\n📡 Inserting newsletter into Supabase...")
    pub = get_next_tuesday()
    insert_newsletter_via_api(content, meta, pub)

    print("\n\U0001f4e3 Generating distribution content...")
    try:
        dist_dir = generate_distribution_content(content, meta)
        print(f"   Output: {dist_dir}")
    except Exception as e:
        print(f"   \u26a0\ufe0f  Distribution generation failed (non-fatal): {e}")

    print(f"\n\u2705 Done! Goes live: {pub}")
    print(f"   Newsletter + PDF + migration + distribution content ready.")
    print(f"   Social media manager: check distribution/{meta['slug']}/")


if __name__ == "__main__":
    main()
