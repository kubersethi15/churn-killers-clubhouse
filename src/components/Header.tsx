import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, NavLink, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NewsletterForm from "./NewsletterForm";
import ContactDialog from "./ContactDialog";
import WaitlistModal from "./WaitlistModal";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, User, LogOut, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
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
  const openContactModal = () => setIsContactOpen(true);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Custom NavLink style function to highlight active routes
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive 
      ? "text-red-600 font-medium transition-colors" 
      : "text-navy-dark hover:text-red-600 font-medium transition-colors";
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? "shadow-sm border-b border-gray-100 py-2.5" : "py-4"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        <Link to="/" className="flex items-center">
          <h1 className="text-xl md:text-2xl font-serif font-black text-navy-dark">
            <span className="underline-red">Churn</span> Is Dead
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setIsWaitlistOpen(true)}
            className="text-navy-dark hover:text-red-600 font-medium transition-colors flex items-center gap-2"
          >
            CS Analyzer
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-400 text-amber-600 bg-amber-50">
              Soon
            </Badge>
          </button>
          <NavLink to="/newsletters" className={getNavLinkClass}>
            Newsletters
          </NavLink>
          <NavLink to="/playbook" className={getNavLinkClass}>
            Playbook Vault
          </NavLink>
          <NavLink to="/about" className={getNavLinkClass}>
            About
          </NavLink>
          <Link 
            to="#" 
            className="text-navy-dark hover:text-red-600 font-medium transition-colors"
            onClick={(e) => {
              e.preventDefault();
              openContactModal();
            }}
          >
            Contact
          </Link>

          {/* Auth section */}
          <div className="pl-4 border-l border-gray-200">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-7 h-7 rounded-full bg-red/10 flex items-center justify-center text-red text-xs font-medium">
                      {initials}
                    </div>
                    <span className="hidden lg:inline text-navy-dark">{displayName}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/cs-analyzer" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      My Analyses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </nav>
        
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile auth button */}
          {user && (
            <div className="w-8 h-8 rounded-full bg-red/10 flex items-center justify-center text-red text-xs font-medium">
              {initials}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
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
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4">
          <nav className="flex flex-col space-y-4">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsWaitlistOpen(true);
              }}
              className="text-navy-dark hover:text-red-600 font-medium transition-colors px-2 py-1 flex items-center gap-2 text-left"
            >
              CS Analyzer
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-400 text-amber-600 bg-amber-50">
                Soon
              </Badge>
            </button>
            <NavLink 
              to="/newsletters" 
              className={({ isActive }) => 
                isActive 
                  ? "text-red-600 font-medium transition-colors px-2 py-1" 
                  : "text-navy-dark hover:text-red-600 font-medium transition-colors px-2 py-1"
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Newsletters
            </NavLink>
            <NavLink 
              to="/playbook" 
              className={({ isActive }) => 
                isActive 
                  ? "text-red-600 font-medium transition-colors px-2 py-1" 
                  : "text-navy-dark hover:text-red-600 font-medium transition-colors px-2 py-1"
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Playbook Vault
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                isActive 
                  ? "text-red-600 font-medium transition-colors px-2 py-1" 
                  : "text-navy-dark hover:text-red-600 font-medium transition-colors px-2 py-1"
              }
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </NavLink>
            <Link 
              to="#" 
              className="text-navy-dark hover:text-red-600 font-medium transition-colors px-2 py-1"
              onClick={() => {
                setIsMenuOpen(false);
                setIsContactOpen(true);
              }}
            >
              Contact
            </Link>
            
            {/* Mobile auth options */}
            <div className="border-t border-gray-100 pt-4 mt-2">
              {user ? (
                <>
                  <div className="px-2 py-1 mb-2">
                    <p className="text-sm font-medium text-navy-dark">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="text-destructive hover:text-destructive/80 font-medium transition-colors px-2 py-1 w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : null}
            </div>
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
      
      {/* Waitlist Modal */}
      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} source="nav" />
    </header>
  );
};

export default Header;
