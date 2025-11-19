import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalStore } from '@/hooks/useGlobalStore';
import { trpc } from '@/lib/trpc';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const FESTIVAL_SCENES = [
  {
    id: 'deep_forest',
    name: 'Deep Forest',
    description: 'Mystical woodland vibes with organic sounds',
    colors: { primary: '#10b981', secondary: '#059669', bg: '#064e3b' },
  },
  {
    id: 'neon_city',
    name: 'Neon City',
    description: 'Cyberpunk energy with electric beats',
    colors: { primary: '#8b5cf6', secondary: '#7c3aed', bg: '#4c1d95' },
  },
  {
    id: 'desert_sunset',
    name: 'Desert Sunset',
    description: 'Warm, chill vibes under endless skies',
    colors: { primary: '#f59e0b', secondary: '#d97706', bg: '#78350f' },
  },
  {
    id: 'ocean_waves',
    name: 'Ocean Waves',
    description: 'Liquid rhythms and coastal atmosphere',
    colors: { primary: '#06b6d4', secondary: '#0891b2', bg: '#164e63' },
  },
  {
    id: 'cosmic_space',
    name: 'Cosmic Space',
    description: 'Interstellar soundscapes and stellar energy',
    colors: { primary: '#6366f1', secondary: '#4f46e5', bg: '#312e81' },
  },
];

export function FestivalScenery() {
  const { activeScene, setActiveScene } = useGlobalStore();
  const [showScenes, setShowScenes] = useState(false);
  const updateScene = trpc.user.updateScene.useMutation({
    onSuccess: () => {
      toast.success('Scene Updated', {
        description: 'Your festival vibe has been changed',
      });
    },
  });

  const currentScene = FESTIVAL_SCENES.find((s) => s.id === activeScene) || FESTIVAL_SCENES[0];

  const handleSceneChange = (sceneId: string) => {
    setActiveScene(sceneId);
    updateScene.mutate({ scene: sceneId });
    setShowScenes(false);
  };

  return (
    <div className="space-y-4">
      {/* Current Scene Display */}
      <Card
        style={{
          background: `linear-gradient(135deg, ${currentScene.colors.bg} 0%, ${currentScene.colors.secondary} 100%)`,
          color: 'white',
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">{currentScene.name}</CardTitle>
              <CardDescription className="text-white/80">
                {currentScene.description}
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowScenes(!showScenes)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Change Vibes
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Scene Selection */}
      {showScenes && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FESTIVAL_SCENES.map((scene) => (
            <Card
              key={scene.id}
              className="cursor-pointer hover:scale-105 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${scene.colors.bg} 0%, ${scene.colors.secondary} 100%)`,
                color: 'white',
                border: activeScene === scene.id ? '2px solid white' : 'none',
              }}
              onClick={() => handleSceneChange(scene.id)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{scene.name}</h3>
                <p className="text-sm text-white/80">{scene.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
