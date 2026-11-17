from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

root=Path(__file__).parent
for name,file in [('Body','Arial.ttf'),('Bold','Arial Bold.ttf'),('Display','Georgia Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,'/System/Library/Fonts/Supplemental/'+file))
W,H=540,675
INK=HexColor('#172536'); RED=HexColor('#B42536'); CREAM=HexColor('#FBF8F1'); GRAY=HexColor('#59616B')
c=canvas.Canvas(str(root/'priority-case-unapproved-review.pdf'),pagesize=(W,H))
c.setTitle('Who gets the engineer? Unapproved review')
c.setAuthor('Kuber Sethi')
c.setSubject('Original hypothetical decision case. Unapproved reserve for weekly review.')
def text(s,x,y,size=18,font='Body',color=INK):
    c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,s)
def wrap(s,y,size=20,leading=28,font='Body',color=INK):
    line=''
    for word in s.split():
        candidate=(line+' '+word).strip()
        if pdfmetrics.stringWidth(candidate,font,size)>460 and line:
            text(line,40,y,size,font,color);y-=leading;line=word
        else: line=candidate
    if line: text(line,40,y,size,font,color);y-=leading
    assert y>=75, f'Body overflow: {y}'
    return y

def base(n,label):
    c.setFillColor(CREAM);c.rect(0,0,W,H,stroke=0,fill=1)
    text('CS CALLS I WOULD DEFEND',40,632,12,'Bold',RED)
    text(label,40,607,11,'Bold',GRAY)
    c.setStrokeColor(HexColor('#D6D6D0'));c.line(40,52,500,52)
    text('KUBER SETHI',40,32,10,'Bold')
    text('HYPOTHETICAL / UNAPPROVED REVIEW',144,32,8.5,'Bold',GRAY)
    text(f'{n}/3',479,32,10,'Bold')
def title(lines):
    y=553
    for line in lines: text(line,40,y,31,'Display');y-=40
    return y

base(1,'01 / A FICTIONAL PRIORITY CALL')
title(['Your biggest customer', 'is second in line.'])
text('TWO ACCOUNTS. ONE AVAILABLE ENGINEER.',40,441,11,'Bold',RED)
y=wrap('The largest renewal this quarter has a broken export and an awkward workaround.',407,size=21,leading=29)
y=wrap('A smaller customer has a stopped core workflow and no workaround.',y-17,size=21,leading=29)
y=wrap('Both have the same support entitlement. One engineer can take either issue.',y-17,size=21,leading=29)
wrap('Who goes first?',y-20,size=25,leading=32,font='Bold',color=RED)
c.showPage()

base(2,'02 / THE STRONGEST CASE FOR THE RENEWAL')
title(['The revenue risk', 'deserves a hearing.'])
y=wrap('The revenue matters. The workaround is costly. Losing trust could make the renewal harder.',437,size=21,leading=29)
y=wrap("Those points deserve a leader's attention. They don't restore the other customer's stopped workflow.",y-18,size=21,leading=29)
text('THE LIMITS OF THIS MADE-UP CASE',40,y-22,11,'Bold',RED)
wrap('Assume no security incident, data loss or breached response promise. Any of those would change the case.',y-54,size=19,leading=27)
c.showPage()

base(3,'03 / MY CALL ON THESE FACTS')
title(["I'd restore the", 'blocked workflow first.'])
y=wrap("I'd put a leader on the larger customer's call, explain the priority and agree the next update without inventing a fix time.",437,size=21,leading=29)
y=wrap("If leadership chooses the renewal first, I'd want them to say which customer's work stays blocked.",y-19,size=21,leading=29)
wrap('Who gets the engineer on your team?',y-23,size=24,leading=32,font='Bold',color=RED)
c.showPage();c.save()
print(root/'priority-case-unapproved-review.pdf')
