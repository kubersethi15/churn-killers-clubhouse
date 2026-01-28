import { useEffect } from "react";
import { ExternalLink, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

interface PlaybookResource {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink?: string;
  disabled?: boolean;
  icon?: string;
  pdfPath?: string;
  datePosted: string;
  featuredIn?: {
    title: string;
    link?: string;
    comingSoon?: boolean;
  };
}

const resources: PlaybookResource[] = [
  {
    id: "expansion-playbook",
    title: "Expansion Playbook",
    description: "A lightweight framework to help you identify and nurture expansion signals across the customer journey.",
    ctaText: "View in Notion",
    ctaLink: "https://www.notion.so/The-Expansion-Playbook-2315d0709c998007a494d0f646389297?source=copy_link",
    icon: undefined,
    datePosted: "2025-07-15", // Posted today
    featuredIn: {
      title: "The Expansion Moment Hiding in Plain Sight",
      link: "/newsletter/the-expansion-moment-hiding-in-plain-sight",
      comingSoon: false
    },
  },
  {
    id: "value-story-slide",
    title: "Value Story Slide",
    description: "A 1-slide QBR format that ties usage → outcomes → business value, with example metrics by persona and how to quantify impact even without hard ROI numbers.",
    ctaText: "View in Notion",
    ctaLink: "https://www.notion.so/The-Value-Story-Slide-2005d0709c99805f8f77c22747e82315?pvs=4",
    icon: undefined,
    pdfPath: "https://raw.githubusercontent.com/kubersethi15/churn-is-dead-site/main/public/pdfs/value-story-slide.pdf",
    datePosted: "2025-07-08", // Usage Is Not Success newsletter date
    featuredIn: {
      title: "Usage Is Not Success",
      link: "/newsletter/usage-is-not-success",
      comingSoon: false
    },
  },
  {
    id: "timeline-negotiator",
    title: "Timeline Negotiator",
    description: "A framework for negotiating realistic timelines that build trust with customers and internal stakeholders.",
    ctaText: "View in Notion",
    ctaLink: "https://www.notion.so/Timeline-Negotiator-1f95d0709c99808e8926eaeff56ef138?pvs=4",
    icon: undefined,
    datePosted: "2025-07-01", // Their Timeline, Not Yours newsletter date
    featuredIn: {
      title: "Their Timeline, Not Yours",
      link: "/newsletter/their-timeline-not-yours",
      comingSoon: false
    },
  },
  {
    id: "customer-momentum-framework",
    title: "Customer Momentum Framework",
    description: "A strategic framework to identify, track, and accelerate customer momentum across the entire lifecycle.",
    ctaText: "View in Notion",
    ctaLink: "https://www.notion.so/Customer-Momentum-Framework-20a5d0709c9980259ea4c3fdcc0b38b1",
    icon: undefined,
    datePosted: "2025-06-24", // Customer Momentum Framework Newsletter date
    featuredIn: {
      title: "Customer Momentum Framework Newsletter",
      comingSoon: true
    },
  },
  {
    id: "kickoff-checklist",
    title: "Kickoff Re-Discovery Checklist",
    description: "A tactical checklist to align internally, validate goals, and earn trust before the first customer call.",
    ctaText: "View in Notion",
    ctaLink: "https://www.notion.so/Kickoff-Re-Discovery-Checklist-1f95d0709c9980cfb35ae653901a6661?pvs=4",
    icon: undefined,
    datePosted: "2025-06-17", // The Perfect Kickoff Call newsletter date
    featuredIn: {
      title: "The Perfect Kickoff Call",
      link: "/newsletter/the-perfect-kickoff-call",
      comingSoon: false
    },
  },
  {
    id: "kickoff-agenda-blueprint",
    title: "Kickoff Agenda Blueprint",
    description: "A tactical agenda to lead high-trust kickoff calls across doers, managers, and execs.",
    ctaText: "View in Notion",
    ctaLink: "https://www.notion.so/Kickoff-Agenda-Blueprint-1f95d0709c9980e1a233cdd529187a6e?pvs=4",
    icon: undefined,
    datePosted: "2025-06-17", // The Perfect Kickoff Call newsletter date (same newsletter)
    featuredIn: {
      title: "The Perfect Kickoff Call",
      link: "/newsletter/the-perfect-kickoff-call",
      comingSoon: false
    },
  },
  {
    id: "co-op-framework",
    title: "CO-OP Framework",
    description: "The exact system that helped save that $2M renewal and is now being used by 10+ enterprise CS teams to increase renewal predictability and expansion velocity.",
    ctaText: "View in Notion",
    ctaLink: "https://www.notion.so/CO-OP-Framework-2235d0709c998059a8a4dc2c18393b25?source=copy_link",
    icon: undefined,
    datePosted: "2025-06-10", // The Question That's Breaking Your CS Team newsletter date
    featuredIn: {
      title: "The Question That's Breaking Your CS Team",
      link: "/newsletter/the-question-thats-breaking-your-cs-team",
      comingSoon: false
    },
  },
  {
    id: "customer-predictability-index",
    title: "Customer Predictability Index (CPI) Framework",
    description: "A tiered framework to assess and improve customer predictability across trust, engagement, and outcomes.",
    ctaText: "View in Notion",
    ctaLink: "https://www.notion.so/Customer-Predictability-Index-CPI-Framework-Tiered-Guide-2015d0709c9980b18354e3512b86ebff",
    icon: undefined,
    datePosted: "2025-06-03", // The Customer Predictability Revolution newsletter date
    featuredIn: {
      title: "The Customer Predictability Revolution",
      link: "/newsletter/the-customer-predictability-revolution",
      comingSoon: false
    },
  },
];

// Sort resources by date (latest first)
const sortedResources = [...resources].sort((a, b) => 
  new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
);

const PlaybookVault = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/playbook' } });
    }
  }, [user, authLoading, navigate]);

  const handlePdfDownload = (pdfPath: string, title: string) => {
    console.log("Initiating PDF download:", pdfPath);
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log("PDF download triggered successfully");
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="bg-cream py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-navy-dark mb-4">
                Tactical Templates, Checklists & Frameworks
              </h1>
              <p className="text-xl md:text-2xl text-navy-dark/80">
                Real tools. No fluff. These are the exact docs I use with customers — built to help you lead with confidence and strategy.
              </p>
            </div>
          </div>
        </section>

        {/* Add spacing or divider */}
        <div className="container mx-auto px-4 md:px-6">
          <Separator className="bg-gray-200 my-12" />
        </div>

        {/* Resource Grid Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sortedResources.map((resource) => (
                <Card key={resource.id} className="bg-white border shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-start">
                      {resource.icon && (
                        <span className="text-2xl mr-3">{resource.icon}</span>
                      )}
                      <h3 className="text-xl font-serif font-bold text-navy-dark">
                        {resource.title}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-navy-dark/80">{resource.description}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start">
                    <div className="flex gap-2 mb-2">
                      {resource.ctaLink ? (
                        <Button 
                          variant="vibrant-red" 
                          asChild
                          disabled={resource.disabled}
                        >
                          <a href={resource.ctaLink} target="_blank" rel="noopener noreferrer">
                            {resource.ctaText} {!resource.disabled && <ExternalLink className="ml-1 h-4 w-4" />}
                          </a>
                        </Button>
                      ) : (
                        <Button 
                          variant="vibrant-red" 
                          className="opacity-60 cursor-not-allowed"
                          disabled
                        >
                          {resource.ctaText}
                        </Button>
                      )}
                      
                      {resource.pdfPath && (
                        <Button 
                          variant="outline-red"
                          onClick={() => handlePdfDownload(resource.pdfPath!, resource.title)}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          PDF
                        </Button>
                      )}
                    </div>
                    
                    {resource.featuredIn && (
                      <div className="text-sm text-gray-600 pt-2">
                        {resource.featuredIn.comingSoon ? (
                          <span className="italic">{resource.featuredIn.title}</span>
                        ) : (
                          <>
                            Featured in:{" "}
                            <Link 
                              to={resource.featuredIn.link || "#"}
                              className="text-red-600 hover:text-red-700 underline-red"
                            >
                              {resource.featuredIn.title}
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Empty State: Show this when no resources are available */}
            {sortedResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">
                  More resources coming soon! Check back regularly for updates.
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
      
      {/* Use the consistent Footer component */}
      <Footer />
    </div>
  );
};

export default PlaybookVault;
