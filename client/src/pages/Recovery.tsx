import { motion } from 'framer-motion';
import { Moon, Heart, Zap, Clock, Sparkles, RotateCcw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Recovery = () => {
  const [workoutType, setWorkoutType] = useState('');
  const [intensity, setIntensity] = useState('');
  const [soreness, setSoreness] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const generateRecoveryAdvice = async () => {
    if (!workoutType || !intensity || !soreness) {
      alert('Please fill in all fields to generate recovery advice');
      return;
    }

    setIsGenerating(true);
    setAiAdvice('');

    try {
      const token = await getToken();
      
      const response = await fetch(`${API_BASE}/recovery/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workoutType,
          intensity,
          soreness
        })
      });

      const data = await response.json();

      if (data.success) {
        setAiAdvice(data.recoveryPlan);
        // Save recovery activity to dashboard
        await saveRecoveryActivity(data.recoveryPlan);
      } else {
        throw new Error(data.error || 'Failed to generate recovery plan');
      }
    } catch (error: any) {
      console.error('Recovery generation error:', error);
      alert(`Failed to generate recovery plan: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRecoveryActivity = async (advice: string) => {
    try {
      const token = await getToken();
      
      await fetch(`${API_BASE}/dashboard/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'recovery',
          action: 'Generated AI recovery plan',
          details: `Workout: ${workoutType}, Intensity: ${intensity}, Soreness: ${soreness}`
        })
      });
      
      console.log('✅ Recovery activity saved to dashboard');
    } catch (error) {
      console.error('Failed to save recovery activity:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(aiAdvice);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Format the AI response to remove markdown and fix formatting
  const formatRecoveryText = (text: string) => {
    return text
      // Remove markdown headers and bold
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/#+\s*(.*?)(?=\n|$)/g, '$1')
      // Fix bullet points
      .replace(/\*\s+/g, '• ')
      // Clean up excessive line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Ensure proper spacing
      .trim();
  };

  const quickRecoveryTips = [
    {
      icon: '💧',
      title: 'Hydration Protocol',
      tip: 'Drink 500ml water with electrolytes within 30 minutes post-workout'
    },
    {
      icon: '🍽️',
      title: 'Post-Workout Nutrition',
      tip: '20-40g protein + 40-80g carbs within the anabolic window'
    },
    {
      icon: '😴',
      title: 'Sleep Optimization',
      tip: '7-9 hours quality sleep in a cool, dark room for optimal recovery'
    },
    {
      icon: '🧘',
      title: 'Active Recovery',
      tip: 'Light walking, stretching, or mobility work on rest days'
    },
    {
      icon: '🧊',
      title: 'Cold Therapy',
      tip: 'Ice packs on sore joints or contrast showers for inflammation'
    },
    {
      icon: '📱',
      title: 'Stress Management',
      tip: 'Reduce screen time, practice deep breathing for cortisol control'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Recovery & Wellness
      </motion.h1>

      {/* AI Recovery Advice Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-savage-steel p-6 rounded-xl border border-gray-800 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-savage-neon-purple" />
          <h2 className="text-2xl font-bold text-savage-neon-purple">AI Recovery Advisor</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Last Workout Type</label>
            <select 
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-blue"
            >
              <option value="">Select type</option>
              <option value="push">Push Day</option>
              <option value="pull">Pull Day</option>
              <option value="legs">Legs Day</option>
              <option value="full_body">Full Body</option>
              <option value="cardio">Cardio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Workout Intensity</label>
            <select 
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-green"
            >
              <option value="">Select intensity</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="very_high">Very High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Soreness</label>
            <select 
              value={soreness}
              onChange={(e) => setSoreness(e.target.value)}
              className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-orange"
            >
              <option value="">Select soreness</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
              <option value="extreme">Extreme</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateRecoveryAdvice}
          disabled={isGenerating || !workoutType || !intensity || !soreness}
          className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-6 ${
            isGenerating || !workoutType || !intensity || !soreness
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-savage-neon-green text-savage-black hover:bg-green-400'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-savage-black"></div>
              Generating AI Recovery Plan...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Generate AI Recovery Plan
            </>
          )}
        </button>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-savage-black/50 p-6 rounded-lg border border-savage-neon-blue/30 text-center"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-savage-neon-green mx-auto mb-3"></div>
            <p className="text-savage-neon-blue font-semibold">AI is creating your personalized recovery plan...</p>
            <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
          </motion.div>
        )}

        {aiAdvice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-savage-black/50 p-6 rounded-lg border border-savage-neon-blue/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-savage-neon-blue" />
                <h3 className="font-bold text-savage-neon-blue text-lg">Your Personalized AI Recovery Plan</h3>
              </div>
              
              {/* Copy Button */}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-savage-neon-orange text-savage-black font-bold px-4 py-2 rounded-lg hover:bg-orange-400 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Plan
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div className="text-center p-3 bg-savage-black/30 rounded-lg">
                  <div className="text-savage-neon-orange font-semibold">Workout Type</div>
                  <div className="text-white capitalize">{workoutType.replace('_', ' ')}</div>
                </div>
                <div className="text-center p-3 bg-savage-black/30 rounded-lg">
                  <div className="text-savage-neon-green font-semibold">Intensity</div>
                  <div className="text-white capitalize">{intensity.replace('_', ' ')}</div>
                </div>
                <div className="text-center p-3 bg-savage-black/30 rounded-lg">
                  <div className="text-savage-neon-blue font-semibold">Soreness</div>
                  <div className="text-white capitalize">{soreness}</div>
                </div>
              </div>
              
              <div className="bg-savage-black/30 p-4 rounded-lg">
                <h4 className="font-semibold text-savage-neon-purple mb-3">Recovery Recommendations:</h4>
                <div className="text-gray-300 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                  {formatRecoveryText(aiAdvice)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 mb-8"
      >
        <button
          onClick={() => navigate('/')}
          className="bg-savage-neon-blue text-savage-black font-bold px-6 py-3 rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        
        <button
          onClick={() => {
            setWorkoutType('');
            setIntensity('');
            setSoreness('');
            setAiAdvice('');
          }}
          className="bg-savage-neon-orange text-savage-black font-bold px-6 py-3 rounded-lg hover:bg-orange-400 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Form
        </button>
      </motion.div>

      {/* Essential Recovery Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {quickRecoveryTips.map((tip, index) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-savage-steel p-6 rounded-xl border border-gray-800 hover:border-savage-neon-green transition-colors group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
              {tip.icon}
            </div>
            <h3 className="font-bold text-lg text-white mb-2">{tip.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{tip.tip}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Recovery Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-savage-steel p-6 rounded-xl border border-gray-800"
      >
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-savage-neon-orange" />
          <h3 className="text-xl font-bold text-savage-neon-orange">Recovery Timeline</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          {[
            { time: '0-2 hours', action: 'Hydrate + Post-workout meal', color: 'bg-savage-neon-green/20 text-savage-neon-green' },
            { time: '2-6 hours', action: 'Light movement + Stretching', color: 'bg-savage-neon-blue/20 text-savage-neon-blue' },
            { time: '6-24 hours', action: 'Quality sleep + Nutrition', color: 'bg-savage-neon-purple/20 text-savage-neon-purple' },
            { time: '24-48 hours', action: 'Active recovery + Mobility', color: 'bg-savage-neon-orange/20 text-savage-neon-orange' },
          ].map((item, index) => (
            <div key={item.time} className="p-4 rounded-lg border border-gray-700">
              <div className={`text-sm font-semibold mb-2 ${item.color}`}>{item.time}</div>
              <div className="text-xs text-gray-300">{item.action}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Recovery;