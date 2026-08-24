import { useState } from "react";
import { Link } from "react-router-dom";
import ContactDialog from "@/components/ContactDialog";
import BrandMark from "@/components/BrandMark";

const Footer = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  
  return (
    <>
      <footer className="py-10 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Brand */}
              <div>
                <Link to="/" className="inline-flex items-center gap-2 text-lg font-serif font-black text-navy-dark hover:text-red-600 transition-colors">
                  <BrandMark className="h-8 w-8" />
                  <span><span className="underline-red">Churn</span> Is Dead</span>
                </Link>
                <p className="text-xs text-gray-600 mt-1 max-w-xs">
                  Honest Customer Success thinking for people doing the work.
                </p>
              </div>
              
              {/* Links */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:flex sm:flex-wrap sm:items-center sm:gap-5">
                <Link to="/newsletters" className="text-gray-600 hover:text-navy-dark transition-colors">Issues</Link>
                <Link to="/topics" className="text-gray-600 hover:text-navy-dark transition-colors">Topics</Link>
                <Link to="/playbook" className="text-gray-600 hover:text-navy-dark transition-colors">Playbooks</Link>
                <Link to="/tools" className="text-gray-600 hover:text-navy-dark transition-colors">Tools</Link>
                <Link to="/about" className="text-gray-600 hover:text-navy-dark transition-colors">About</Link>
                <Link to="/editorial-standards" className="text-gray-600 hover:text-navy-dark transition-colors">Standards</Link>
                <Link to="/privacy" className="text-gray-600 hover:text-navy-dark transition-colors">Privacy</Link>
                <Link to="/terms" className="text-gray-600 hover:text-navy-dark transition-colors">Terms</Link>
                <Link to="/analyzer-data-handling" className="text-gray-600 hover:text-navy-dark transition-colors">Data handling</Link>
                <button 
                  onClick={() => setIsContactOpen(true)} 
                  className="text-left text-gray-600 hover:text-navy-dark transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Contact
                </button>
                <a 
                  href="https://www.linkedin.com/in/kuber-cs-strategist/"
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-navy-dark transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
              &copy; {currentYear} Churn Is Dead. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
    </>
  );
};

export default Footer;
