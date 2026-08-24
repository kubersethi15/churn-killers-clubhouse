import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";
import { trackGrowthEvent } from "@/utils/growthTracking";
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";

interface Question {
  id: string;
  text: string;
  subtext: string;
  options: { label: string; score: number; tag: string }[];
}

// Higher score = more theater. The whole thesis: most QBRs inform, they do not
// move a decision. Each option is scored on how far it sits from a QBR that
// forces a decision. Grounded in the 30-minute, three-block framework.
const questions: Question[] = [
  {
    id: "purpose",
    text: "What is the QBR actually for?",
    subtext: "Not what the deck says. What happens in the room.",
    options: [
      { label: "We walk the customer through the last quarter's activity and metrics", score: 85, tag: "theater" },
      { label: "We show value delivered and build the case for renewal", score: 65, tag: "theater" },
      { label: "We align on the customer's goal and check we are still tracking to it", score: 30, tag: "mixed" },
      { label: "We put one real decision in front of the room and get it made", score: 5, tag: "decision" },
    ],
  },
  {
    id: "agenda",
    text: "Who sets the agenda?",
    subtext: "Whoever owns the agenda owns the meeting.",
    options: [
      { label: "We reuse the standard QBR template every account gets", score: 80, tag: "theater" },
      { label: "The CSM builds it from whatever data is available that week", score: 60, tag: "theater" },
      { label: "The CSM builds it around this account's current goal", score: 30, tag: "mixed" },
      { label: "The customer's decision this quarter sets it, and we pre-agree it", score: 10, tag: "decision" },
    ],
  },
  {
    id: "prewire",
    text: "The hardest moment in the QBR: when does the customer first hear it?",
    subtext: "A pre-wired hard conversation is not the same as an ambush in front of their boss.",
    options: [
      { label: "In the meeting, live, along with everyone else in the room", score: 85, tag: "theater" },
      { label: "In the meeting, but we soften it so nobody is caught out", score: 60, tag: "mixed" },
      { label: "We usually flag it beforehand to our main contact", score: 30, tag: "mixed" },
      { label: "We pre-wire it with the decision owner so the room just confirms", score: 5, tag: "decision" },
    ],
  },
  {
    id: "airtime",
    text: "In the last QBR you ran, who did most of the talking?",
    subtext: "Presenting at a customer is not the same as deciding with them.",
    options: [
      { label: "Us. We presented, they listened and nodded", score: 80, tag: "theater" },
      { label: "Mostly us, with questions at the end", score: 60, tag: "theater" },
      { label: "Roughly even", score: 35, tag: "mixed" },
      { label: "Them. We framed one decision and they worked it", score: 10, tag: "decision" },
    ],
  },
  {
    id: "badnews",
    text: "The numbers this quarter look bad. What does the QBR become?",
    subtext: "This is the question that separates a review from a performance.",
    options: [
      { label: "We lead with the wins and hope the room does not dwell on the rest", score: 90, tag: "theater" },
      { label: "We explain the dip and the plan to recover it", score: 55, tag: "mixed" },
      { label: "We name the cause honestly and ask for what we need", score: 25, tag: "mixed" },
      { label: "We bring the decision the bad number forces, with an owner and a date", score: 10, tag: "decision" },
    ],
  },
  {
    id: "strategic_operational",
    text: "Do you run one QBR for two audiences?",
    subtext: "The exec and the daily user do not need the same meeting.",
    options: [
      { label: "One meeting, one deck, everyone from admin to exec in the room", score: 75, tag: "theater" },
      { label: "One meeting, but we try to cover both altitudes in it", score: 55, tag: "mixed" },
      { label: "We split operational detail out of the exec conversation", score: 25, tag: "mixed" },
      { label: "The exec session is one decision; the operational cadence is separate", score: 10, tag: "decision" },
    ],
  },
  {
    id: "output",
    text: "What does the customer leave the QBR with?",
    subtext: "A deck they will not reopen does not count.",
    options: [
      { label: "The slides, sent as a follow-up", score: 80, tag: "theater" },
      { label: "A recap email with action items", score: 55, tag: "mixed" },
      { label: "A short list of agreed next steps with owners", score: 30, tag: "mixed" },
      { label: "A one-page success plan that was the meeting, not an attachment to it", score: 5, tag: "decision" },
    ],
  },
  {
    id: "aftermath",
    text: "A week after the QBR, what changed?",
    subtext: "The honest test. Did the meeting move anything?",
    options: [
      { label: "Nothing yet, but everyone agreed things looked good or concerning", score: 85, tag: "theater" },
      { label: "We are chasing the action items we assigned", score: 55, tag: "mixed" },
      { label: "One or two things moved because we followed up hard", score: 30, tag: "mixed" },
      { label: "The decision we forced is being executed, on the date we set", score: 5, tag: "decision" },
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
    title: "Decision Engine",
    subtitle: "Your QBRs make decisions unavoidable.",
    color: "text-emerald-600",
    description: "Your reviews are not performances. You put a real decision in the room, you pre-wire the hard part, and the customer leaves having chosen something. This is rare. Most QBRs never get here.",
    advice: "Protect it. The moment a QBR starts opening with a wins montage, it is drifting back to theater. Keep every review anchored to one decision the customer has to make.",
  },
  {
    range: [26, 50],
    title: "Half Review, Half Theater",
    subtitle: "Real substance, wrapped in ceremony.",
    color: "text-blue-600",
    description: "There is a genuine review buried in your QBR, but it is carrying a lot of ritual that adds no decision. You inform more than you move. The good quarters feel useful; the bad ones become a managed performance.",
    advice: "Cut the reporting the customer could read on their own. Replace it with the one decision this account has to make this quarter, and pre-wire it before the room.",
  },
  {
    range: [51, 70],
    title: "Mostly Performance",
    subtitle: "This is where most CS teams live.",
    color: "text-amber-600",
    description: "Your QBR is built to inform, not to move things forward. Stakeholders show up, slides get presented, everyone agrees things look good or concerning, and then the call ends and nothing changes. It is not your slides or your data. It is the shape of the meeting.",
    advice: "Stop running the standard template. Rebuild the next QBR around three blocks: the customer's goal and whether the quarter aligned to it, what was achieved, and the one decision that is next including where you need support.",
  },
  {
    range: [71, 100],
    title: "Pure Theater",
    subtitle: "The meeting exists to be held, not to decide.",
    color: "text-red-600",
    description: "Right now the QBR is a status update in a nicer room. You present, they nod, the numbers get a positive spin, and nobody leaves with a decision. This is not a comment on your effort. It is a signal that the meeting, as structured, cannot move an account, so churn and expansion both happen somewhere else without you.",
    advice: "Fire the QBR you run now and rebuild it small. Thirty minutes. Three slides. The customer's goal and how the quarter aligned to it, what was achieved, and what is next including where you need support. Make one decision unavoidable. That is the whole meeting.",
  },
];

const QBRScore = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [answerTags, setAnswerTags] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    import("@/utils/seoMeta").then(({ applyRouteSeo }) => applyRouteSeo({
      title: "QBR Effectiveness Score | Churn Is Dead",
      description: "An eight-question diagnostic for Customer Success teams: is your QBR driving decisions, or is it theater? Get a directional score and one practical next move in two minutes.",
      path: "/qbr-score",
    }));
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        // Measurable on the (now guarded) analytics: a completed tool run.
        void trackGrowthEvent({ eventName: "resource_open", resourceId: "tool:qbr-score" });
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
    setHasStarted(false);
  };

  const totalScore = Math.round(
    Object.values(answers).reduce((a, b) => a + b, 0) / questions.length
  );
  const tier = tiers.find(t => totalScore >= t.range[0] && totalScore <= t.range[1]) || tiers[3];
  const theaterCount = Object.values(answerTags).filter(t => t === "theater").length;
  const decisionCount = Object.values(answerTags).filter(t => t === "decision").length;
  const mixedCount = Object.values(answerTags).filter(t => t === "mixed").length;
  const progress = (currentQ / questions.length) * 100;

  if (showResult) {
    const shareText = `My QBRs scored ${totalScore}% on the theater scale — "${tier.title}". Is your QBR driving decisions or just informing? Free 2-minute diagnostic:`;
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main id="main-content" className="pt-28 pb-20 md:pt-36">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto">

              <div className="text-center mb-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-4">Your QBR Theater Score</p>
                <div className="text-7xl md:text-8xl font-serif font-black text-navy-dark mb-2">{totalScore}%</div>
                <p className={`text-2xl md:text-3xl font-serif font-bold ${tier.color} mb-1`}>{tier.title}</p>
                <p className="text-gray-500">{tier.subtitle}</p>
              </div>

              <div className="mb-10">
                <div className="flex rounded-full overflow-hidden h-3 bg-gray-100">
                  <div className="bg-red-500 transition-all duration-700" style={{ width: `${(theaterCount / questions.length) * 100}%` }} />
                  <div className="bg-amber-400 transition-all duration-700" style={{ width: `${(mixedCount / questions.length) * 100}%` }} />
                  <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${(decisionCount / questions.length) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>{theaterCount} theater</span>
                  <span>{mixedCount} mixed</span>
                  <span>{decisionCount} decision-driven</span>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <p className="text-[1.0625rem] leading-relaxed text-gray-700">{tier.description}</p>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-semibold text-navy-dark mb-2">What to do next</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{tier.advice}</p>
                </div>
              </div>

              <div className="mb-12 p-6 border border-gray-200 rounded-lg text-center">
                <p className="text-sm font-semibold text-navy-dark mb-3">Share your result</p>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://churnisdead.com/qbr-score")}&title=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void trackGrowthEvent({ eventName: "resource_open", resourceId: "tool-share:qbr-score" })}
                  className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#0A66C2] text-white text-sm font-semibold rounded-lg hover:bg-[#004182] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Share on LinkedIn
                </a>
                <p className="text-xs text-gray-600 mt-2">Send it to a CSM who runs QBRs. Ask them to guess their score first.</p>
              </div>

              <div className="py-10 px-8 bg-navy-dark rounded-lg text-center mb-10">
                <h3 className="text-xl font-serif font-bold text-white mb-2">Want the framework behind the score?</h3>
                <p className="text-sm text-gray-400 mb-6">Every Tuesday, I publish tactical CS frameworks with downloadable playbooks. The 30-Minute QBR is one of them: the exact three-block structure that makes a decision unavoidable, free, no form.</p>
                <div className="max-w-sm mx-auto">
                  <NewsletterForm location="article" buttonVariant="vibrant-red" textColor="text-white" buttonText="Subscribe — it's free" subscribeText="" />
                </div>
                <p className="mt-5 text-xs text-gray-400">
                  Or <Link to="/playbook?q=30-Minute%20QBR" className="underline hover:text-white">grab the 30-Minute QBR Framework</Link> now.
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button onClick={reset} className="inline-flex items-center gap-1.5 font-semibold text-navy-dark hover:text-red-600 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Retake
                </button>
                <Link to="/newsletters" className="font-semibold text-navy-dark hover:text-red-600 transition-colors">Read the newsletter →</Link>
              </div>

            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main id="main-content" className="pt-28 pb-20 md:pt-36">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-2xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-red-600">QBR diagnostic · 8 questions · about 2 minutes</p>
              <h1 className="mb-5 text-4xl font-serif font-black leading-tight text-navy-dark md:text-6xl">Is your QBR driving decisions, or is it theater?</h1>
              <p className="mb-8 text-lg leading-relaxed text-gray-700">Most QBRs are built to inform, not to move anything forward. Stakeholders show up, slides get presented, everyone agrees things look good or concerning, and then nothing changes. Answer eight questions about the last QBR you actually ran. You will leave with a directional score and one practical next move.</p>
              <div className="mb-8 grid gap-3 sm:grid-cols-3">
                {["Answer from a real recent QBR", "No email required for the result", "Built for reflection, not a grade"].map(item => (
                  <div key={item} className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-navy-dark">{item}</div>
                ))}
              </div>
              <button onClick={() => setHasStarted(true)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700">
                Score my QBR <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-5 max-w-xl text-xs leading-relaxed text-gray-600">This is an editorial self-assessment, not a validated instrument. The score reflects only your answers and is a prompt for how you run the next review.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const q = questions[currentQ];
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content" className="pt-28 pb-20 md:pt-36">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">

            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-600">QBR Effectiveness Score</span>
                <span className="text-xs text-gray-300">{currentQ + 1} of {questions.length}</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-navy-dark leading-snug mb-2">{q.text}</h2>
              <p className="text-sm text-gray-600">{q.subtext}</p>
            </div>

            <div className="space-y-3 mb-10">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt.score, opt.tag, i)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedOption === i ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className="text-[0.9375rem] text-gray-700 leading-relaxed">{opt.label}</span>
                </button>
              ))}
            </div>

            {currentQ > 0 && (
              <button onClick={handleBack} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-navy-dark transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Previous question
              </button>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QBRScore;
