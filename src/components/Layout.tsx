
import { ReactNode } from "react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      
      {/* Footer */}
      <footer className="bg-navy-dark text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">
                <span className="underline-red">Churn</span> Is Dead
              </h3>
              <p className="text-gray-300 mb-4">
                Customer success strategies and practical frameworks for SaaS leaders.
              </p>
            </div>
            
            <div className="flex justify-start md:justify-end items-start">
              <div>
                <h3 className="text-lg font-bold mb-4">Connect</h3>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="border-gray-500 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <a 
                      href="https://www.linkedin.com/in/kuber-s-79521946/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  </Button>
                  
                  <div className="pt-4">
                    <button 
                      onClick={() => document.getElementById("contact-button")?.click()}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {currentYear} Churn Is Dead. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
