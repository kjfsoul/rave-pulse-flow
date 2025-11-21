import { Button } from "@/components/ui/button";
import { Home, Library, Mic2, Music2, Settings } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// CRITICAL: Import froms vFLX10 folder
import BottomNavigation from "@/components/BottomNavigation";
import Layout from "@/components/Layout";
import { DJStation } from "@/components/vFLX10/DJStation";
import { ProductionStation } from "@/components/vFLX10/ProductionStation";
import { SoundLibraryPanel } from "@/components/vFLX10/SoundLibraryPanel";

const ProfessionalDJStationPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<
    "studio" | "production" | "library"
  >("studio");

  return (
    <Layout showHeader={true} title="FLX-10 PRO">
      <div className="min-h-[calc(100vh-128px)] bg-zinc-950 text-white flex flex-col overflow-hidden">
        {/* Pro Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 z-50 sticky top-[64px]">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <Home className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent leading-none">
                FLX-10 PRO
              </h1>
              <span className="text-[10px] text-zinc-500 tracking-widest uppercase">
                Virtual Controller
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <Button
              variant={activeView === "studio" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveView("studio")}
              className={
                activeView === "studio"
                  ? "bg-zinc-800 text-cyan-400"
                  : "text-zinc-400 hover:text-white"
              }
            >
              <Music2 className="w-4 h-4 mr-2" />
              Decks
            </Button>
            <Button
              variant={activeView === "library" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveView("library")}
              className={
                activeView === "library"
                  ? "bg-zinc-800 text-purple-400"
                  : "text-zinc-400 hover:text-white"
              }
            >
              <Library className="w-4 h-4 mr-2" />
              Library
            </Button>
            <Button
              variant={activeView === "production" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveView("production")}
              className={
                activeView === "production"
                  ? "bg-zinc-800 text-purple-400"
                  : "text-zinc-400 hover:text-white"
              }
            >
              <Mic2 className="w-4 h-4 mr-2" />
              Production
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative overflow-hidden">
          {activeView === "studio" && <DJStation />}
          {activeView === "production" && (
            <div className="h-full overflow-y-auto p-4 bg-zinc-900/50">
              <div className="max-w-6xl mx-auto">
                <ProductionStation />
              </div>
            </div>
          )}
          {activeView === "library" && (
            <div className="h-full overflow-y-auto p-4 bg-zinc-900/50">
              <div className="max-w-5xl mx-auto">
                <SoundLibraryPanel />
              </div>
            </div>
          )}
        </main>

        {/* Mobile Nav (Hidden on Desktop) */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    </Layout>
  );
};

export default ProfessionalDJStationPage;
