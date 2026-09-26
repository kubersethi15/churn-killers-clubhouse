"""Deterministic one-page action aid and copyable prompt for issue data.

This renderer makes no network calls and cannot publish or approve an issue.
Existing playbooks retain the legacy renderer unless they explicitly opt in.
"""

from pathlib import Path
from datetime import datetime
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def build_compact_playbook(playbook, metadata, output_path):
    version = datetime.fromisoformat(metadata["published_date"].replace("Z", "+00:00")).strftime("%B %Y")
    navy = colors.HexColor("#11172A")
    red = colors.HexColor("#E52335")
    cream = colors.HexColor("#F3EFE7")
    muted = colors.HexColor("#606575")
    border = colors.HexColor("#D7D3CB")
    width = 528
    styles = {
        "eyebrow": ParagraphStyle("eyebrow", fontName="Helvetica-Bold", fontSize=8, leading=12, textColor=red, spaceAfter=9),
        "title": ParagraphStyle("title", fontName="Times-Bold", fontSize=29, leading=31, textColor=navy, spaceAfter=8),
        "subtitle": ParagraphStyle("subtitle", fontName="Helvetica", fontSize=12, leading=16, textColor=navy, spaceAfter=12),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.5, leading=13, textColor=navy, spaceAfter=6),
        "small": ParagraphStyle("small", fontName="Helvetica", fontSize=8, leading=11, textColor=muted, spaceAfter=6),
        "heading": ParagraphStyle("heading", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=navy, spaceBefore=7, spaceAfter=4),
        "prompt": ParagraphStyle("prompt", fontName="Helvetica", fontSize=9, leading=12, textColor=navy),
        "cell": ParagraphStyle("cell", fontName="Helvetica", fontSize=9, leading=12, textColor=navy),
        "header": ParagraphStyle("header", fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=colors.white),
    }

    def p(value, style="body"):
        return Paragraph(escape(str(value)), styles[style])

    def table(headers, rows, ratios, blank=False):
        data = [[p(value, "header") for value in headers]]
        data += [[p(value, "cell") for value in row] for row in rows]
        result = Table(data, colWidths=[width * ratio for ratio in ratios], repeatRows=1,
                       minRowHeights=[25] + [32 if blank else 30] * len(rows))
        result.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), navy),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, cream]),
            ("GRID", (0, 0), (-1, -1), .4, border),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        return result

    def page(canvas, doc):
        if doc.page > 1:
            raise ValueError("Compact playbook exceeds one page; shorten content before publication")
        canvas.saveState()
        canvas.setStrokeColor(red)
        canvas.setLineWidth(3)
        canvas.line(42, 757, 570, 757)
        canvas.setStrokeColor(border)
        canvas.setLineWidth(.5)
        canvas.line(42, 36, 570, 36)
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(muted)
        canvas.drawString(42, 23, f"CHURN IS DEAD  |  Kuber Sethi  |  {version}")
        canvas.drawRightString(570, 23, "1 / 1")
        canvas.restoreState()

    example = playbook["example"]
    story = [p("CHURN IS DEAD / ONE-PAGE ACTION GUIDE", "eyebrow"), p(playbook["title"], "title"),
             p(playbook["subtitle"], "subtitle")]
    for index, section in enumerate(playbook["sections"], 1):
        story.append(p(f"0{index}  {section['title']}", "heading"))
        story.append(p(section["instruction"]))
    story += [p(example.get("heading", "Example: an implementation plan"), "heading"), p(example["label"], "small"),
              table(example["headers"], example["rows"], [.66, .17, .17]), Spacer(1, 6),
              p(example["interpretation"], "small"), p("Copy this prompt. Add your observations.", "heading")]
    prompt = Paragraph(escape(playbook["prompt"]).replace("\n", "<br/>"), styles["prompt"])
    box = Table([[prompt]], colWidths=[width])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), cream),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story += [box, Spacer(1, 7), p(playbook["next_action"], "small"), p(playbook["methodology"], "small")]
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(output_path), pagesize=letter, rightMargin=42, leftMargin=42,
                            topMargin=48, bottomMargin=47, title=playbook["title"],
                            author="Kuber Sethi", subject=playbook["subtitle"])
    doc.build(story, onFirstPage=page, onLaterPages=page)
