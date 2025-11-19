import { create } from 'zustand';

const STEPS = 16;
const SYNTH_NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const DRUM_INSTRUMENTS = ['kick', 'snare', 'hihat', 'clap', 'tom', 'rim', 'cowbell', 'crash'];

// Grid types
type SynthGrid = boolean[][];
type DrumGrid = boolean[][];

// Pattern types
interface Pattern {
  id: string;
  name: string;
  grid: boolean[][];
}

interface SequenceState {
  // Synth patterns
  synthPatterns: Pattern[];
  activeSynthPatternId: string;
  synthNotes: string[];
  
  // Drum patterns
  drumPatterns: Pattern[];
  activeDrumPatternId: string;
  drumInstruments: string[];
  
  // Synth pattern actions
  createSynthPattern: (name?: string) => void;
  duplicateSynthPattern: (id: string) => void;
  deleteSynthPattern: (id: string) => void;
  setActiveSynthPattern: (id: string) => void;
  renameSynthPattern: (id: string, name: string) => void;
  toggleSynthNote: (step: number, noteIndex: number) => void;
  clearActiveSynthPattern: () => void;
  
  // Drum pattern actions
  createDrumPattern: (name?: string) => void;
  duplicateDrumPattern: (id: string) => void;
  deleteDrumPattern: (id: string) => void;
  setActiveDrumPattern: (id: string) => void;
  renameDrumPattern: (id: string, name: string) => void;
  toggleDrumHit: (step: number, instrumentIndex: number) => void;
  clearActiveDrumPattern: () => void;
  
  // Getters
  getActiveSynthPattern: () => Pattern | undefined;
  getActiveDrumPattern: () => Pattern | undefined;
  getSynthNotesAtStep: (step: number) => string[];
  getDrumHitsAtStep: (step: number) => string[];
}

// Helper functions
const createEmptyGrid = (rows: number, cols: number): boolean[][] => {
  return Array(rows).fill(null).map(() => Array(cols).fill(false));
};

const generateId = () => `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSequenceState = create<SequenceState>((set, get) => ({
  // Initial state with one default pattern for each
  synthPatterns: [
    {
      id: 'synth_default',
      name: 'Synth Pattern 1',
      grid: createEmptyGrid(STEPS, SYNTH_NOTES.length),
    },
  ],
  activeSynthPatternId: 'synth_default',
  synthNotes: SYNTH_NOTES,
  
  drumPatterns: [
    {
      id: 'drum_default',
      name: 'Drum Pattern 1',
      grid: createEmptyGrid(STEPS, DRUM_INSTRUMENTS.length),
    },
  ],
  activeDrumPatternId: 'drum_default',
  drumInstruments: DRUM_INSTRUMENTS,
  
  // Synth pattern management
  createSynthPattern: (name) => {
    const newId = generateId();
    const patternCount = get().synthPatterns.length + 1;
    const newPattern: Pattern = {
      id: newId,
      name: name || `Synth Pattern ${patternCount}`,
      grid: createEmptyGrid(STEPS, SYNTH_NOTES.length),
    };
    
    set((state) => ({
      synthPatterns: [...state.synthPatterns, newPattern],
      activeSynthPatternId: newId,
    }));
  },
  
  duplicateSynthPattern: (id) => {
    const state = get();
    const patternToDuplicate = state.synthPatterns.find((p) => p.id === id);
    if (!patternToDuplicate) return;
    
    const newId = generateId();
    const newPattern: Pattern = {
      id: newId,
      name: `${patternToDuplicate.name} (Copy)`,
      grid: patternToDuplicate.grid.map(row => [...row]), // Deep copy grid
    };
    
    set((state) => ({
      synthPatterns: [...state.synthPatterns, newPattern],
      activeSynthPatternId: newId,
    }));
  },
  
  deleteSynthPattern: (id) => {
    set((state) => {
      const filtered = state.synthPatterns.filter((p) => p.id !== id);
      // Don't allow deleting the last pattern
      if (filtered.length === 0) return state;
      
      // If deleting active pattern, switch to first available
      const newActiveId = state.activeSynthPatternId === id ? filtered[0].id : state.activeSynthPatternId;
      
      return {
        synthPatterns: filtered,
        activeSynthPatternId: newActiveId,
      };
    });
  },
  
  setActiveSynthPattern: (id) => {
    set({ activeSynthPatternId: id });
  },
  
  renameSynthPattern: (id, name) => {
    set((state) => ({
      synthPatterns: state.synthPatterns.map((p) =>
        p.id === id ? { ...p, name } : p
      ),
    }));
  },
  
  toggleSynthNote: (step, noteIndex) => {
    set((state) => {
      const patterns = state.synthPatterns.map((pattern) => {
        if (pattern.id !== state.activeSynthPatternId) return pattern;
        
        const newGrid = pattern.grid.map((row, i) =>
          i === step ? row.map((cell, j) => (j === noteIndex ? !cell : cell)) : row
        );
        
        return { ...pattern, grid: newGrid };
      });
      
      return { synthPatterns: patterns };
    });
  },
  
  clearActiveSynthPattern: () => {
    set((state) => ({
      synthPatterns: state.synthPatterns.map((p) =>
        p.id === state.activeSynthPatternId
          ? { ...p, grid: createEmptyGrid(STEPS, SYNTH_NOTES.length) }
          : p
      ),
    }));
  },
  
  // Drum pattern management
  createDrumPattern: (name) => {
    const newId = generateId();
    const patternCount = get().drumPatterns.length + 1;
    const newPattern: Pattern = {
      id: newId,
      name: name || `Drum Pattern ${patternCount}`,
      grid: createEmptyGrid(STEPS, DRUM_INSTRUMENTS.length),
    };
    
    set((state) => ({
      drumPatterns: [...state.drumPatterns, newPattern],
      activeDrumPatternId: newId,
    }));
  },
  
  duplicateDrumPattern: (id) => {
    const state = get();
    const patternToDuplicate = state.drumPatterns.find((p) => p.id === id);
    if (!patternToDuplicate) return;
    
    const newId = generateId();
    const newPattern: Pattern = {
      id: newId,
      name: `${patternToDuplicate.name} (Copy)`,
      grid: patternToDuplicate.grid.map(row => [...row]), // Deep copy grid
    };
    
    set((state) => ({
      drumPatterns: [...state.drumPatterns, newPattern],
      activeDrumPatternId: newId,
    }));
  },
  
  deleteDrumPattern: (id) => {
    set((state) => {
      const filtered = state.drumPatterns.filter((p) => p.id !== id);
      // Don't allow deleting the last pattern
      if (filtered.length === 0) return state;
      
      // If deleting active pattern, switch to first available
      const newActiveId = state.activeDrumPatternId === id ? filtered[0].id : state.activeDrumPatternId;
      
      return {
        drumPatterns: filtered,
        activeDrumPatternId: newActiveId,
      };
    });
  },
  
  setActiveDrumPattern: (id) => {
    set({ activeDrumPatternId: id });
  },
  
  renameDrumPattern: (id, name) => {
    set((state) => ({
      drumPatterns: state.drumPatterns.map((p) =>
        p.id === id ? { ...p, name } : p
      ),
    }));
  },
  
  toggleDrumHit: (step, instrumentIndex) => {
    set((state) => {
      const patterns = state.drumPatterns.map((pattern) => {
        if (pattern.id !== state.activeDrumPatternId) return pattern;
        
        const newGrid = pattern.grid.map((row, i) =>
          i === step ? row.map((cell, j) => (j === instrumentIndex ? !cell : cell)) : row
        );
        
        return { ...pattern, grid: newGrid };
      });
      
      return { drumPatterns: patterns };
    });
  },
  
  clearActiveDrumPattern: () => {
    set((state) => ({
      drumPatterns: state.drumPatterns.map((p) =>
        p.id === state.activeDrumPatternId
          ? { ...p, grid: createEmptyGrid(STEPS, DRUM_INSTRUMENTS.length) }
          : p
      ),
    }));
  },
  
  // Getters
  getActiveSynthPattern: () => {
    const state = get();
    return state.synthPatterns.find((p) => p.id === state.activeSynthPatternId);
  },
  
  getActiveDrumPattern: () => {
    const state = get();
    return state.drumPatterns.find((p) => p.id === state.activeDrumPatternId);
  },
  
  getSynthNotesAtStep: (step) => {
    const activePattern = get().getActiveSynthPattern();
    if (!activePattern) return [];
    
    const activeNotes: string[] = [];
    if (step >= 0 && step < activePattern.grid.length) {
      activePattern.grid[step].forEach((isActive, noteIndex) => {
        if (isActive) {
          activeNotes.push(SYNTH_NOTES[noteIndex]);
        }
      });
    }
    
    return activeNotes;
  },
  
  getDrumHitsAtStep: (step) => {
    const activePattern = get().getActiveDrumPattern();
    if (!activePattern) return [];
    
    const activeHits: string[] = [];
    if (step >= 0 && step < activePattern.grid.length) {
      activePattern.grid[step].forEach((isActive, instrumentIndex) => {
        if (isActive) {
          activeHits.push(DRUM_INSTRUMENTS[instrumentIndex]);
        }
      });
    }
    
    return activeHits;
  },
}));

export { STEPS, SYNTH_NOTES, DRUM_INSTRUMENTS };
export type { Pattern };
