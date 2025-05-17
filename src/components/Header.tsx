
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
          <a href="#insights" className="text-navy-dark hover:text-red-600 font-medium transition-colors">
            Insights
          </a>
          <a href="#about" className="text-navy-dark hover:text-red-600 font-medium transition-colors">
            About
          </a>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
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
            <a 
              href="#insights" 
              className="text-navy-dark hover:text-red-600 font-medium transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Insights
            </a>
            <a 
              href="#about" 
              className="text-navy-dark hover:text-red-600 font-medium transition-colors px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <Button className="bg-red-600 hover:bg-red-700 text-white w-full">
              Subscribe
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
