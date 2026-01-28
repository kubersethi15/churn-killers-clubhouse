# Memory: features/cs-analyzer/risk-sub-classification
Updated: now

The CS Analyzer now splits "Customer Risk" into two distinct sub-categories detected by the triage bot:

1. **Active Incident** (`customer-risk`): Outages, SLA breaches, exec escalations, support crises, compensation discussions. Uses existing incident-focused prompt with sections like Incident Impact, Root Cause Signals, Immediate Stabilization Plan.

2. **Silent Strategic Risk** (`customer-risk-silent`): Tool review, low adoption, leadership changes, budget scrutiny, quiet disengagement. Uses new dedicated prompt with sections:
   - Silent Churn Risk Score (0-100)
   - Strategic Risk Signals with Priority (Critical/High/Medium/Low)
   - Adoption Fragmentation Analysis
   - Leadership Alignment Gaps
   - Observability & Strategy Maturity
   - 30-Day Proactive Intervention Plan

The triage bot suggests the sub-type based on content signals, and users can confirm or override. Key detection signals:
- Active: "outage", "SLA", "escalation", "incident", "compensation", angry language
- Silent: "evaluating options", "tool review", "low adoption", "leadership change", "budget scrutiny", no crisis language
