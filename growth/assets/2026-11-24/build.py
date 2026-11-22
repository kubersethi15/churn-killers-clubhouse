from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from pathlib import Path
import fitz
root=Path(__file__).resolve().parent
root.mkdir(parents=True,exist_ok=True)
pdf=root/'Who Gets the Next Engineer.pdf'
c=canvas.Canvas(str(pdf),pagesize=(540,675))
navy='#172338';cream='#F7F1E8';red='#C9343D'
def base(n):
 c.setFillColor(HexColor(cream));c.rect(0,0,540,675,fill=1,stroke=0)
 c.setFillColor(HexColor(red));c.setFont('Helvetica-Bold',12);c.drawString(38,638,'CS CALLS I WOULD DEFEND / 02')
 c.setFont('Helvetica-Bold',11);c.drawString(38,613,'HYPOTHETICAL CASE')
 c.setFillColor(HexColor(navy));c.setFont('Helvetica',10);c.drawString(38,26,'KUBER SETHI / CHURN IS DEAD');c.drawRightString(502,26,f'{n} / 3')
def text(t,y,size=22,bold=False,width=464,lead=None):
 c.setFillColor(HexColor(navy));font='Helvetica-Bold' if bold else 'Helvetica';c.setFont(font,size)
 for line in simpleSplit(t,font,size,width):
  c.drawString(38,y,line);y-=lead or size*1.3
 return y
base(1)
y=text('Who gets the next engineer?',565,36,True,lead=43)
y=text('One engineer. Two customers.',y-17,23,True)
y=text('LARGER CUSTOMER',y-40,14,True)
y=text('Export broken. Clumsy workaround. Renewal close. Threatening to leave.',y-28,23)
y=text('SMALLER CUSTOMER',y-32,14,True)
y=text('Core workflow stopped. No workaround. No cancellation threat.',y-28,23)
text('Same support entitlement. No security or data-loss incident. No breached emergency promise.',119,16,width=464,lead=21)
c.showPage()
base(2)
y=text("I'd start with the blocked workflow.",565,36,True,lead=43)
y=text('Put a leader on the phone with the larger customer while the engineer restores the stopped work.',y-26,25,lead=33)
y=text('The renewal risk matters. So does the cost of leaving another customer unable to work.',y-35,23,lead=31)
y=text("If a threat changes our priority, let's name whose work we're putting behind it.",y-35,25,True,lead=32)
text('This is a judgement call for these facts. A different impact, entitlement or urgent obligation can change it.',113,16,lead=21)
c.showPage()
base(3)
y=text('Make the trade-off visible.',565,36,True,lead=43)
for number,title,body in [('01','What can the customer not do?','Describe the stopped work and the real workaround.'),('02','What changes if we wait?','Check immediate harm and commitments, as well as renewal risk.'),('03','What would change our call?','Write the missing fact. Revisit when it arrives.')]:
 y=text(number,y-19,13,True);y=text(title,y-25,22,True);y=text(body,y-27,19,lead=24)
text('Save this case for your next escalation review.',68,16,True)
c.save()
doc=fitz.open(pdf)
for i,p in enumerate(doc):
 p.get_pixmap(matrix=fitz.Matrix(0.6667,0.6667)).save(root/f'page-{i+1}-mobile.png')
print(str(pdf));print('pages',len(doc),'bytes',pdf.stat().st_size)
