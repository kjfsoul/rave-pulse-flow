import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductionStation } from '@/components/vFLX10/ProductionStation';
import { DJStation } from '@/components/vFLX10/DJStation';
import { FestivalScenery } from '@/components/vFLX10/FestivalScenery';
import { SoundLibraryPanel } from '@/components/vFLX10/SoundLibraryPanel';

/**
 * Pro Station Test Page
 *
 * Temporary test page to validate vFLX-10 component UI rendering.
 * This page renders all ported components side-by-side for visual verification.
 */
const ProStationTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">vFLX-10 Pro Station - UI Test</CardTitle>
            <CardDescription>
              Testing all ported components from vFLX-10 Pro Station. Components are UI-only with stubbed data fetching.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Festival Scenery */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Festival Scenery</CardTitle>
              <CardDescription>Scene selector component</CardDescription>
            </CardHeader>
            <CardContent>
              <FestivalScenery />
            </CardContent>
          </Card>
        </section>

        {/* Sound Library */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Sound Library</CardTitle>
              <CardDescription>Track upload, samples, and AI generation</CardDescription>
            </CardHeader>
            <CardContent>
              <SoundLibraryPanel />
            </CardContent>
          </Card>
        </section>

        {/* Production Station */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Production Station</CardTitle>
              <CardDescription>Synth and drum sequencer</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductionStation />
            </CardContent>
          </Card>
        </section>

        {/* DJ Station */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>DJ Station</CardTitle>
              <CardDescription>Dual deck mixer with waveforms</CardDescription>
            </CardHeader>
            <CardContent>
              <DJStation />
            </CardContent>
          </Card>
        </section>

        {/* Status */}
        <Card className="bg-blue-950/50 border-blue-500/50">
          <CardHeader>
            <CardTitle className="text-blue-400">Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-green-200">✅ Components ported and UI rendering</p>
              <p className="text-green-200">✅ Audio engine activated (Tone.js, Wavesurfer.js)</p>
              <p className="text-green-200">✅ Sequence state management (useSequenceState)</p>
              <p className="text-green-200">✅ Transport synchronization (useToneTransport)</p>
              <p className="text-green-200">✅ DJ audio routing (useDJAudio)</p>
              <p className="text-yellow-200">⚠️ Data fetching stubbed (TODO: Wire to Supabase)</p>
              <p className="text-gray-300">📝 All trpc imports removed and replaced with TODO comments</p>
              <div className="mt-4 p-3 bg-green-950/50 border border-green-500/50 rounded">
                <p className="text-green-200 font-semibold mb-2">Test Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-green-300">
                  <li>Click "Play" on Production Station</li>
                  <li>Watch step sequencer advance visually (proves useToneTransport works)</li>
                  <li>Click grid cells on Drum Machine</li>
                  <li>Confirm audio is heard (proves Tone.js is active)</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProStationTest;
