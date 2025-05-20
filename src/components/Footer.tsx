
import { useState } from "react";
import { Link } from "react-router-dom";
import ContactDialog from "@/components/ContactDialog";

const Footer = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  
  return (
    <>
      <footer className="py-12 bg-navy-dark text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl font-serif font-black mb-2">
                <span className="underline-red">Churn</span> Is Dead
              </h2>
              <p className="text-sm text-gray-300">
                © {currentYear} Churn Is Dead. All rights reserved.
              </p>
            </div>
            
            <div className="flex gap-6">
              <a 
                href="https://www.linkedin.com/in/kuber-s-79521946/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <button 
                onClick={() => setIsContactOpen(true)} 
                className="text-gray-300 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer"
                aria-label="Contact Us"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Contact Dialog */}
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
    </>
  );
};

export default Footer;
