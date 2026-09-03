#!/usr/bin/env python3
"""Build the compact Churn Is Dead three-slide QBR template."""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "pdfs" / "30-Minute-QBR-Framework-ChurnIsDead.pdf"

NAVY = HexColor("#11172A")
RED = HexColor("#E52335")
CREAM = HexColor("#F3EFE7")
INK = HexColor("#252938")
MUTED = HexColor("#606575")
LINE = HexColor("#D7D3CB")
WHITE = HexColor("#FFFFFF")


def text(c, x, y, value, font="Helvetica", size=10, color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, value)


def wrapped(c, x, y, value, width, font="Helvetica", size=10, leading=14, color=INK):
    words = value.split()
    lines = []
    current = []
    for word in words:
        candidate = " ".join(current + [word])
        if c.stringWidth(candidate, font, size) <= width:
            current.append(word)
        else:
            lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    for line in lines:
        text(c, x, y, line, font, size, color)
        y -= leading
    return y


def footer(c, page_number):
    c.setStrokeColor(LINE)
    c.line(42, 34, 570, 34)
    text(c, 42, 20, "CHURN IS DEAD", "Helvetica-Bold", 7, NAVY)
    text(c, 520, 20, f"0{page_number} / 02", "Helvetica-Bold", 7, MUTED)


def field_line(c, x, y, label, width):
    text(c, x, y, label.upper(), "Helvetica-Bold", 7, MUTED)
    c.setStrokeColor(LINE)
    c.line(x, y - 12, x + width, y - 12)


def slide_card(c, y, number, title, instruction, fields):
    x = 42
    width = 528
    height = 157
    c.setFillColor(WHITE)
    c.setStrokeColor(NAVY)
    c.setLineWidth(1.2)
    c.rect(x, y - height, width, height, fill=1, stroke=1)
    c.setFillColor(RED)
    c.rect(x, y - height, 7, height, fill=1, stroke=0)
    text(c, x + 22, y - 31, number, "Times-Bold", 26, RED)
    text(c, x + 75, y - 27, title, "Times-Bold", 18, NAVY)
    wrapped(c, x + 75, y - 46, instruction, 455, size=8.5, leading=11, color=MUTED)
    field_y = y - 82
    for label in fields:
        field_line(c, x + 75, field_y, label, 440)
        field_y -= 30


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=letter)
    c.setTitle("The 30-Minute QBR: Three Slides")
    c.setAuthor("Kuber Sethi | Churn Is Dead")
    c.setSubject("A practical three-slide quarterly business review template")

    # Page 1: the complete three-slide template.
    c.setFillColor(CREAM)
    c.rect(0, 0, 612, 792, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, 650, 612, 142, fill=1, stroke=0)
    text(c, 42, 757, "CHURN IS DEAD  /  WORKING TEMPLATE", "Helvetica-Bold", 8, RED)
    text(c, 42, 716, "THE 30-MINUTE QBR", "Times-Bold", 30, WHITE)
    text(c, 42, 680, "THREE SLIDES. THAT'S IT.", "Times-Bold", 30, WHITE)
    text(c, 42, 657, "The whole structure. Nothing extra.", "Helvetica", 10, HexColor("#BBC0CD"))

    slide_card(
        c, 626, "01", "The customer's goal",
        "Anchor the room in the outcome that matters and how the last three months aligned to it.",
        ["Customer's stated goal", "How the quarter aligned, drifted, or changed", "Context the room needs"],
    )
    slide_card(
        c, 453, "02", "What was achieved",
        "Show what moved. Keep the evidence close to the outcome instead of presenting activity.",
        ["Outcome achieved", "Evidence", "What did not move and why"],
    )
    slide_card(
        c, 280, "03", "What happens next",
        "End on the next priority or decision, with a clear owner and the support required.",
        ["Next priority or decision", "Owner and date", "Where support is needed"],
    )
    footer(c, 1)
    c.showPage()

    # Page 2: a short operating guide, not another framework.
    c.setFillColor(CREAM)
    c.rect(0, 0, 612, 792, fill=1, stroke=0)
    text(c, 42, 751, "HOW TO RUN IT", "Helvetica-Bold", 8, RED)
    text(c, 42, 710, "THIRTY MINUTES.", "Times-Bold", 31, NAVY)
    text(c, 42, 674, "ONE USEFUL DECISION.", "Times-Bold", 31, NAVY)
    wrapped(c, 42, 642, "Move through the three slides in order. Keep the conversation tied to the customer's goal, not your internal activity.", 510, size=11, leading=16, color=MUTED)

    items = [
        ("01", "Before the meeting", "Fill the three slides with what is known. Remove the status pages, product tour, and internal detail that the room does not need."),
        ("02", "In the meeting", "Use the slides to have the conversation. If the goal changed, say it. If an outcome did not move, make that visible."),
        ("03", "Before anyone leaves", "Name the next priority or decision, the owner, the date, and where support is needed."),
    ]
    y = 552
    for number, heading, body in items:
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE)
        c.rect(42, y - 106, 528, 106, fill=1, stroke=1)
        text(c, 60, y - 34, number, "Times-Bold", 24, RED)
        text(c, 111, y - 29, heading, "Times-Bold", 17, NAVY)
        wrapped(c, 111, y - 51, body, 428, size=9.5, leading=13, color=MUTED)
        y -= 122

    c.setFillColor(NAVY)
    c.rect(42, 120, 528, 83, fill=1, stroke=0)
    text(c, 60, 176, "THE FINISH LINE", "Helvetica-Bold", 8, RED)
    wrapped(c, 60, 151, "A useful QBR ends with a clear next move. If there is no decision, owner, date, or support request, the meeting is not finished.", 480, "Helvetica-Bold", 11, 15, WHITE)
    footer(c, 2)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build()
