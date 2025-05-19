
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewsletterForm from "./NewsletterForm";
import ContactDialog from "./ContactDialog";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const openSubscribeModal = () => setIsSubscribeOpen(true);
  const closeSubscribeModal = () => setIsSubscribeOpen(false);
  const openContactModal = () => setIsContactOpen(true);
  
  const scrollToNewsletter = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If we're not on the homepage, go to homepage first
    if (location.pathname !== "/") {
      window.location.href = "/#newsletter-section";
      return;
    }
    
    // Smooth scroll to newsletter section
    const newsletterSection = document.getElementById("newsletter-section");
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: "smooth" });
    }
    
    // Close the menu if it's open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    
    // Close the dialog if it's open
    if (isSubscribeOpen) {
      setIsSubscribeOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? "shadow-md py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        <Link to="/" className="flex items-center">
          <h1 className="text-xl md:text-2xl font-serif font-black text-navy-dark">
            <span className="underline-red">Churn</span> Is Dead
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/newsletters" className="text-navy-dark hover:text-red-600 font-medium transition-colors">
            Newsletters
          </Link>
          <Link to="/about" className="text-navy-dark hover:text-red-600 font-medium transition-colors">
            About
          </Link>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white transform transition-all duration-200 hover:scale-103"
            onClick={scrollToNewsletter}
          >
            Subscribe
          </Button>
        </nav>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={toggleMenu}
        >
          <span className="sr-only">Menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/newsletters" 
              className="text-navy-dark hover:text-red-600 font-medium transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Newsletters
            </Link>
            <Link 
              to="/about" 
              className="text-navy-dark hover:text-red-600 font-medium transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white w-full transform transition-all duration-200 hover:scale-103"
              onClick={scrollToNewsletter}
            >
              Subscribe
            </Button>
          </nav>
        </div>
      )}

      {/* Subscribe Modal */}
      <Dialog open={isSubscribeOpen} onOpenChange={setIsSubscribeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-serif font-bold mb-2">Subscribe to our newsletter</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-gray-600 mb-6">
              Get the latest customer success insights and strategies delivered straight to your inbox.
            </p>
            <NewsletterForm location="hero" className="max-w-sm mx-auto" />
            <p className="text-sm mt-4 text-center text-gray-500">
              Join CS leaders getting fresh insights every Tuesday.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Contact Dialog */}
      <ContactDialog open={isContactOpen} onOpenChange={setIsContactOpen} />
    </header>
  );
};

export default Header;
