import { useEffect, useRef } from 'react';
import { useGlobalStore } from './useGlobalStore';
import { toast } from 'sonner';

/**
 * MIDI CC (Control Change) mapping for DJ controllers
 * Standard MIDI DJ controller layout:
 * - CC 7: Channel volume
 * - CC 13-15: EQ Low, Mid, High
 * - CC 16: Crossfader
 * - CC 17-19: Master EQ bands
 * 
 * Note: Different controllers use different CC numbers
 * This is a common mapping that works with many controllers
 */

const MIDI_CC_MAP = {
  // Deck A
  DECK_A_VOLUME: 7,
  DECK_A_EQ_LOW: 13,
  DECK_A_EQ_MID: 14,
  DECK_A_EQ_HIGH: 15,
  DECK_A_PITCH: 16,
  
  // Deck B
  DECK_B_VOLUME: 23,
  DECK_B_EQ_LOW: 29,
  DECK_B_EQ_MID: 30,
  DECK_B_EQ_HIGH: 31,
  DECK_B_PITCH: 32,
  
  // Mixer
  CROSSFADER: 8,
  MASTER_VOLUME: 39,
  
  // Master EQ (10 bands)
  MASTER_EQ_START: 40, // CC 40-49 for 10-band EQ
};

const MIDI_NOTE_MAP = {
  // Deck A buttons
  DECK_A_PLAY: 60, // Middle C
  DECK_A_CUE: 61,
  DECK_A_SYNC: 62,
  
  // Deck B buttons
  DECK_B_PLAY: 72,
  DECK_B_CUE: 73,
  DECK_B_SYNC: 74,
};

/**
 * Convert MIDI value (0-127) to normalized value (0-1)
 */
function midiToNormalized(value: number): number {
  return value / 127;
}

/**
 * Convert MIDI value (0-127) to EQ gain (-12 to +12 dB)
 * Center position (64) = 0dB
 */
function midiToEqGain(value: number): number {
  return ((value - 64) / 64) * 12;
}

/**
 * Convert MIDI value (0-127) to crossfader position (-1 to +1)
 * 0 = full A (-1), 64 = center (0), 127 = full B (+1)
 */
function midiToCrossfader(value: number): number {
  return ((value - 64) / 64);
}

/**
 * Convert MIDI value (0-127) to pitch (0.5x to 2.0x)
 * Center position (64) = 1.0x
 */
function midiToPitch(value: number): number {
  // Map 0-127 to 0.5-2.0
  // 0 = 0.5x, 64 = 1.0x, 127 = 2.0x
  if (value < 64) {
    // 0-64 maps to 0.5-1.0
    return 0.5 + (value / 64) * 0.5;
  } else {
    // 64-127 maps to 1.0-2.0
    return 1.0 + ((value - 64) / 63) * 1.0;
  }
}

/**
 * Hook to connect physical MIDI controllers to the DJ Station
 * Uses Web MIDI API to listen for MIDI messages and update global store
 */
export function useHardwareMIDI() {
  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const store = useGlobalStore();
  
  useEffect(() => {
    // Check if Web MIDI API is supported
    if (!navigator.requestMIDIAccess) {
      console.warn('[MIDI] Web MIDI API not supported in this browser');
      return;
    }
    
    // Request MIDI access
    navigator.requestMIDIAccess()
      .then((midiAccess) => {
        midiAccessRef.current = midiAccess;
        console.log('[MIDI] MIDI access granted');
        
        // Get all MIDI inputs
        const inputs = Array.from(midiAccess.inputs.values());
        
        if (inputs.length === 0) {
          console.log('[MIDI] No MIDI devices connected');
          store.setMidiConnected(false);
          return;
        }
        
        // Connect to all MIDI inputs
        inputs.forEach((input) => {
          console.log(`[MIDI] Connected to: ${input.name}`);
          store.setMidiConnected(true, input.name || 'Unknown Device');
          toast.success(`MIDI Controller Connected: ${input.name}`);
          
          // Add message listener
          input.onmidimessage = handleMIDIMessage;
        });
        
        // Listen for device connection/disconnection
        midiAccess.onstatechange = (event) => {
          const port = event.port as MIDIInput;
          if (port.type === 'input') {
            if (port.state === 'connected') {
              console.log(`[MIDI] Device connected: ${port.name}`);
              store.setMidiConnected(true, port.name || 'Unknown Device');
              toast.success(`MIDI Controller Connected: ${port.name}`);
              port.onmidimessage = handleMIDIMessage;
            } else if (port.state === 'disconnected') {
              console.log(`[MIDI] Device disconnected: ${port.name}`);
              store.setMidiConnected(false);
              toast.info(`MIDI Controller Disconnected: ${port.name}`);
            }
          }
        };
      })
      .catch((error) => {
        console.error('[MIDI] Failed to get MIDI access:', error);
        store.setMidiConnected(false);
      });
    
    // Cleanup
    return () => {
      if (midiAccessRef.current) {
        const inputs = Array.from(midiAccessRef.current.inputs.values());
        inputs.forEach((input) => {
          input.onmidimessage = null;
        });
      }
    };
  }, []);
  
  /**
   * Handle incoming MIDI messages
   */
  function handleMIDIMessage(event: MIDIMessageEvent) {
    if (!event.data || event.data.length < 3) return;
    const status = event.data[0];
    const data1 = event.data[1];
    const data2 = event.data[2];
    
    // Extract message type and channel
    const messageType = status & 0xf0;
    const channel = status & 0x0f;
    
    // Control Change (0xB0)
    if (messageType === 0xb0) {
      handleControlChange(data1, data2);
    }
    // Note On (0x90)
    else if (messageType === 0x90 && data2 > 0) {
      handleNoteOn(data1);
    }
    // Note Off (0x80 or Note On with velocity 0)
    else if (messageType === 0x80 || (messageType === 0x90 && data2 === 0)) {
      handleNoteOff(data1);
    }
  }
  
  /**
   * Handle Control Change (CC) messages
   * Used for faders, knobs, and continuous controls
   */
  function handleControlChange(cc: number, value: number) {
    console.log(`[MIDI] CC ${cc} = ${value}`);
    
    // Deck A controls
    if (cc === MIDI_CC_MAP.DECK_A_VOLUME) {
      store.setDeckAVolume(midiToNormalized(value));
    } else if (cc === MIDI_CC_MAP.DECK_A_EQ_LOW) {
      store.setDeckAEqLow(midiToEqGain(value));
    } else if (cc === MIDI_CC_MAP.DECK_A_EQ_MID) {
      store.setDeckAEqMid(midiToEqGain(value));
    } else if (cc === MIDI_CC_MAP.DECK_A_EQ_HIGH) {
      store.setDeckAEqHigh(midiToEqGain(value));
    } else if (cc === MIDI_CC_MAP.DECK_A_PITCH) {
      store.setDeckAPitch(midiToPitch(value));
    }
    
    // Deck B controls
    else if (cc === MIDI_CC_MAP.DECK_B_VOLUME) {
      store.setDeckBVolume(midiToNormalized(value));
    } else if (cc === MIDI_CC_MAP.DECK_B_EQ_LOW) {
      store.setDeckBEqLow(midiToEqGain(value));
    } else if (cc === MIDI_CC_MAP.DECK_B_EQ_MID) {
      store.setDeckBEqMid(midiToEqGain(value));
    } else if (cc === MIDI_CC_MAP.DECK_B_EQ_HIGH) {
      store.setDeckBEqHigh(midiToEqGain(value));
    } else if (cc === MIDI_CC_MAP.DECK_B_PITCH) {
      store.setDeckBPitch(midiToPitch(value));
    }
    
    // Mixer controls
    else if (cc === MIDI_CC_MAP.CROSSFADER) {
      store.setCrossfader(midiToCrossfader(value));
    } else if (cc === MIDI_CC_MAP.MASTER_VOLUME) {
      store.setMasterVolume(midiToNormalized(value));
    }
    
    // Master EQ (10 bands)
    else if (cc >= MIDI_CC_MAP.MASTER_EQ_START && cc < MIDI_CC_MAP.MASTER_EQ_START + 10) {
      const bandIndex = cc - MIDI_CC_MAP.MASTER_EQ_START;
      store.setMasterEqBand(bandIndex, midiToEqGain(value));
    }
  }
  
  /**
   * Handle Note On messages
   * Used for buttons and pads
   */
  function handleNoteOn(note: number) {
    console.log(`[MIDI] Note On ${note}`);
    
    // Deck A buttons
    if (note === MIDI_NOTE_MAP.DECK_A_PLAY) {
      store.setDeckAPlayState(!store.deckAPlayState);
    }
    
    // Deck B buttons
    else if (note === MIDI_NOTE_MAP.DECK_B_PLAY) {
      store.setDeckBPlayState(!store.deckBPlayState);
    }
  }
  
  /**
   * Handle Note Off messages
   * Used for button release events
   */
  function handleNoteOff(note: number) {
    console.log(`[MIDI] Note Off ${note}`);
    // Most DJ controllers use Note On for button presses
    // Note Off is typically not used for toggle behavior
  }
}
