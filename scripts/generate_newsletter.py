#!/usr/bin/env python3
"""
Churn Is Dead — Automated Newsletter Generator
Runs every Sunday via GitHub Actions.
Calls Claude API to write newsletter, generates playbook PDF, creates SQL migration.
"""

import anthropic
import json
import os
import re
import uuid
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

# ─── CONFIG ───
REPO_ROOT = Path(__file__).parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
PDFS_DIR = REPO_ROOT / "public" / "pdfs"
SCRIPTS_DIR = REPO_ROOT / "scripts"

def get_next_tuesday():
    """Get next Tuesday at 08:00 UTC (6:00 PM AEST)"""
    today = datetime.utcnow()
    days_ahead = 1 - today.weekday()  # Tuesday = 1
    if days_ahead <= 0:
        days_ahead += 7
    tuesday = today + timedelta(days=days_ahead)
    return tuesday.strftime("%Y-%m-%dT08:00:00+00:00")


def get_existing_topics():
    """Scan existing migrations to find previously published newsletter topics"""
    topics = []
    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        content = f.read_text()
        # Extract titles from INSERT statements
        match = re.search(r"INSERT INTO public\.newsletters.*?VALUES\s*\(\s*'([^']+)'", content, re.DOTALL)
        if match:
            topics.append(match.group(1))
        # Also check E'' style strings
        match = re.search(r"INSERT INTO public\.newsletters.*?VALUES\s*\(\s*E?'([^']+)'", content, re.DOTALL)
        if match and match.group(1) not in topics:
            topics.append(match.group(1))
    return topics


def call_claude(system_prompt, user_prompt, max_tokens=8000):
    """Call Claude API"""
    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    return message.content[0].text


def generate_newsletter_content(topic_override=None):
    """Generate the newsletter content via Claude API"""
    
    existing_topics = get_existing_topics()
    existing_list = "\n".join(f"- {t}" for t in existing_topics) if existing_topics else "None yet"
    
    system_prompt = """You are Kuber Sethi, the author of "Churn Is Dead" — a weekly newsletter for enterprise Customer Success professionals. 

Your voice is:
- Contrarian and direct — you challenge CS industry orthodoxy
- Story-driven — every issue opens with a specific, vivid scenario (real or realistic composite)
- Framework-backed — every issue introduces a named framework with actionable components
- Enterprise-focused — your examples involve large accounts, complex deployments, multi-year deals
- Anti-fluff — you have zero patience for vague CS platitudes

Your newsletter structure is ALWAYS:
1. Opening story (vivid, specific scenario that hooks the reader)
2. The contrarian thesis (what the industry gets wrong)
3. The "lies" or "myths" or "failure modes" section (2-5 numbered breakdowns)
4. The framework (named, numbered, with specific action steps)
5. Playbook CTA section (listing what the downloadable audit includes)
6. Sign-off with P.S. that invites engagement

Format: Markdown with ## headers, **bold** for emphasis, --- for section breaks.
Length: ~2,500 words.

CRITICAL: The CTA for the playbook download MUST use this exact format:
[CTA link="/pdfs/FILENAME.pdf"]Download the PLAYBOOK NAME[/CTA]

The filename should be Title_Case_ChurnIsDead.pdf"""

    if topic_override:
        topic_instruction = f"Write about this specific topic: {topic_override}"
    else:
        topic_instruction = """Pick the best topic for this week's newsletter. Choose something that:
- Has NOT been covered before (see existing topics below)
- Is timely and relevant to CS professionals in 2026
- Gives you strong contrarian angle potential
- Lends itself to a named framework with actionable diagnostics

Consider topics like: CS org design failures, the QBR death spiral, why CS hiring is broken, 
the onboarding handoff disaster, customer advocacy theater, the metrics that actually predict 
expansion, why CS and product alignment is a myth, the enterprise vs SMB CS identity crisis,
why most CS playbooks are useless, the customer segmentation lie, or anything else that would 
make CS LinkedIn uncomfortable."""

    user_prompt = f"""EXISTING NEWSLETTER TOPICS (do NOT repeat these):
{existing_list}

{topic_instruction}

Write the complete newsletter now. Remember:
1. Open with a vivid, specific story
2. Include your contrarian thesis
3. Break down the myths/lies/failure modes
4. Present a named framework with numbered components and action steps
5. End with a playbook CTA section listing 5 specific tools in the audit
6. Sign off as Kuber with a P.S. that drives engagement

Also, at the very end of your response, add a metadata block in this exact format:

---METADATA---
TITLE: [Newsletter title]
SLUG: [url-friendly-slug]
EXCERPT: [One compelling sentence for the archive page, max 200 chars]
CATEGORY: [Short category label, e.g., "AI & Automation", "Revenue Strategy", "Team Design"]
READ_TIME: [e.g., "9 min read"]
PDF_FILENAME: [Title_Case_Audit_ChurnIsDead.pdf]
PLAYBOOK_TITLE: [e.g., "The QBR Transformation Audit"]
---END_METADATA---"""

    return call_claude(system_prompt, user_prompt)


def generate_playbook_content(newsletter_content, metadata):
    """Generate the playbook PDF content via Claude API"""
    
    system_prompt = """You are generating a Python script that creates a professional PDF playbook 
for the "Churn Is Dead" newsletter series. The PDF uses reportlab and follows a specific design system.

The design system uses:
- Colors: ACCENT = HexColor("#C8553D") (rust red), BLACK/CHARCOAL for text, WARM_BG for alt rows
- Font: Helvetica family only
- Layout: Letter size, 0.9 inch margins
- Components: Cover page, scoring rubrics (1-5 scale), diagnostic questions with checkboxes, 
  fill-in tables, callout boxes with left rust border, section headers with "SECTION 01" labels,
  final scorecard page, closing quote + "— Kuber" signature

Each playbook has:
- Cover page with title, subtitle, "Created by: Kuber Sethi", "churnisdead.com"
- "How to Use This Audit" page with scoring overview table
- 4-5 sections, each with: diagnostic questions (checkboxes), a worksheet table, scoring rubric, "Your Score: ____ / 5"
- Final scorecard aggregating all sections with interpretation table
- Closing quote and signature

CRITICAL: Output ONLY the Python script. No markdown, no explanation. Just the script.
The script must save the PDF to the path provided in the PLAYBOOK_OUTPUT_PATH environment variable."""

    user_prompt = f"""Based on this newsletter content, create a complete Python script that generates 
the matching playbook PDF.

NEWSLETTER CONTENT:
{newsletter_content}

PLAYBOOK TITLE: {metadata['playbook_title']}
OUTPUT PATH: Will be read from os.environ["PLAYBOOK_OUTPUT_PATH"]

Generate the complete Python script now. Use reportlab. Follow the Churn Is Dead design system exactly.
The script must be self-contained and runnable."""

    return call_claude(system_prompt, user_prompt, max_tokens=12000)


def parse_metadata(raw_response):
    """Extract metadata from the Claude response"""
    metadata_match = re.search(r'---METADATA---\s*\n(.+?)\n---END_METADATA---', raw_response, re.DOTALL)
    if not metadata_match:
        raise ValueError("No metadata block found in Claude response")
    
    metadata_text = metadata_match.group(1)
    metadata = {}
    for line in metadata_text.strip().split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            metadata[key.strip().lower()] = value.strip()
    
    # Clean the newsletter content (remove metadata block)
    content = raw_response[:raw_response.index('---METADATA---')].strip()
    
    return content, metadata


def escape_sql_string(s):
    """Escape a string for PostgreSQL E'' syntax"""
    s = s.replace("\\", "\\\\")
    s = s.replace("'", "''")
    s = s.replace("\n", "\\n")
    s = s.replace("\r", "")
    s = s.replace("\t", "\\t")
    return s


def create_migration(content, metadata, publish_date):
    """Create a Supabase migration file"""
    escaped_content = escape_sql_string(content)
    escaped_title = metadata['title'].replace("'", "''")
    escaped_excerpt = metadata['excerpt'].replace("'", "''")
    escaped_category = metadata.get('category', 'Strategy').replace("'", "''")
    
    sql = f"""INSERT INTO public.newsletters (title, slug, excerpt, content, published_date, read_time, category)
VALUES (
  '{escaped_title}',
  '{metadata['slug']}',
  '{escaped_excerpt}',
  E'{escaped_content}',
  '{publish_date}',
  '{metadata.get('read_time', '9 min read')}',
  '{escaped_category}'
);
"""
    
    # Generate migration filename: YYYYMMDDHHMMSS_UUID.sql
    now = datetime.utcnow()
    timestamp = now.strftime("%Y%m%d%H%M%S")
    migration_uuid = str(uuid.uuid4())[:8] + "-" + str(uuid.uuid4())[9:13] + "-" + str(uuid.uuid4())[14:18] + "-" + str(uuid.uuid4())[19:23] + "-" + str(uuid.uuid4())[24:36]
    filename = f"{timestamp}_{migration_uuid}.sql"
    
    filepath = MIGRATIONS_DIR / filename
    filepath.write_text(sql)
    print(f"Migration created: {filepath}")
    return filepath


def main():
    topic_override = os.environ.get("TOPIC_OVERRIDE", "").strip() or None
    
    print("=" * 60)
    print("CHURN IS DEAD — Newsletter Generator")
    print("=" * 60)
    
    # Step 1: Generate newsletter
    print("\n📝 Step 1: Generating newsletter content...")
    raw_response = generate_newsletter_content(topic_override)
    content, metadata = parse_metadata(raw_response)
    print(f"   Title: {metadata['title']}")
    print(f"   Slug: {metadata['slug']}")
    print(f"   Category: {metadata.get('category', 'N/A')}")
    
    # Save title for git commit message
    Path("/tmp/newsletter_title.txt").write_text(metadata['title'])
    
    # Step 2: Generate playbook PDF
    print("\n📄 Step 2: Generating playbook PDF...")
    pdf_filename = metadata.get('pdf_filename', f"{metadata['slug'].replace('-', '_')}_ChurnIsDead.pdf")
    pdf_path = PDFS_DIR / pdf_filename
    
    os.environ["PLAYBOOK_OUTPUT_PATH"] = str(pdf_path)
    playbook_script = generate_playbook_content(content, metadata)
    
    # Clean the script (remove markdown code fences if present)
    playbook_script = re.sub(r'^```python\s*\n?', '', playbook_script)
    playbook_script = re.sub(r'\n?```\s*$', '', playbook_script)
    
    # Write and execute the playbook script
    script_path = Path("/tmp/generate_playbook.py")
    script_path.write_text(playbook_script)
    
    result = subprocess.run(
        ["python", str(script_path)],
        capture_output=True, text=True,
        env={**os.environ, "PLAYBOOK_OUTPUT_PATH": str(pdf_path)}
    )
    
    if result.returncode != 0:
        print(f"   ⚠️  Playbook generation failed: {result.stderr[:500]}")
        print("   Attempting retry with simplified playbook...")
        # Fallback: create a minimal PDF
        create_fallback_pdf(pdf_path, metadata)
    else:
        print(f"   PDF created: {pdf_path}")
    
    # Step 3: Create migration
    print("\n🗄️  Step 3: Creating SQL migration...")
    publish_date = get_next_tuesday()
    migration_path = create_migration(content, metadata, publish_date)
    print(f"   Publish date: {publish_date}")
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ DONE!")
    print(f"   Newsletter: {metadata['title']}")
    print(f"   PDF: {pdf_path}")
    print(f"   Migration: {migration_path}")
    print(f"   Goes live: {publish_date}")
    print("=" * 60)


def create_fallback_pdf(pdf_path, metadata):
    """Create a minimal playbook PDF if the AI-generated script fails"""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    
    ACCENT = HexColor("#C8553D")
    BLACK = HexColor("#0D0D0D")
    MID_GRAY = HexColor("#6B6B6B")
    
    doc = SimpleDocTemplate(str(pdf_path), pagesize=letter,
                            leftMargin=0.9*inch, rightMargin=0.9*inch,
                            topMargin=0.8*inch, bottomMargin=0.7*inch)
    
    story = []
    story.append(Spacer(1, 60))
    story.append(Paragraph("CHURN IS DEAD", ParagraphStyle('b', fontName='Helvetica-Bold', 
                           fontSize=12, textColor=ACCENT, letterSpacing=4)))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="30%", thickness=2, color=ACCENT, hAlign='LEFT'))
    story.append(Spacer(1, 16))
    
    title = metadata.get('playbook_title', 'Playbook')
    story.append(Paragraph(title, ParagraphStyle('t', fontName='Helvetica-Bold',
                           fontSize=32, textColor=BLACK, leading=40)))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Full playbook coming soon. Visit churnisdead.com for the latest frameworks.",
                           ParagraphStyle('s', fontName='Helvetica', fontSize=13, textColor=MID_GRAY, leading=20)))
    story.append(Spacer(1, 40))
    story.append(Paragraph("— Kuber", ParagraphStyle('sig', fontName='Helvetica-Bold', 
                           fontSize=11, textColor=BLACK)))
    
    doc.build(story)
    print(f"   Fallback PDF created: {pdf_path}")


if __name__ == "__main__":
    main()
