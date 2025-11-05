// Updated: src/pages/FoodLog.tsx
import { motion } from 'framer-motion';
import { Utensils, ArrowLeft, Plus, Trash2, Save, Calendar, Edit, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // ADD useLocation
import { useAuth } from '@clerk/clerk-react';

const FoodLog = () => {
  const [meals, setMeals] = useState([
    { id: 1, name: '', calories: '', protein: '', carbs: '', fat: '' }
  ]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [existingLog, setExistingLog] = useState<any>(null);
  const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create'); // ADD mode state
  const [isLoading, setIsLoading] = useState(false); // ADD loading state
  
  const navigate = useNavigate();
  const location = useLocation(); // ADD location hook
  const { getToken } = useAuth();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // FIXED: Handle navigation state for view/edit modes
  useEffect(() => {
    const state = location.state as { viewDate?: string; editDate?: string };
    
    if (state?.viewDate) {
      setDate(state.viewDate);
      setMode('view');
      loadFoodLogForDate(state.viewDate);
    } else if (state?.editDate) {
      setDate(state.editDate);
      setMode('edit');
      loadFoodLogForDate(state.editDate);
    } else {
      setMode('create');
      // Only auto-load for create mode when date changes
      loadFoodLog();
    }
  }, [location.state]); // Only depend on location.state

  // FIXED: Separate function for loading by specific date
  const loadFoodLogForDate = async (targetDate: string) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/food-logs/${targetDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExistingLog(data.foodLog);
        
        const formattedMeals = data.foodLog.meals.map((meal: any, index: number) => ({
          id: index + 1,
          name: meal.name,
          calories: meal.calories.toString(),
          protein: meal.protein.toString(),
          carbs: meal.carbs.toString(),
          fat: meal.fat.toString()
        }));
        
        setMeals(formattedMeals.length > 0 ? formattedMeals : [{ id: 1, name: '', calories: '', protein: '', carbs: '', fat: '' }]);
        setIsEditing(true);
      } else {
        setExistingLog(null);
        setMeals([{ id: 1, name: '', calories: '', protein: '', carbs: '', fat: '' }]);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to load food log:', error);
      setExistingLog(null);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Original load function for current date
  const loadFoodLog = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/food-logs/${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExistingLog(data.foodLog);
        
        const formattedMeals = data.foodLog.meals.map((meal: any, index: number) => ({
          id: index + 1,
          name: meal.name,
          calories: meal.calories.toString(),
          protein: meal.protein.toString(),
          carbs: meal.carbs.toString(),
          fat: meal.fat.toString()
        }));
        
        setMeals(formattedMeals.length > 0 ? formattedMeals : [{ id: 1, name: '', calories: '', protein: '', carbs: '', fat: '' }]);
        setIsEditing(true);
      } else {
        setExistingLog(null);
        setMeals([{ id: 1, name: '', calories: '', protein: '', carbs: '', fat: '' }]);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to load food log:', error);
      setExistingLog(null);
      setIsEditing(false);
    }
  };

  const addMeal = () => {
    if (mode === 'view') return; // Disable in view mode
    setMeals([...meals, { 
      id: Date.now(), 
      name: '', 
      calories: '', 
      protein: '', 
      carbs: '', 
      fat: '' 
    }]);
  };

  const updateMeal = (id: number, field: string, value: string) => {
    if (mode === 'view') return; // Disable in view mode
    setMeals(meals.map(meal => 
      meal.id === id ? { ...meal, [field]: value } : meal
    ));
  };

  const removeMeal = (id: number) => {
    if (mode === 'view') return; // Disable in view mode
    if (meals.length > 1) {
      setMeals(meals.filter(meal => meal.id !== id));
    }
  };

  const saveFoodLog = async () => {
    if (mode === 'view') return; // Disable in view mode
    
    try {
      const token = await getToken();
      
      // Prepare meals data
      const mealsData = meals
        .filter(meal => meal.name.trim() !== '')
        .map(meal => ({
          name: meal.name.trim(),
          calories: parseInt(meal.calories) || 0,
          protein: parseInt(meal.protein) || 0,
          carbs: parseInt(meal.carbs) || 0,
          fat: parseInt(meal.fat) || 0
        }));

      if (mealsData.length === 0) {
        alert('Please add at least one meal with a name');
        return;
      }

      const response = await fetch(`${API_BASE}/food-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          meals: mealsData
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Food log saved successfully! 🎉');
        setExistingLog(data.foodLog);
        setIsEditing(true);
        setMode('edit'); // Switch to edit mode after saving
      } else {
        alert('Failed to save food log: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to save food log:', error);
      alert('Failed to save food log. Please try again.');
    }
  };

  const deleteFoodLog = async () => {
    if (!confirm('Are you sure you want to delete this food log?')) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/food-logs/${date}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Food log deleted successfully!');
        setExistingLog(null);
        setMeals([{ id: 1, name: '', calories: '', protein: '', carbs: '', fat: '' }]);
        setIsEditing(false);
        setMode('create'); // Switch back to create mode
      } else {
        alert('Failed to delete food log: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to delete food log:', error);
      alert('Failed to delete food log. Please try again.');
    }
  };

  const calculateTotals = () => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + (parseInt(meal.calories) || 0),
      protein: totals.protein + (parseInt(meal.protein) || 0),
      carbs: totals.carbs + (parseInt(meal.carbs) || 0),
      fat: totals.fat + (parseInt(meal.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTotals();

  // FIXED: Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-savage-neon-green mx-auto mb-4"></div>
        <p className="text-savage-neon-blue">Loading food log...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header - FIXED: Show mode in title */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/nutrition')}
          className="flex items-center gap-2 text-savage-neon-blue hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Nutrition
        </button>
        <h1 className="text-3xl font-bold text-center flex-1">
          {mode === 'view' ? 'View Food Log' : 
           mode === 'edit' ? 'Edit Food Log' : 
           'Create Food Log'}
        </h1>
        <div className="w-20"></div>
      </div>

      {/* Date Selection - FIXED: Disable in view mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-savage-steel p-6 rounded-xl border border-gray-800 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => mode !== 'view' && setDate(e.target.value)}
              disabled={mode === 'view'}
              className="bg-savage-black border border-gray-700 rounded-lg px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' && <Eye className="w-5 h-5 text-savage-neon-blue" />}
            {mode === 'edit' && <Edit className="w-5 h-5 text-savage-neon-green" />}
            {isEditing && (
              <span className={`text-sm ${
                mode === 'view' ? 'text-savage-neon-blue' : 'text-savage-neon-green'
              }`}>
                {mode === 'view' ? 'Viewing' : 'Editing'} existing log
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Meals List - FIXED: Read-only in view mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 mb-6"
      >
        {meals.map((meal, index) => (
          <div key={meal.id} className="bg-savage-steel p-4 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-savage-neon-green">Meal {index + 1}</h3>
              {meals.length > 1 && mode !== 'view' && (
                <button
                  onClick={() => removeMeal(meal.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Food Name *</label>
                <input
                  type="text"
                  value={meal.name}
                  onChange={(e) => updateMeal(meal.id, 'name', e.target.value)}
                  placeholder="e.g., Grilled Chicken Salad"
                  disabled={mode === 'view'}
                  className="w-full bg-savage-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Calories</label>
                <input
                  type="number"
                  value={meal.calories}
                  onChange={(e) => updateMeal(meal.id, 'calories', e.target.value)}
                  placeholder="0"
                  disabled={mode === 'view'}
                  className="w-full bg-savage-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={meal.protein}
                  onChange={(e) => updateMeal(meal.id, 'protein', e.target.value)}
                  placeholder="0"
                  disabled={mode === 'view'}
                  className="w-full bg-savage-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={meal.carbs}
                  onChange={(e) => updateMeal(meal.id, 'carbs', e.target.value)}
                  placeholder="0"
                  disabled={mode === 'view'}
                  className="w-full bg-savage-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={meal.fat}
                  onChange={(e) => updateMeal(meal.id, 'fat', e.target.value)}
                  placeholder="0"
                  disabled={mode === 'view'}
                  className="w-full bg-savage-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Add Meal Button - FIXED: Hide in view mode */}
      {mode !== 'view' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={addMeal}
          className="w-full bg-savage-neon-blue text-savage-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-5 h-5" />
          Add Another Meal
        </motion.button>
      )}

      {/* Totals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-savage-steel p-6 rounded-xl border border-gray-800 mb-6"
      >
        <h3 className="text-xl font-bold text-savage-neon-orange mb-4">Daily Totals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-savage-neon-orange">{totals.calories}</div>
            <div className="text-sm text-gray-400">Calories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-savage-neon-green">{totals.protein}g</div>
            <div className="text-sm text-gray-400">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-savage-neon-blue">{totals.carbs}g</div>
            <div className="text-sm text-gray-400">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-savage-neon-purple">{totals.fat}g</div>
            <div className="text-sm text-gray-400">Fat</div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons - FIXED: Different buttons for different modes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4"
      >
        {mode === 'view' ? (
          // View mode buttons
          <>
            <button
              onClick={() => navigate('/food-log-history')}
              className="flex-1 bg-savage-neon-blue text-savage-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Back to History
            </button>
            <button
              onClick={() => setMode('edit')}
              className="flex-1 bg-savage-neon-green text-savage-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Edit This Log
            </button>
          </>
        ) : (
          // Create/Edit mode buttons
          <>
            <button
              onClick={saveFoodLog}
              className="flex-1 bg-savage-neon-green text-savage-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isEditing ? 'Update Food Log' : 'Save Food Log'}
            </button>
            
            {isEditing && mode === 'edit' && (
              <button
                onClick={deleteFoodLog}
                className="px-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default FoodLog;