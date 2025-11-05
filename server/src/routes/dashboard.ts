import express from 'express';
import { Goal } from '../models/Goal';
import { Streak } from '../models/Streak';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get dashboard data
router.get('/', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    console.log('📊 Dashboard request for:', req.user!.email);
    
    const [goals, streak, activities] = await Promise.all([
      Goal.find({ clerkUserId: req.user!.clerkUserId }).sort({ createdAt: -1 }),
      Streak.findOne({ clerkUserId: req.user!.clerkUserId }),
      Activity.find({ clerkUserId: req.user!.clerkUserId })
        .sort({ timestamp: -1 })
        .limit(10)
    ]);

    console.log('✅ Dashboard data loaded:', {
      goals: goals.length,
      streak: streak?.currentStreak || 0,
      activities: activities.length
    });

    // 🔥 FIXED: Default streak with NO streak (never checked in)
    const defaultStreak = {
      currentStreak: 0,
      lastCheckIn: null, // 🚀 Use null to indicate never checked in
      totalCheckIns: 0,
      weeklyCheckIns: {
        monday: false, tuesday: false, wednesday: false,
        thursday: false, friday: false, saturday: false, sunday: false
      }
    };

    res.json({
      goals: goals || [],
      streak: streak || defaultStreak,
      activities: activities || []
    });
  } catch (error: any) {
    console.error('❌ Dashboard error:', error.message);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Add goal
router.post('/goals', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Goal text is required' });
    }

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const goal = await Goal.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      text: text.trim()
    });

    // Log activity
    await Activity.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      type: 'goal',
      action: 'Added new goal',
      details: text.trim()
    });

    console.log('✅ Goal created for:', req.user!.email);
    res.json(goal);
  } catch (error: any) {
    console.error('❌ Add goal error:', error.message);
    res.status(500).json({ error: 'Failed to add goal' });
  }
});

// Toggle goal completion
router.patch('/goals/:id/toggle', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      clerkUserId: req.user!.clerkUserId
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.completed = !goal.completed;
    await goal.save();

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    await Activity.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      type: 'goal',
      action: goal.completed ? 'Completed goal' : 'Reopened goal',
      details: goal.text
    });

    console.log(`✅ Goal toggled for ${req.user!.email}: ${goal.completed ? 'completed' : 'reopened'}`);
    res.json(goal);
  } catch (error: any) {
    console.error('❌ Toggle goal error:', error.message);
    res.status(500).json({ error: 'Failed to toggle goal' });
  }
});

// Delete goal
router.delete('/goals/:id', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.user!.clerkUserId
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    await Activity.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      type: 'goal',
      action: 'Deleted goal',
      details: goal.text
    });

    console.log('✅ Goal deleted for:', req.user!.email);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error: any) {
    console.error('❌ Delete goal error:', error.message);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Check in for streak - FIXED VERSION
router.post('/streak/checkin', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    let streak = await Streak.findOne({ clerkUserId: req.user!.clerkUserId });
    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();

    if (!streak) {
      // 🔥 FIXED: For FIRST TIME users, create streak with TODAY's date
      streak = await Streak.create({
        userId: user._id,
        clerkUserId: req.user!.clerkUserId,
        currentStreak: 1, // First check-in = 1 day streak
        lastCheckIn: today, // 🚀 Use TODAY for first check-in
        totalCheckIns: 1,
        weeklyCheckIns: {
          monday: false, tuesday: false, wednesday: false,
          thursday: false, friday: false, saturday: false, sunday: false
        }
      });
      
      console.log(`✅ FIRST check-in for ${req.user!.email}: Started 1-day streak!`);
    } else {
      const lastCheckIn = new Date(streak.lastCheckIn);
      
      // Check if already checked in today
      if (lastCheckIn.toDateString() === today.toDateString()) {
        return res.status(400).json({ error: 'Already checked in today' });
      }

      // Check if consecutive day
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastCheckIn.toDateString() === yesterday.toDateString()) {
        streak.currentStreak += 1;
        console.log(`🔥 Streak increased to ${streak.currentStreak} days`);
      } else {
        streak.currentStreak = 1;
        console.log(`🔄 Streak reset to 1 day (gap detected)`);
      }

      streak.lastCheckIn = today;
      streak.totalCheckIns += 1;

      // Update weekly check-ins
      const dayOfWeek = today.getDay();
      const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayKey = weekDays[dayOfWeek] as keyof typeof streak.weeklyCheckIns;
      streak.weeklyCheckIns[todayKey] = true;

      await streak.save();
    }

    // Log activity
    await Activity.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      type: 'streak',
      action: 'Daily check-in',
      details: `Streak: ${streak.currentStreak} days`
    });

    console.log(`✅ Check-in for ${req.user!.email}: ${streak.currentStreak} day streak`);
    res.json(streak);
  } catch (error: any) {
    console.error('❌ Check-in error:', error.message);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// 🚀 ADDED: Create activity endpoint (for nutrition, workouts, etc.)
router.post('/activities', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { type, action, details } = req.body;

    console.log('📝 Creating activity:', { type, action, details });

    // Validate required fields
    if (!type || !action) {
      return res.status(400).json({ 
        error: 'Type and action are required for activity' 
      });
    }

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create the activity
    const activity = await Activity.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      type,
      action,
      details: details || '',
      timestamp: new Date()
    });

    console.log('✅ Activity created for:', req.user!.email, '-', action);

    res.json({
      success: true,
      activity: {
        _id: activity._id,
        type: activity.type,
        action: activity.action,
        details: activity.details,
        timestamp: activity.timestamp
      }
    });

  } catch (error: any) {
    console.error('❌ Create activity error:', error.message);
    res.status(500).json({ 
      error: 'Failed to create activity',
      details: error.message 
    });
  }
});

// Clear all activities
router.delete('/activities', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await Activity.deleteMany({ clerkUserId: req.user!.clerkUserId });
    
    console.log(`✅ Activities cleared for ${req.user!.email}: ${result.deletedCount} activities`);
    res.json({ 
      message: 'All activities cleared successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error: any) {
    console.error('❌ Clear activities error:', error.message);
    res.status(500).json({ error: 'Failed to clear activities' });
  }
});

export default router;