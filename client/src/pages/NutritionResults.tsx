// src/pages/NutritionResults.tsx
import { motion } from 'framer-motion';
import { Utensils, ArrowLeft, Target, Zap, Apple, Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const NutritionResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bmi, calories, userData } = location.state || {};

  if (!bmi || !calories) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-red-500 mb-4">No Data Found</h1>
        <p className="text-gray-400 mb-6">Please calculate your nutrition plan first.</p>
        <button 
          onClick={() => navigate('/nutrition')}
          className="bg-savage-neon-blue text-savage-black font-bold px-6 py-2 rounded-lg hover:bg-cyan-400"
        >
          Go to Nutrition Calculator
        </button>
      </div>
    );
  }

  const getGoalDescription = (goal: string) => {
    const descriptions: { [key: string]: string } = {
      'lose_weight': 'Weight Loss Focus: Creating a calorie deficit while preserving muscle mass',
      'gain_muscle': 'Muscle Gain Focus: Calorie surplus with high protein for growth',
      'maintain': 'Maintenance Focus: Balanced calories to maintain current weight'
    };
    return descriptions[goal] || 'Personalized nutrition plan based on your goals';
  };

  const getActivityDescription = (level: string) => {
    const descriptions: { [key: string]: string } = {
      'sedentary': 'Little to no exercise',
      'light': 'Light exercise 1-3 days/week',
      'moderate': 'Moderate exercise 3-5 days/week',
      'active': 'Active exercise 6-7 days/week',
      'very_active': 'Very active (2x daily workouts)'
    };
    return descriptions[level] || 'Regular physical activity';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/nutrition')}
          className="flex items-center gap-2 text-savage-neon-blue hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Nutrition
        </button>
        <h1 className="text-3xl font-bold text-center flex-1">Your AI Nutrition Plan</h1>
        <div className="w-20"></div> {/* Spacer for balance */}
      </div>

      {/* User Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-savage-steel p-6 rounded-xl border border-gray-800 mb-8"
      >
        <h2 className="text-2xl font-bold text-savage-neon-purple mb-4">Personalized Plan</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Height:</span>
            <div className="font-semibold">{userData?.height} cm</div>
          </div>
          <div>
            <span className="text-gray-400">Weight:</span>
            <div className="font-semibold">{userData?.weight} kg</div>
          </div>
          <div>
            <span className="text-gray-400">Age:</span>
            <div className="font-semibold">{userData?.age} years</div>
          </div>
          <div>
            <span className="text-gray-400">Gender:</span>
            <div className="font-semibold capitalize">{userData?.gender}</div>
          </div>
          <div>
            <span className="text-gray-400">Activity:</span>
            <div className="font-semibold">{getActivityDescription(userData?.activityLevel)}</div>
          </div>
          <div>
            <span className="text-gray-400">Goal:</span>
            <div className="font-semibold capitalize">{userData?.goal?.replace('_', ' ')}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BMI Results */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-savage-steel p-6 rounded-xl border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-savage-neon-blue" />
            <h2 className="text-xl font-bold text-savage-neon-blue">Body Mass Index (BMI)</h2>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-2">{bmi.value}</div>
            <div className={`text-lg font-semibold ${bmi.color} mb-3`}>
              {bmi.category}
            </div>
            <div className="text-sm text-gray-300">
              {bmi.category === 'Normal Weight' 
                ? '🎉 Perfect! Maintain your healthy weight.'
                : bmi.category === 'Underweight'
                ? '💪 Focus on nutrient-dense foods and strength training.'
                : bmi.category === 'Overweight'
                ? '🔥 Combine balanced nutrition with regular exercise.'
                : '🏥 Consult with a healthcare professional for guidance.'
              }
            </div>
          </div>

          <div className="bg-savage-black/50 p-4 rounded-lg">
            <h3 className="font-semibold text-savage-neon-green mb-2">BMI Categories:</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Underweight:</span>
                <span className="text-savage-neon-blue">&lt; 18.5</span>
              </div>
              <div className="flex justify-between">
                <span>Normal weight:</span>
                <span className="text-savage-neon-green">18.5 – 24.9</span>
              </div>
              <div className="flex justify-between">
                <span>Overweight:</span>
                <span className="text-savage-neon-orange">25 – 29.9</span>
              </div>
              <div className="flex justify-between">
                <span>Obesity:</span>
                <span className="text-red-500">≥ 30</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calorie & Macro Plan */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-savage-steel p-6 rounded-xl border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-savage-neon-orange" />
            <h2 className="text-xl font-bold text-savage-neon-orange">Daily Nutrition Targets</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-savage-black/50 p-4 rounded-lg">
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-savage-neon-orange mb-1">
                  {calories.target} kcal
                </div>
                <div className="text-sm text-gray-300">Daily Target Calories</div>
              </div>
              <div className="text-xs text-gray-400 text-center">
                {getGoalDescription(calories.goal)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-savage-black/30 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-savage-neon-green">{calories.protein}</div>
                <div className="text-xs text-gray-400">Protein</div>
              </div>
              <div className="bg-savage-black/30 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-savage-neon-blue">{calories.carbs}</div>
                <div className="text-xs text-gray-400">Carbs</div>
              </div>
              <div className="bg-savage-black/30 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-savage-neon-orange">{calories.fat}</div>
                <div className="text-xs text-gray-400">Fat</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-savage-steel p-6 rounded-xl border border-gray-800 mt-8"
      >
        <h2 className="text-2xl font-bold text-savage-neon-green mb-4">AI Nutrition Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Apple className="w-5 h-5 text-savage-neon-green" />
              <h3 className="font-semibold text-savage-neon-green">Food Suggestions</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Lean proteins: Chicken breast, fish, tofu, Greek yogurt</li>
              <li>• Complex carbs: Brown rice, quinoa, sweet potatoes, oats</li>
              <li>• Healthy fats: Avocado, nuts, olive oil, fatty fish</li>
              <li>• Vegetables: Leafy greens, broccoli, bell peppers, carrots</li>
              <li>• Hydration: 3-4L water daily, herbal teas</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-savage-neon-blue" />
              <h3 className="font-semibold text-savage-neon-blue">Lifestyle Tips</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Eat every 3-4 hours to maintain energy levels</li>
              <li>• Include protein in every meal for muscle preservation</li>
              <li>• Plan meals ahead to stay on track</li>
              <li>• Track progress weekly, not daily</li>
              <li>• Get 7-9 hours of quality sleep nightly</li>
              <li>• Combine with regular exercise for best results</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4 mt-8"
      >
        <button
          onClick={() => navigate('/nutrition')}
          className="flex-1 bg-savage-neon-blue text-savage-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors"
        >
          Recalculate Plan
        </button>
        <button
          onClick={() => navigate('/food-log')}
          className="flex-1 bg-savage-neon-green text-savage-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors"
        >
          Start Food Log
        </button>
      </motion.div>
    </div>
  );
};

export default NutritionResults;