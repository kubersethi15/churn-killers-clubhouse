#!/usr/bin/env python3
"""
Churn Is Dead — Automated Newsletter Generator v4
3-Stage Pipeline with Web Search Research

Runs every Sunday via GitHub Actions.
1. Stage 1: Research & Intelligence (with web search)
2. Stage 2: Topic Selection & Angle Development
3. Stage 3: Newsletter Writing with quality scoring
4. Deterministic PDF playbook builder
5. Supabase API insert
6. Distribution content generator (LinkedIn, Reddit, Slack)
"""

import anthropic
import json
import os
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

# --- PATHS ---
REPO_ROOT = Path(__file__).parent.parent
MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"
PDFS_DIR = REPO_ROOT / "public" / "pdfs"
DISTRIBUTION_DIR = REPO_ROOT / "distribution"


# ===============================================================
# UTILITIES
# ===============================================================

def get_next_tuesday():
    today = datetime.now(timezone.utc)
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


def clean_json_response(raw):
    """Extract and parse JSON from Claude's response, handling mixed text from web search."""
    text = raw.strip()

    # Try direct parse first (fastest path)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strip markdown fences
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```', '', text)
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Find the outermost JSON object in mixed text (web search responses)
    # Look for the first { and find its matching }
    start = text.find('{')
    if start == -1:
        raise json.JSONDecodeError("No JSON object found in response", text, 0)

    depth = 0
    in_string = False
    escape = False
    for i in range(start, len(text)):
        c = text[i]
        if escape:
            escape = False
            continue
        if c == '\\' and in_string:
            escape = True
            continue
        if c == '"' and not escape:
            in_string = not in_string
            continue
        if in_string:
            continue
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i+1])
                except json.JSONDecodeError:
                    # Try finding next JSON object
                    next_start = text.find('{', i+1)
                    if next_start != -1:
                        start = next_start
                        depth = 0
                        continue
                    raise

    raise json.JSONDecodeError("No complete JSON object found in response", text, 0)


def call_claude(system_prompt, user_prompt, max_tokens=8000, tools=None):
    client = anthropic.Anthropic()
    kwargs = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    if tools:
        kwargs["tools"] = tools
    message = client.messages.create(**kwargs)
    text_parts = []
    for block in message.content:
        if hasattr(block, 'text'):
            text_parts.append(block.text)
    return "\n".join(text_parts)

# ===============================================================
# STAGE 1: RESEARCH & INTELLIGENCE (WITH WEB SEARCH)
# ===============================================================

RESEARCH_SYSTEM_PROMPT = """You are a senior CS industry analyst with deep knowledge of enterprise Customer Success, \
B2B SaaS operations, revenue retention, and the AI transformation happening across CS teams.

Your job is to produce a weekly intelligence brief covering:
- What CS leaders are debating right now
- What's happening in the broader SaaS/tech landscape that impacts CS
- What frameworks, tools, or approaches are being challenged or adopted
- Where the gap is between what CS leaders SAY and what they actually DO

You have awareness of these ongoing industry dynamics (updated context for 2026):

MACRO TRENDS SHAPING CS RIGHT NOW:
- AI agents are replacing Tier 1 CSM tasks (onboarding, health checks, renewal reminders)
- CFOs are demanding CS prove revenue impact or face cuts
- The "CS owns NRR" narrative is being stress-tested as expansion increasingly moves to sales
- Consolidation in CS platforms (Gainsight, Vitally, ChurnZero, Planhat) is forcing tool strategy decisions
- "Digital CS" has become a buzzword that often means "we fired CSMs and sent more emails"
- The CSM-to-account ratio debate is intensifying (1:50? 1:200? Does it matter?)
- Customer education and community are emerging as CS-adjacent functions
- Product-led growth is challenging traditional high-touch CS models
- CS comp plans are shifting from activity-based to outcome-based
- The VP of CS role is being absorbed into CRO or COO in many orgs

KEY INDUSTRY VOICES AND PUBLISHERS:
- Gainsight (Nick Mehta) -- tends toward optimistic CS evangelism
- Vitally, ChurnZero, Catalyst -- product-driven thought leadership
- CS Insider, Gain Grow Retain -- community-driven practitioner perspectives
- Jason Lemkin / SaaStr -- investor/founder perspective on CS ROI
- LinkedIn CS creator ecosystem -- increasingly commoditized advice
- McKinsey, Bain reports on customer retention -- enterprise strategy lens

COMMON CS DEBATES IN 2026:
- Should CS own renewals or just influence them?
- Is the CSM role dying or evolving?
- Health scores: useful or theater?
- QBRs: strategic or performative?
- CS platforms: essential infrastructure or expensive dashboards?
- Should CS report to CRO, CEO, or COO?
- Digital CS vs human CS: where's the line?
- Customer segmentation: by ARR, by complexity, or by potential?
- The proactive vs reactive myth: are CSMs actually proactive?
- Onboarding: CS responsibility or product responsibility?

IMPORTANT: Use your web search tool to find CURRENT news, posts, and developments in the CS industry. \
Search for recent CS layoffs, AI in customer success, SaaS earnings mentioning NRR or churn, \
CS platform announcements, and what CS leaders are posting on LinkedIn this week.

Return ONLY valid JSON. No markdown fences. No explanation."""

RESEARCH_USER_PROMPT = """Generate this week's CS industry intelligence brief.

Use web search to find current information about:
1. Recent CS team layoffs, reorgs, or hiring freezes at SaaS companies
2. New AI tools or announcements affecting CS teams
3. Recent SaaS earnings calls mentioning NRR, churn, or customer retention
4. What CS leaders are debating on LinkedIn and in communities this week
5. Any recent Gainsight, Vitally, ChurnZero, or other CS platform news

Then think about:
1. What would a VP of CS at a Fortune 500 tech company be worrying about THIS WEEK?
2. What "accepted wisdom" in CS is starting to crack under real-world pressure?
3. What are CSMs experiencing on the ground that leadership isn't seeing?

Return a JSON object:

{
  "web_research_summary": "Brief summary of what you found from web searches this week",
  "top_tensions": [
    {
      "tension": "Brief description of an industry tension or debate",
      "why_now": "Why this is acute right now, not 6 months ago",
      "conventional_take": "What most CS leaders would say about this",
      "contrarian_reality": "What's actually true that people don't want to admit",
      "who_feels_this": "Which CS personas feel this most acutely"
    }
  ],
  "enterprise_reality_check": {
    "what_leaders_say": "The narrative CS leadership pushes",
    "what_actually_happens": "What frontline CSMs and data actually show",
    "the_gap": "Where the disconnect creates real damage"
  },
  "underexplored_angles": [
    "Topic or angle that hasn't been beaten to death yet but matters deeply"
  ],
  "framework_opportunities": [
    {
      "concept": "A named framework concept that could become a signature tool",
      "problem_it_solves": "The specific operational problem this addresses",
      "why_existing_approaches_fail": "Why current solutions don't work"
    }
  ]
}

Generate 5 top_tensions, 3 underexplored_angles, and 3 framework_opportunities.
Be specific, not generic. Reference real dynamics, not platitudes."""


def run_stage_1_research():
    print("\n   Stage 1: Researching CS industry landscape...")
    raw = call_claude(
        RESEARCH_SYSTEM_PROMPT,
        RESEARCH_USER_PROMPT,
        max_tokens=4000,
        tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 5}]
    )
    try:
        data = clean_json_response(raw)
        print(f"   Research complete: {len(data.get('top_tensions', []))} tensions identified")
        if data.get('web_research_summary'):
            print(f"   Web research: {data['web_research_summary'][:120]}...")
        return raw
    except json.JSONDecodeError as e:
        print(f"   Research JSON parse failed: {e}")
        print(f"   Raw response length: {len(raw)} chars")
        print(f"   First 200 chars: {raw[:200]}...")
        print("   Using raw text as context for Stage 2 (this still works)")
        return raw

# ===============================================================
# STAGE 2: TOPIC SELECTION & ANGLE DEVELOPMENT
# ===============================================================

TOPIC_SYSTEM_PROMPT = """You are the editorial strategist for "Churn Is Dead," a weekly newsletter by Kuber Sethi \
that has become essential reading for enterprise CS leaders who are tired of recycled advice.

Your job is to select THIS WEEK'S topic and develop a sharp angle that will:
1. Make a senior CS leader stop scrolling and read the full piece
2. Challenge something they believe but haven't examined
3. Give them a framework they can use in their next leadership meeting
4. Position Kuber Sethi as someone who sees what others miss

TOPIC SELECTION CRITERIA (in order of priority):
1. URGENCY -- Is this something CS leaders need to think about RIGHT NOW?
2. CONTRARIAN CREDIBILITY -- Can we take a position that's defensible AND surprising?
3. FRAMEWORK POTENTIAL -- Can we name a framework that becomes a tool people reference?
4. PERSONAL AUTHORITY -- Can Kuber speak to this from direct enterprise experience?
5. SHAREABILITY -- Would a CS leader share this with their team or their CEO?

HEADLINE RULES -- CRITICAL:
You MUST rotate headline structures. NEVER use "Your [X] Are [Y]" again. That formula has been used \
for the last 8 issues straight and readers will tune it out.

Choose ONE of these headline structures this week:
- The declaration: "CS Teams Don't Have a Churn Problem. They Have a Courage Problem."
- The question nobody asks: "What If Your Best Customers Are Your Worst Investment?"
- The counter-narrative: "The Case Against Customer Health Scores"
- The provocation: "Fire Your QBR. Here's What to Do Instead."
- The insider confession: "I Stopped Running QBRs. Here's What Happened."
- The reframe: "Retention Isn't a CS Problem. It's a Product Problem."
- The numbered: "3 Things Your CFO Knows About CS That You Don't"

The headline should feel like something a real person would say out loud in a meeting, not a content \
marketing template.

ANGLE DEVELOPMENT RULES:
- The opening must tell a story from the trenches, not cite a statistic
- The contrarian take must be EARNED through evidence, not just provocative for clicks
- The framework must have a memorable name and be immediately applicable
- The playbook must be something a CSM can use Monday morning

Return ONLY valid JSON. No markdown fences."""

TOPIC_USER_PROMPT_TEMPLATE = """RESEARCH BRIEF:
{research_brief}

EXISTING TOPICS (do NOT repeat or closely overlap):
{existing_topics}

KUBER'S CONTEXT (use to inform angle, not to mention directly):
- Customer Success Engineer at Splunk managing a large portfolio of top-tier enterprise accounts
- Sees the gap between CS strategy decks and frontline execution daily
- Works with Fortune 500 accounts where CS is existential, not decorative
- Has direct experience with the tension between CS as cost center vs revenue driver
- Lives the reality of AI tools being pushed on CS teams without solving real problems
- Based in Australia, giving a global perspective vs the US-centric CS echo chamber

Select the single best topic for this week and develop the full angle.

CRITICAL: Check the existing topics list. Your title MUST NOT follow the "Your [X] Are [Y]" pattern.
Use one of the headline structures from the system prompt.

Also select a STRUCTURAL TEMPLATE for this issue (rotate -- don't repeat the same one two weeks in a row):
- "myth_buster": Open with scene, then 3-5 lies/myths demolished, then framework, then action
- "case_study": Extended opening story (500+ words), then the lesson, then framework
- "manifesto": Bold declaration opening, philosophical argument, then practical framework
- "interview_style": Written as if answering a reader question, conversational, then framework
- "before_after": Show the broken state in detail, then show the transformed state, framework bridges the gap
- "letter_to": Written as a direct letter to a specific persona (Dear VP of CS, Dear CFO, Dear CSM)

Return:
{{
  "selected_topic": {{
    "title": "Headline using a FRESH structure (NOT 'Your X Are Y')",
    "slug": "url-friendly-slug",
    "structural_template": "One of: myth_buster, case_study, manifesto, interview_style, before_after, letter_to",
    "thesis": "The core argument in 2 sentences. What do you believe that most CS leaders don't?",
    "why_this_week": "Why this topic is more relevant now than any other week",
    "opening_story_seed": "A 2-sentence scenario. NEVER use the name Sarah. Use a specific role title instead of a name (e.g. 'A VP of CS at a Series D company' or 'The head of enterprise accounts'). Or open without a character at all.",
    "contrarian_position": "The uncomfortable truth, stated plainly",
    "what_readers_will_feel": "The emotional arc: called out, curious, equipped, motivated",
    "framework_name": "A memorable 2-4 word name for the framework",
    "framework_components": ["Component 1", "Component 2", "Component 3", "Component 4"],
    "playbook_concept": "What the downloadable audit/playbook should measure",
    "who_shares_this": "Which persona shares this and what they say when they do"
  }},
  "rejected_alternatives": [
    {{
      "topic": "Alternative topic considered",
      "why_rejected": "Why this wasn't the best choice this week"
    }}
  ]
}}"""


def run_stage_2_topic_selection(research_brief, existing_topics):
    print("\n   Stage 2: Selecting topic and developing angle...")
    existing_list = "\n".join(f"- {t}" for t in existing_topics) if existing_topics else "None yet"
    user_prompt = TOPIC_USER_PROMPT_TEMPLATE.format(
        research_brief=research_brief,
        existing_topics=existing_list
    )
    raw = call_claude(TOPIC_SYSTEM_PROMPT, user_prompt, max_tokens=3000)
    data = clean_json_response(raw)
    topic = data.get("selected_topic", {})
    print(f"   Topic selected: {topic.get('title', 'Unknown')}")
    print(f"   Framework: {topic.get('framework_name', 'TBD')}")
    rejected = data.get("rejected_alternatives", [])
    if rejected:
        print(f"   Rejected {len(rejected)} alternatives:")
        for alt in rejected[:3]:
            print(f"      - {alt.get('topic', '?')}: {alt.get('why_rejected', '')[:60]}...")
    return raw

# ===============================================================
# STAGE 3: NEWSLETTER WRITING
# ===============================================================

WRITING_SYSTEM_PROMPT = """You are Kuber Sethi, writing this week's edition of "Churn Is Dead."

YOUR VOICE -- memorize this:
- You write like a senior operator who's seen the bullshit and is done tolerating it
- You're not angry. You're precise. There's a difference.
- You tell stories from the enterprise trenches. Not "Company X did Y" case studies. \
Real moments: the awkward QBR, the Slack message that revealed the truth, \
the dashboard everyone ignores, the exec who asked the question no one could answer.
- You name things. You create frameworks. You give people language for problems \
they felt but couldn't articulate.
- You respect your reader. They're smart, experienced, and busy. Don't over-explain. \
Don't hedge. Don't add disclaimers.
- You're Australian with global enterprise experience. You see the US-centric CS \
bubble from outside and call out its blind spots.

ANTI-REPETITION RULES -- CRITICAL:
These rules exist because the last 8 issues were structurally identical. Break the pattern.

1. CHARACTER NAMES: NEVER use the name "Sarah." NEVER use any recurring character name. \
Instead, vary your approach:
   - Use role titles: "A VP of CS at a mid-market SaaS company", "The head of renewals"
   - Use first person: "I was sitting in a QBR when..."
   - Use second person: "You open your laptop on Monday morning. Fourteen Slack notifications..."
   - Use no character at all: Open with a bold statement, a data point, or an observation
   - If you must name someone, pick a DIFFERENT name each time and only use it once

2. OPENING VARIETY: You MUST match the structural_template from the topic brief. \
Do NOT default to "Character walks into meeting with slides." Options:
   - Drop into a specific moment mid-action (in medias res)
   - Open with a bold, declarative statement that challenges conventional wisdom
   - Start with a question the reader has never been asked
   - Begin with "I" -- a personal anecdote from your own CS career
   - Open with a conversation or dialogue snippet
   - Start with a number or data point that reframes the entire topic

3. BODY STRUCTURE: Follow the structural_template specified in the topic brief:

   "myth_buster": Opening scene (200 words) > The Turn (100 words) > 3-5 Lies demolished > \
Framework > Action steps > Close

   "case_study": Extended story (500 words, detailed, specific) > What went wrong and why > \
Framework as the solution > How it would have changed the outcome > Action steps > Close

   "manifesto": Bold opening declaration (no story) > Why the industry got this wrong > \
The philosophical argument > The practical framework > Action steps > Close

   "interview_style": "A reader asked me..." opening > Unpack the question > Why the obvious \
answer is wrong > The real answer (framework) > Action steps > Close

   "before_after": Paint the "broken" state vividly > Transition > Paint the "fixed" state > \
The framework that bridges them > Action steps > Close

   "letter_to": "Dear [persona]," > Direct address throughout > The hard truth they need to hear > \
The framework that solves it > Specific asks > Sign off within the letter, then Kuber close

4. SECTION HEADERS: Do NOT always use "Lie #1, Lie #2" or numbered myths. Vary headers:
   - Use questions as headers
   - Use declarative statements
   - Use "The [X] Problem" format
   - Use dialogue as headers ("But our customers love us")
   - Mix formats within a single issue

5. CLOSING VARIETY: Do NOT always end with the same formula. Rotate:
   - End with a single provocative question
   - End with a prediction about the industry
   - End with a direct challenge to the reader
   - End with a callback to the opening story
   - End with a brief personal reflection

STYLE RULES:
- Maximum 3 em dashes in the entire piece. Use periods, commas, colons instead.
- No "In today's landscape" or "Let's dive in" or "Here's the thing" or "At the end of the day"
- No rhetorical questions used as transitions (e.g., "So what does this mean?")
- No "Here's the uncomfortable truth" -- this phrase has appeared in every recent issue. Find new language.
- Paragraphs: 2-4 sentences max. White space is your friend.
- Bold used for framework component names and section headers ONLY. Not for emphasis.
- Use "you" and "your" -- talk TO the reader, not ABOUT CS in general
- Numbers and data when they serve the argument, but never as the opening
- End sections with a punch line, not a summary
- Vary sentence length. Mix short punchy lines with longer, more complex ones.

FORMATTING:
- Use ## for main section headers
- Use **bold** for framework component names
- Use --- for section breaks
- Use numbered lists for framework components and action steps
- Total length: 2,200-2,800 words
- CTA format: [CTA link="/pdfs/FILENAME.pdf"]Download the FRAMEWORK NAME[/CTA]

Return ONLY valid JSON. No markdown fences."""

WRITING_USER_PROMPT_TEMPLATE = """TOPIC BRIEF:
{topic_brief}

RESEARCH CONTEXT:
{research_brief}

Write this week's newsletter. Follow the structure and quality bar exactly.

Return a JSON object with this structure:

{{
  "metadata": {{
    "title": "Newsletter title from the topic brief",
    "slug": "url-friendly-slug from topic brief",
    "excerpt": "One compelling sentence for archive page, max 200 chars",
    "category": "Short category e.g. Strategy, AI & Automation, Team Design, Revenue, Operations",
    "read_time": "X min read",
    "pdf_filename": "Framework_Name_Audit_ChurnIsDead.pdf",
    "playbook_title": "The Framework Name Audit",
    "playbook_description": "Brief description of what the playbook contains"
  }},
  "newsletter_content": "FULL NEWSLETTER IN MARKDOWN following the exact structure above",
  "quality_self_check": {{
    "specificity_score": "1-10 with brief justification",
    "shareability_score": "1-10 with brief justification",
    "actionability_score": "1-10 with brief justification",
    "originality_score": "1-10 with brief justification",
    "memorability_score": "1-10 with brief justification",
    "overall": "Average score. If below 7, explain what's weak and how it could improve."
  }},
  "playbook": {{
    "title": "The Framework Name Audit",
    "subtitle": "A diagnostic tool for CS teams",
    "intro_text": "1-2 sentence intro for the playbook",
    "scoring_note": "Rate each item 1-5. 1 = not happening, 5 = embedded in operations.",
    "sections": [
      {{
        "title": "Section Title (matches framework component)",
        "why_it_matters": "1-2 sentences on why this dimension matters",
        "headers": ["Criteria", "What Good Looks Like", "What Bad Looks Like"],
        "col_ratios": [0.28, 0.36, 0.36],
        "rows": [
          ["Specific measurable criteria", "Description of excellence", "Description of failure"]
        ],
        "rubric": [
          ["Rubric criteria description", "1-5"]
        ]
      }}
    ],
    "closing_quote": "A memorable closing line from the newsletter"
  }}
}}

CRITICAL: If your quality_self_check overall score is below 7, REWRITE before returning.
The reader deserves your best work. Their career might depend on what you write."""


def run_stage_3_newsletter(topic_brief, research_brief):
    print("\n   Stage 3: Writing newsletter...")
    user_prompt = WRITING_USER_PROMPT_TEMPLATE.format(
        topic_brief=topic_brief,
        research_brief=research_brief
    )
    raw = call_claude(WRITING_SYSTEM_PROMPT, user_prompt, max_tokens=12000)
    data = clean_json_response(raw)

    quality = data.get('quality_self_check', {})
    overall_str = str(quality.get('overall', '0'))
    overall_match = re.search(r'(\d+\.?\d*)', overall_str)
    overall = float(overall_match.group(1)) if overall_match else 0

    print(f"   Quality score: {overall}/10")
    if overall < 7:
        print(f"   Below quality bar ({overall}/10) -- triggering rewrite...")
        raw = call_claude(
            WRITING_SYSTEM_PROMPT,
            user_prompt + "\n\nYour previous attempt scored below 7. Write a stronger version.",
            max_tokens=12000
        )
        data = clean_json_response(raw)
        quality = data.get('quality_self_check', {})
        overall_match = re.search(r'(\d+\.?\d*)', str(quality.get('overall', '0')))
        overall = float(overall_match.group(1)) if overall_match else 0
        print(f"   Rewrite quality score: {overall}/10")

    print(f"   Newsletter written: {data.get('metadata', {}).get('title', 'Unknown')}")
    return data


# ===============================================================
# CONTENT PIPELINE ORCHESTRATOR
# ===============================================================

def generate_newsletter_and_playbook(topic_override=None):
    existing_topics = get_existing_topics()

    if topic_override:
        print(f"   Topic override: {topic_override}")
        research_brief = "Topic was manually specified. No research phase."
        topic_brief = json.dumps({
            "selected_topic": {
                "title": topic_override,
                "slug": re.sub(r'[^a-z0-9]+', '-', topic_override.lower()).strip('-'),
                "thesis": "Manually specified topic.",
                "why_this_week": "Manual override.",
                "opening_story_seed": "Write a compelling opening scene.",
                "contrarian_position": "The conventional wisdom is wrong.",
                "framework_name": "Custom Framework",
                "framework_components": ["Component 1", "Component 2", "Component 3", "Component 4"],
                "playbook_concept": "Measuring what matters"
            }
        })
    else:
        research_brief = run_stage_1_research()
        topic_brief = run_stage_2_topic_selection(research_brief, existing_topics)

    newsletter = run_stage_3_newsletter(topic_brief, research_brief)
    return newsletter

# ===============================================================
# DETERMINISTIC PDF BUILDER
# ===============================================================

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
        'brand': S('brand', fontName='Helvetica-Bold', fontSize=10, textColor=ACCENT, spaceAfter=2),
        'tt': S('tt', fontName='Helvetica-Bold', fontSize=28, textColor=BLACK, leading=34, spaceAfter=4),
        'sub': S('sub', fontName='Helvetica', fontSize=12, textColor=MID_GRAY, leading=18, spaceAfter=4),
        'intro': S('intro', fontName='Helvetica', fontSize=10.5, textColor=CHARCOAL, leading=17, spaceAfter=6),
        'sh': S('sh', fontName='Helvetica-Bold', fontSize=14, textColor=BLACK, leading=20, spaceBefore=6, spaceAfter=4),
        'se': S('se', fontName='Helvetica', fontSize=10, textColor=CHARCOAL, leading=16),
        'sm': S('sm', fontName='Helvetica', fontSize=8.5, textColor=LIGHT_GRAY, leading=12),
        'th': S('th', fontName='Helvetica-Bold', fontSize=8.5, textColor=WHITE, leading=12),
        'td': S('td', fontName='Helvetica', fontSize=9, textColor=CHARCOAL, leading=14),
        'cb': S('cb', fontName='Helvetica', fontSize=9.5, textColor=CHARCOAL, leading=15),
    }

    def sp(pts): return Spacer(1, pts)
    def hr_line(color=BORDER_LIGHT, width=0.5):
        return HRFlowable(width="100%", thickness=width, color=color, spaceBefore=4, spaceAfter=4)

    def mk_table(data_rows, col_widths):
        styled_data = []
        for ri, row in enumerate(data_rows):
            s = st['th'] if ri == 0 else st['td']
            styled_data.append([Paragraph(str(c), s) for c in row])
        t = Table(styled_data, colWidths=col_widths, repeatRows=1)
        cmds = [
            ('BACKGROUND', (0, 0), (-1, 0), CHARCOAL),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.4, BORDER_LIGHT),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]
        for i in range(1, len(data_rows)):
            bg = WARM_BG if i % 2 == 0 else WHITE
            cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
        t.setStyle(TableStyle(cmds))
        return t

    def cbox(text):
        t = Table([[Paragraph(text, st['cb'])]], colWidths=[CW - 16])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ]))
        return t

    pb = playbook_data
    sections = pb.get('sections', [])
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    class PlaybookDoc(BaseDocTemplate):
        def __init__(self, fn, **kw):
            super().__init__(fn, **kw)
            frame_cover = Frame(ML, MB, CW, PAGE_H - MT - MB, id='cover')
            frame_body = Frame(ML, MB, CW, PAGE_H - MT - MB, id='body')
            self.addPageTemplates([
                PageTemplate(id='Cover', frames=frame_cover, onPage=self._cover_page),
                PageTemplate(id='Body', frames=frame_body, onPage=self._body_page),
            ])

        def _cover_page(self, canvas, doc):
            canvas.saveState()
            canvas.setFillColor(WARM_BG)
            canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1)
            canvas.setStrokeColor(ACCENT)
            canvas.setLineWidth(3)
            canvas.line(ML, PAGE_H - 0.5*inch, PAGE_W - MR, PAGE_H - 0.5*inch)
            canvas.restoreState()

        def _body_page(self, canvas, doc):
            canvas.saveState()
            canvas.setFont("Helvetica-Bold", 7)
            canvas.setFillColor(ACCENT)
            canvas.drawString(ML, PAGE_H - 0.45*inch, "CHURN IS DEAD")
            canvas.setFont("Helvetica", 7)
            canvas.setFillColor(LIGHT_GRAY)
            canvas.drawRightString(PAGE_W - MR, PAGE_H - 0.45*inch, pb.get('title', ''))
            canvas.drawCentredString(PAGE_W/2, 0.4*inch, f"Page {doc.page}")
            canvas.restoreState()

    doc = PlaybookDoc(str(output_path), pagesize=letter)
    story = []

    # Cover page
    story.append(sp(100))
    story.append(Paragraph("CHURN IS DEAD", st['brand']))
    story.append(sp(8))
    story.append(Paragraph(pb.get('title', 'Playbook'), st['tt']))
    story.append(sp(4))
    story.append(hr_line(ACCENT, 1.5))
    story.append(sp(6))
    story.append(Paragraph(pb.get('subtitle', ''), st['sub']))
    story.append(sp(12))
    story.append(cbox(pb.get('intro_text', '')))
    story.append(sp(12))
    story.append(Paragraph(f"<b>Scoring:</b> {pb.get('scoring_note', '')}", st['se']))
    story.append(sp(8))
    for lbl, val in [["Created by", "Kuber Sethi"], ["Source", "churnisdead.com"], ["Version", f"1.0 -- {datetime.now(timezone.utc).strftime('%B %Y')}"]]:
        story.append(Paragraph(f"<b>{lbl}:</b>  {val}", st['sm']))
    story.append(NextPageTemplate('Body'))
    story.append(PageBreak())

    # Section pages
    for si, sec in enumerate(sections, 1):
        story.append(sp(6))
        story.append(Paragraph(f"SECTION {si}", S(f'sn{si}', fontName='Helvetica-Bold', fontSize=9, textColor=ACCENT, leading=12)))
        story.append(Paragraph(sec.get('title', ''), st['sh']))
        story.append(sp(2))
        wim = sec.get('why_it_matters', '')
        if wim:
            story.append(cbox(wim))
            story.append(sp(6))
        hdrs = sec.get('headers', ['Criteria', 'What Good Looks Like', 'What Bad Looks Like'])
        rats = sec.get('col_ratios', [0.28, 0.36, 0.36])
        rows = sec.get('rows', [])
        tdata = [hdrs] + [r + [""]*(len(hdrs)-len(r)) if len(r) < len(hdrs) else r[:len(hdrs)] for r in rows]
        if not tdata or len(tdata) <= 1:
            tdata = [hdrs, ["No criteria defined"] + [""]*(len(hdrs)-1)]
        story.append(mk_table(tdata, [CW*r for r in rats]))
        story.append(sp(8))
        story.append(Paragraph("Score This Section", st['sh']))
        rub = sec.get('rubric', [])
        if rub:
            story.append(mk_table([["Criteria", "Score"]] + rub, [CW*0.78, CW*0.22]))
        story.append(sp(6))
        story.append(Paragraph("<b>Your Score:  ____  / 5</b>", st['se']))
        story.append(PageBreak())

    # Final scorecard
    story.append(sp(12))
    story.append(Paragraph("CHURN IS DEAD", st['brand']))
    story.append(sp(4))
    story.append(Paragraph("Your Scorecard", ParagraphStyle('ftt', fontName='Helvetica-Bold', fontSize=24, textColor=BLACK, leading=30, spaceAfter=6)))
    story.append(hr_line(ACCENT, 1.5))
    story.append(sp(8))
    mx = len(sections)*5
    fd = [["Dimension", "Your Score", "Max"]]
    for i, s in enumerate(sections, 1):
        fd.append([f"{i}. {s.get('title','')}", "____", "5"])
    fd.append(["TOTAL", "____", str(mx)])
    story.append(mk_table(fd, [CW*0.55, CW*0.225, CW*0.225]))
    story.append(sp(12))
    hi = mx
    interp = [
        ["Total Score", "Assessment", "What It Means"],
        [f"{int(hi*0.8)}-{hi}", "Uncuttable", "Embedded, measurable, strategically irreplaceable."],
        [f"{int(hi*0.6)}-{int(hi*0.8)-1}", "Defensible", "Solid but gaps remain. Focus on lowest dimension."],
        [f"{int(hi*0.4)}-{int(hi*0.6)-1}", "Vulnerable", "Real risk ahead. Treat as urgent."],
        [f"{len(sections)}-{int(hi*0.4)-1}", "Critical", "Cannot survive scrutiny. Major changes needed."],
    ]
    story.append(mk_table(interp, [CW*0.15, CW*0.17, CW*0.68]))
    story.append(sp(12))
    story.append(cbox("<b>What to do next:</b> Take your lowest-scoring section and build a 30-day action plan. One at a time. Then share this with leadership -- not to ask permission, but to show you know where the gaps are."))
    story.append(sp(12))
    story.append(hr_line(BORDER_LIGHT, 0.3))
    story.append(sp(4))
    story.append(Paragraph(pb.get('closing_quote', ''), ParagraphStyle('clq', fontName='Helvetica-Oblique', fontSize=10, textColor=MID_GRAY, leading=16)))
    story.append(sp(4))
    story.append(Paragraph("-- Kuber", ParagraphStyle('sig2', fontName='Helvetica-Bold', fontSize=11, textColor=BLACK)))
    story.append(sp(2))
    story.append(Paragraph("churnisdead.com  |  Weekly frameworks that replace hope with strategy.", st['sm']))

    doc.build(story)
    fsize = os.path.getsize(output_path)
    print(f"   PDF created: {output_path} ({fsize:,} bytes)")
    if fsize < 5000:
        raise RuntimeError(f"PDF too small ({fsize} bytes) -- likely failed to build properly")

# ===============================================================
# SUPABASE API INSERT
# ===============================================================

def insert_newsletter_via_api(content, meta, pub_date):
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
            print(f"   Newsletter inserted into Supabase: {result[0]['id']}")
            return result[0]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else "No details"
        raise RuntimeError(f"Supabase API insert failed ({e.code}): {error_body}")


# ===============================================================
# DISTRIBUTION CONTENT GENERATOR
# ===============================================================

def generate_distribution_content(newsletter_content, meta):
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

NEWSLETTER CONTENT (last 1000 chars):
{newsletter_content[-1000:]}

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
  "medium_article": {{
    "title": "SEO-friendly headline. NOT the newsletter title. Optimize for Google search. Example: 'Why Enterprise Customer Journey Maps Fail (And What to Build Instead)'",
    "subtitle": "One-line subtitle for Medium",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "body": "Full long-form article. 1200-1800 words. Rewrite the newsletter for Medium's audience: less insider CS jargon, more accessible to general business readers. Use H2 headers. Include the framework in full. Strip [CTA link] format and replace with plain markdown links. End with a bio block: '---\\n\\n*Kuber Sethi writes the Churn Is Dead newsletter for CS leaders. Subscribe at churnisdead.com for weekly frameworks.*' Do NOT copy the newsletter verbatim. Rewrite it."
  }},
  "substack_note": {{
    "body": "2-4 sentences max. Pull the single most provocative stat, line, or reframe from the issue. Add the link at the end. Think of it as a tweet with more room. Must stand alone without context."
  }},
  "x_thread": {{
    "should_thread": true,
    "skip_reason": "Only populate if should_thread is false. Explain why this issue doesn't suit a thread format.",
    "tweets": [
      {{
        "tweet_number": 1,
        "text": "Hook tweet. Under 280 chars. Must be a standalone banger. No 'Thread:' or '1/' prefix."
      }},
      {{
        "tweet_number": 2,
        "text": "Expand on the hook. Under 280 chars."
      }},
      {{
        "tweet_number": 3,
        "text": "Key insight or framework point. Under 280 chars."
      }},
      {{
        "tweet_number": 4,
        "text": "Another point. Under 280 chars."
      }},
      {{
        "tweet_number": 5,
        "text": "Final tweet with CTA to newsletter URL. Under 280 chars."
      }}
    ]
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
- Medium article must be REWRITTEN for the platform, not copy-pasted from the newsletter
- X thread: set should_thread to false if the newsletter is mostly narrative without clear numbered points
- Substack note: extremely short. Think "what's the one line someone would screenshot?"
- Community posts should feel like a peer sharing, not a marketer promoting.
- No em dashes anywhere."""

    raw = call_claude(system_prompt, user_prompt, max_tokens=10000)
    data = clean_json_response(raw)

    slug = meta['slug']
    week_dir = DISTRIBUTION_DIR / slug
    week_dir.mkdir(exist_ok=True)

    posts_content = f"# LinkedIn Posts -- {meta['title']}\n"
    posts_content += f"# Newsletter URL: https://churnisdead.com/newsletter/{slug}\n"
    posts_content += f"# Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}\n\n"
    for i, post in enumerate(data['linkedin_posts'], 1):
        posts_content += f"{'='*60}\n"
        posts_content += f"POST {i} -- {post['day'].upper()}\n"
        posts_content += f"Strategy: {post['strategy']}\n"
        posts_content += f"{'='*60}\n\n"
        posts_content += f"{post['body']}\n\n\n"
    (week_dir / "linkedin_posts.md").write_text(posts_content)
    print(f"   LinkedIn posts: {week_dir / 'linkedin_posts.md'}")

    ln = data['linkedin_newsletter']
    ln_content = f"# LinkedIn Newsletter Edition\n"
    ln_content += f"# Title: {ln['title']}\n"
    ln_content += f"# Copy everything below the line into LinkedIn Newsletter editor\n\n"
    ln_content += f"---\n\n{ln['body']}\n"
    (week_dir / "linkedin_newsletter.md").write_text(ln_content)
    print(f"   LinkedIn newsletter: {week_dir / 'linkedin_newsletter.md'}")

    cp = data['community_posts']
    comm_content = f"# Community Cross-Posts -- {meta['title']}\n\n"
    comm_content += f"## Slack (Gain Grow Retain / CS Insider)\n\n{cp['slack_post']}\n\n"
    comm_content += f"---\n\n## Reddit (r/CustomerSuccess)\n\n"
    comm_content += f"**Title:** {cp['reddit_post_title']}\n\n{cp['reddit_post_body']}\n"
    (week_dir / "community_posts.md").write_text(comm_content)
    print(f"   Community posts: {week_dir / 'community_posts.md'}")

    # Medium article
    if 'medium_article' in data:
        ma = data['medium_article']
        medium_content = f"# Medium Article\n"
        medium_content += f"# Title: {ma['title']}\n"
        medium_content += f"# Subtitle: {ma.get('subtitle', '')}\n"
        medium_content += f"# Tags: {', '.join(ma.get('tags', []))}\n"
        medium_content += f"# Copy everything below the line into Medium editor\n\n"
        medium_content += f"---\n\n{ma['body']}\n"
        (week_dir / "medium_article.md").write_text(medium_content)
        print(f"   Medium article: {week_dir / 'medium_article.md'}")

    # Substack Note
    if 'substack_note' in data:
        sn = data['substack_note']
        substack_content = f"# Substack Note\n"
        substack_content += f"# Copy this into Substack Notes\n\n"
        substack_content += f"---\n\n{sn['body']}\n"
        (week_dir / "substack_note.md").write_text(substack_content)
        print(f"   Substack note: {week_dir / 'substack_note.md'}")

    # X Thread
    if 'x_thread' in data:
        xt = data['x_thread']
        if xt.get('should_thread', False) and xt.get('tweets'):
            thread_content = f"# X Thread -- {meta['title']}\n"
            thread_content += f"# Post each tweet as a reply to the previous one\n\n"
            for tweet in xt['tweets']:
                n = tweet.get('tweet_number', '')
                thread_content += f"--- Tweet {n} ---\n{tweet['text']}\n\n"
            (week_dir / "x_thread.md").write_text(thread_content)
            print(f"   X thread: {week_dir / 'x_thread.md'}")
        else:
            reason = xt.get('skip_reason', 'Not suited for thread format')
            print(f"   X thread: SKIPPED ({reason})")

    return week_dir


# ===============================================================
# MAIN
# ===============================================================

def main():
    topic = os.environ.get("TOPIC_OVERRIDE", "").strip() or None
    print("=" * 60)
    print("CHURN IS DEAD -- Newsletter Generator v4")
    print("3-Stage Pipeline with Web Search Research")
    print("=" * 60)

    print("\nRunning 3-stage content pipeline...")
    data = generate_newsletter_and_playbook(topic)
    meta = data['metadata']
    content = data['newsletter_content']
    pb = data['playbook']
    print(f"\n   Final title: {meta['title']}")
    print(f"   Sections: {len(pb.get('sections', []))}")

    Path("/tmp/newsletter_title.txt").write_text(meta['title'])
    Path("/tmp/newsletter_slug.txt").write_text(meta['slug'])

    print("\nBuilding playbook PDF...")
    pdf_name = meta.get('pdf_filename', f"{meta['slug'].replace('-','_')}_ChurnIsDead.pdf")
    pdf_path = PDFS_DIR / pdf_name
    PDFS_DIR.mkdir(parents=True, exist_ok=True)
    build_playbook_pdf(pb, meta, pdf_path)

    print("\nInserting newsletter into Supabase...")
    pub = get_next_tuesday()
    insert_newsletter_via_api(content, meta, pub)

    print("\nGenerating distribution content...")
    try:
        dist_dir = generate_distribution_content(content, meta)
        print(f"   Output: {dist_dir}")
    except Exception as e:
        print(f"   Distribution generation failed (non-fatal): {e}")

    print(f"\nDone! Goes live: {pub}")
    print(f"   Newsletter + PDF + distribution content ready.")
    print(f"   Social media manager: check distribution/{meta['slug']}/")


if __name__ == "__main__":
    main()
