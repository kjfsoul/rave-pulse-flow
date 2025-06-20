
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import NeonButton from "@/components/NeonButton";
import ArchetypeAuraMeter from "@/components/ArchetypeAuraMeter";
import ArchetypeRevealCeremony from "@/components/ArchetypeRevealCeremony";
import ArtistSpotlightCarousel from "@/components/ArtistSpotlightCarousel";
import QuizBackgroundAnimation from "@/components/QuizBackgroundAnimation";

interface QuizQuestion {
  id: number;
  question: string;
  answers: {
    text: string;
    archetype: "Firestorm" | "FrostPulse" | "MoonWaver";
    vibe: "fire" | "frost" | "wave";
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "When the bass drops, your body naturally...",
    answers: [
      { text: "🔥 Explodes with aggressive stomps and sharp cuts", archetype: "Firestorm", vibe: "fire" },
      { text: "❄️ Flows like liquid ice with smooth precision", archetype: "FrostPulse", vibe: "frost" },
      { text: "🌙 Waves and rolls with dreamy, hypnotic motion", archetype: "MoonWaver", vibe: "wave" }
    ]
  },
  {
    id: 2,
    question: "Your ideal rave aesthetic is...",
    answers: [
      { text: "🔥 Blazing LED armor and fire-colored gear", archetype: "Firestorm", vibe: "fire" },
      { text: "❄️ Crystalline whites and electric blue accents", archetype: "FrostPulse", vibe: "frost" },
      { text: "🌙 Holographic pastels and cosmic patterns", archetype: "MoonWaver", vibe: "wave" }
    ]
  },
  {
    id: 3,
    question: "Your energy peak happens when...",
    answers: [
      { text: "🔥 The crowd goes wild and chaos takes over", archetype: "Firestorm", vibe: "fire" },
      { text: "❄️ You find perfect sync with the beat's precision", archetype: "FrostPulse", vibe: "frost" },
      { text: "🌙 You lose yourself in the music's emotional journey", archetype: "MoonWaver", vibe: "wave" }
    ]
  }
];

const ArchetypeQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentVibe, setCurrentVibe] = useState<"fire" | "frost" | "wave" | null>(null);
  const [finalArchetype, setFinalArchetype] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  const handleAnswer = (answer: QuizQuestion['answers'][0]) => {
    const newAnswers = [...answers, answer.archetype];
    setAnswers(newAnswers);
    setCurrentVibe(answer.vibe);

    if (currentStep < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setCurrentVibe(null);
      }, 1500);
    } else {
      // Calculate final archetype
      const archetypeCounts = newAnswers.reduce((acc, archetype) => {
        acc[archetype] = (acc[archetype] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const winner = Object.entries(archetypeCounts).reduce((a, b) => 
        archetypeCounts[a[0]] > archetypeCounts[b[0]] ? a : b
      )[0];
      
      setFinalArchetype(winner);
      setTimeout(() => setShowReveal(true), 1000);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setCurrentVibe(null);
    setFinalArchetype(null);
    setShowReveal(false);
  };

  const getCurrentQuestion = () => quizQuestions[currentStep];

  if (showReveal && finalArchetype) {
    return (
      <div className="min-h-screen bg-bass-dark relative pb-20">
        <ArchetypeRevealCeremony 
          archetype={finalArchetype as "Firestorm" | "FrostPulse" | "MoonWaver"}
          onContinue={() => window.location.href = '/shuffle-feed'}
          onRetake={resetQuiz}
        />
        <ArtistSpotlightCarousel archetype={finalArchetype as "Firestorm" | "FrostPulse" | "MoonWaver"} />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bass-dark relative pb-20 overflow-hidden">
      <QuizBackgroundAnimation vibe={currentVibe} />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Progress Indicator */}
        <motion.div 
          className="absolute top-8 left-1/2 transform -translate-x-1/2 flex space-x-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {quizQuestions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index <= currentStep ? 'bg-neon-purple shadow-lg shadow-neon-purple/50' : 'bg-slate-600'
              }`}
            />
          ))}
        </motion.div>

        {/* Archetype Aura Meter */}
        <ArchetypeAuraMeter answers={answers} currentVibe={currentVibe} />

        {/* Question Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-2xl"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-8"
              animate={{
                textShadow: [
                  "0 0 20px rgba(191, 90, 242, 0.8)",
                  "0 0 40px rgba(6, 255, 165, 0.8)",
                  "0 0 20px rgba(191, 90, 242, 0.8)",
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {getCurrentQuestion().question}
            </motion.h1>

            <div className="space-y-4">
              {getCurrentQuestion().answers.map((answer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.3, duration: 0.6 }}
                >
                  <NeonButton
                    onClick={() => handleAnswer(answer)}
                    variant="secondary"
                    size="lg"
                    className="w-full text-left p-6 text-lg hover:scale-105 transition-all duration-300"
                  >
                    {answer.text}
                  </NeonButton>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Back to Home Button */}
        <motion.div
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={() => window.history.back()}
            className="text-slate-400 hover:text-neon-cyan transition-colors duration-300 text-sm"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ArchetypeQuiz;
