UPDATE public.newsletters 
SET content = content || E'\n\n[CTA link="/pdfs/CS_Survival_Audit_ChurnIsDead.pdf"]Download the CS Survival Audit[/CTA]'
WHERE slug = 'ai-didnt-kill-customer-success';