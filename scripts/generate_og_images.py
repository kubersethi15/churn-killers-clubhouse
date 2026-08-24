#!/usr/bin/env python3
"""
Generate branded OG social preview images for each newsletter.
Output: public/og/{slug}.png (1200x630)

Design:
- Dark navy background (#0F1B2D)
- Red accent bar at top
- "CHURN IS DEAD" wordmark
- Newsletter title (large, wrapped)
- Issue label + "by Kuber Sethi"
- "churnisdead.com" + "New issue every Tuesday"

Usage:
  python scripts/generate_og_images.py                    # Generate for all issues
  python scripts/generate_og_images.py --slug my-slug --title "My Title"  # Single issue
"""

import os
import sys
import glob
import html
import json
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(REPO_ROOT, "public", "og")
MIGRATIONS_DIR = os.path.join(REPO_ROOT, "supabase", "migrations")

# Design constants
WIDTH, HEIGHT = 1200, 630
BG_COLOR = (15, 27, 45)        # #0F1B2D navy
RED = (220, 38, 38)            # #DC2626
WHITE = (255, 255, 255)
GRAY = (156, 163, 175)         # #9CA3AF
LIGHT_GRAY = (209, 213, 219)   # #D1D5DB

# Fonts
FONT_SERIF_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/Library/Fonts/Georgia Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf",
]
FONT_SANS_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
]
FONT_SANS_BOLD_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
]


def resolve_font(candidates):
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate
    raise RuntimeError(f"No scalable font found. Tried: {', '.join(candidates)}")


FONT_SERIF_BOLD = resolve_font(FONT_SERIF_CANDIDATES)
FONT_SANS_BOLD = resolve_font(FONT_SANS_BOLD_CANDIDATES)
FONT_SANS = resolve_font(FONT_SANS_CANDIDATES)


def load_font(path, size):
    return ImageFont.truetype(path, size)


def wrap_by_pixels(draw, text, font, max_width):
    lines, current = [], []
    for word in text.split():
        candidate = " ".join([*current, word])
        width = draw.textbbox((0, 0), candidate, font=font)[2]
        if current and width > max_width:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines


def short_hook(title):
    cleaned = re.sub(r"^(the|your|a|an)\s+", "", title.strip(), flags=re.IGNORECASE)
    cleaned = re.split(r"[:?.!]", cleaned, maxsplit=1)[0]
    words = cleaned.split()
    return " ".join(words[:5]).rstrip(".,:;-")


def format_and_flow(title):
    lowered = title.lower()
    if re.search(r"evidence|data|metric|forecast|usage|score|signal", lowered):
        return "EVIDENCE REVIEW", ["WHAT HAPPENED", "WHY IT MATTERS", "WHAT TO DO"]
    if re.search(r"framework|playbook|system|model|packet|ledger|map|review|kickoff|onboarding|silence|digital cs", lowered):
        return "PRACTICAL GUIDE", ["THE PROBLEM", "A WAY FORWARD", "NEXT STEP"]
    return "STRAIGHT OPINION", ["THE ASSUMPTION", "THE HONEST TEST", "WHAT NEXT"]


def extract_newsletters_from_migrations():
    """Extract slug and title from migration SQL files."""
    newsletters = []
    migration_files = sorted(glob.glob(os.path.join(MIGRATIONS_DIR, "*.sql")))
    
    for f in migration_files:
        with open(f, "r") as fh:
            content = fh.read()
        
        # Match INSERT INTO newsletters ... VALUES patterns
        # Look for (slug, title) in various INSERT formats
        inserts = re.findall(
            r"INSERT INTO.*?newsletters.*?VALUES\s*\((.*?)\)\s*(?:ON CONFLICT|;)",
            content, re.DOTALL | re.IGNORECASE
        )
        
        for values_str in inserts:
            # Extract quoted strings - first is usually title, slug is nearby
            strings = re.findall(r"'((?:[^']|'')*)'", values_str)
            if len(strings) >= 2:
                # Typical order: title, slug, ... or varies by migration
                # Try to identify slug (contains hyphens, no spaces) vs title
                slug = None
                title = None
                for s in strings:
                    s_clean = s.replace("''", "'")
                    if re.match(r'^[a-z0-9-]+$', s_clean) and len(s_clean) > 5:
                        slug = s_clean
                    elif not title and len(s_clean) > 10 and not s_clean.startswith('20'):
                        title = s_clean
                
                if slug and title:
                    newsletters.append({"slug": slug, "title": title})
    
    # The static article pages are the canonical catalogue and catch issues
    # introduced by scripts whose SQL layout differs from older migrations.
    page_dir = Path(REPO_ROOT) / "public" / "newsletter"
    for page in sorted(page_dir.glob("*/index.html")):
        source = page.read_text(encoding="utf-8")
        match = re.search(r'<meta property="og:title" content="([^"]+)"', source)
        if not match:
            match = re.search(r"<title>(.*?)\s*\|\s*Churn Is Dead</title>", source, re.DOTALL)
        if match:
            title = html.unescape(re.sub(r"\s+", " ", match.group(1)).strip())
            title = re.sub(r"\s*\|\s*Churn Is Dead.*$", "", title, flags=re.IGNORECASE)
            newsletters.append({"slug": page.parent.name, "title": title})

    deduped = {item["slug"]: item for item in newsletters}

    # Editorial packages are the source of truth for approved title rewrites.
    # Only override slugs already present in the public catalogue so future
    # issues do not leak into generated assets before publication.
    issue_dir = Path(REPO_ROOT) / "editorial" / "issues"
    for metadata_path in issue_dir.glob("*/metadata.json"):
        try:
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        slug = metadata.get("slug")
        title = metadata.get("title")
        if slug in deduped and isinstance(title, str) and title.strip():
            deduped[slug]["title"] = title.strip()

    return list(deduped.values())


def generate_og_image(slug, title):
    """Generate a single OG image for a newsletter."""
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Red accent bar at top
    draw.rectangle([(0, 0), (WIDTH, 6)], fill=RED)
    
    format_label, flow = format_and_flow(title)
    font_wordmark = load_font(FONT_SERIF_BOLD, 27)
    draw.text((70, 48), "CHURN IS DEAD", fill=WHITE, font=font_wordmark)
    draw.rectangle([(70, 84), (265, 89)], fill=RED)
    font_label = load_font(FONT_SANS_BOLD, 15)
    draw.text((70, 123), format_label, fill=RED, font=font_label)

    hook = short_hook(title)
    font_title = load_font(FONT_SERIF_BOLD, 66)
    lines = wrap_by_pixels(draw, hook, font_title, 640)[:3]
    for i, line in enumerate(lines):
        draw.text((70, 165 + i * 78), line, fill=WHITE, font=font_title)

    font_original = load_font(FONT_SANS, 16)
    original_lines = wrap_by_pixels(draw, title, font_original, 620)[:2]
    original_y = 165 + len(lines) * 78 + 24
    for i, line in enumerate(original_lines):
        draw.text((72, original_y + i * 23), line, fill=GRAY, font=font_original)

    canvas_x, canvas_y, canvas_w, canvas_h = 775, 105, 350, 390
    draw.rounded_rectangle([(canvas_x, canvas_y), (canvas_x + canvas_w, canvas_y + canvas_h)], radius=24, fill=(23, 39, 64), outline=(55, 72, 98), width=2)
    draw.text((canvas_x + 26, canvas_y + 24), "IN THIS ISSUE", fill=LIGHT_GRAY, font=load_font(FONT_SANS_BOLD, 13))
    for index, step in enumerate(flow):
        y = canvas_y + 78 + index * 92
        draw.rounded_rectangle([(canvas_x + 25, y), (canvas_x + canvas_w - 25, y + 62)], radius=12, fill=(15, 27, 45), outline=(70, 87, 112), width=1)
        draw.text((canvas_x + 43, y + 18), f"0{index + 1}", fill=RED, font=load_font(FONT_SERIF_BOLD, 20))
        draw.text((canvas_x + 90, y + 22), step, fill=WHITE, font=load_font(FONT_SANS_BOLD, 14))
    
    # Bottom bar
    draw.rectangle([(0, HEIGHT - 60), (WIDTH, HEIGHT)], fill=(10, 20, 35))
    
    # Bottom left: churnisdead.com
    font_url = load_font(FONT_SANS, 16)
    draw.text((70, HEIGHT - 42), "churnisdead.com  ·  by Kuber Sethi", fill=LIGHT_GRAY, font=font_url)
    
    # Bottom right: "New issue every Tuesday" pill
    pill_text = "New issue every Tuesday"
    pill_font = load_font(FONT_SANS, 14)
    pill_bbox = draw.textbbox((0, 0), pill_text, font=pill_font)
    pill_w = pill_bbox[2] - pill_bbox[0] + 24
    pill_h = 28
    pill_x = WIDTH - 80 - pill_w
    pill_y = HEIGHT - 48
    draw.rounded_rectangle(
        [(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)],
        radius=14, fill=RED
    )
    draw.text((pill_x + 12, pill_y + 5), pill_text, fill=WHITE, font=pill_font)
    
    # Save
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{slug}.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"  ✓ {out_path}")
    return out_path


def generate_brand_assets():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw.rectangle([(0, 0), (WIDTH, 7)], fill=RED)
    draw.text((70, 55), "CHURN IS DEAD", fill=WHITE, font=load_font(FONT_SERIF_BOLD, 34))
    draw.text((70, 145), "Honest thinking for", fill=WHITE, font=load_font(FONT_SERIF_BOLD, 64))
    draw.text((70, 225), "Customer Success.", fill=RED, font=load_font(FONT_SERIF_BOLD, 64))
    flow = ["ONE SHARP TAKE", "A WAY FORWARD", "ONE USEFUL TOOL"]
    for index, label in enumerate(flow):
        x = 70 + index * 350
        draw.rounded_rectangle([(x, 360), (x + 310, 465)], radius=16, fill=(23, 39, 64), outline=(62, 79, 105), width=2)
        draw.text((x + 22, 382), f"0{index + 1}", fill=RED, font=load_font(FONT_SERIF_BOLD, 22))
        draw.text((x + 22, 423), label, fill=WHITE, font=load_font(FONT_SANS_BOLD, 17))
    draw.text((70, 555), "Every Tuesday  ·  churnisdead.com", fill=LIGHT_GRAY, font=load_font(FONT_SANS, 18))
    img.save(Path(REPO_ROOT) / "public" / "og-image.png", "PNG", optimize=True)

    banner = Image.new("RGB", (1584, 396), BG_COLOR)
    bdraw = ImageDraw.Draw(banner)
    bdraw.rectangle([(0, 0), (12, 396)], fill=RED)
    bdraw.text((75, 72), "CHURN IS DEAD", fill=WHITE, font=load_font(FONT_SERIF_BOLD, 58))
    bdraw.text((76, 160), "Honest Customer Success thinking for people doing the work.", fill=LIGHT_GRAY, font=load_font(FONT_SANS, 27))
    bdraw.text((76, 235), "One sharp take.  A practical way forward.  One useful tool.", fill=WHITE, font=load_font(FONT_SANS_BOLD, 22))
    bdraw.rounded_rectangle([(76, 305), (385, 354)], radius=24, fill=RED)
    bdraw.text((104, 320), "NEW ISSUE EVERY TUESDAY", fill=WHITE, font=load_font(FONT_SANS_BOLD, 15))
    banner.save(Path(REPO_ROOT) / "public" / "linkedin-banner.png", "PNG", optimize=True)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", help="Generate for a single slug")
    parser.add_argument("--title", help="Title for single slug")
    args = parser.parse_args()
    
    if args.slug and args.title:
        print(f"Generating OG image for: {args.slug}")
        generate_og_image(args.slug, args.title)
        return

    generate_brand_assets()
    
    # Generate for all newsletters from migrations
    print("Extracting newsletters from migrations...")
    newsletters = extract_newsletters_from_migrations()
    
    if not newsletters:
        print("No newsletters found in migrations. Use --slug and --title for manual generation.")
        return
    
    print(f"Found {len(newsletters)} newsletters. Generating OG images...\n")
    for nl in newsletters:
        generate_og_image(nl["slug"], nl["title"])
    
    print(f"\nDone! {len(newsletters)} images in {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
