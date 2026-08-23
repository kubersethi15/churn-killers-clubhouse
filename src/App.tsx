import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import { CommandPalette } from "./components/CommandPalette";
import GrowthPageTracker from "./components/GrowthPageTracker";

const PastNewsletters = lazy(() => import("./pages/PastNewsletters"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewsletterDetail = lazy(() => import("./pages/NewsletterDetail"));
const About = lazy(() => import("./pages/About"));
const Playbook = lazy(() => import("./pages/Playbook"));
const CSAnalyzer = lazy(() => import("./pages/CSAnalyzer"));
const CSAnalyzerDemo = lazy(() => import("./pages/CSAnalyzerDemo"));
const CSAnalyzerShare = lazy(() => import("./pages/CSAnalyzerShare"));
const AIExposureScore = lazy(() => import("./pages/AIExposureScore"));
const StartHere = lazy(() => import("./pages/StartHere"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const ProtectedAdminRoute = lazy(() => import("./components/ProtectedAdminRoute"));
const Distribution = lazy(() => import("./pages/Distribution"));
const EditorialStandards = lazy(() => import("./pages/EditorialStandards"));
const GrowthDashboard = lazy(() => import("./pages/GrowthDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CommandPalette />
          <GrowthPageTracker />
          <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/newsletters" element={<PastNewsletters />} />
              <Route path="/newsletter/:slug" element={<NewsletterDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/editorial-standards" element={<EditorialStandards />} />
              <Route path="/playbook" element={<Playbook />} />
              <Route path="/cs-analyzer" element={<CSAnalyzer />} />
              <Route path="/cs-analyzer/demo" element={<CSAnalyzerDemo />} />
              <Route path="/cs-analyzer/share/:shareId" element={<CSAnalyzerShare />} />
              <Route path="/cs-analyzer-waitlist" element={<Navigate to="/cs-analyzer" replace />} />
              <Route path="/ai-exposure-score" element={<AIExposureScore />} />
              <Route path="/start" element={<StartHere />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<ProtectedAdminRoute><AdminPanel /></ProtectedAdminRoute>} />
              <Route path="/distribute" element={<ProtectedAdminRoute><Distribution /></ProtectedAdminRoute>} />
              <Route path="/growth" element={<ProtectedAdminRoute><GrowthDashboard /></ProtectedAdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
