
import { ReactNode } from "react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

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
          <div className="grid grid-cols-1">
            <div className="text-center">
              <h3 className="text-xl font-serif font-bold mb-4">
                <span className="underline-red">Churn</span> Is Dead
              </h3>
              <p className="text-gray-300 mb-4">
                © {currentYear} Churn Is Dead. All rights reserved.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center gap-6">
            <a 
              href="https://www.linkedin.com/in/kuber-s-79521946/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <button 
              onClick={() => {
                const contactDialog = document.querySelector("[data-state='open']");
                if (!contactDialog) {
                  const contactButtons = Array.from(document.querySelectorAll('button')).filter(
                    button => button.textContent?.includes('Contact')
                  );
                  if (contactButtons.length > 0) {
                    contactButtons[0].click();
                  }
                }
              }} 
              className="text-gray-300 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
