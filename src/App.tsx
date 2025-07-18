import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from "@/contexts/AudioContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ArchetypeQuiz from "./pages/ArchetypeQuiz";
import ShuffleFeed from "./pages/ShuffleFeed";
import MarketplaceGrid from "./pages/MarketplaceGrid";
import FestivalVotingStage from "./pages/FestivalVotingStage";
import NotFound from "./pages/NotFound";
import DJMixStation from "./pages/DJMixStation";
import Profile from "./pages/Profile";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AudioProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ 
            v7_startTransition: true,
            v7_relativeSplatPath: true 
          }}>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/archetype-quiz" element={<ArchetypeQuiz />} />
              <Route path="/shuffle-feed" element={<ShuffleFeed />} />
              <Route path="/marketplace" element={<MarketplaceGrid />} />
              <Route path="/festival" element={<FestivalVotingStage />} />
              <Route path="/dj-mix" element={<DJMixStation />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AudioProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
