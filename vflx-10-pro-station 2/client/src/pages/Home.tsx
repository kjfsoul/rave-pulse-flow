import { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToneTransport } from '@/hooks/useToneTransport';
import { SoundLibraryPanel } from '@/components/SoundLibraryPanel';
import { ProductionStation } from '@/components/ProductionStation';
import { DJStation } from '@/components/DJStation';
import { FestivalScenery } from '@/components/FestivalScenery';
import { SubmissionSystem } from '@/components/SubmissionSystem';
import { NotificationBell } from '@/components/NotificationBell';

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState('library');
  
  // Initialize Tone.js transport at app root level
  useToneTransport();

  const handleMainTabChange = (value: string) => {
    setActiveMainTab(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white">
              vFLX-10 Pro Station
            </h1>
            <p className="text-xl text-white/80">
              Create, Mix, and Compete in the EDM Shuffle Ecosystem
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 space-y-6">
            <div className="space-y-4 text-white/90">
              <h2 className="text-2xl font-semibold">Your Complete Music Creation Platform</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <h3 className="font-semibold">🎹 Production Station</h3>
                  <p className="text-sm">Create music from scratch with synths and drum machines</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">🎧 DJ Station</h3>
                  <p className="text-sm">Mix tracks with professional FLX-10 style interface</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">📚 Sound Library</h3>
                  <p className="text-sm">Upload tracks, browse samples, or generate with AI</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">🏆 Festival Competition</h3>
                  <p className="text-sm">Submit your creations and compete for votes</p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Get Started - Sign In
            </Button>
          </div>

          <p className="text-sm text-white/60">
            Powered by Tone.js, Wavesurfer.js, and the EDM Shuffle community
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              {APP_LOGO && (
                <img src={APP_LOGO} alt={APP_TITLE} className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold truncate">vFLX-10 Pro Station</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  Welcome back, {user?.name || 'Producer'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <NotificationBell />
              <Button variant="outline" size="sm" className="text-xs md:text-sm" onClick={() => logout()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="space-y-4 md:space-y-6">
          {/* Festival Scenery */}
          <FestivalScenery />

          {/* Main Tabs */}
          <Tabs value={activeMainTab} onValueChange={handleMainTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="library" onClick={() => handleMainTabChange('library')} className="text-xs md:text-sm px-2 md:px-4 py-2">
                <span className="hidden sm:inline">Sound Library</span>
                <span className="sm:hidden">Library</span>
              </TabsTrigger>
              <TabsTrigger value="production" onClick={() => handleMainTabChange('production')} className="text-xs md:text-sm px-2 md:px-4 py-2">
                <span className="hidden sm:inline">Production</span>
                <span className="sm:hidden">Produce</span>
              </TabsTrigger>
              <TabsTrigger value="dj" onClick={() => handleMainTabChange('dj')} className="text-xs md:text-sm px-2 md:px-4 py-2">
                <span className="hidden sm:inline">DJ Station</span>
                <span className="sm:hidden">DJ</span>
              </TabsTrigger>
              <TabsTrigger value="submit" onClick={() => handleMainTabChange('submit')} className="text-xs md:text-sm px-2 md:px-4 py-2">Submit</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-4">
              <SoundLibraryPanel />
            </TabsContent>

            <TabsContent value="production" className="space-y-4">
              <ProductionStation />
            </TabsContent>

            <TabsContent value="dj" className="space-y-4">
              <DJStation />
            </TabsContent>

            <TabsContent value="submit" className="space-y-4">
              <SubmissionSystem />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-8 md:mt-12">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <p className="text-center text-xs md:text-sm text-muted-foreground">
            vFLX-10 Pro Station - A community-driven music creation and performance ecosystem
          </p>
        </div>
      </footer>
    </div>
  );
}
