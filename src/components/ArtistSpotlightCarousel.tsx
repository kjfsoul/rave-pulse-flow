
import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface ArtistSpotlightCarouselProps {
  archetype: "Firestorm" | "FrostPulse" | "MoonWaver";
}

const artistData = {
  Firestorm: [
    { id: 1, name: "BlazeFX", avatar: "🔥", genre: "Hardstyle", followers: "12.3K", isMatching: true },
    { id: 2, name: "InfernoBeats", avatar: "⚡", genre: "Bass Drop", followers: "8.7K", isMatching: true },
    { id: 3, name: "PyroMixer", avatar: "💥", genre: "Aggressive House", followers: "15.1K", isMatching: true },
    { id: 4, name: "ChillWave", avatar: "🌊", genre: "Ambient", followers: "6.2K", isMatching: false },
  ],
  FrostPulse: [
    { id: 1, name: "IceFlow", avatar: "❄️", genre: "Liquid DnB", followers: "9.4K", isMatching: true },
    { id: 2, name: "CrystalBeats", avatar: "💎", genre: "Progressive", followers: "11.8K", isMatching: true },
    { id: 3, name: "ArcticMix", avatar: "🧊", genre: "Minimal Tech", followers: "7.6K", isMatching: true },
    { id: 4, name: "BlazeFX", avatar: "🔥", genre: "Hardstyle", followers: "12.3K", isMatching: false },
  ],
  MoonWaver: [
    { id: 1, name: "LunarVibes", avatar: "🌙", genre: "Psytrance", followers: "13.2K", isMatching: true },
    { id: 2, name: "CosmicFlow", avatar: "✨", genre: "Ambient Trance", followers: "8.9K", isMatching: true },
    { id: 3, name: "StarGazer", avatar: "🌟", genre: "Melodic House", followers: "10.5K", isMatching: true },
    { id: 4, name: "IceFlow", avatar: "❄️", genre: "Liquid DnB", followers: "9.4K", isMatching: false },
  ]
};

const ArtistSpotlightCarousel = ({ archetype }: ArtistSpotlightCarouselProps) => {
  const [activeArtist, setActiveArtist] = useState<number | null>(null);
  const artists = artistData[archetype];

  const handleArtistClick = (artistId: number) => {
    setActiveArtist(activeArtist === artistId ? null : artistId);
  };

  return (
    <div className="px-4 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5, duration: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-neon-cyan mb-2">
          🎤 Your Archetype DJs
        </h2>
        <p className="text-slate-400">
          Artists that match your {archetype} energy
        </p>
      </motion.div>

      <motion.div
        className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 1 }}
      >
        {artists.map((artist, index) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 4 + index * 0.1, duration: 0.6 }}
            className="flex-shrink-0 w-48"
          >
            <Card 
              className={`cursor-pointer transition-all duration-500 ${
                artist.isMatching 
                  ? 'bg-bass-medium border-neon-purple/50 hover:border-neon-purple hover:shadow-lg hover:shadow-neon-purple/30' 
                  : 'bg-bass-medium/50 border-slate-600/30 hover:border-slate-500/50'
              } ${
                activeArtist === artist.id 
                  ? 'ring-2 ring-neon-cyan shadow-lg shadow-neon-cyan/30' 
                  : ''
              }`}
              onClick={() => handleArtistClick(artist.id)}
            >
              <CardContent className="p-4 text-center">
                {/* Avatar with Glow Animation */}
                <motion.div
                  className="text-4xl mb-3 relative"
                  animate={activeArtist === artist.id ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 0.6, repeat: activeArtist === artist.id ? Infinity : 0 }}
                >
                  {artist.avatar}
                  
                  {/* Simulated Audio Pulse */}
                  {activeArtist === artist.id && (
                    <motion.div
                      className="absolute -inset-2 rounded-full border-2 border-neon-cyan"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.8, 0, 0.8]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Artist Info */}
                <h3 className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                  artist.isMatching ? 'text-white' : 'text-slate-400'
                }`}>
                  {artist.name}
                </h3>

                <Badge 
                  className={`mb-2 ${
                    artist.isMatching 
                      ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' 
                      : 'bg-slate-600/20 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {artist.genre}
                </Badge>

                <p className="text-sm text-slate-500 mb-3">
                  {artist.followers} followers
                </p>

                {/* Matching Badge */}
                {artist.isMatching && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 4.5 + index * 0.1, duration: 0.5 }}
                  >
                    <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50">
                      ✨ Perfect Match
                    </Badge>
                  </motion.div>
                )}

                {/* Audio Drop Simulation */}
                {activeArtist === artist.id && (
                  <motion.div
                    className="mt-3 text-neon-cyan text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    🎵 Now Playing Sample...
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Audio Drop Visualization */}
      {activeArtist && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="bg-bass-medium rounded-lg p-4 border border-neon-cyan/30">
            <motion.div
              className="flex items-center justify-center space-x-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
              <span className="text-neon-cyan text-sm">Audio Preview Active</span>
              <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ArtistSpotlightCarousel;
