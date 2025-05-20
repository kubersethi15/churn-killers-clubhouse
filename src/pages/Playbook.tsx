
import { ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PlaybookResource {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  icon?: string;
  featuredIn?: {
    title: string;
    link: string;
  };
}

const resources: PlaybookResource[] = [
  {
    id: "kickoff-checklist",
    title: "Kickoff Re-Discovery Checklist",
    description: "A tactical checklist to align internally, validate goals, and earn trust before the first customer call.",
    ctaText: "View in Notion",
    ctaLink: "https://www.notion.so/", // Replace with your actual Notion link
    icon: "📋",
    featuredIn: {
      title: "The Perfect Kickoff Call",
      link: "#", // This will be updated once the newsletter is posted
    },
  },
  // More resources can be added here later
];

const PlaybookVault = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-cream py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-navy-dark mb-4">
              📂 Tactical Templates, Checklists & Frameworks
            </h1>
            <p className="text-xl md:text-2xl text-navy-dark/80">
              Real tools. No fluff. These are the exact docs I use with customers — built to help you lead with confidence and strategy.
            </p>
          </div>
        </div>
      </section>

      {/* Resource Grid Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
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
                  <Button 
                    variant="vibrant-red" 
                    className="mb-2"
                    asChild
                  >
                    <a href={resource.ctaLink} target="_blank" rel="noopener noreferrer">
                      {resource.ctaText} <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                  
                  {resource.featuredIn && (
                    <div className="text-sm text-gray-600 pt-2">
                      🔗 Featured in:{" "}
                      <Link 
                        to={resource.featuredIn.link}
                        className="text-red-600 hover:text-red-700 underline-red"
                      >
                        {resource.featuredIn.title}
                      </Link>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Empty State: Show this when no resources are available */}
          {resources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                More resources coming soon! Check back regularly for updates.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PlaybookVault;
