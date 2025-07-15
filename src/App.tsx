
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PastNewsletters from "./pages/PastNewsletters";
import NotFound from "./pages/NotFound";
import NewsletterDetail from "./pages/NewsletterDetail";
import About from "./pages/About";
import Playbook from "./pages/Playbook";
import AdminPanel from "./components/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AdminPanel />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
