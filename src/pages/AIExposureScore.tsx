import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";

interface Question {
  id: string;
  text: string;
  subtext: string;
  options: { label: string; score: number; tag: string }[];
}

const questions: Question[] = [
  {
    id: "status-updates",
    text: "How do you typically share account status with internal stakeholders?",
    subtext: "Think about your weekly/monthly reporting rhythm.",
    options: [
      { label: "I manually write status emails or Slack updates from memory", score: 90, tag: "exposed" },
      { label: "I pull data from dashboards and summarize it", score: 70, tag: "exposed" },
      { label: "I add strategic commentary and recommendations to the data", score: 30, tag: "mixed" },
      { label: "Stakeholders mostly self-serve; I only flag exceptions", score: 10, tag: "proof" },
    ],
  },
  {
    id: "qbr-prep",
    text: "What takes the most time when preparing for a QBR?",
    subtext: "Be honest about where the hours actually go.",
    options: [
      { label: "Pulling usage data and building slides", score: 85, tag: "exposed" },
      { label: "Making the data look presentable", score: 75, tag: "exposed" },
      { label: "Developing strategic recommendations specific to this customer", score: 20, tag: "proof" },
      { label: "I rarely do traditional QBRs — I run working sessions instead", score: 5, tag: "proof" },
    ],
  },
  {
    id: "check-ins",
    text: "What happens in most of your recurring customer calls?",
    subtext: "Think about your standard cadence calls, not escalations.",
    options: [
      { label: "I ask how things are going and if they need anything", score: 85, tag: "exposed" },
      { label: "I review metrics and walk through recent activity", score: 65, tag: "exposed" },
      { label: "I bring a specific recommendation or challenge their approach", score: 20, tag: "mixed" },
      { label: "The customer brings decisions to me for input before they act", score: 5, tag: "proof" },
    ],
  },
  {
    id: "churn-response",
    text: "When a customer shows signs of risk, what's your first move?",
    subtext: "Think about the last at-risk account you handled.",
    options: [
      { label: "Schedule a call to understand what's wrong", score: 60, tag: "exposed" },
      { label: "Pull usage data to identify the drop-off point", score: 50, tag: "exposed" },
      { label: "Build a business case showing the cost of leaving vs staying", score: 15, tag: "proof" },
      { label: "I usually catch risk before the customer signals it", score: 5, tag: "proof" },
    ],
  },
  {
    id: "expansion",
    text: "How do expansion opportunities typically surface in your accounts?",
    subtext: "Think about your last 3 upsell or cross-sell conversations.",
    options: [
      { label: "Sales or the customer brings it up", score: 80, tag: "exposed" },
      { label: "I notice usage patterns that suggest readiness", score: 45, tag: "mixed" },
      { label: "I proactively build the business case and present it to the customer", score: 15, tag: "proof" },
      { label: "I architect the customer's roadmap so expansion is the logical next step", score: 5, tag: "proof" },
    ],
  },
  {
    id: "technical-depth",
    text: "If your customer's engineering team asked you to explain your product's architecture, could you?",
    subtext: "Not sales-level. Engineering-level.",
    options: [
      { label: "No — I'd need to bring in a solutions engineer", score: 80, tag: "exposed" },
      { label: "At a high level, but not in technical depth", score: 55, tag: "mixed" },
      { label: "Yes — I can hold my own in architecture discussions", score: 15, tag: "proof" },
      { label: "Yes — I've influenced their architecture decisions based on my expertise", score: 5, tag: "proof" },
    ],
  },
  {
    id: "decision-influence",
    text: "In the last 30 days, how many customer decisions changed because of your input?",
    subtext: "Not meetings attended. Actual decisions influenced.",
    options: [
      { label: "None that I can point to specifically", score: 90, tag: "exposed" },
      { label: "Maybe 1 — but it's hard to prove", score: 60, tag: "mixed" },
      { label: "2-3 clear instances where my input changed their direction", score: 15, tag: "proof" },
      { label: "5+ — customers regularly consult me before making decisions", score: 5, tag: "proof" },
    ],
  },
  {
    id: "disappear-test",
    text: "If you vanished tomorrow, what would break for your top customer?",
    subtext: "The proof of absence test. Be brutally honest.",
    options: [
      { label: "They'd miss me, but nothing operational would break", score: 90, tag: "exposed" },
      { label: "Some things would slip through the cracks temporarily", score: 55, tag: "mixed" },
      { label: "A specific process I built would stop functioning", score: 15, tag: "proof" },
      { label: "Multiple operational workflows depend on frameworks I created", score: 5, tag: "proof" },
    ],
  },
];

type ResultTier = {
  range: [number, number];
  title: string;
  subtitle: string;
  color: string;
  description: string;
  advice: string;
};

const tiers: ResultTier[] = [
  {
    range: [0, 25],
    title: "AI-Proof",
    subtitle: "You're doing the work AI can't touch.",
    color: "text-emerald-600",
    description: "Your role is built on judgment, trust, and strategic influence. AI is a tool for you, not a threat. You're shaping customer decisions, not just reporting on them.",
    advice: "Your next move: document your frameworks and make them repeatable across your team. That's how you go from valuable individual contributor to irreplaceable leader.",
  },
  {
    range: [26, 45],
    title: "Mostly Defended",
    subtitle: "Strong foundation, but gaps remain.",
    color: "text-blue-600",
    description: "You have real strategic impact in some areas, but parts of your week are still spent on work that AI could handle. The good news: you have the skills to shift fully into defensible territory.",
    advice: "Focus on eliminating the remaining information-delivery tasks from your week. Every hour you reclaim from status updates is an hour you can spend on decision-shaping work.",
  },
  {
    range: [46, 65],
    title: "Partially Exposed",
    subtitle: "The line is closer than you think.",
    color: "text-amber-600",
    description: "About half your role is strategic and half is automatable. This is where most CSMs land. You have moments of real impact, but they're inconsistent. The exposed half of your job is what AI vendors are targeting right now.",
    advice: "Pick your top 3 accounts and run the 'proof of absence' test. For each one, build something operational that would break if you left. That's your 90-day project.",
  },
  {
    range: [66, 100],
    title: "Highly Exposed",
    subtitle: "Most of your role is automatable today.",
    color: "text-red-600",
    description: "The majority of your current work could be handled by AI with access to your company's CRM, usage data, and support history. This isn't a judgment on you as a professional. It's a signal that the role as currently structured is vulnerable.",
    advice: "This is fixable, but it requires an honest reckoning. Start with the decision influence question: after every customer interaction this week, ask 'what will they do differently because of this conversation?' Track it. The pattern will show you exactly where to focus.",
  },
];

const AIExposureScore = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [answerTags, setAnswerTags] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    document.title = "AI Exposure Score | Churn Is Dead";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQ, showResult]);

  const handleSelect = (score: number, tag: string, index: number) => {
    setSelectedOption(index);
    const q = questions[currentQ];

    setTimeout(() => {
      setAnswers(prev => ({ ...prev, [q.id]: score }));
      setAnswerTags(prev => ({ ...prev, [q.id]: tag }));
      setSelectedOption(null);

      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1);
      setSelectedOption(null);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers({});
    setAnswerTags({});
    setShowResult(false);
    setSelectedOption(null);
  };

  const totalScore = Math.round(
    Object.values(answers).reduce((a, b) => a + b, 0) / questions.length
  );

  const tier = tiers.find(t => totalScore >= t.range[0] && totalScore <= t.range[1]) || tiers[3];

  const exposedCount = Object.values(answerTags).filter(t => t === "exposed").length;
  const proofCount = Object.values(answerTags).filter(t => t === "proof").length;
  const mixedCount = Object.values(answerTags).filter(t => t === "mixed").length;

  const progress = ((currentQ) / questions.length) * 100;

  if (showResult) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <section className="pt-28 pb-20 md:pt-36">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto">

              {/* Score */}
              <div className="text-center mb-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Your AI Exposure Score</p>
                <div className="text-7xl md:text-8xl font-serif font-black text-navy-dark mb-2">
                  {totalScore}%
                </div>
                <p className={`text-2xl md:text-3xl font-serif font-bold ${tier.color} mb-1`}>
                  {tier.title}
                </p>
                <p className="text-gray-500">{tier.subtitle}</p>
              </div>

              {/* Breakdown bar */}
              <div className="mb-10">
                <div className="flex rounded-full overflow-hidden h-3 bg-gray-100">
                  <div className="bg-red-500 transition-all duration-700" style={{ width: `${(exposedCount / questions.length) * 100}%` }} />
                  <div className="bg-amber-400 transition-all duration-700" style={{ width: `${(mixedCount / questions.length) * 100}%` }} />
                  <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${(proofCount / questions.length) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{exposedCount} exposed</span>
                  <span>{mixedCount} mixed</span>
                  <span>{proofCount} AI-proof</span>
                </div>
              </div>

              {/* Analysis */}
              <div className="space-y-6 mb-10">
                <p className="text-[1.0625rem] leading-relaxed text-gray-700">
                  {tier.description}
                </p>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-semibold text-navy-dark mb-2">What to do next</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{tier.advice}</p>
                </div>
              </div>

              {/* Share */}
              <div className="mb-12 p-6 border border-gray-200 rounded-lg text-center">
                <p className="text-sm font-semibold text-navy-dark mb-3">Share your result</p>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://churnisdead.com/ai-exposure-score')}&title=${encodeURIComponent(`I scored ${totalScore}% on the AI Exposure Score — "${tier.title}". How exposed is your CS role? Take the free 2-minute quiz:`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#0A66C2] text-white text-sm font-semibold rounded-lg hover:bg-[#004182] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Share on LinkedIn
                </a>
                <p className="text-xs text-gray-400 mt-2">
                  See how your score compares to other CS professionals.
                </p>
              </div>

              {/* CTA */}
              <div className="py-10 px-8 bg-navy-dark rounded-lg text-center mb-10">
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  Want the full framework?
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Every Tuesday, I publish tactical CS frameworks with downloadable playbooks. The AI Exposure Audit goes deeper than this score with a 90-day action plan.
                </p>
                <div className="max-w-sm mx-auto">
                  <NewsletterForm 
                    location="article" 
                    buttonVariant="vibrant-red"
                    textColor="text-white"
                    buttonText="Subscribe — it's free"
                    subscribeText=""
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 font-semibold text-navy-dark hover:text-red-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake
                </button>
                <Link to="/newsletters" className="font-semibold text-navy-dark hover:text-red-600 transition-colors">
                  Read the newsletter →
                </Link>
              </div>

            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-28 pb-20 md:pt-36">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">

            {/* Progress */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  AI Exposure Score
                </span>
                <span className="text-xs text-gray-300">
                  {currentQ + 1} of {questions.length}
                </span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-navy-dark leading-snug mb-2">
                {q.text}
              </h2>
              <p className="text-sm text-gray-400">{q.subtext}</p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-10">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt.score, opt.tag, i)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedOption === i
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className="text-[0.9375rem] text-gray-700 leading-relaxed">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Back */}
            {currentQ > 0 && (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-navy-dark transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous question
              </button>
            )}

          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AIExposureScore;
