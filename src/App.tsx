import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import PastNewsletters from "./pages/PastNewsletters";
import NotFound from "./pages/NotFound";
import NewsletterDetail from "./pages/NewsletterDetail";
import About from "./pages/About";
import Playbook from "./pages/Playbook";
import CSAnalyzer from "./pages/CSAnalyzer";
import CSAnalyzerWaitlist from "./pages/CSAnalyzerWaitlist";
import Auth from "./pages/Auth";
import AdminPanel from "./components/AdminPanel";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/newsletters" element={<PastNewsletters />} />
            <Route path="/newsletter/:slug" element={<NewsletterDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/playbook" element={<Playbook />} />
            <Route path="/cs-analyzer" element={<CSAnalyzer />} />
            <Route path="/cs-analyzer-waitlist" element={<CSAnalyzerWaitlist />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<ProtectedAdminRoute><AdminPanel /></ProtectedAdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
