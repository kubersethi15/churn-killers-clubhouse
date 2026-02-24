-- Create playbooks table
CREATE TABLE IF NOT EXISTS public.playbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pdf_path TEXT,
  notion_link TEXT,
  newsletter_slug TEXT,
  newsletter_title TEXT,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.playbooks
  FOR SELECT USING (true);

-- Seed: Migrate all existing hardcoded playbooks

-- Old Notion-based playbooks (from earlier newsletters)
INSERT INTO public.playbooks (title, description, notion_link, newsletter_slug, newsletter_title, published_date) VALUES
('Customer Predictability Index (CPI) Framework', 'A tiered framework to assess and improve customer predictability across trust, engagement, and outcomes.', 'https://www.notion.so/Customer-Predictability-Index-CPI-Framework-Tiered-Guide-2015d0709c9980b18354e3512b86ebff', 'the-customer-predictability-revolution', 'The Customer Predictability Revolution', '2025-06-03'),
('CO-OP Framework', 'The exact system that helped save a $2M renewal. Used by 10+ enterprise CS teams to increase renewal predictability and expansion velocity.', 'https://www.notion.so/CO-OP-Framework-2235d0709c998059a8a4dc2c18393b25', 'the-question-thats-breaking-your-cs-team', 'The Question That''s Breaking Your CS Team', '2025-06-10'),
('Kickoff Re-Discovery Checklist', 'A tactical checklist to align internally, validate goals, and earn trust before the first customer call.', 'https://www.notion.so/Kickoff-Re-Discovery-Checklist-1f95d0709c9980cfb35ae653901a6661', 'the-perfect-kickoff-call', 'The Perfect Kickoff Call', '2025-06-17'),
('Kickoff Agenda Blueprint', 'A tactical agenda to lead high-trust kickoff calls across doers, managers, and execs.', 'https://www.notion.so/Kickoff-Agenda-Blueprint-1f95d0709c9980e1a233cdd529187a6e', 'the-perfect-kickoff-call', 'The Perfect Kickoff Call', '2025-06-17'),
('Customer Momentum Framework', 'A strategic framework to identify, track, and accelerate customer momentum across the entire lifecycle.', 'https://www.notion.so/Customer-Momentum-Framework-20a5d0709c9980259ea4c3fdcc0b38b1', NULL, 'Customer Momentum Framework', '2025-06-24'),
('Timeline Negotiator', 'A framework for negotiating realistic timelines that build trust with customers and internal stakeholders.', 'https://www.notion.so/Timeline-Negotiator-1f95d0709c99808e8926eaeff56ef138', 'their-timeline-not-yours', 'Their Timeline, Not Yours', '2025-07-01'),
('Value Story Slide', 'A 1-slide QBR format that ties usage to outcomes to business value, with example metrics by persona.', 'https://www.notion.so/The-Value-Story-Slide-2005d0709c99805f8f77c22747e82315', 'usage-is-not-success', 'Usage Is Not Success', '2025-07-08'),
('Expansion Playbook', 'A lightweight framework to identify and nurture expansion signals across the customer journey.', 'https://www.notion.so/The-Expansion-Playbook-2315d0709c998007a494d0f646389297', 'the-expansion-moment-hiding-in-plain-sight', 'The Expansion Moment Hiding in Plain Sight', '2025-07-15');

-- New PDF-based playbooks (Issues #1-5)
INSERT INTO public.playbooks (title, description, pdf_path, newsletter_slug, newsletter_title, published_date) VALUES
('CS Survival Audit', 'Revenue attribution scorecard, technical credibility assessment, decision impact tracker, upstream influence checklist, and proof of absence diagnostic.', '/pdfs/CS_Survival_Audit_ChurnIsDead.pdf', 'customer-success-doesnt-deserve-to-survive', 'Customer Success Doesn''t Deserve to Survive', '2026-02-25'),
('AI Exposure Audit', 'Task exposure map, 5% calculator, role restructuring blueprint, upskilling priority matrix, and AI tool evaluation scorecard.', '/pdfs/AI_Exposure_Audit_ChurnIsDead.pdf', 'ai-wont-save-customer-success', 'AI Won''t Save Customer Success', '2026-03-04'),
('Revenue Readiness Audit', '5 prerequisites scorecard, workload restructuring calculator, compensation model templates, account segmentation matrix, and revenue blame red flag checklist.', '/pdfs/Revenue_Readiness_Audit_ChurnIsDead.pdf', 'the-revenue-ownership-trap', 'The Revenue Ownership Trap', '2026-03-11'),
('Strategic Impact Audit', 'Decision impact log, QBR transformation template, CFO translation worksheet, level-up development plan, and strategic readiness self-assessment.', '/pdfs/Strategic_Impact_Audit_ChurnIsDead.pdf', 'stop-calling-yourself-strategic', 'Stop Calling Yourself Strategic', '2026-03-18'),
('Health Score Reality Check', 'Signal audit worksheet, leading indicator identifier, operational embedding scorecard, executive narrative builder, and health system redesign blueprint.', '/pdfs/Health_Score_Reality_Check_ChurnIsDead.pdf', 'health-scores-are-astrology', 'Health Scores Are Astrology for CS Teams', '2026-03-25');
