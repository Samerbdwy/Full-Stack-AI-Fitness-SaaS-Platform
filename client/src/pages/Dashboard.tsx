import { motion } from 'framer-motion';
import { Activity, TrendingUp, Target, Dumbbell, Heart, Trophy, Flame, Award, Trash2, X, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Goal {
  _id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface Streak {
  _id: string;
  currentStreak: number;
  lastCheckIn: string | null; // 🚀 FIXED: Can be null for new users
  totalCheckIns: number;
  weeklyCheckIns: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

interface ActivityItem {
  _id: string;
  type: 'goal' | 'workout' | 'nutrition' | 'recovery' | 'streak' | 'achievement';
  action: string;
  details?: string;
  timestamp: string;
}

// Default streak data - FIXED for new users
const getDefaultStreak = (): Streak => ({
  _id: '',
  currentStreak: 0,
  lastCheckIn: null, // 🚀 FIXED: null for new users (never checked in)
  totalCheckIns: 0,
  weeklyCheckIns: {
    monday: false, tuesday: false, wednesday: false,
    thursday: false, friday: false, saturday: false, sunday: false
  }
});

const Dashboard = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streak, setStreak] = useState<Streak>(getDefaultStreak());
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [nextCheckInTime, setNextCheckInTime] = useState<string>('');
  const [timeUntilNextCheckIn, setTimeUntilNextCheckIn] = useState<string>('');
  const [canCheckIn, setCanCheckIn] = useState<boolean>(true);
  const [timerKey, setTimerKey] = useState<number>(0);

  // API configuration
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (!user || !isLoaded) return;

    console.log('🔄 USER CHANGED - NUCLEAR RESET:', user.id);
    
    // Reset state for new user
    setGoals([]);
    setStreak(getDefaultStreak());
    setActivities([]);
    setNewGoal('');
    setNextCheckInTime('');
    setTimeUntilNextCheckIn('Ready to check in!');
    setCanCheckIn(true);
    
    // Force timer component to remount by changing key
    setTimerKey(prev => prev + 1);

    // Load fresh data after reset
    const loadTimer = setTimeout(() => {
      loadDashboardData();
    }, 100);

    return () => clearTimeout(loadTimer);
  }, [user?.id]);

  // Handle authentication state issues
  useEffect(() => {
    if (isLoaded && !user && isSignedIn) {
      signOut();
      navigate('/');
    }
  }, [isLoaded, user, isSignedIn]);

  // Calculate next check-in time properly - FIXED for new users
  const calculateNextCheckIn = (lastCheckIn: string | null) => {
    // 🚀 FIXED: Handle new users with no lastCheckIn
    if (!lastCheckIn) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    }

    const lastCheckInDate = new Date(lastCheckIn);
    const nextCheckInDate = new Date();
    
    // If user has never checked in or last check-in was today, next is tomorrow
    if (lastCheckInDate.toDateString() === new Date().toDateString()) {
      nextCheckInDate.setDate(nextCheckInDate.getDate() + 1);
    }
    
    // Always set to 12:00 AM
    nextCheckInDate.setHours(0, 0, 0, 0);
    
    return nextCheckInDate;
  };

  // 🚀 FIXED: Enhanced timer with proper new user handling
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      
      // 🚀 FIXED: Handle new users (lastCheckIn is null)
      if (!streak.lastCheckIn) {
        setTimeUntilNextCheckIn('Ready to check in!');
        setNextCheckInTime('Now');
        setCanCheckIn(true);
        return;
      }

      const lastCheckIn = new Date(streak.lastCheckIn);
      const nextCheckIn = calculateNextCheckIn(streak.lastCheckIn);
      
      // Check if user can check in
      const canCheckInToday = lastCheckIn.toDateString() !== now.toDateString();
      setCanCheckIn(canCheckInToday);

      if (canCheckInToday) {
        setTimeUntilNextCheckIn('Ready to check in!');
        setNextCheckInTime('Now');
      } else {
        // Calculate time until next check-in (tomorrow at midnight)
        const timeDiff = nextCheckIn.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
          setTimeUntilNextCheckIn('Ready to check in!');
          setNextCheckInTime('Now');
          setCanCheckIn(true);
        } else {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          
          setTimeUntilNextCheckIn(`${hours}h ${minutes}m ${seconds}s`);
          setNextCheckInTime(nextCheckIn.toLocaleTimeString());
          setCanCheckIn(false);
        }
      }
    };

    // Initial update
    updateTimer();
    
    // Set up interval
    const timer = setInterval(updateTimer, 1000);

    // Cleanup function
    return () => {
      clearInterval(timer);
    };
  }, [streak.lastCheckIn, timerKey, user?.id]);

  // Load dashboard data with authentication
  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const token = await getToken();
      const response = await axios.get(`${API_BASE}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      // Set fresh data - each user gets their own isolated data
      setGoals(response.data.goals || []);
      setStreak(response.data.streak || getDefaultStreak());
      setActivities(response.data.activities || []);
      
      console.log('✅ Dashboard data loaded for new user:', {
        hasLastCheckIn: !!response.data.streak?.lastCheckIn,
        streak: response.data.streak?.currentStreak || 0
      });
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      // Reset to defaults on error
      setGoals([]);
      setStreak(getDefaultStreak());
      setActivities([]);
    }
  };

  // Add goal with authentication and INSTANT activity update
  const addGoal = async () => {
    if (newGoal.trim() && user) {
      try {
        const token = await getToken();
        const response = await axios.post(`${API_BASE}/dashboard/goals`, {
          text: newGoal.trim()
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // 🔥 INSTANT UPDATE: Add goal and activity immediately
        setGoals([response.data, ...goals]);
        
        // Add activity instantly without reloading
        const newActivity: ActivityItem = {
          _id: `temp-${Date.now()}`,
          type: 'goal',
          action: 'Added new goal',
          details: newGoal.trim(),
          timestamp: new Date().toISOString()
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 latest
        
        setNewGoal('');
      } catch (error: any) {
        console.error('Add goal error:', error);
        alert(`Failed to add goal: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  // Toggle goal with authentication and INSTANT activity update
  const toggleGoal = async (id: string) => {
    try {
      const token = await getToken();
      const response = await axios.patch(`${API_BASE}/dashboard/goals/${id}/toggle`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // 🔥 INSTANT UPDATE: Update goal immediately
      setGoals(goals.map(goal => 
        goal._id === id ? response.data : goal
      ));
      
      // Add activity instantly
      const goal = goals.find(g => g._id === id);
      if (goal) {
        const newActivity: ActivityItem = {
          _id: `temp-${Date.now()}`,
          type: 'goal',
          action: response.data.completed ? 'Completed goal' : 'Reopened goal',
          details: goal.text,
          timestamp: new Date().toISOString()
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    } catch (error: any) {
      console.error('Failed to toggle goal:', error);
    }
  };

  // Delete goal with authentication and INSTANT activity update
  const deleteGoal = async (id: string) => {
    try {
      const token = await getToken();
      const goalToDelete = goals.find(goal => goal._id === id);
      
      await axios.delete(`${API_BASE}/dashboard/goals/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // 🔥 INSTANT UPDATE: Remove goal immediately
      setGoals(goals.filter(goal => goal._id !== id));
      
      // Add activity instantly
      if (goalToDelete) {
        const newActivity: ActivityItem = {
          _id: `temp-${Date.now()}`,
          type: 'goal',
          action: 'Deleted goal',
          details: goalToDelete.text,
          timestamp: new Date().toISOString()
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    } catch (error: any) {
      console.error('Failed to delete goal:', error);
      alert(`Failed to delete goal: ${error.response?.data?.error || error.message}`);
    }
  };

  // Check in with authentication and INSTANT activity update
  const checkIn = async () => {
    try {
      const token = await getToken();
      const response = await axios.post(`${API_BASE}/dashboard/streak/checkin`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // 🔥 INSTANT UPDATE: Update streak immediately
      setStreak(response.data);
      
      // Add activity instantly
      const newActivity: ActivityItem = {
        _id: `temp-${Date.now()}`,
        type: 'streak',
        action: 'Daily check-in',
        details: `Streak: ${response.data.currentStreak} days`,
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      
      console.log('✅ Check-in successful! New streak:', response.data.currentStreak);
      
    } catch (error: any) {
      console.error('Failed to check in:', error);
      if (error.response?.data?.error === 'Already checked in today') {
        alert('You have already checked in today!');
      } else {
        alert(`Failed to check in: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  // Clear activities with authentication
  const clearActivities = async () => {
    try {
      const token = await getToken();
      await axios.delete(`${API_BASE}/dashboard/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setActivities([]);
    } catch (error: any) {
      console.error('Failed to clear activities:', error);
      alert(`Failed to clear activities: ${error.response?.data?.error || error.message}`);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout': return Dumbbell;
      case 'nutrition': return Heart;
      case 'recovery': return Activity;
      case 'goal': return Target;
      case 'streak': return Flame;
      case 'achievement': return Award;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'workout': return 'text-savage-neon-orange';
      case 'nutrition': return 'text-savage-neon-green';
      case 'recovery': return 'text-savage-neon-blue';
      case 'goal': return 'text-savage-neon-purple';
      case 'streak': return 'text-savage-neon-orange';
      case 'achievement': return 'text-savage-neon-purple';
      default: return 'text-gray-400';
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'workout': return 'bg-savage-neon-orange/20';
      case 'nutrition': return 'bg-savage-neon-green/20';
      case 'recovery': return 'bg-savage-neon-blue/20';
      case 'goal': return 'bg-savage-neon-purple/20';
      case 'streak': return 'bg-savage-neon-orange/20';
      case 'achievement': return 'bg-savage-neon-purple/20';
      default: return 'bg-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const goalsProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  const nextMilestone = Math.ceil((streak.currentStreak + 1) / 5) * 5;

  const stats = [
    { 
      icon: Target, 
      label: 'Goals Completed', 
      value: `${completedGoals}/${totalGoals}`, 
      change: `${Math.round(goalsProgress)}% done`, 
      color: 'text-savage-neon-green'
    },
    { 
      icon: Flame, 
      label: 'Current Streak', 
      value: `${streak.currentStreak} days`, 
      change: '🔥 Keep it up!', 
      color: 'text-savage-neon-orange'
    },
    { 
      icon: Trophy, 
      label: 'Total Check-ins', 
      value: `${streak.totalCheckIns}`, 
      change: 'Consistency is key!', 
      color: 'text-savage-neon-purple'
    },
    { 
      icon: Activity, 
      label: 'Recent Activities', 
      value: `${activities.length}`, 
      change: 'Stay active!', 
      color: 'text-savage-neon-blue'
    },
  ];

  const quickActions = [
    { label: 'Start Workout', color: 'bg-savage-neon-green hover:bg-green-400', icon: Dumbbell, path: '/workouts' },
    { label: 'Log Nutrition', color: 'bg-savage-neon-blue hover:bg-cyan-400', icon: Heart, path: '/nutrition' },
    { label: 'Exercise Library', color: 'bg-savage-neon-orange hover:bg-orange-400', icon: TrendingUp, path: '/exercises' },
    { label: 'Recovery Tips', color: 'bg-savage-neon-purple hover:bg-purple-400', icon: Activity, path: '/recovery' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Welcome {user?.firstName || 'User'}! 💪
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-savage-steel p-6 rounded-xl border border-gray-800 hover:border-savage-neon-blue"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            
            {/* Simplified Stat Display */}
            <div className="space-y-1">
              <p className={`text-sm ${stat.color} font-medium`}>
                {stat.change}
              </p>
              {stat.label === 'Current Streak' && streak.currentStreak > 0 && (
                <div className="text-xs text-gray-400">
                  Next: {nextMilestone} days
                </div>
              )}
              {stat.label === 'Total Check-ins' && (
                <div className="text-xs text-gray-400">
                  Daily commitment!
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Management */}
        <div className="bg-savage-steel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-savage-neon-green">My Goals</h3>
            <Target className="w-5 h-5 text-savage-neon-green" />
          </div>
          
          {/* Add Goal Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a new goal..."
              className="flex-1 bg-savage-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-savage-neon-green focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            />
            <button
              onClick={addGoal}
              className="bg-savage-neon-green text-savage-black font-bold px-4 rounded-lg hover:bg-green-400 text-sm"
            >
              Add
            </button>
          </div>

          {/* Goals List */}
          <div className="space-y-3 h-60 overflow-y-auto">
            {goals.map((goal) => (
              <div
                key={goal._id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  goal.completed 
                    ? 'bg-savage-neon-green/20 border-savage-neon-green/30' 
                    : 'bg-savage-black/50 border-gray-700 hover:border-savage-neon-blue'
                }`}
              >
                <button
                  onClick={() => toggleGoal(goal._id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    goal.completed
                      ? 'bg-savage-neon-green border-savage-neon-green text-savage-black'
                      : 'border-gray-500 hover:border-savage-neon-green text-transparent'
                  }`}
                >
                  {goal.completed && '✓'}
                </button>
                <span className={`flex-1 text-sm ${
                  goal.completed ? 'text-gray-400 line-through' : 'text-white'
                }`}>
                  {goal.text}
                </span>
                <button
                  onClick={() => deleteGoal(goal._id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {goals.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No goals yet. Add your first goal above!
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Streak & Motivation with Timer */}
        <div className="bg-savage-steel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-savage-neon-orange">Streak & Motivation</h3>
            <Flame className="w-5 h-5 text-savage-neon-orange" />
          </div>

          {/* Current Streak */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-savage-neon-orange mb-2">
              {streak.currentStreak}
            </div>
            <div className="text-gray-400 text-sm">
              Days in a row! {streak.currentStreak > 0 ? '🔥' : '💪'}
            </div>
            <div className="text-xs text-savage-neon-green mt-1">
              Next milestone: {nextMilestone} days
            </div>
          </div>

          {/* Check-in Timer */}
          <div key={timerKey} className="bg-savage-black/50 p-4 rounded-lg border border-savage-neon-blue/30 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-savage-neon-blue" />
              <h4 className="text-savage-neon-blue text-sm font-medium">Next Check-in</h4>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold mb-1 ${
                canCheckIn ? 'text-savage-neon-green' : 'text-savage-neon-orange'
              }`}>
                {timeUntilNextCheckIn}
              </div>
              <div className="text-xs text-gray-400">
                {canCheckIn ? 'Ready to check in!' : `Available at: ${nextCheckInTime}`}
              </div>
            </div>
          </div>

          {/* Check-in Button */}
          <button
            onClick={checkIn}
            disabled={!canCheckIn}
            className={`w-full font-bold py-3 rounded-lg mb-4 flex items-center justify-center gap-2 ${
              canCheckIn 
                ? 'bg-savage-neon-orange text-savage-black hover:bg-orange-400' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>✅</span>
            {canCheckIn ? 'Check In Today' : 'Already Checked In'}
          </button>

          {/* Motivation Quote */}
          <div className="bg-savage-black/50 p-4 rounded-lg border border-savage-neon-blue/30">
            <div className="text-savage-neon-blue text-sm font-medium mb-1">💪 Today's Motivation</div>
            <div className="text-gray-300 text-sm">
              "The only bad workout is the one that didn't happen. Keep the streak alive!"
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-savage-steel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            {activities.length > 0 && (
              <button
                onClick={clearActivities}
                className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
          <div className="space-y-3 h-35 overflow-y-auto">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity._id} className="flex items-center gap-3 p-3 bg-savage-black/50 rounded-lg hover:bg-savage-black/70">
                  <div className={`p-2 rounded-lg ${getActivityBg(activity.type)}`}>
                    <IconComponent className={`w-4 h-4 ${getActivityColor(activity.type)}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    {activity.details && (
                      <p className="text-gray-400 text-xs">{activity.details}</p>
                    )}
                    <p className="text-gray-500 text-xs">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              );
            })}
            {activities.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No recent activity. Start working out to see your progress!
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-savage-steel p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 h-auto">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`${action.color} text-savage-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 min-h-0`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;