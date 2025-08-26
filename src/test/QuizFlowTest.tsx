import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileOperations } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export const QuizFlowTest: React.FC = () => {
  const { user, profile } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  const logTest = (message: string) => {
    console.log(`[QUIZ TEST] ${message}`);
    setTestResults(prev => [...prev, message]);
  };

  const runQuizFlowTest = async () => {
    if (!user) {
      logTest('ERROR: No authenticated user');
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    
    try {
      logTest(`Starting quiz flow test for user: ${user.id}`);
      
      // Step 1: Check initial profile state
      setCurrentStep('Checking initial profile state...');
      const initialProfile = await profileOperations.getProfile(user.id);
      logTest(`Initial profile: ${JSON.stringify(initialProfile)}`);
      
      // Step 2: Simulate quiz completion
      setCurrentStep('Simulating quiz completion...');
      const testArchetype = 'Firestorm';
      const testPoints = 100;
      
      logTest(`Attempting to update archetype to: ${testArchetype}`);
      const archetypeResult = await profileOperations.updateArchetype(user.id, testArchetype);
      logTest(`Archetype update result: ${archetypeResult}`);
      
      logTest(`Attempting to update PLUR points to: ${testPoints}`);
      const pointsResult = await profileOperations.updatePLURPoints(user.id, testPoints);
      logTest(`Points update result: ${pointsResult}`);
      
      // Step 3: Verify updates
      setCurrentStep('Verifying updates...');
      const updatedProfile = await profileOperations.getProfile(user.id);
      logTest(`Updated profile: ${JSON.stringify(updatedProfile)}`);
      
      // Step 4: Check if updates persisted
      if (updatedProfile?.archetype === testArchetype && updatedProfile?.plur_points === testPoints) {
        logTest('✅ SUCCESS: Quiz flow completed successfully');
        logTest('✅ Archetype and points updated correctly');
      } else {
        logTest('❌ FAILURE: Updates did not persist correctly');
      }
      
    } catch (error) {
      logTest(`❌ ERROR: ${error}`);
    } finally {
      setIsTesting(false);
      setCurrentStep('');
    }
  };

  const resetTestData = async () => {
    if (!user) return;
    
    logTest('Resetting test data...');
    await profileOperations.updateArchetype(user.id, '');
    await profileOperations.updatePLURPoints(user.id, 0);
    logTest('Test data reset complete');
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quiz Flow Test</h2>
      
      <div className="mb-4">
        <button 
          onClick={runQuizFlowTest}
          disabled={isTesting || !user}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded mr-2"
        >
          {isTesting ? 'Testing...' : 'Run Quiz Flow Test'}
        </button>
        
        <button 
          onClick={resetTestData}
          disabled={isTesting || !user}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded"
        >
          Reset Test Data
        </button>
      </div>

      {currentStep && (
        <div className="mb-4 p-3 bg-blue-900 rounded">
          <strong>Current Step:</strong> {currentStep}
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">User Status:</h3>
        <p>Authenticated: {user ? 'Yes' : 'No'}</p>
        <p>User ID: {user?.id || 'None'}</p>
        <p>Current Profile: {profile ? JSON.stringify(profile) : 'None'}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
        <div className="bg-gray-800 p-4 rounded max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="mb-1 text-sm font-mono">
              {result}
            </div>
          ))}
          {testResults.length === 0 && <p>No test results yet</p>}
        </div>
      </div>
    </div>
  );
};
