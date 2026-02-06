import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wand2, FileText, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SampleTranscriptMenuProps {
  onSampleGenerated: (transcript: string) => void;
  disabled?: boolean;
}

// Pre-written realistic sample transcripts with depth
const SAMPLE_TEMPLATES = {
  value: `[Customer Success Call - Q1 Renewal & Expansion Discussion]
Date: February 6, 2026
Duration: 45 minutes
Participants: 
- Sarah Chen (Senior CSM, Our Company)
- Michael Torres (VP of Operations, Acme Corp)
- Jennifer Walsh (CFO, Acme Corp)
- Marcus Johnson (Director of IT, Acme Corp)

---

[00:00] Sarah: Thank you all for joining today. I know everyone's calendar is packed, so I really appreciate you making time. Michael, Jennifer, Marcus - it's great to have the full team here. I wanted to use this session to review the value we've delivered over the past year and discuss how we can support Acme's growth initiatives going forward.

[00:45] Michael: Thanks Sarah. I'll start by saying the operations team has been genuinely impressed with the platform. When we first implemented this 14 months ago, I was skeptical we'd see the ROI projections your team presented. I'm happy to say we've exceeded them.

[01:15] Sarah: That's wonderful to hear. Can you walk Jennifer and Marcus through some of the specific outcomes?

[01:30] Michael: Absolutely. So when we started, our average processing time per order was 23 minutes. We're now at 8.5 minutes - that's a 63% reduction. The team is handling about 40% more volume with the same headcount. If we had to scale traditionally, we'd have needed to hire at least 6 additional FTEs.

[02:15] Jennifer: I've been tracking this closely. At our average fully-loaded cost of $85,000 per employee, that's over $500,000 in avoided headcount costs annually. The platform subscription is a fraction of that.

[02:45] Sarah: That's exactly the kind of ROI story we love to hear. Jennifer, from a finance perspective, how has the visibility into operations changed?

[03:10] Jennifer: Night and day difference. Before, I was getting monthly reports that were already outdated by the time they hit my desk. Now I have real-time dashboards. Last month, I caught a margin issue on one of our product lines within 48 hours instead of waiting for the quarterly review. That early detection probably saved us $200,000.

[03:50] Marcus: From an IT standpoint, I'll add that the integration with our ERP was smoother than expected. We had some initial hiccups with the API rate limits, but your technical team resolved that quickly. System uptime has been 99.7% which exceeds our SLA requirements.

[04:25] Sarah: Marcus, I remember those early integration calls. Your team was fantastic to work with. Speaking of technical needs, I understand you're planning some infrastructure changes this year?

[04:50] Marcus: Yes, we're migrating to a hybrid cloud architecture. We'll need to ensure the platform can handle the transition seamlessly. I've been looking at your enterprise tier features - the dedicated instance option and enhanced security controls would be valuable for our compliance requirements.

[05:30] Michael: That's actually a good segue. Sarah, we've been discussing internally about expanding the platform to our European operations. We have offices in London, Frankfurt, and Amsterdam - about 150 users across those locations.

[06:00] Sarah: That's exciting! I'd love to understand more about what you're envisioning. Same use cases as here, or are there different needs in EMEA?

[06:20] Michael: Primarily the same workflows, but there are some GDPR-specific requirements we'd need to address. Also, the Frankfurt team has some unique regulatory reporting that might need custom configuration.

[06:50] Jennifer: Before we go too deep on expansion, I want to understand the commercial terms. We're approaching renewal in March. Our current contract is $180,000 annually. What would the expansion look like financially?

[07:20] Sarah: Great question. For the EMEA expansion with 150 additional users, plus the enterprise tier upgrade Marcus mentioned, we're looking at approximately $320,000 annually for the combined package. However, given your success and the multi-region commitment, I can offer a 15% volume discount, bringing it to $272,000 - and I'd recommend a 3-year term to lock in current pricing before our planned increases in Q3.

[08:10] Jennifer: That's a significant increase from our current spend. Walk me through the cost justification.

[08:30] Sarah: Of course. You mentioned avoiding $500,000 in headcount costs here in the US. If we project similar efficiency gains for 150 EMEA users, conservatively that's another $300,000 in avoided costs. The enterprise tier adds the compliance features Marcus needs and includes dedicated support with 4-hour SLA - critical for your 24/7 operations. Net-net, you're looking at a 3x ROI minimum.

[09:15] Michael: The ROI math makes sense. My concern is the implementation timeline. We need EMEA live by end of Q2 for our board commitments.

[09:35] Sarah: That's aggressive but doable. I'll put together a detailed implementation plan. We'd need to start discovery calls with the EMEA team leaders within the next two weeks to hit that timeline.

[09:55] Marcus: I'll need to loop in our EMEA IT director, Hans Mueller. He'll have questions about data residency and the EU data centers.

[10:15] Sarah: Perfect. We have data centers in Frankfurt and Dublin specifically for EMEA clients. I can schedule a technical deep-dive with Hans next week.

[10:35] Jennifer: One more thing - the 3-year commitment. Given the economic uncertainty, I'm hesitant to lock in that long. What about a 2-year term?

[10:55] Sarah: I understand the concern. For a 2-year term, I can offer 10% discount instead of 15%, so approximately $288,000 annually. I'd also include a clause allowing you to expand to additional regions at the same per-user rate during the contract period.

[11:25] Jennifer: That flexibility is helpful. Michael, Marcus - any other concerns before we move forward with proposal review?

[11:40] Michael: Just one. The reporting customization Sarah mentioned last quarter - our finance team has been asking for specific export formats for our new ERP. Is that on the roadmap?

[12:00] Sarah: Yes! We're actually launching enhanced reporting in our March release. I can get you early beta access this month. It includes custom export templates and scheduled report delivery.

[12:25] Marcus: That would solve a pain point for us. Currently our team spends 5-6 hours weekly manually reformatting reports.

[12:40] Sarah: Perfect. Let me summarize next steps: I'll send the formal proposal with both 2-year and 3-year options by end of week. I'll schedule the technical call with Hans for next week. And I'll arrange beta access to the new reporting features. Does that work for everyone?

[13:10] Jennifer: Sounds good. I'll need to present this to our CEO and board, but assuming no surprises, I'd like to target signing by end of February to allow time for EMEA implementation.

[13:30] Michael: Agreed. This has been productive. Thanks for putting this together, Sarah.

[13:40] Sarah: Thank you all. I'm excited about the partnership growth. I'll follow up with calendar invites and the proposal by Friday.

---
[End of call]`,

  risk: `[Customer Escalation Call - Critical Production Issues]
Date: February 6, 2026
Duration: 52 minutes
Participants:
- James Wilson (Senior CSM, Our Company)
- Lisa Park (Director of Engineering, TechFlow Inc)
- David Kim (CTO, TechFlow Inc)
- Rachel Nguyen (VP of Customer Experience, TechFlow Inc)
- Tom Bradley (VP of Engineering, Our Company - joined at 15:00)

---

[00:00] James: Thank you all for joining. I know this is a difficult situation, and I want you to know that resolving this is my absolute top priority. David, Lisa, Rachel - please walk me through everything that happened.

[00:30] David: James, I'll be direct. We had a complete platform outage this morning from 6:15 AM to 9:45 AM Pacific. That's three and a half hours during our peak transaction window. Our customers couldn't access dashboards, process payments, or pull reports. This is unacceptable.

[01:00] Lisa: Let me give you the technical details. At 6:15 AM, our monitoring detected a complete loss of connectivity to your API endpoints. We immediately opened a P1 ticket. Your support team acknowledged at 6:32 AM but didn't provide substantive updates until 8:45 AM. By then, we'd already lost most of our morning transaction window.

[01:45] Rachel: From a customer impact perspective - we had 847 end-users who couldn't access the platform. Our support lines were flooded. We received 312 support tickets in those three hours, and our NPS dropped 15 points in our daily survey. I had to personally call three of our enterprise accounts to apologize.

[02:30] James: I'm deeply sorry. You're right - this response was inadequate. Can you tell me more about the business impact?

[02:50] David: We estimate direct revenue loss of approximately $127,000 in transactions that didn't process. But the bigger issue is the reputational damage. Two of our enterprise clients - Meridian Financial and Coastal Healthcare - have explicitly asked us about our vendor reliability. These are $2M and $1.4M accounts respectively.

[03:30] Lisa: And James, let's be clear - this isn't an isolated incident. In the past 60 days, we've had three significant outages: December 15th was 45 minutes, January 8th was 90 minutes, and now this. That's a pattern, not bad luck.

[04:00] James: You're absolutely right to call out the pattern. I've reviewed all three incidents, and I owe you an honest assessment. The December and January issues were related to database scaling that should have been addressed proactively. This morning's incident was a different root cause - a network configuration change that wasn't properly tested.

[04:45] David: Different root causes but same result - our business is impacted, and we're left explaining to our customers why they can't trust us. James, I'll be transparent with you. I've had preliminary conversations with two of your competitors in the past week. Our contract is up in April, and right now, I'm not confident we should renew.

[05:20] Rachel: I want to add context here. When we chose your platform two years ago, reliability was the number one factor. We were paying a premium specifically because you promised enterprise-grade uptime. We're not seeing that.

[05:50] James: I hear you, and I'm not going to make excuses. Before I share what we're doing to address this, I want to understand - what would it take for you to feel confident in the partnership again?

[06:15] David: I need three things. First, I need to understand exactly what failed and why. Not a PR-sanitized incident report, but actual technical root cause analysis. Second, I need concrete commitments on what's changing to prevent recurrence. And third, I need some form of accountability - whether that's SLA credits, contract adjustments, or dedicated resources.

[07:00] Lisa: I'd add a fourth item. I need direct access to your engineering team. Going through support isn't working. When we have an issue, I need to be able to escalate directly to someone who can actually fix things, not just log tickets.

[07:30] James: All of that is fair and reasonable. Let me address each point. On root cause - I have our VP of Engineering, Tom Bradley, joining this call in a few minutes. He'll walk through the technical details directly.

[07:55] James: On prevention, we're implementing three changes immediately. First, all configuration changes now require a staged rollout with automatic rollback triggers - this would have caught this morning's issue. Second, we're deploying enhanced monitoring specifically for TechFlow's environment with alerting thresholds tuned to your traffic patterns. Third, we're assigning a dedicated Site Reliability Engineer to your account for the next 90 days.

[08:45] Rachel: A dedicated SRE is a good start. What about the communication failures? We didn't get a useful update for over two hours this morning.

[09:00] James: You're right. Our incident communication was inadequate. Effective immediately, for any P1 incident affecting TechFlow, you'll receive updates every 30 minutes minimum, directly from the engineer working the issue - not templated support responses. Lisa, I'm also giving you my personal cell and Tom's. For critical issues, you call us directly.

[09:40] David: Fine. What about commercial accountability?

[09:50] James: I'm prepared to offer the following: Full SLA credits for all three incidents - that's approximately $18,000 based on your contract terms. Additionally, I'm proposing we extend your contract by 3 months at no cost, and I'll include the premium support tier - which includes the dedicated SRE - for the remainder of your contract at no additional charge.

[10:30] David: That's a start, but it doesn't address the fundamental question: should we trust that things will actually improve?

[10:50] [Tom Bradley joins the call]

[10:55] Tom: Hi everyone. I'm Tom Bradley, VP of Engineering. James briefed me on the situation, and I want to personally apologize for what happened. I've cleared my calendar to be on this call because TechFlow is a priority account, and we failed you.

[11:20] Lisa: Tom, can you walk us through technically what happened this morning?

[11:30] Tom: Absolutely. At approximately 6:10 AM, a network engineer deployed a routing configuration change to improve latency for our APAC customers. The change was supposed to be isolated to APAC traffic, but due to a misconfigured rule, it affected traffic routing for accounts in your deployment region.

[12:00] Tom: The error cascaded because our automated health checks didn't catch the issue - they were monitoring the wrong endpoints. By the time manual alerts triggered, the damage was done.

[12:25] Lisa: Why wasn't this caught in testing?

[12:35] Tom: Honest answer: the change was classified as low-risk and went through abbreviated testing. That was a process failure on our part. As of yesterday, we've updated our change management policy - all network changes now require full regression testing regardless of perceived risk level.

[13:00] David: Tom, what confidence can you give me that we won't be having this same conversation in 60 days?

[13:15] Tom: David, I'm committing to the following: weekly technical syncs with Lisa's team for the next 90 days. Monthly executive reviews with you directly - I'll be on those calls personally. And a 99.95% uptime SLA for TechFlow specifically, with meaningful penalties if we miss it - 3x the standard credits.

[13:50] Rachel: What about our customers who were impacted? We need something we can share with them.

[14:05] James: Rachel, I can provide you with an executive-level incident summary letter, signed by Tom, that you can share with your enterprise accounts. It will acknowledge the issue and outline the steps we're taking. Would that help?

[14:25] Rachel: That would help significantly. Especially for Meridian - their compliance team is asking questions.

[14:40] David: Tom, James - I appreciate the responses today. But I want to be clear about where we stand. We're pausing any expansion discussions until we see consistent improvement. The APAC rollout we were planning is on hold. And I'm keeping our options open for April.

[15:10] Tom: I understand, David. We have 8 weeks to demonstrate that we've earned your trust back. I'm committing our team to that goal.

[15:30] James: Let me summarize next steps. I'll send the formal SLA credit documentation today. Tom will schedule the first technical sync with Lisa for this week. I'll have the incident summary letter for Rachel by tomorrow morning. And I'll set up our first monthly executive review for next week.

[16:00] David: Fine. But James, Tom - I need to see results, not just meetings and documents. If there's another significant incident before April, we're done.

[16:20] Tom: Understood. Thank you for giving us the opportunity to make this right.

---
[End of call]`,

  internal: `[Internal CS Team Strategy Sync - Q1 Planning & At-Risk Accounts]
Date: February 6, 2026
Duration: 58 minutes
Participants:
- Amanda Foster (CS Director)
- Ryan Martinez (CS Manager, Enterprise Segment)
- Katie Wong (Senior CSM)
- Derek Huang (CSM)
- Priya Sharma (CS Operations)

---

[00:00] Amanda: Alright team, let's dive in. We have a packed agenda - Q1 renewals review, at-risk accounts, expansion pipeline, and some process updates. Ryan, let's start with the Enterprise segment health check.

[00:25] Ryan: Thanks Amanda. So, Enterprise segment: we have 18 renewals in Q1, totaling $4.2M ARR. As of today, 12 are green - high confidence to renew at current or higher rates. Three are yellow - some concerns but manageable. And three are red - significant risk of churn or downsell.

[00:55] Amanda: Walk us through the reds first. What are we dealing with?

[01:05] Ryan: Number one is TechFlow - $280K ARR, renews in April. They've had three production incidents in the past 60 days. The CTO is actively evaluating competitors. James had an escalation call with them this morning - Tom Bradley joined from engineering. The short version: we've offered SLA credits, dedicated SRE, and enhanced support. David Kim, their CTO, is keeping options open until he sees improvement.

[02:00] Amanda: What's our internal assessment? Can we save this account?

[02:10] Ryan: Honestly? 50/50. If we have another incident before April, we're done. If we execute flawlessly and demonstrate genuine improvement, I think we can retain them - but probably not expand as planned. The APAC rollout they were considering is paused.

[02:40] Katie: I'm connected with Rachel Nguyen, their VP of Customer Experience. She's more sympathetic to us than David is. I can work that relationship as a secondary channel - maybe position the executive QBR we discussed as a trust-rebuilding exercise.

[03:05] Amanda: Good thinking. Do that. Ryan, what's the second red account?

[03:15] Ryan: Meridian Group - $420K ARR, renews March 31st. They got a new VP of Operations six months ago, Patricia Delgado. She's been consolidating vendors across the organization and has explicitly stated she wants to reduce software spend by 25%.

[03:50] Derek: I own this account. Patricia's approach is purely cost-focused, which makes it hard to have value conversations. Every meeting becomes a negotiation about price. I've tried pivoting to ROI discussions, but she shuts them down - says she needs to see vendor reduction, not just efficiency gains.

[04:20] Amanda: What's our competitive position? Is she looking at alternatives?

[04:30] Derek: Yes. She's had demos with both CompetitorA and CompetitorB. From what I've gathered through my champion, Marcus Chen their IT Director, CompetitorA quoted 30% below our rate. But Marcus says their feature set is significantly weaker.

[04:55] Amanda: So we're fighting on price against an inferior product. That's actually a winnable situation. Derek, I want you to build a comprehensive switching cost analysis. Include implementation time, training costs, productivity loss during transition, feature gaps they'd face. Make the total cost of switching visible.

[05:25] Derek: Already started on that. The other angle I'm working is Marcus. He's our internal champion and genuinely believes in our platform. If I can get him in front of Patricia with a technical assessment of what they'd lose by switching, that might change the conversation.

[05:50] Ryan: One more factor on Meridian - they're implementing a new ERP this quarter. That's a massive project for their IT team. Switching customer platforms simultaneously would be insane. We should lean into that.

[06:10] Amanda: Good point. Derek, position our stability during their ERP transition as a key value prop. The last thing they need is more change. What's the third red?

[06:30] Ryan: GlobalRetail - $650K ARR, renews February 28th. So we're down to the wire. They're facing budget cuts company-wide. Their CFO mandated 20% reduction across all software vendors.

[07:00] Priya: I've been tracking their news. They announced layoffs last month - about 8% of workforce. The stock is down 35% from peak. This is a company-wide financial issue, not a us-problem.

[07:25] Amanda: What's our current offer?

[07:30] Ryan: We've offered 15% discount for a 2-year commitment. They've countered asking for 25% discount with only 1-year commitment. CFO won't approve multi-year in current environment.

[07:55] Amanda: What's the walk-away math here? At 25% discount, are we still profitable on this account?

[08:05] Priya: I ran the numbers. At 25% discount, we're at $487K ARR. Gross margin would be around 62% - still above our threshold. But it sets a bad precedent and significantly impacts this quarter's net retention metrics.

[08:35] Amanda: Here's what I want to do. Ryan, go back with 20% discount, 1-year term, but include a provision that if they return to multi-year next cycle, they lock in that rate. We preserve some margin, give them budget relief, and create incentive for future commitment.

[09:05] Ryan: I can work with that. I think they'll accept - it's close to their ask and gives them cover with their CFO.

[09:20] Amanda: Good. Now let's talk yellows quickly, then get to expansion pipeline.

[09:30] Katie: I have two of the yellows. NorthStar Manufacturing - $180K, renews March 15th. Their concern is our product roadmap. They need specific supply chain features we've been promising but haven't delivered. They're not looking to leave, but they're frustrated.

[09:55] Katie: I've set up a call with our product team for next week. We need to either commit to delivery dates or find workarounds. The good news is their usage is strong and their users love the platform. It's a leadership perception issue, not a usage issue.

[10:20] Amanda: Get me a list of their top 3 feature requests. I'll escalate to product leadership.

[10:30] Katie: Second yellow is Brightway Financial - $210K, renews April 15th. Their champion, our primary contact for two years, left the company last month. New contact is skeptical of all inherited vendor relationships. Classic "new sheriff in town" scenario.

[10:55] Amanda: Those are always tricky. What's your play?

[11:05] Katie: I've requested an executive alignment meeting - their new Director plus my stakeholder map. I want to re-establish relationships at multiple levels so we're not dependent on a single champion again. I'm also pulling together a success story document specific to financial services vertical.

[11:30] Amanda: Smart. Make sure you're identifying who the new champion could be. Sometimes it's not the new Director - sometimes it's someone on their team who's been a power user. Derek, you have the third yellow?

[11:50] Derek: Yes - Westfield Logistics, $165K, March 30th renewal. No major issues, just some price sensitivity. They've asked about downgrading to lower tier to save costs. I think this one's manageable with a modest discount or creative packaging.

[12:15] Amanda: Okay. Let's shift to expansion pipeline. Katie, you mentioned Acme last week?

[12:25] Katie: Yes - Acme Corp is our biggest expansion opportunity. They want to roll out to EMEA operations - London, Frankfurt, Amsterdam. Total of 150 users. Plus, they're interested in upgrading to enterprise tier for compliance features.

[12:50] Katie: I had a multi-stakeholder call yesterday with their VP Ops, CFO, and IT Director. Very positive. CFO is bought in on ROI, IT Director approved technical requirements. We're looking at approximately $275K additional ARR.

[13:15] Amanda: That's excellent. What's the timeline?

[13:25] Katie: They want to go live by end of Q2. I'm working with implementation team on a project plan. Main dependency is getting technical discovery calls scheduled with their EMEA IT team in the next two weeks.

[13:45] Ryan: That's a great win for the quarter. Katie, do you have everything you need from me on pricing approval?

[13:55] Katie: Yes, we discussed yesterday. I'm proposing a package deal with 3-year term and 15% discount, or 2-year with 10% discount. CFO is leaning toward 2-year given economic uncertainty.

[14:15] Amanda: Great. Any other expansion opportunities?

[14:25] Derek: Two smaller ones. PacificHealth is looking to add 40 users for a new division - about $60K ARR. They're already in procurement. And DataSync wants to upgrade their analytics package - $30K additional. Both should close this quarter.

[14:50] Amanda: Good. Priya, let's talk metrics. Where are we on net retention for the quarter?

[15:00] Priya: So, if all at-risk accounts play out worst-case, we're looking at net retention of 94% for Q1. Best case, with expansions closed and at-risk accounts saved, we hit 118%. Current realistic projection is 106%.

[15:30] Amanda: 106% is good, but we need to push for that 118%. The expansions are more controllable than the at-risk recoveries. Let's prioritize getting Acme and the smaller expansions closed as quickly as possible.

[15:55] Ryan: Agreed. One process item before we wrap - onboarding success rates. The changes we made last quarter are showing results. Time to first value is down from 45 days to 28 days. And customers onboarded with the new process have 23% higher engagement at day 90.

[16:25] Amanda: That's great data. Priya, let's get that into our board reporting. It's a good story.

[16:35] Priya: Already on it. I'm also building a correlation analysis between onboarding velocity and first-year retention. Early data suggests customers who hit value in under 30 days have 15% higher renewal rates.

[16:55] Amanda: Excellent. Final items - I want weekly standups on the three red accounts until we're through renewal. Katie on TechFlow as secondary, Derek on Meridian and GlobalRetail primary. Ryan, you're quarterbacking.

[17:20] Ryan: Got it. I'll set up the cadence.

[17:25] Amanda: Good discussion everyone. Let's execute on these plans. We've got a challenging quarter but it's winnable.

---
[End of call]`
};

export const SampleTranscriptMenu = ({ onSampleGenerated, disabled }: SampleTranscriptMenuProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTemplateSelect = (type: keyof typeof SAMPLE_TEMPLATES) => {
    onSampleGenerated(SAMPLE_TEMPLATES[type]);
    toast({
      title: "Sample loaded",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} scenario transcript ready to analyze.`,
    });
  };

  const handleGenerateUnique = async (scenario: string) => {
    setIsGenerating(true);
    setGenerationType(scenario);

    try {
      const { data, error } = await supabase.functions.invoke("cs-triage", {
        body: {
          generateSample: true,
          scenario,
        },
      });

      if (error) {
        if (error.message?.includes("429") || error.context?.status === 429) {
          throw new Error("Rate limit exceeded. Try a pre-written sample instead.");
        }
        throw error;
      }

      if (data?.transcript) {
        onSampleGenerated(data.transcript);
        toast({
          title: "Unique sample generated",
          description: "AI-generated transcript ready to analyze.",
        });
      }
    } catch (error) {
      console.error("Failed to generate sample:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Try a pre-written sample instead.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationType(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1.5 h-auto py-1 px-2"
          disabled={disabled || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs">Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span className="text-xs">Try a sample</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Quick samples (instant)
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleTemplateSelect("value")} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-emerald-600" />
          <div className="flex flex-col">
            <span className="font-medium">Value & Expansion</span>
            <span className="text-xs text-muted-foreground">Renewal with upsell signals</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTemplateSelect("risk")} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-red-600" />
          <div className="flex flex-col">
            <span className="font-medium">Risk & Escalation</span>
            <span className="text-xs text-muted-foreground">Customer considering churn</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTemplateSelect("internal")} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="font-medium">Internal Strategy</span>
            <span className="text-xs text-muted-foreground">Team planning discussion</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          AI-generated (unique each time)
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleGenerateUnique("customer-value")} 
          className="gap-2 cursor-pointer"
          disabled={isGenerating}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="font-medium">Generate unique sample</span>
            <span className="text-xs text-muted-foreground">Random scenario via AI</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
