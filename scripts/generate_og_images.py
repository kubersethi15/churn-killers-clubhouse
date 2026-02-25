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
import re
import textwrap
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
def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

FONT_SERIF_BOLD = "/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf"
FONT_SANS_BOLD = "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"
FONT_SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


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
    
    return newsletters


def generate_og_image(slug, title):
    """Generate a single OG image for a newsletter."""
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Red accent bar at top
    draw.rectangle([(0, 0), (WIDTH, 6)], fill=RED)
    
    # "CHURN IS DEAD" wordmark
    font_wordmark = load_font(FONT_SERIF_BOLD, 28)
    draw.text((80, 50), "CHURN IS DEAD", fill=RED, font=font_wordmark)
    
    # Red underline under wordmark
    wm_bbox = draw.textbbox((80, 50), "CHURN IS DEAD", font=font_wordmark)
    draw.rectangle([(80, wm_bbox[3] + 4), (wm_bbox[2], wm_bbox[3] + 7)], fill=RED)
    
    # Newsletter title - wrap to fit
    font_title = load_font(FONT_SERIF_BOLD, 52)
    
    # Word-wrap the title
    max_chars = 28  # chars per line at this font size
    wrapped = textwrap.fill(title, width=max_chars)
    lines = wrapped.split("\n")[:3]  # Max 3 lines
    
    y_start = 140
    line_height = 68
    for i, line in enumerate(lines):
        draw.text((80, y_start + i * line_height), line, fill=WHITE, font=font_title)
    
    # Separator line
    sep_y = y_start + len(lines) * line_height + 30
    draw.rectangle([(80, sep_y), (300, sep_y + 2)], fill=RED)
    
    # "by Kuber Sethi"
    font_author = load_font(FONT_SANS, 20)
    draw.text((80, sep_y + 20), "by Kuber Sethi", fill=GRAY, font=font_author)
    
    # Bottom bar
    draw.rectangle([(0, HEIGHT - 60), (WIDTH, HEIGHT)], fill=(10, 20, 35))
    
    # Bottom left: churnisdead.com
    font_url = load_font(FONT_SANS, 16)
    draw.text((80, HEIGHT - 42), "churnisdead.com", fill=LIGHT_GRAY, font=font_url)
    
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
