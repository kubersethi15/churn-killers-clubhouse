UPDATE public.newsletters 
SET content = replace(
  content,
  '- **Proof of Absence Diagnostic** — The exercise that reveals whether your team is truly embedded or just present

---',
  '- **Proof of Absence Diagnostic** — The exercise that reveals whether your team is truly embedded or just present

[CTA link="/pdfs/CS_Survival_Audit_ChurnIsDead.pdf"]Download the CS Survival Audit[/CTA]

---'
)
WHERE slug = 'customer-success-doesnt-deserve-to-survive';