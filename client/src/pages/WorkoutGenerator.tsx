// src/pages/WorkoutGenerator.tsx
import { motion } from 'framer-motion';
import { Dumbbell, Target, Clock, Zap, Copy, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

const WorkoutGenerator = () => {
  const [workoutData, setWorkoutData] = useState({
    goal: 'Muscle Gain',
    equipment: 'Full Gym',
    duration: '60 minutes',
    fitnessLevel: 'intermediate'
  });
  const [generatedWorkout, setGeneratedWorkout] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { getToken } = useAuth();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const handleInputChange = (field: string, value: string) => {
    setWorkoutData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateWorkout = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setGeneratedWorkout('');

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/workouts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workoutData)
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedWorkout(data.workout);
      } else {
        alert('Failed to generate workout: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Workout generation error:', error);
      alert('Failed to generate workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedWorkout);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // 🚀 UPDATED: Better formatting for plain text workouts
  const formatWorkoutText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Main section headers (numbered sections, workout days, etc.)
      if (trimmedLine.match(/^[0-9]+\./) || 
          trimmedLine.match(/^Workout Day:/) ||
          trimmedLine.match(/^Example Workout Day:/) ||
          trimmedLine.match(/^[A-Z][a-zA-Z ]+ Workout Plan/) ||
          (trimmedLine.length > 10 && trimmedLine.toUpperCase() === trimmedLine)) {
        return (
          <div key={index} className="font-bold text-savage-neon-blue mb-3 mt-6 first:mt-0 text-lg border-b border-savage-neon-blue/30 pb-2">
            {trimmedLine}
          </div>
        );
      }
      
      // Sub-headers (muscle groups, warm-up, cool-down)
      if (trimmedLine.match(/^[A-Z][a-zA-Z ]+:$/) && 
          !trimmedLine.includes('sets') && 
          !trimmedLine.includes('reps')) {
        return (
          <div key={index} className="font-semibold text-savage-neon-green mb-3 mt-4 text-md">
            {trimmedLine}
          </div>
        );
      }
      
      // Exercise lines with sets/reps
      if ((trimmedLine.includes('sets') && trimmedLine.includes('reps')) ||
          trimmedLine.match(/^[A-Z][a-zA-Z ]+:/)) {
        return (
          <div key={index} className="text-white mb-2 ml-2 leading-relaxed flex items-start">
            <span className="text-savage-neon-orange mr-2 mt-1">•</span>
            <span>{trimmedLine}</span>
          </div>
        );
      }
      
      // Bullet points (warm-up exercises, stretches)
      if (trimmedLine.startsWith('* ')) {
        return (
          <div key={index} className="text-gray-300 mb-1 ml-4 leading-relaxed">
            • {trimmedLine.substring(2)}
          </div>
        );
      }
      
      // Numbered items
      if (trimmedLine.match(/^[a-zA-Z]*\* /)) {
        return (
          <div key={index} className="text-gray-300 mb-1 ml-4 leading-relaxed">
            • {trimmedLine.replace(/^[a-zA-Z]*\* /, '')}
          </div>
        );
      }
      
      // Regular text (descriptions, notes)
      return (
        <div key={index} className="text-gray-300 mb-3 leading-relaxed">
          {trimmedLine}
        </div>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        AI Workout Generator
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workout Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-savage-steel p-6 rounded-xl border border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-6 text-savage-neon-blue">Create Your Workout</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fitness Goal</label>
              <select 
                value={workoutData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-blue"
              >
                <option>Muscle Gain</option>
                <option>Weight Loss</option>
                <option>Strength</option>
                <option>Endurance</option>
                <option>General Fitness</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Available Equipment</label>
              <select 
                value={workoutData.equipment}
                onChange={(e) => handleInputChange('equipment', e.target.value)}
                className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-green"
              >
                <option>Full Gym</option>
                <option>Home Gym</option>
                <option>Bodyweight Only</option>
                <option>Dumbbells Only</option>
                <option>Resistance Bands</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Workout Duration</label>
              <select 
                value={workoutData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-orange"
              >
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
                <option>90 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fitness Level</label>
              <select 
                value={workoutData.fitnessLevel}
                onChange={(e) => handleInputChange('fitnessLevel', e.target.value)}
                className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-purple"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <button
              onClick={generateWorkout}
              disabled={isGenerating}
              className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isGenerating 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-savage-neon-green text-savage-black hover:bg-green-400'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-savage-black"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate AI Workout
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Generated Workout Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-savage-steel p-6 rounded-xl border border-gray-800 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-savage-neon-green">Your Workout</h2>
            {generatedWorkout && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-savage-neon-blue text-savage-black font-bold px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {isCopied ? 'Copied!' : 'Copy Workout'}
              </button>
            )}
          </div>
          
          {/* Fixed Height Scrollable Content */}
          <div className="flex-1 min-h-0 flex flex-col">
            {generatedWorkout ? (
              <div className="bg-savage-black/50 rounded-lg border border-gray-700 flex flex-col flex-1 min-h-0">
                {/* Scrollable workout content */}
                <div className="flex-1 overflow-y-auto p-4 max-h-96">
                  <div className="space-y-1">
                    {formatWorkoutText(generatedWorkout)}
                  </div>
                </div>
                
                {/* Copy button at bottom */}
                <div className="p-4 border-t border-gray-700">
                  <button
                    onClick={copyToClipboard}
                    className="w-full bg-savage-neon-orange text-savage-black font-bold py-3 rounded-lg hover:bg-orange-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {isCopied ? 'Workout Copied!' : 'Copy Full Workout'}
                  </button>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="flex-1 bg-savage-black/50 rounded-lg border border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-savage-neon-green mx-auto mb-4"></div>
                  <p className="text-savage-neon-blue font-semibold">AI is crafting your perfect workout...</p>
                  <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-savage-black/50 rounded-lg border border-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="mb-2 text-lg">Generate your first AI-powered workout!</p>
                  <p className="text-sm">Your personalized workout will appear here</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkoutGenerator;