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

# --- MODEL ---
# Claude Opus 4.8 — Anthropic's most capable model, with clearer, warmer prose.
# Every stage of the pipeline (research, topic selection, writing) runs on it
# so the newsletter is top-notch end to end. Change here to swap models globally.
MODEL = "claude-opus-4-8"


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


def _occupied_publish_dates():
    """Set of YYYY-MM-DD strings already taken in the newsletters table."""
    import urllib.request, urllib.error
    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not (supabase_url and service_role_key):
        return set()
    try:
        url = (f"{supabase_url.rstrip('/')}/rest/v1/newsletters"
               f"?select=published_date&order=published_date.desc&limit=200")
        req = urllib.request.Request(url, method="GET")
        req.add_header("apikey", service_role_key)
        req.add_header("Authorization", f"Bearer {service_role_key}")
        with urllib.request.urlopen(req, timeout=15) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
        return {(r.get("published_date") or "")[:10] for r in rows if r.get("published_date")}
    except Exception as e:
        print(f"   (occupied dates unavailable: {e})")
        return set()


def get_next_free_tuesday(max_weeks=8):
    """Next Tuesday 08:00 UTC whose date is NOT already taken in Supabase. Prevents
    the Sunday cron from colliding with a manually-held / scheduled issue. Falls back
    to the naive next Tuesday if Supabase is unreachable (never blocks the cron)."""
    occupied = _occupied_publish_dates()
    today = datetime.now(timezone.utc)
    days_ahead = 1 - today.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    candidate = today + timedelta(days=days_ahead)
    for _ in range(max_weeks):
        if candidate.strftime("%Y-%m-%d") not in occupied:
            return candidate.strftime("%Y-%m-%dT08:00:00+00:00")
        print(f"   ⚠️  {candidate.strftime('%Y-%m-%d')} already has an issue — bumping a week.")
        candidate += timedelta(days=7)
    return candidate.strftime("%Y-%m-%dT08:00:00+00:00")


def get_existing_topics_and_themes():
    """Fetch existing newsletter titles AND themes from Supabase.

    Returns: (list of titles, list of (theme, published_date) tuples for recent newsletters)
    Themes are used to enforce deterministic theme rotation — no topic can repeat
    a theme used in the last 4 weeks. Gracefully handles missing 'theme' column.
    """
    import urllib.request
    import urllib.error

    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    topics = []
    recent_themes = []  # list of (theme, published_date) for last 4 newsletters

    if supabase_url and service_role_key:
        # Try with theme column first
        for select_clause in ["title,slug,published_date,theme", "title,slug,published_date"]:
            try:
                url = f"{supabase_url.rstrip('/')}/rest/v1/newsletters?select={select_clause}&order=published_date.desc&limit=50"
                req = urllib.request.Request(url, method="GET")
                req.add_header("apikey", service_role_key)
                req.add_header("Authorization", f"Bearer {service_role_key}")
                with urllib.request.urlopen(req, timeout=15) as resp:
                    rows = json.loads(resp.read().decode("utf-8"))
                topics = [r.get("title", "") for r in rows if r.get("title")]
                # Capture themes from last 6 newsletters if column exists
                if "theme" in select_clause:
                    for r in rows[:6]:
                        if r.get("theme"):
                            recent_themes.append((r["theme"], r.get("published_date", "")))
                print(f"   Loaded {len(topics)} existing topics from Supabase")
                if recent_themes:
                    print(f"   Recent themes (last 6): {[t[0] for t in recent_themes]}")
                else:
                    print(f"   No theme data yet (column may not exist or is empty)")
                return topics, recent_themes
            except urllib.error.HTTPError as e:
                # If theme column doesn't exist, retry without it
                if e.code == 400 and "theme" in select_clause:
                    continue
                print(f"   Warning: could not load topics from Supabase ({e})")
                break
            except (urllib.error.URLError, json.JSONDecodeError) as e:
                print(f"   Warning: could not load topics from Supabase ({e})")
                break

    # Fallback: scan legacy migration files
    if MIGRATIONS_DIR.exists():
        for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
            content = f.read_text()
            match = re.search(r"INSERT INTO public\.newsletters.*?VALUES\s*\(\s*E?'([^']+)'", content, re.DOTALL)
            if match:
                topics.append(match.group(1))
    return list(set(topics)), recent_themes


# Defined set of themes — keep stable. Add new ones at the bottom; never delete.
ALL_THEMES = [
    "qbrs",                  # Quarterly Business Reviews
    "health_scores",         # Customer health scoring
    "ai_replacement",        # AI replacing CSMs / layoffs
    "metrics_theater",       # Activity metrics / CSM busywork
    "renewals_ownership",    # Who owns renewals (CS vs sales)
    "csm_role_evolution",    # The changing CSM role / skills
    "cs_platforms",          # Gainsight, Vitally, ChurnZero, tool ROI
    "expansion_revenue",     # NRR, upsell, CS owning expansion
    "onboarding",            # Onboarding ownership / quality
    "digital_cs",            # Digital CS / tech-touch / scale
    "customer_segmentation", # ARR tiers, segmentation strategy
    "cs_org_design",         # Reporting structure, team design
    "strategic_relevance",   # CS as strategic vs tactical
    "data_intelligence",     # Customer intelligence beyond health scores
    "executive_alignment",   # CFO/CRO/board relationships
    # --- Constructive themes (build-not-burn) — break the teardown monotony ---
    "whats_working",         # What's actually working in CS right now (constructive)
    "operator_playbook",     # A concrete build/playbook, not a teardown (constructive)
    "career_growth",         # CSM->leader growth, skills, positioning (constructive)
]

# Themes that argue overlapping theses are grouped into families. Rotation bans the
# whole FAMILY for the look-back window, so "your metrics lie to you" can't recur
# under three different labels (health_scores / data_intelligence / metrics_theater).
THEME_FAMILIES = {
    "measurement":  {"health_scores", "data_intelligence", "metrics_theater"},
    "renewals":     {"renewals_ownership", "expansion_revenue"},
    "ai_shift":     {"ai_replacement", "csm_role_evolution"},
    "rituals":      {"qbrs", "onboarding"},
    "org":          {"cs_org_design", "executive_alignment", "strategic_relevance"},
    "tooling":      {"cs_platforms", "digital_cs"},
    "segmentation": {"customer_segmentation"},
    "constructive": {"whats_working", "operator_playbook", "career_growth"},
}

CONSTRUCTIVE_THEMES = THEME_FAMILIES["constructive"]


def _family_of(theme):
    """Return the family name a theme belongs to, or None."""
    for fam, members in THEME_FAMILIES.items():
        if theme in members:
            return fam
    return None


def get_recent_issue_bodies(n=3):
    """Fetch the title + content of the most recent n newsletters, for the
    adversarial grader to compare structure against. Supabase first, migrations fallback.
    Returns list of (title, content) tuples, newest first.
    """
    import urllib.request, urllib.error
    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    out = []
    if supabase_url and service_role_key:
        try:
            url = (f"{supabase_url.rstrip('/')}/rest/v1/newsletters"
                   f"?select=title,content,published_date&order=published_date.desc&limit={n}")
            req = urllib.request.Request(url, method="GET")
            req.add_header("apikey", service_role_key)
            req.add_header("Authorization", f"Bearer {service_role_key}")
            with urllib.request.urlopen(req, timeout=15) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
            out = [(r.get("title", ""), r.get("content", "")) for r in rows]
            if out:
                return out
        except Exception as e:
            print(f"   (recent bodies via Supabase unavailable: {e})")
    # Fallback: parse migrations
    if MIGRATIONS_DIR.exists():
        files = sorted(MIGRATIONS_DIR.glob("*.sql"), reverse=True)
        for f in files:
            c = f.read_text()
            if 'INSERT INTO public.newsletters' not in c:
                continue
            m = re.search(r"VALUES\s*\(\s*E?'((?:[^']|'')*)'.*?E'((?:[^'\\]|\\.|'')*)'", c, re.DOTALL)
            if m:
                title = m.group(1).replace("''", "'")
                body = m.group(2).replace("''", "'").replace("\\n", "\n")
                out.append((title, body))
            if len(out) >= n:
                break
    return out


def structure_fingerprint(recent_issues):
    """Extract opening + section-header signatures from recent issues so Stage 2 can
    actively avoid repeating them. More reliable than trusting self-reported labels.
    Returns a formatted string for prompt injection.
    """
    if not recent_issues:
        return "None available — no constraint."
    lines = []
    for title, body in recent_issues[:4]:
        body = body or ""
        # First non-header, non-rule content line = the opening move
        opening = ""
        for ln in body.split("\n"):
            s = ln.strip()
            if s and not s.startswith("#") and s != "---" and not s.startswith("*Issue"):
                opening = s[:120]
                break
        headers = re.findall(r"^##+\s+(.+)$", body, re.M)
        hdr_preview = " | ".join(h[:30] for h in headers[:4])
        lines.append(f'- "{title}"\n    opens: "{opening}"\n    section pattern: {hdr_preview}')
    return "\n".join(lines)


def get_existing_topics():
    """Backwards-compat wrapper: returns just the topics list."""
    topics, _ = get_existing_topics_and_themes()
    return topics


class DuplicateNewsletterError(Exception):
    """Raised when a generated newsletter collides with an already-published one."""


def _normalize_title(s):
    """Lowercase, strip punctuation/filler, for fuzzy comparison."""
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    # Drop low-signal words so "Your CS Metrics Are Theater" ~ "CS Metrics: Pure Theater"
    stop = {"your", "the", "a", "an", "are", "is", "of", "to", "and", "for", "in",
            "you", "re", "s", "cs", "customer", "success"}
    words = [w for w in s.split() if w not in stop]
    return " ".join(words)


def assert_not_duplicate(meta, existing_topics, threshold=0.85):
    """Hard gate: abort the run if this newsletter duplicates an existing one.

    Never trust the model to self-police dedup (it has shipped literal duplicates).
    Compares both the exact slug and a fuzzy-normalized title against everything
    already published. Raises DuplicateNewsletterError on collision so the GitHub
    Action fails loudly instead of silently publishing issue #N twice.
    """
    from difflib import SequenceMatcher

    new_title = meta.get("title", "")
    new_slug = (meta.get("slug", "") or "").strip().lower()
    new_norm = _normalize_title(new_title)

    for existing in existing_topics:
        # existing may be a title string
        ex_title = existing if isinstance(existing, str) else existing.get("title", "")
        ex_norm = _normalize_title(ex_title)

        # Exact normalized-title collision
        if new_norm and new_norm == ex_norm:
            raise DuplicateNewsletterError(
                f"Title duplicates existing issue.\n  New:      '{new_title}'\n  Existing: '{ex_title}'"
            )
        # Fuzzy similarity collision
        if new_norm and ex_norm:
            ratio = SequenceMatcher(None, new_norm, ex_norm).ratio()
            if ratio >= threshold:
                raise DuplicateNewsletterError(
                    f"Title is {ratio:.0%} similar to an existing issue (threshold {threshold:.0%}).\n"
                    f"  New:      '{new_title}'\n  Existing: '{ex_title}'"
                )
        # Exact slug collision
        ex_slug = re.sub(r"[^a-z0-9]+", "-", ex_title.lower()).strip("-")
        if new_slug and new_slug == ex_slug:
            raise DuplicateNewsletterError(
                f"Slug '{new_slug}' collides with existing issue '{ex_title}'"
            )

    print(f"   Dedup check passed: '{new_title}' is distinct from {len(existing_topics)} existing issues")


CLAIM_VOCAB = [
    "health score", "qbr", "nps", "csat", "onboarding", "renewal", "expansion",
    "upsell", "churn", "ai", "agent", "automation", "platform", "gainsight",
    "segmentation", "ratio", "metric", "playbook", "adoption", "cfo", "cro",
    "board", "budget", "layoff", "ticket", "escalation",
]
SPECIFIC_TARGETS = {"health score", "qbr", "nps", "csat", "onboarding",
                    "segmentation", "platform", "gainsight", "ratio", "adoption"}


def _normalize_claim(s):
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    stop = {"the", "a", "an", "is", "are", "of", "to", "and", "for", "in", "you",
            "your", "it", "that", "this", "cs", "customer", "success", "they",
            "their", "not", "but", "its", "on", "with", "as"}
    return " ".join(w for w in s.split() if w not in stop)


def _claim_keywords(s):
    s = (s or "").lower()
    return {kw for kw in CLAIM_VOCAB if kw in s}


def _thesis_duplicate_of(claim, recent_claims, ratio_threshold=0.62):
    """Return the recent claim this one duplicates, else None. Two signals: fuzzy
    string similarity, OR >=2 shared controlled-vocab targets incl. a specific one.
    Deliberately SOFT -- a hit triggers a single re-pick, never an abort, so a fuzzy
    false positive can't kill the Sunday cron.
    """
    from difflib import SequenceMatcher
    if not claim:
        return None
    nc = _normalize_claim(claim)
    kc = _claim_keywords(claim)
    for rc in recent_claims:
        if not rc:
            continue
        if SequenceMatcher(None, nc, _normalize_claim(rc)).ratio() >= ratio_threshold:
            return rc
        shared = kc & _claim_keywords(rc)
        if len(shared) >= 2 and (shared & SPECIFIC_TARGETS):
            return rc
    return None


def get_recent_core_claims(n=8):
    """Fetch core_claim from the most recent n newsletters (Supabase). Newest first.
    Returns [] if the column/data is unavailable -- never raises, never blocks the cron."""
    import urllib.request, urllib.error
    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not (supabase_url and service_role_key):
        return []
    try:
        url = (f"{supabase_url.rstrip('/')}/rest/v1/newsletters"
               f"?select=core_claim&order=published_date.desc&limit={n}")
        req = urllib.request.Request(url, method="GET")
        req.add_header("apikey", service_role_key)
        req.add_header("Authorization", f"Bearer {service_role_key}")
        with urllib.request.urlopen(req, timeout=15) as resp:
            rows = json.loads(resp.read().decode("utf-8"))
        return [r.get("core_claim", "") for r in rows if r.get("core_claim")]
    except Exception as e:
        print(f"   (core_claims unavailable: {e})")
        return []


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
        "model": MODEL,
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

NAMED EXECUTIVE VOICES WORTH TRACKING (their PUBLIC statements are fair game for commentary):
- Liz Centoni (Cisco, Chief Customer Experience Officer) -- agentic AI in CX, "time to relief" framing, Cisco IQ
- Chuck Robbins (Cisco CEO) -- AI/security/infrastructure strategic framing
- Nick Mehta (Gainsight CEO) -- CS evangelism, "human-first" AI
- Jason Lemkin (SaaStr) -- blunt founder takes on CS ROI and headcount
- Any Fortune 500 CCO / CX leader making public statements about the future of CS/CX
These people post publicly on LinkedIn, give conference keynotes, and write company blogs. Their PUBLIC,
CITABLE statements can be reacted to. Their internal strategy, private remarks, or anything non-public CANNOT.

PRACTITIONER-PATTERN AWARENESS:
Kuber is a senior CS practitioner running enterprise accounts at scale RIGHT NOW. Beyond industry news, surface
the operational patterns a working enterprise CSM would be noticing this quarter -- the gap between what the
LinkedIn CS discourse claims and what actually happens inside a Fortune 500 account. These ground-truth patterns
are the rarest, most credible material the newsletter can use.

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

IMPORTANT: Use your web search tool aggressively to find CURRENT news, posts, and developments in the CS industry. \
Search for recent CS layoffs, AI in customer success, SaaS earnings mentioning NRR or churn, \
CS platform announcements, and what CS leaders are posting on LinkedIn this week. Also search for recent PUBLIC \
statements, keynotes, coined frameworks, or viral posts from the named executive voices above -- these are \
the raw material for practitioner-commentary editions.

RESEARCH DEPTH BAR: A shallow brief produces a generic newsletter. Run multiple searches, follow the strongest \
threads, and capture SPECIFICS -- real numbers, real dated events, the exact public phrasing a named exec used \
(with the source URL). Vague gestures at "trends" are useless. Anything you want the newsletter to be able to \
cite, you must capture verbatim-enough with a traceable source here.

CITATION INTEGRITY: When you capture something a named person said publicly, record their EXACT public wording \
and the URL. Never invent, embellish, or paraphrase a quote into something they didn't say. If you cannot find \
the exact public statement, do not attribute anything to that person.

Return ONLY valid JSON. No markdown fences. No explanation."""

RESEARCH_USER_PROMPT = """Generate this week's CS industry intelligence brief.

Use web search to find current information about:
1. Recent CS team layoffs, reorgs, or hiring freezes at SaaS companies
2. New AI tools or announcements affecting CS teams
3. Recent SaaS earnings calls mentioning NRR, churn, or customer retention
4. What CS leaders are debating on LinkedIn and in communities this week
5. Any recent Gainsight, Vitally, ChurnZero, or other CS platform news
6. Recent PUBLIC statements, keynotes, coined frameworks, or viral posts from named CS/CX executives \
(Liz Centoni, Chuck Robbins, Nick Mehta, Jason Lemkin, or any Fortune 500 CCO) -- capture exact wording + URL

Then think about:
1. What would a VP of CS at a Fortune 500 tech company be worrying about THIS WEEK?
2. What "accepted wisdom" in CS is starting to crack under real-world pressure?
3. What are CSMs experiencing on the ground that leadership isn't seeing?
4. Which public exec statement this week is worth a sharp practitioner reaction (agree-and-extend, or push back)?
5. What operational pattern would a senior enterprise CSM be noticing right now that the discourse is missing?

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
  "industry_moments": [
    {
      "who": "Named public figure or org (e.g. 'Liz Centoni, Cisco CCO')",
      "what_they_said": "Their EXACT public statement or the framework/metric they coined, in their words",
      "source_url": "The traceable public URL where this appeared (LinkedIn post, blog, keynote coverage)",
      "date": "When it was published, as specific as you can find",
      "why_it_matters": "Why a senior CS practitioner would have a strong reaction to this",
      "the_practitioner_angle": "Where Kuber would AGREE-AND-EXTEND or PUSH BACK, from real enterprise experience"
    }
  ],
  "practitioner_pattern_signals": [
    {
      "pattern": "An operational pattern a working enterprise CSM is seeing this quarter",
      "discourse_says": "What the LinkedIn CS discourse claims is happening",
      "ground_truth": "What actually happens inside a real Fortune 500 account",
      "why_credible_from_kuber": "Why Kuber specifically can speak to this with authority"
    }
  ],
  "whats_actually_working": [
    {
      "what": "A genuine win, working approach, or positive pattern (NOT a teardown) — something a CS team is doing that demonstrably works",
      "evidence": "Real signal this works — a named company, a real data point, a credible source. Avoid generic claims.",
      "why_underrated": "Why this deserves more attention than it gets",
      "how_to_steal_it": "What a reader could actually adopt"
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

Generate 5 top_tensions, up to 2 industry_moments (ONLY real, citable, recent ones -- if nothing this week is \
genuinely worth reacting to, return an empty array; do NOT manufacture a moment), 2 practitioner_pattern_signals, \
2 whats_actually_working entries (real wins, not teardowns -- this is the constructive lane so the newsletter \
isn't relentlessly negative), 3 underexplored_angles, and 3 framework_opportunities.
Be specific, not generic. Reference real dynamics, not platitudes. Every industry_moment MUST have a real source_url."""


def run_stage_1_research():
    print("\n   Stage 1: Researching CS industry landscape...")
    raw = call_claude(
        RESEARCH_SYSTEM_PROMPT,
        RESEARCH_USER_PROMPT,
        max_tokens=5500,
        tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 9}]
    )
    try:
        data = clean_json_response(raw)
        print(f"   Research complete: {len(data.get('top_tensions', []))} tensions identified")
        moments = data.get('industry_moments', [])
        if moments:
            print(f"   Industry moments worth reacting to: {len(moments)}")
            for m in moments[:2]:
                print(f"      - {m.get('who', '?')}: {str(m.get('what_they_said',''))[:70]}...")
        patterns = data.get('practitioner_pattern_signals', [])
        if patterns:
            print(f"   Practitioner patterns: {len(patterns)}")
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

CONTENT MODE -- choose ONE for this issue:

The newsletter has three modes. Most weeks are STANDARD. The other two fire only when the research supports them.

- "standard" (DEFAULT, ~70% of issues): The classic Churn Is Dead contrarian beat. Hard truths about CS work,
  a named framework, a Monday-morning playbook. Pick this unless there is a genuinely strong reason not to.

- "industry_commentary" (~15% of issues, ONLY when research surfaced a real, citable industry_moment): A sharp
  practitioner reaction to a SPECIFIC public statement by a named CS/CX exec. The piece cites the public source,
  agrees-and-extends OR pushes back from real enterprise experience, then adds Kuber's own framework on top.
  This positions Kuber as the practitioner who can critique the executives -- not echo them. ONLY pick this mode
  if research returned an industry_moment with a real source_url that is genuinely worth a full issue. If the
  moments are weak, do NOT force it -- fall back to standard.

- "operator_patterns" (~15% of issues, every 3rd-4th issue): A "here's what I'm actually seeing this quarter"
  piece grounded in anonymized enterprise patterns. Uses practitioner_pattern_signals from research. This is
  Kuber's rarest edge: ground-truth from running enterprise accounts at scale, that no consultant or first-time
  VP can replicate. Anonymized but specific.

INTELLECTUAL-PROPERTY & EMPLOYER GUARDRAILS (NON-NEGOTIABLE -- apply to every mode, especially the latter two):
- NEVER name, describe, or make identifiable any specific customer, deal, or account from Kuber's employer.
- NEVER reveal internal strategy, roadmap, unreleased products, internal metrics, or anything learned under NDA.
- NEVER position the newsletter as speaking for Cisco/Splunk. Kuber writes as an independent practitioner ("I"),
  never "we at [employer]".
- For industry_commentary: react ONLY to PUBLIC, already-published statements, and CITE the source. NEVER invent
  or paraphrase a quote into something the person did not say. If the exact public statement isn't in the
  research brief with a source_url, do NOT attribute anything to them -- pick a different mode.
- Anonymized stories must be generalized to the point of being unrecognizable ("a Fortune 500 financial-services
  CISO", never a real name or identifying detail).

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
- FRAMEWORK NAMING — HARD RULE: framework names are sticky PHRASES or METAPHORS, NEVER forced acronyms.
  Banned: TRACE, RAISE, SCALE, and any name reverse-engineered into an acronym. Acronyms are an AI-content
  tell and read as junior. The bar is "time to relief" — a real phrase that sticks. "The Renewal Cliff",
  "Silent Attrition", "The Adoption Tax" — good. "The R.E.N.E.W. Method" — banned.
- The playbook must be something a CSM can use Monday morning

Return ONLY valid JSON. No markdown fences."""

TOPIC_USER_PROMPT_TEMPLATE = """RESEARCH BRIEF:
{research_brief}

EXISTING TOPICS — these have already been covered. Do NOT repeat them, and do NOT pick anything thematically overlapping.

{existing_topics}

THEMES USED IN THE LAST 4 WEEKS (BANNED — pick a different theme):
{banned_themes}

ELIGIBLE THEMES FOR THIS WEEK (pick exactly ONE):
{eligible_themes}

RECENT ISSUE STRUCTURES — you MUST NOT repeat these openings or section-header patterns:
{recent_structures}

STRUCTURAL DIVERSITY (mandatory — this is the #1 reason the newsletter felt repetitive):
- Look at the openings above. If recent issues opened on "a [role] walked into a meeting" or any meeting scene,
  you are BANNED from opening on a meeting scene. Pick a different opening type entirely.
- Opening types to rotate through: in-medias-res moment / bold declaration / a question never asked /
  first-person "I" anecdote / a single hard number / direct address ("You open your laptop...") / a short letter.
- Look at the section patterns above. If recent issues used "The [X] Industrial Complex / Epidemic / Delusion"
  headers or a "Five Lies" / numbered-myths body, you are BANNED from reusing that shape. Vary it.
- Your chosen opening_type and structural_template must differ from the most recent issue's.

DUPLICATION CHECK (mandatory before finalizing your pick):
- Read each existing topic above carefully.
- If your candidate topic shares the SAME core target (e.g. QBRs, health scores, CSM activity metrics, NPS, onboarding, the CS-vs-Sales renewal split), it is a DUPLICATE even if your headline differs.
- If your candidate's underlying argument is "this CS ritual is theater and here's the replacement," check whether you've made that argument about a similar ritual in the last 4 weeks. If yes, pick something structurally different.
- Vary the *target* week to week. Last week was X? This week target something other than X.
- Your `theme` field MUST be one of the ELIGIBLE THEMES above. If you pick a BANNED theme, the run will fail.
- In your `rejected_alternatives`, list any topic you considered that was too close to an existing one, and explicitly say which existing topic it overlapped with.

KUBER'S CONTEXT (use to inform angle, not to mention directly):
- Customer Success Engineer at Splunk managing a large portfolio of top-tier enterprise accounts
- Sees the gap between CS strategy decks and frontline execution daily
- Works with Fortune 500 accounts where CS is existential, not decorative
- Has direct experience with the tension between CS as cost center vs revenue driver
- Lives the reality of AI tools being pushed on CS teams without solving real problems
- Based in Australia, giving a global perspective vs the US-centric CS echo chamber

Select the single best topic for this week and develop the full angle.

FIRST, decide the CONTENT MODE (standard / industry_commentary / operator_patterns) per the rules in the system
prompt. Check the research brief: if it contains a strong `industry_moments` entry with a real source_url that's
worth a full issue, industry_commentary is on the table. If it's been ~3-4 issues since the last operator_patterns
piece and the `practitioner_pattern_signals` are strong, operator_patterns is on the table. Otherwise default to
standard. State your chosen mode and WHY.

CRITICAL: Check the existing topics list. Your title MUST NOT follow the "Your [X] Are [Y]" pattern.
Use one of the headline structures from the system prompt.

Also select a STRUCTURAL TEMPLATE for this issue (rotate -- don't repeat the same one two weeks in a row):
- "myth_buster": Open with scene, then 3-5 lies/myths demolished, then framework, then action
- "case_study": Extended opening story (500+ words), then the lesson, then framework
- "manifesto": Bold declaration opening, philosophical argument, then practical framework
- "interview_style": Written as if answering a reader question, conversational, then framework
- "before_after": Show the broken state in detail, then show the transformed state, framework bridges the gap
- "letter_to": Written as a direct letter to a specific persona (Dear VP of CS, Dear CFO, Dear CSM)

(Note: industry_commentary mode usually pairs best with manifesto or before_after; operator_patterns with
case_study or interview_style. But you may pair as fits the angle.)

Return:
{{
  "selected_topic": {{
    "title": "Headline using a FRESH structure (NOT 'Your X Are Y')",
    "slug": "url-friendly-slug",
    "content_mode": "EXACTLY one of: standard, industry_commentary, operator_patterns",
    "content_mode_rationale": "Why this mode this week (1-2 sentences)",
    "public_source_to_cite": "For industry_commentary ONLY: the who + exact public statement + source_url being reacted to, copied from the research brief's industry_moments. Empty string for other modes.",
    "theme": "EXACTLY one value from the ELIGIBLE THEMES list above",
    "structural_template": "One of: myth_buster, case_study, manifesto, interview_style, before_after, letter_to. MUST differ from the most recent issue's structure shown above.",
    "opening_type": "One of: in_medias_res, declaration, question, first_person, single_number, direct_address, letter. MUST differ from the most recent issue's opening shown above.",
    "thesis": "The core argument in 2 sentences. What do you believe that most CS leaders don't?",
    "why_this_week": "Why this topic is more relevant now than any other week",
    "opening_story_seed": "A 2-sentence scenario. NEVER use the name Sarah. Use a specific role title instead of a name (e.g. 'A VP of CS at a Series D company' or 'The head of enterprise accounts'). Or open without a character at all.",
    "contrarian_position": "The uncomfortable truth, stated plainly",
    "what_readers_will_feel": "The emotional arc: called out, curious, equipped, motivated",
    "framework_name": "A memorable 2-4 word name for the framework",
    "framework_components": ["Component 1", "Component 2", "Component 3", "Component 4"],
    "signature_metric": "A memorable, repeatable metric or term to coin this issue (Liz Centoni's 'time to relief' is the bar). Short, sticky, quotable.",
    "playbook_concept": "What the downloadable audit/playbook should measure",
    "core_claim": "The ONE-sentence core argument of THIS issue, plainly stated (e.g. 'Health scores measure the past, so they miss churn that is already decided'). Used to block issues that repeat a recent thesis -- make it specific to this angle, not generic.",
    "who_shares_this": "Which persona shares this and what they say when they do"
  }},
  "rejected_alternatives": [
    {{
      "topic": "Alternative topic considered",
      "why_rejected": "Why this wasn't the best choice this week"
    }}
  ]
}}"""


def run_stage_2_topic_selection(research_brief, existing_topics, recent_themes=None, recent_issues=None, extra_note=""):
    """Stage 2: pick a topic. recent_themes is a list of (theme, date) tuples for last 4 issues.
    recent_issues is a list of (title, body) used to ban repeated openings/structures."""
    print("\n   Stage 2: Selecting topic and developing angle...")
    existing_list = "\n".join(f"- {t}" for t in existing_topics) if existing_topics else "None yet"

    recent_themes = recent_themes or []
    banned = [t[0] for t in recent_themes if t[0]]
    # Ban at the FAMILY level: if a recent theme belongs to a family, the whole
    # family is off-limits, stopping the same thesis recurring under a different label.
    banned_families = {_family_of(t) for t in banned if _family_of(t)}
    eligible = [t for t in ALL_THEMES
                if t not in banned and _family_of(t) not in banned_families]
    # Safety: never let the eligible set collapse to empty (would break the cron).
    if not eligible:
        eligible = [t for t in ALL_THEMES if t not in banned] or list(ALL_THEMES)
    # Constructive nudge: if the last 3 issues were all teardowns, surface the
    # constructive options first so the newsletter isn't "contrarian on a loop".
    recent3 = [t[0] for t in recent_themes[:3] if t[0]]
    if recent3 and not any(t in CONSTRUCTIVE_THEMES for t in recent3):
        c_first = [t for t in eligible if t in CONSTRUCTIVE_THEMES]
        if c_first:
            eligible = c_first + [t for t in eligible if t not in CONSTRUCTIVE_THEMES]
    banned_str = ", ".join(banned) if banned else "None — first run with themes"
    if banned_families:
        fams = ", ".join(sorted(f for f in banned_families if f))
        banned_str += f"  (families also banned: {fams})"
    eligible_str = ", ".join(eligible)
    recent_structures = structure_fingerprint(recent_issues or [])

    user_prompt = TOPIC_USER_PROMPT_TEMPLATE.format(
        research_brief=research_brief,
        existing_topics=existing_list,
        banned_themes=banned_str,
        eligible_themes=eligible_str,
        recent_structures=recent_structures
    )
    if extra_note:
        user_prompt += extra_note
    raw = call_claude(TOPIC_SYSTEM_PROMPT, user_prompt, max_tokens=3000)
    data = clean_json_response(raw)
    topic = data.get("selected_topic", {})

    # Validate theme is one of the eligible ones; if not, fail fast so we can fix the prompt
    chosen_theme = topic.get("theme", "")
    _banned_fams = {_family_of(t) for t in banned if _family_of(t)}
    if chosen_theme and (chosen_theme in banned or _family_of(chosen_theme) in _banned_fams):
        print(f"   ⚠️  Stage 2 picked a BANNED theme '{chosen_theme}'. Retrying...")
        retry_prompt = user_prompt + f"\n\nYour previous attempt picked the banned theme '{chosen_theme}'. Pick from eligible themes only."
        raw = call_claude(TOPIC_SYSTEM_PROMPT, retry_prompt, max_tokens=3000)
        data = clean_json_response(raw)
        topic = data.get("selected_topic", {})
        chosen_theme = topic.get("theme", "")

    print(f"   Topic selected: {topic.get('title', 'Unknown')}")
    print(f"   Content mode: {topic.get('content_mode', 'standard')} — {topic.get('content_mode_rationale', '')[:70]}")
    print(f"   Theme: {chosen_theme or '(none set)'}")
    print(f"   Structure: {topic.get('structural_template', '?')} / opening: {topic.get('opening_type', '?')}")
    print(f"   Framework: {topic.get('framework_name', 'TBD')}")
    if topic.get('signature_metric'):
        print(f"   Signature metric: {topic.get('signature_metric')}")
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

CONTENT MODE -- the topic brief specifies one. Write accordingly:

- "standard": The classic contrarian beat. Proceed exactly as the structure rules below describe.

- "industry_commentary": You are reacting to a SPECIFIC public statement by a named CS/CX executive (provided
  in the topic brief's public_source_to_cite). Structure: (1) Open by citing what they said -- accurately, in
  their actual public words, naming them and the venue. (2) Give them their due -- what they got right. (3) Then
  the practitioner turn: where the reality on the ground is harder/different than the executive framing admits,
  from YOUR vantage point running enterprise accounts. (4) Add YOUR framework on top -- the thing the original
  statement was missing. You are the practitioner who can critique the executives, not echo them. Be respectful
  and precise, never a hit piece. CITE the source inline (e.g. "In her Cisco Live keynote, Liz Centoni called
  it 'time to relief'"). NEVER invent a quote -- use ONLY the exact wording in public_source_to_cite.

- "operator_patterns": A "here's what I'm actually seeing this quarter" piece. Open by naming the gap between
  what the CS discourse claims and what you observe inside real enterprise accounts. Walk through 2-3 specific,
  ANONYMIZED patterns (generalized so no customer is identifiable). The authority comes from specificity of the
  PATTERN, not specificity of the customer. Then the framework that makes sense of the patterns.

INTELLECTUAL-PROPERTY & EMPLOYER GUARDRAILS (NON-NEGOTIABLE):
- NEVER name or make identifiable any specific customer, deal, or account from your employer.
- NEVER reveal internal strategy, roadmap, unreleased products, internal numbers, or anything under NDA.
- You write as an independent practitioner. Use "I", never "we at Cisco/Splunk". The newsletter does not speak
  for any employer.
- For industry_commentary: react ONLY to the exact public statement provided. Do NOT fabricate, embellish, or
  paraphrase anyone into saying something they didn't. If you find yourself needing a quote that isn't in the
  brief, don't use it.
- Anonymized stories are generalized to the point of being unrecognizable -- a role and an industry, never a
  name or identifying detail.

CRAFT MOVES (apply to EVERY mode -- this is what separates senior thought leadership from generic CS content):
- COIN A METRIC OR TERM: The topic brief gives you a signature_metric. Introduce it, define it in one line, and
  repeat it 2-3 times so it sticks. The bar is Liz Centoni's "time to relief" -- short, sticky, quotable.
- ANCHOR IN ONE STORY: Anchor the argument in a single concrete (anonymized) scene rather than abstract claims.
- ONE CALLOUT LINE: Write at least one line engineered to be screenshotted and quoted -- a sentence that lands
  as a standalone truth. Make it earn its place; don't force a dozen.

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
    "playbook_description": "Brief description of what the playbook contains",
    "subject_variants": [
      {{"label": "curiosity", "subject": "Curiosity-driven subject line under 60 chars — opens with a question or unexpected claim"}},
      {{"label": "direct", "subject": "Direct, blunt subject line under 60 chars — states the contrarian truth"}},
      {{"label": "personal", "subject": "Personal subject line under 60 chars — uses 'you/your' and feels like a 1:1 message"}}
    ]
  }},
  "newsletter_content": "FULL NEWSLETTER IN MARKDOWN following the exact structure above",
  "word_count": "Integer — your honest word count for newsletter_content. MUST be between 2200 and 2800.",
  "quality_self_check": {{
    "specificity_score": "1-10 with brief justification",
    "shareability_score": "1-10 with brief justification",
    "actionability_score": "1-10 with brief justification",
    "originality_score": "1-10 with brief justification",
    "memorability_score": "1-10 with brief justification",
    "ip_safety_check": "PASS or FAIL. FAIL if the draft names a real customer/deal, reveals internal strategy, speaks for an employer, or attributes a quote not present in the topic brief's public_source_to_cite. If FAIL, you MUST rewrite before returning.",
    "citation_integrity": "For industry_commentary only: confirm every quote/attribution traces to public_source_to_cite. 'N/A' for other modes.",
    "overall": "Average score. If below 7 OR ip_safety_check is FAIL, explain what's weak and how it could improve."
  }}
}}

LENGTH IS NOT OPTIONAL: newsletter_content MUST be 2,200-2,800 words. Recent issues shipped at ~1,000 words,
which is a failure. If your draft is short, you have under-developed the argument: add a real example, deepen
the framework explanation, or walk through how each framework component plays out. Do not pad with filler — earn the length.

CRITICAL: If your quality_self_check overall score is below 7, REWRITE before returning.
The reader deserves your best work. Their career might depend on what you write."""


# ---------------------------------------------------------------
# Stage 3a: write the newsletter body (full token budget for prose)
# ---------------------------------------------------------------

def _parse_quality(data):
    quality = data.get('quality_self_check', {})
    m = re.search(r'(\d+\.?\d*)', str(quality.get('overall', '0')))
    overall = float(m.group(1)) if m else 0
    ip_failed = "FAIL" in str(quality.get('ip_safety_check', '')).upper()
    return overall, ip_failed


def _word_count(text):
    return len((text or "").split())


def write_newsletter_draft(topic_brief, research_brief, extra_note=""):
    """Single writing call. Returns parsed dict (metadata + newsletter_content + quality)."""
    user_prompt = WRITING_USER_PROMPT_TEMPLATE.format(
        topic_brief=topic_brief, research_brief=research_brief
    ) + extra_note
    # 16k gives the prose room now that the playbook is a separate call
    raw = call_claude(WRITING_SYSTEM_PROMPT, user_prompt, max_tokens=16000)
    return clean_json_response(raw)


# ---------------------------------------------------------------
# Stage 3b: INDEPENDENT adversarial critique (Gemini, Claude fallback)
# ---------------------------------------------------------------

ADVERSARIAL_CRITIC_SYSTEM = """You are a hostile, brilliant editor who has read every issue of "Churn Is Dead" \
and is sick of its tics. You do not work for the author. Your job is to find every reason this draft is \
mediocre, generic, or repetitive BEFORE it ships. You are not here to be encouraging.

You are an expert on the enterprise Customer Success space and on what separates genuine senior-operator thought \
leadership from AI-generated content-mill filler. You know the difference between a real insight and a \
confident-sounding platitude.

Judge the draft against these failure modes the newsletter is known for:
1. GENERIC STRAWMEN: Does it argue against invented hypotheticals ("a $200M SaaS company", "most CS teams") \
instead of real, named, cited companies/events/data? Real specifics are mandatory for credibility.
2. TEARDOWN MONOTONY: Is this yet another pure teardown? Does it ever build, teach, or show what works?
3. STRUCTURAL REPETITION: Compare to the recent issues provided. Same opening type (scene/meeting), same \
"The [X] Industrial Complex/Epidemic" section tic, same "Five Lies" body, same framework-then-action shape?
4. BACKRONYM FRAMEWORKS: Is the framework a forced acronym (TRACE, RAISE)? That's an AI tell. Good frameworks \
are sticky phrases ("time to relief"), not acronyms.
5. FAKE DEPTH: Confident sentences that say nothing. Does every claim earn its place?
6. SHALLOW ACTIONABILITY: Could a real VP of CS actually do something Monday, or is it vague?

Return ONLY valid JSON. No markdown fences."""

ADVERSARIAL_CRITIC_USER = """RECENT PUBLISHED ISSUES (for structural-repetition comparison):
{recent_issues}

DRAFT TO CRITIQUE (title: {title}):
{draft}

Tear this apart. Return JSON:
{{
  "verdict": "ship | revise | reject",
  "is_generic_strawman": "true/false + the single most damning example from the draft",
  "is_teardown_again": "true/false + whether that's a problem given the recent issues above",
  "structural_similarity": "How structurally similar is this to the recent issues? Name the specific repeated move, or 'distinct' if genuinely fresh.",
  "backronym_framework": "true/false — is the framework name a forced acronym?",
  "weakest_sections": ["Specific section or line that is generic/weak, quoted briefly"],
  "what_would_make_it_unmissable": ["Concrete, specific change that would materially raise quality"],
  "line_level_fixes": ["Specific sentence-level fixes worth making"],
  "harshest_honest_take": "One brutal sentence: why a senior CS leader might roll their eyes at this draft."
}}"""


def _gemini_critique(system, user):
    """Call Gemini as an independent critic. Returns raw text or raises."""
    import urllib.request
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set")
    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": user}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 3000},
    }
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        out = json.loads(resp.read().decode("utf-8"))
    return out["candidates"][0]["content"]["parts"][0]["text"]


def run_adversarial_critique(draft_content, title, recent_issues):
    """Independent critique with graceful degradation:
    Gemini if GEMINI_API_KEY is set, else a Claude adversarial-critic call.
    A critic outage must NEVER break the run — returns None on total failure.
    """
    recent_str = "\n\n".join(
        f"### {t}\n{(c or '')[:900]}" for t, c in recent_issues[:3]
    ) or "None available."
    user = ADVERSARIAL_CRITIC_USER.format(
        recent_issues=recent_str, title=title, draft=draft_content[:9000]
    )

    # Try Gemini first (true cross-vendor independence)
    if os.environ.get("GEMINI_API_KEY"):
        try:
            print("   Adversarial grader: Gemini (independent)...")
            raw = _gemini_critique(ADVERSARIAL_CRITIC_SYSTEM, user)
            return clean_json_response(raw)
        except Exception as e:
            print(f"   Gemini critic unavailable ({e}); falling back to Claude critic")

    # Fallback: Claude with a hostile-editor persona (still independent of the writer call)
    try:
        print("   Adversarial grader: Claude (hostile-editor fallback)...")
        raw = call_claude(ADVERSARIAL_CRITIC_SYSTEM, user, max_tokens=3000)
        return clean_json_response(raw)
    except Exception as e:
        print(f"   Adversarial critique failed entirely ({e}); proceeding without it")
        return None


# ---------------------------------------------------------------
# Stage 3c: revision — weigh the critique, don't blindly obey it
# ---------------------------------------------------------------

REVISION_NOTE_TEMPLATE = """\

---
An independent adversarial editor reviewed your draft. Their critique is below. You are the author and you
keep judgment: ADOPT the points that genuinely improve the piece, and IGNORE any that would make it worse,
off-voice, or that are wrong. Do not blandly comply — improve.

CRITIQUE (JSON):
{critique}

Rewrite the newsletter incorporating what makes sense. Keep it 2,200-2,800 words. Return the SAME JSON schema
as before (metadata, newsletter_content, word_count, quality_self_check)."""


def run_stage_3_newsletter(topic_brief, research_brief, recent_issues=None):
    """Write → independent adversarial critique → revise. Returns parsed dict (no playbook)."""
    recent_issues = recent_issues or []
    print("\n   Stage 3a: Writing newsletter draft...")
    data = write_newsletter_draft(topic_brief, research_brief)

    overall, ip_failed = _parse_quality(data)
    wc = _word_count(data.get('newsletter_content', ''))
    print(f"   Draft: {wc} words, self-score {overall}/10" + (" [IP FAIL]" if ip_failed else ""))

    # IP-safety failure forces an immediate corrective rewrite (hard rule)
    if ip_failed:
        print("   ⚠️  IP-safety FAILED — forcing corrective rewrite...")
        data = write_newsletter_draft(
            topic_brief, research_brief,
            extra_note="\n\nYour previous attempt FAILED the IP-safety check. Remove any named customer, "
                       "internal strategy, employer-voice framing, or unsourced attribution.")
        overall, ip_failed = _parse_quality(data)
        wc = _word_count(data.get('newsletter_content', ''))

    title = data.get('metadata', {}).get('title', 'Unknown')

    # Stage 3b: independent adversarial critique
    print("\n   Stage 3b: Independent adversarial review...")
    critique = run_adversarial_critique(data.get('newsletter_content', ''), title, recent_issues)

    # Stage 3c: revise if the critic flags anything material OR if length/quality is off
    needs_revision = False
    if critique:
        verdict = str(critique.get('verdict', '')).lower()
        flags = [
            "true" in str(critique.get('is_generic_strawman', '')).lower(),
            "true" in str(critique.get('backronym_framework', '')).lower(),
            "distinct" not in str(critique.get('structural_similarity', 'distinct')).lower(),
            verdict in ("revise", "reject"),
        ]
        needs_revision = any(flags)
        print(f"   Critic verdict: {verdict or 'n/a'} | revision needed: {needs_revision}")
        if critique.get('harshest_honest_take'):
            print(f"   Critic: \"{critique['harshest_honest_take'][:120]}\"")

    if needs_revision or overall < 7 or not (2200 <= wc <= 2900):
        print("   Stage 3c: Revising based on critique + targets...")
        note = REVISION_NOTE_TEMPLATE.format(critique=json.dumps(critique, indent=2)) if critique else \
            "\n\nYour previous attempt scored below target or missed the length window. Write a stronger, " \
            "fuller version (2,200-2,800 words)."
        revised = write_newsletter_draft(topic_brief, research_brief, extra_note=note)
        # Only accept the revision if it didn't regress badly on length
        rev_wc = _word_count(revised.get('newsletter_content', ''))
        if rev_wc >= max(1500, wc * 0.8):
            data = revised
            overall, ip_failed = _parse_quality(data)
            wc = rev_wc
            print(f"   Revised: {wc} words, self-score {overall}/10")
        else:
            print(f"   Revision regressed length ({rev_wc}w); keeping stronger original ({wc}w)")

    print(f"   Newsletter finalized: {title} ({wc} words)")
    return data


# ---------------------------------------------------------------
# Stage 3d: playbook — separate call so it never starves the prose
# ---------------------------------------------------------------

PLAYBOOK_SYSTEM_PROMPT = """You build the downloadable diagnostic playbook (PDF) that accompanies each \
"Churn Is Dead" newsletter. It must map directly to the framework in the newsletter and be something a CS team \
can actually score themselves against. Concrete criteria, no fluff. Return ONLY valid JSON. No markdown fences."""

PLAYBOOK_USER_PROMPT_TEMPLATE = """Build the playbook for this newsletter.

FRAMEWORK NAME: {framework_name}
FRAMEWORK COMPONENTS: {framework_components}
PLAYBOOK CONCEPT: {playbook_concept}

NEWSLETTER (for grounding the playbook in the actual argument):
{newsletter_content}

Return JSON:
{{
  "title": "The {framework_name} Audit",
  "subtitle": "A diagnostic tool for CS teams",
  "intro_text": "1-2 sentence intro",
  "scoring_note": "Rate each item 1-5. 1 = not happening, 5 = embedded in operations.",
  "sections": [
    {{
      "title": "Section Title (matches a framework component)",
      "why_it_matters": "1-2 sentences",
      "headers": ["Criteria", "What Good Looks Like", "What Bad Looks Like"],
      "col_ratios": [0.28, 0.36, 0.36],
      "rows": [["Specific measurable criteria", "Description of excellence", "Description of failure"]],
      "rubric": [["Rubric criteria description", "1-5"]]
    }}
  ],
  "closing_quote": "A memorable closing line from the newsletter"
}}

Create one section per framework component. Each section needs 3-5 concrete rows."""


def generate_playbook(newsletter_content, meta, topic_brief):
    """Separate call for the playbook so the newsletter prose got the full budget."""
    print("\n   Stage 3d: Generating playbook (separate call)...")
    try:
        tb = clean_json_response(topic_brief).get("selected_topic", {})
    except Exception:
        tb = {}
    fw_name = tb.get("framework_name") or meta.get("playbook_title", "CS").replace(" Audit", "")
    components = tb.get("framework_components", [])
    user = PLAYBOOK_USER_PROMPT_TEMPLATE.format(
        framework_name=fw_name,
        framework_components=", ".join(components) if components else "Derive from the newsletter",
        playbook_concept=tb.get("playbook_concept", "Measure what actually drives retention"),
        newsletter_content=(newsletter_content or "")[:8000],
    )
    raw = call_claude(PLAYBOOK_SYSTEM_PROMPT, user, max_tokens=4000)
    try:
        pb = clean_json_response(raw)
        print(f"   Playbook: {len(pb.get('sections', []))} sections")
        return pb
    except Exception as e:
        print(f"   Playbook generation failed ({e}); using minimal fallback")
        return {
            "title": f"The {fw_name} Audit",
            "subtitle": "A diagnostic tool for CS teams",
            "intro_text": meta.get("playbook_description", ""),
            "scoring_note": "Rate each item 1-5.",
            "sections": [], "closing_quote": "",
        }


def _legacy_run_stage_3(topic_brief, research_brief):
    """Deprecated single-call Stage 3 (kept for reference; no longer used)."""
    raise NotImplementedError("Stage 3 is now write -> critique -> revise; see run_stage_3_newsletter")


# ===============================================================
# CONTENT PIPELINE ORCHESTRATOR
# ===============================================================

def generate_newsletter_and_playbook(topic_override=None):
    existing_topics, recent_themes = get_existing_topics_and_themes()
    chosen_theme = None
    chosen_core_claim = None

    if topic_override:
        print(f"   Topic override: {topic_override}")
        research_brief = "Topic was manually specified. No research phase."
        topic_brief = json.dumps({
            "selected_topic": {
                "title": topic_override,
                "slug": re.sub(r'[^a-z0-9]+', '-', topic_override.lower()).strip('-'),
                "theme": None,
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
        # Pull recent issue bodies up front: used by BOTH Stage 2 (avoid repeating
        # openings/structures) and Stage 3b (adversarial structural comparison)
        recent_issues = get_recent_issue_bodies(3)
        topic_brief = run_stage_2_topic_selection(
            research_brief, existing_topics, recent_themes, recent_issues=recent_issues
        )
        # Extract chosen theme from the topic brief so we can store it in Supabase
        try:
            tb = clean_json_response(topic_brief)
            chosen_theme = tb.get("selected_topic", {}).get("theme")
            chosen_core_claim = tb.get("selected_topic", {}).get("core_claim")
        except Exception:
            chosen_theme = None
            chosen_core_claim = None

        # Thesis-level dedup: if this issue's core argument is too close to a recent
        # issue's, re-pick ONCE with an explicit avoid-note. Soft by design.
        recent_claims = get_recent_core_claims(8)
        dup_of = _thesis_duplicate_of(chosen_core_claim, recent_claims)
        if dup_of:
            print(f"   ⚠️  Core claim overlaps a recent issue; re-picking once.")
            print(f"      overlaps: \"{dup_of[:80]}\"")
            note = ("\n\nYour previous pick's core_claim was too close to a recent issue: "
                    f"\"{dup_of}\". Choose a genuinely DIFFERENT argument, target, and theme.")
            topic_brief = run_stage_2_topic_selection(
                research_brief, existing_topics, recent_themes,
                recent_issues=recent_issues, extra_note=note)
            try:
                tb = clean_json_response(topic_brief)
                chosen_theme = tb.get("selected_topic", {}).get("theme")
                chosen_core_claim = tb.get("selected_topic", {}).get("core_claim")
            except Exception:
                pass

    if topic_override:
        recent_issues = []

    newsletter = run_stage_3_newsletter(topic_brief, research_brief, recent_issues=recent_issues)

    # Playbook is generated in a SEPARATE call so the prose got the full token budget
    meta = newsletter.get("metadata", {})
    newsletter["playbook"] = generate_playbook(
        newsletter.get("newsletter_content", ""), meta, topic_brief
    )

    # Attach theme to metadata so insert_newsletter_via_api can write it
    if chosen_theme and isinstance(newsletter, dict) and "metadata" in newsletter:
        newsletter["metadata"]["theme"] = chosen_theme
    if chosen_core_claim and isinstance(newsletter, dict) and "metadata" in newsletter:
        newsletter["metadata"]["core_claim"] = chosen_core_claim
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

    base_payload = {
        "title": meta["title"],
        "slug": meta["slug"],
        "excerpt": meta["excerpt"],
        "content": content,
        "published_date": pub_date,
        "read_time": meta.get("read_time", "9 min read"),
        "category": meta.get("category", "Strategy")
    }

    # Optionally include theme — falls back to insert without it if the column doesn't exist yet
    theme = meta.get("theme")
    full_payload = dict(base_payload)
    if theme:
        full_payload["theme"] = theme
    core_claim = meta.get("core_claim")
    if core_claim:
        full_payload["core_claim"] = core_claim

    # Subject line variants for A/B testing — only included if generator produced them
    subject_variants = meta.get("subject_variants")
    if subject_variants and isinstance(subject_variants, list) and len(subject_variants) > 0:
        full_payload["subject_variants"] = subject_variants

    url = f"{supabase_url.rstrip('/')}/rest/v1/newsletters"

    def _do_insert(p):
        req = urllib.request.Request(url, data=json.dumps(p).encode("utf-8"), method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("apikey", service_role_key)
        req.add_header("Authorization", f"Bearer {service_role_key}")
        req.add_header("Prefer", "return=representation")
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))

    # Try full payload first; on schema mismatch, try progressively reduced payloads
    attempts = [
        ("full", full_payload),
        ("no_variants", {k: v for k, v in full_payload.items() if k != "subject_variants"}),
        ("no_core_claim", {k: v for k, v in full_payload.items()
                            if k not in ("subject_variants", "core_claim")}),
        ("base_only", base_payload),
    ]
    last_err = None
    for label, payload in attempts:
        try:
            result = _do_insert(payload)
            extras = []
            if "theme" in payload: extras.append(f"theme={payload['theme']}")
            if "subject_variants" in payload: extras.append(f"{len(payload['subject_variants'])} subject variants")
            print(f"   Newsletter inserted into Supabase: {result[0]['id']}"
                  + (f" ({', '.join(extras)})" if extras else ""))
            return result[0]
        except urllib.error.HTTPError as e:
            last_err = e
            error_body = e.read().decode("utf-8") if e.fp else "No details"
            # Only retry on column-not-exists style 400s
            if e.code == 400 and ("column" in error_body.lower() or "schema" in error_body.lower()):
                print(f"   Insert variant '{label}' failed (schema mismatch), retrying with fewer fields...")
                continue
            raise RuntimeError(f"Supabase API insert failed ({e.code}): {error_body}")

    error_body = last_err.read().decode("utf-8") if last_err and last_err.fp else "Unknown"
    raise RuntimeError(f"Supabase API insert failed after all attempts: {error_body}")


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

    # HARD DEDUP GATE — abort before any side effects (PDF, insert) if this collides
    if not topic:  # skip for manual overrides
        existing_topics, _ = get_existing_topics_and_themes()
        assert_not_duplicate(meta, existing_topics)

    Path("/tmp/newsletter_title.txt").write_text(meta['title'])
    Path("/tmp/newsletter_slug.txt").write_text(meta['slug'])

    print("\nBuilding playbook PDF...")
    pdf_name = meta.get('pdf_filename', f"{meta['slug'].replace('-','_')}_ChurnIsDead.pdf")
    pdf_path = PDFS_DIR / pdf_name
    PDFS_DIR.mkdir(parents=True, exist_ok=True)
    build_playbook_pdf(pb, meta, pdf_path)

    # Guarantee the playbook CTA is in the body. The split Stage-3 prose call can
    # omit it, which leaves the published article with no funnel to the playbook PDF.
    if "[CTA link=" not in content:
        cta_label = (meta.get("playbook_title") or "the Audit").strip()
        if cta_label.lower().startswith("the "):
            cta_label = cta_label[4:]
        content = content.rstrip() + f'\n\n[CTA link="/pdfs/{pdf_name}"]Download the {cta_label}[/CTA]'
        print(f"   CTA missing from body — auto-appended /pdfs/{pdf_name}")
    else:
        print("   CTA present in body")

    print("\nInserting newsletter into Supabase...")
    pub = get_next_free_tuesday()
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
