// src/pages/Nutrition.tsx
import { motion } from 'framer-motion';
import { Utensils, Apple, Scale, Calculator, TrendingUp, Activity, History } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Nutrition = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [bmiResult, setBmiResult] = useState<any>(null);
  const [calorieResult, setCalorieResult] = useState<any>(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const calculateBMI = async () => {
    if (!height || !weight) return;

    const heightInMeters = parseInt(height) / 100;
    const weightInKg = parseInt(weight);
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-savage-neon-blue';
    } else if (bmi < 25) {
      category = 'Normal Weight';
      color = 'text-savage-neon-green';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-savage-neon-orange';
    } else {
      category = 'Obese';
      color = 'text-red-500';
    }

    const bmiData = {
      value: bmi.toFixed(1),
      category,
      color
    };

    setBmiResult(bmiData);
    await calculateCalories(bmi, weightInKg, bmiData);
  };

  const calculateCalories = async (bmi: number, weight: number, bmiData: any) => {
    if (!age || !gender || !activityLevel || !goal) return;

    // Basal Metabolic Rate calculation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * parseInt(height)) - (5.677 * parseInt(age));
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * parseInt(height)) - (4.330 * parseInt(age));
    }

    // Activity multiplier
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    // Goal adjustment
    const goalAdjustments: { [key: string]: number } = {
      lose_weight: -500,
      maintain: 0,
      gain_muscle: 300
    };

    const maintenanceCalories = bmr * activityMultipliers[activityLevel];
    const targetCalories = maintenanceCalories + goalAdjustments[goal];

    // Macronutrient breakdown
    let protein, carbs, fat;
    
    if (goal === 'lose_weight') {
      protein = (weight * 2.2).toFixed(0);
      carbs = ((targetCalories * 0.35) / 4).toFixed(0);
      fat = ((targetCalories * 0.25) / 9).toFixed(0);
    } else if (goal === 'gain_muscle') {
      protein = (weight * 2.0).toFixed(0);
      carbs = ((targetCalories * 0.45) / 4).toFixed(0);
      fat = ((targetCalories * 0.25) / 9).toFixed(0);
    } else {
      protein = (weight * 1.8).toFixed(0);
      carbs = ((targetCalories * 0.40) / 4).toFixed(0);
      fat = ((targetCalories * 0.25) / 9).toFixed(0);
    }

    const calorieData = {
      maintenance: Math.round(maintenanceCalories),
      target: Math.round(targetCalories),
      protein: `${protein}g`,
      carbs: `${carbs}g`,
      fat: `${fat}g`,
      goal
    };

    setCalorieResult(calorieData);

    // Save to dashboard activities
    await saveNutritionActivity(bmiData, calorieData);
    
    // Navigate to results page
    navigate('/nutrition-results', { 
      state: { 
        bmi: bmiData, 
        calories: calorieData,
        userData: { height, weight, age, gender, activityLevel, goal }
      } 
    });
  };

  const saveNutritionActivity = async (bmiData: any, calorieData: any) => {
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/dashboard/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'nutrition',
          action: 'Calculated nutrition plan',
          details: `BMI: ${bmiData.value} (${bmiData.category}), Calories: ${calorieData.target} kcal`
        })
      });
    } catch (error) {
      console.error('Failed to save nutrition activity:', error);
    }
  };

  const startFoodLog = () => {
    navigate('/food-log');
  };

  const viewFoodLogHistory = () => {
    navigate('/food-log-history');
  };

  const getBMITip = (category: string) => {
    const tips: { [key: string]: string } = {
      'Underweight': 'Focus on calorie-dense foods and strength training to build muscle mass.',
      'Normal Weight': 'Maintain your current habits! Focus on balanced nutrition and consistent exercise.',
      'Overweight': 'Combine calorie control with regular exercise. Focus on protein and fiber-rich foods.',
      'Obese': 'Consult with a healthcare professional. Start with gentle exercise and portion control.'
    };
    return tips[category] || 'Maintain a balanced diet and regular exercise routine.';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Nutrition & Calorie Tracker
      </motion.h1>

      {/* AI Calorie & BMI Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-savage-steel p-6 rounded-xl border border-gray-800 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-savage-neon-purple" />
          <h2 className="text-2xl font-bold text-savage-neon-purple">AI Calorie & BMI Calculator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="175"
              className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
              className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-savage-neon-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white"
            >
              <option value="">Select activity</option>
              <option value="sedentary">Sedentary (little exercise)</option>
              <option value="light">Light (1-3 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="very_active">Very Active (2x day)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-savage-black border border-gray-700 rounded-lg px-4 py-3 text-white"
            >
              <option value="">Select goal</option>
              <option value="lose_weight">Lose Weight</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain_muscle">Gain Muscle</option>
            </select>
          </div>
        </div>

        <button
          onClick={calculateBMI}
          className="w-full bg-savage-neon-green text-savage-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
        >
          <Calculator className="w-5 h-5" />
          Calculate My Plan
        </button>

        {/* Quick Results Display (before navigation) */}
        {(bmiResult || calorieResult) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {bmiResult && (
              <div className="bg-savage-black/50 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold text-savage-neon-blue mb-3">BMI Analysis</h3>
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold mb-1">{bmiResult.value}</div>
                  <div className={`text-lg font-semibold ${bmiResult.color}`}>
                    {bmiResult.category}
                  </div>
                </div>
                <p className="text-sm text-gray-300 text-center">
                  {getBMITip(bmiResult.category)}
                </p>
              </div>
            )}

            {calorieResult && (
              <div className="bg-savage-black/50 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold text-savage-neon-green mb-3">Daily Nutrition Plan</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target Calories:</span>
                    <span className="font-bold text-savage-neon-orange">{calorieResult.target} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protein:</span>
                    <span className="font-bold text-savage-neon-green">{calorieResult.protein}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Carbs:</span>
                    <span className="font-bold text-savage-neon-blue">{calorieResult.carbs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fat:</span>
                    <span className="font-bold text-savage-neon-orange">{calorieResult.fat}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Quick Nutrition Tips & Progress Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Essential Nutrition Tips */}
        <div className="bg-savage-steel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Apple className="w-6 h-6 text-savage-neon-green" />
            <h3 className="text-xl font-bold text-savage-neon-green">Essential Nutrition Tips</h3>
          </div>
          <div className="space-y-3">
            {[
              '🥗 Eat protein with every meal for muscle repair',
              '💧 Drink 3-4L water daily for optimal hydration',
              '🥦 Include vegetables in every meal for fiber & micronutrients',
              '⏰ Space meals 3-4 hours apart for stable energy',
              '🚫 Limit processed foods and added sugars',
              '🥑 Include healthy fats for hormone production'
            ].map((tip, index) => (
              <div key={index} className="flex items-center gap-3 p-2">
                <span className="text-lg">{tip.split(' ')[0]}</span>
                <span className="text-sm text-gray-300">{tip.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Tracking - IMPROVED STYLING */}
        <div className="bg-savage-steel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-savage-neon-blue" />
            <h3 className="text-xl font-bold text-savage-neon-blue">Progress Tracking</h3>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center py-6">
            {/* Icon and Description */}
            <Activity className="w-16 h-16 mx-auto mb-4 text-savage-neon-blue opacity-80" />
            <p className="text-gray-300 mb-6 text-lg font-medium">
              Track your meals and progress with our AI nutrition coach!
            </p>
            
            {/* Action Buttons - Centered and Stacked */}
            <div className="space-y-3 w-full max-w-xs">
              <button 
                onClick={startFoodLog}
                className="w-full bg-savage-neon-blue text-savage-black font-bold px-6 py-3 rounded-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2"
              >
                <Utensils className="w-5 h-5" />
                Start Food Log
              </button>
              
              <button 
                onClick={viewFoodLogHistory}
                className="w-full bg-savage-neon-purple text-savage-black font-bold px-6 py-3 rounded-lg hover:bg-purple-400 transition-colors flex items-center justify-center gap-2"
              >
                <History className="w-5 h-5" />
                View Food Log History
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Nutrition;