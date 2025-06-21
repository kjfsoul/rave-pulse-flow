
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from "@/contexts/AudioContext";
import Index from "./pages/Index";
import ArchetypeQuiz from "./pages/ArchetypeQuiz";
import ShuffleFeed from "./pages/ShuffleFeed";
import MarketplaceGrid from "./pages/MarketplaceGrid";
import FestivalVotingStage from "./pages/FestivalVotingStage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AudioProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/archetype-quiz" element={<ArchetypeQuiz />} />
            <Route path="/shuffle-feed" element={<ShuffleFeed />} />
            <Route path="/marketplace" element={<MarketplaceGrid />} />
            <Route path="/festival" element={<FestivalVotingStage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AudioProvider>
  </QueryClientProvider>
);

export default App;
