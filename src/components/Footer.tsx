import { useState } from "react";
import { Link } from "react-router-dom";
import ContactDialog from "@/components/ContactDialog";

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
                <Link to="/" className="text-lg font-serif font-black text-navy-dark hover:text-red-600 transition-colors">
                  <span className="underline-red">Churn</span> Is Dead
                </Link>
                <p className="text-xs text-gray-400 mt-1">
                  Weekly CS frameworks by Kuber Sethi
                </p>
              </div>
              
              {/* Links */}
              <div className="flex items-center gap-5 text-sm">
                <Link to="/newsletters" className="text-gray-400 hover:text-navy-dark transition-colors">Issues</Link>
                <Link to="/playbook" className="text-gray-400 hover:text-navy-dark transition-colors">Playbooks</Link>
                <Link to="/about" className="text-gray-400 hover:text-navy-dark transition-colors">About</Link>
                <button 
                  onClick={() => setIsContactOpen(true)} 
                  className="text-gray-400 hover:text-navy-dark transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Contact
                </button>
                <a 
                  href="https://www.linkedin.com/in/kuber-s-79521946/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-navy-dark transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-300">
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
