// src/pages/FoodLogHistory.tsx
import { motion } from 'framer-motion';
import { Utensils, ArrowLeft, Calendar, Trash2, Edit, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const FoodLogHistory = () => {
  const [foodLogs, setFoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    loadFoodLogs();
  }, []);

  const loadFoodLogs = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/food-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFoodLogs(data.foodLogs);
      }
    } catch (error) {
      console.error('Failed to load food logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewFoodLog = (date: string) => {
    navigate('/food-log', { state: { viewDate: date } });
  };

  const editFoodLog = (date: string) => {
    navigate('/food-log', { state: { editDate: date } });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-savage-neon-green mx-auto mb-4"></div>
        <p className="text-savage-neon-blue">Loading your food logs...</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-center flex-1">Food Log History</h1>
        <button
          onClick={() => navigate('/food-log')}
          className="bg-savage-neon-green text-savage-black font-bold px-4 py-2 rounded-lg hover:bg-green-400"
        >
          New Log
        </button>
      </div>

      {foodLogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-savage-steel rounded-xl border border-gray-800"
        >
          <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-400 mb-2">No Food Logs Yet</h2>
          <p className="text-gray-500 mb-6">Start tracking your meals to see your history here.</p>
          <button
            onClick={() => navigate('/food-log')}
            className="bg-savage-neon-blue text-savage-black font-bold px-6 py-3 rounded-lg hover:bg-cyan-400"
          >
            Create Your First Food Log
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {foodLogs.map((log: any) => (
            <div key={log._id} className="bg-savage-steel p-6 rounded-xl border border-gray-800 hover:border-savage-neon-blue transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Calendar className="w-8 h-8 text-savage-neon-blue" />
                  <div>
                    <h3 className="font-bold text-lg">{formatDate(log.date)}</h3>
                    <p className="text-gray-400 text-sm">
                      {log.meals.length} meals • {log.totalCalories} total calories
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewFoodLog(log.date)}
                    className="flex items-center gap-2 bg-savage-neon-blue text-savage-black font-bold px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => editFoodLog(log.date)}
                    className="flex items-center gap-2 bg-savage-neon-green text-savage-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>

              {/* Meal Preview */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {log.meals.slice(0, 3).map((meal: any, index: number) => (
                  <div key={index} className="bg-savage-black/50 p-3 rounded-lg">
                    <div className="font-medium text-sm">{meal.name}</div>
                    <div className="text-xs text-gray-400">
                      {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                    </div>
                  </div>
                ))}
                {log.meals.length > 3 && (
                  <div className="bg-savage-black/50 p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-400">
                      +{log.meals.length - 3} more meals
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default FoodLogHistory;