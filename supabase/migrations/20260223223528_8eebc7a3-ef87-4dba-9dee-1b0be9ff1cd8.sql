UPDATE public.newsletters 
SET content = regexp_replace(
  content,
  '\*\*\[Download the CS Survival Audit →\]\*\*',
  '[CTA link="/pdfs/CS_Survival_Audit_ChurnIsDead.pdf" download="true"]Download the CS Survival Audit[/CTA]'
)
WHERE slug = 'customer-success-doesnt-deserve-to-survive';