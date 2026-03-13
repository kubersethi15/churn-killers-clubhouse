import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Copy, Check, Linkedin, MessageSquare, Globe, ChevronDown, ChevronUp } from "lucide-react";

// Distribution content is loaded from static files in /distribution/
// Each newsletter has: linkedin_posts.md, linkedin_newsletter.md, community_posts.md

interface DistributionPack {
  slug: string;
  title: string;
  linkedinPosts: string;
  linkedinNewsletter: string;
  communityPosts: string;
}

// Map slugs to display titles
const NEWSLETTER_TITLES: Record<string, string> = {
  "customer-journey-maps-are-fiction": "Your Customer Journey Maps Are Fiction",
  "cs-team-hoarding-work": "Your CS Team Is Hoarding Work",
  "customer-success-doesnt-deserve-to-survive": "Customer Success Doesn't Deserve to Survive",
  "ai-didnt-kill-customer-success": "AI Didn't Kill Customer Success. It Exposed It.",
  "ai-wont-save-customer-success": "AI Won't Save Customer Success. It'll Finish It Off.",
  "the-revenue-ownership-trap": "The Revenue Ownership Trap",
  "stop-calling-yourself-strategic": "Stop Calling Yourself Strategic",
  "health-scores-are-astrology": "Health Scores Are Astrology for CS Teams",
};

const DISTRIBUTION_SLUGS = [
  "customer-journey-maps-are-fiction",
  "cs-team-hoarding-work",
  "customer-success-doesnt-deserve-to-survive",
  "ai-didnt-kill-customer-success",
];

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied!", description: `${label} copied to clipboard` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please select and copy manually", variant: "destructive" });
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className={`gap-1.5 ${copied ? "bg-green-50 border-green-300 text-green-700" : ""}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
};

const ContentBlock = ({
  icon,
  title,
  subtitle,
  content,
  platform,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: string;
  platform: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const preview = content.split("\n").slice(0, 4).join("\n");

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="font-semibold text-sm text-navy-dark">{title}</p>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={content} label={platform} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="gap-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "Collapse" : "Preview"}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <pre className="whitespace-pre-wrap text-sm text-gray-600 font-mono leading-relaxed max-h-96 overflow-y-auto">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
};

const NewsletterDistribution = ({ pack }: { pack: DistributionPack }) => {
  const [open, setOpen] = useState(false);

  // Parse linkedin_posts.md into individual posts
  const parsePosts = (raw: string): { label: string; content: string }[] => {
    const posts: { label: string; content: string }[] = [];
    const sections = raw.split(/={10,}/);
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (section.startsWith("POST")) {
        const labelMatch = section.match(/^POST \d+ — (\w+)/);
        const label = labelMatch ? labelMatch[1] : `Post ${posts.length + 1}`;
        // The actual content is in the next section
        if (i + 1 < sections.length) {
          const content = sections[i + 1]
            .trim()
            .replace(/^Strategy:.*?\n/m, "")
            .trim();
          if (content.length > 20) {
            posts.push({ label, content });
          }
        }
      }
    }
    return posts;
  };

  const linkedinPosts = parsePosts(pack.linkedinPosts);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Newsletter header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <h3 className="text-lg font-serif font-bold text-navy-dark">
            {pack.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {linkedinPosts.length} LinkedIn posts · Newsletter edition · Community posts
          </p>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="p-5 pt-0 space-y-4">
          {/* LinkedIn Posts */}
          {linkedinPosts.map((post, i) => (
            <ContentBlock
              key={i}
              icon={<Linkedin className="w-5 h-5 text-[#0A66C2]" />}
              title={`LinkedIn Post — ${post.label}`}
              subtitle="Copy and paste into LinkedIn"
              content={post.content}
              platform={`LinkedIn ${post.label} post`}
            />
          ))}

          {/* LinkedIn Newsletter */}
          {pack.linkedinNewsletter && (
            <ContentBlock
              icon={<Linkedin className="w-5 h-5 text-[#0A66C2]" />}
              title="LinkedIn Newsletter Edition"
              subtitle="Full newsletter for LinkedIn Newsletter feature"
              content={pack.linkedinNewsletter.replace(/^#.*\n.*\n.*\n\n---\n?/m, "").trim()}
              platform="LinkedIn Newsletter"
            />
          )}

          {/* Community Posts */}
          {pack.communityPosts && (
            <ContentBlock
              icon={<MessageSquare className="w-5 h-5 text-orange-500" />}
              title="Community Posts"
              subtitle="Slack, Reddit, and other communities"
              content={pack.communityPosts}
              platform="Community posts"
            />
          )}

          {/* Direct link */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <Globe className="w-4 h-4 text-gray-400" />
            <a
              href={`https://churnisdead.com/newsletter/${pack.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-600 hover:underline"
            >
              churnisdead.com/newsletter/{pack.slug}
            </a>
            <CopyButton
              text={`https://churnisdead.com/newsletter/${pack.slug}`}
              label="Newsletter URL"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const Distribution = () => {
  const [packs, setPacks] = useState<DistributionPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Distribution Dashboard | Churn Is Dead";
    window.scrollTo(0, 0);
    loadDistributionContent();
  }, []);

  const loadDistributionContent = async () => {
    const loaded: DistributionPack[] = [];

    for (const slug of DISTRIBUTION_SLUGS) {
      try {
        const [postsRes, nlRes, commRes] = await Promise.allSettled([
          fetch(`/distribution/${slug}/linkedin_posts.md`).then((r) =>
            r.ok ? r.text() : ""
          ),
          fetch(`/distribution/${slug}/linkedin_newsletter.md`).then((r) =>
            r.ok ? r.text() : ""
          ),
          fetch(`/distribution/${slug}/community_posts.md`).then((r) =>
            r.ok ? r.text() : ""
          ),
        ]);

        loaded.push({
          slug,
          title: NEWSLETTER_TITLES[slug] || slug,
          linkedinPosts:
            postsRes.status === "fulfilled" ? postsRes.value : "",
          linkedinNewsletter:
            nlRes.status === "fulfilled" ? nlRes.value : "",
          communityPosts:
            commRes.status === "fulfilled" ? commRes.value : "",
        });
      } catch (err) {
        console.error(`Failed to load distribution for ${slug}:`, err);
      }
    }

    setPacks(loaded);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-28 pb-10 md:pt-36 md:pb-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-navy-dark mb-3">
              Distribution Dashboard
            </h1>
            <p className="text-lg text-gray-400">
              Copy-paste ready content for every platform. Click copy, paste, post.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse border rounded-xl p-5">
                    <div className="h-5 w-2/3 bg-gray-100 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-gray-50 rounded" />
                  </div>
                ))}
              </div>
            ) : packs.length === 0 ? (
              <p className="text-gray-400 py-16 text-center">
                No distribution content found.
              </p>
            ) : (
              packs.map((pack) => (
                <NewsletterDistribution key={pack.slug} pack={pack} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Distribution;
