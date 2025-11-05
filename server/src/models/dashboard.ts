import express from 'express';
import { Goal } from '../models/Goal';
import { Streak } from '../models/Streak';
import { Activity } from '../models/Activity';
import { User } from '../models/User'; // ADD THIS IMPORT
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get dashboard data
router.get('/', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [goals, streak, activities] = await Promise.all([
      Goal.find({ clerkUserId: req.user!.clerkUserId }).sort({ createdAt: -1 }),
      Streak.findOne({ clerkUserId: req.user!.clerkUserId }),
      Activity.find({ clerkUserId: req.user!.clerkUserId })
        .sort({ timestamp: -1 })
        .limit(10)
    ]);

    res.json({
      goals: goals || [],
      streak: streak || {
        currentStreak: 0,
        lastCheckIn: new Date(),
        totalCheckIns: 0,
        weeklyCheckIns: {
          monday: false, tuesday: false, wednesday: false,
          thursday: false, friday: false, saturday: false, sunday: false
        }
      },
      activities: activities || []
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Add goal
router.post('/goals', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const goal = await Goal.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      text
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

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

    // Log activity
    await Activity.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      type: 'goal',
      action: 'Deleted goal',
      details: goal.text
    });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});
    

    // Log activity
    await Activity.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      type: 'goal',
      action: 'Added new goal',
      details: text
    });

    res.json(goal);
  } catch (error) {
    console.error('Add goal error:', error);
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

    res.json(goal);
  } catch (error) {
    console.error('Toggle goal error:', error);
    res.status(500).json({ error: 'Failed to toggle goal' });
  }
});

// Check in for streak
router.post('/streak/checkin', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    let streak = await Streak.findOne({ clerkUserId: req.user!.clerkUserId });
    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!streak) {
      streak = await Streak.create({
        userId: user._id,
        clerkUserId: req.user!.clerkUserId,
        currentStreak: 1,
        lastCheckIn: new Date(),
        totalCheckIns: 1
      });
    } else {
      const today = new Date();
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
      } else {
        streak.currentStreak = 1;
      }

      streak.lastCheckIn = today;
      streak.totalCheckIns += 1;

      // Update weekly check-ins
      const dayOfWeek = today.getDay();
      const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      streak.weeklyCheckIns[weekDays[dayOfWeek] as keyof typeof streak.weeklyCheckIns] = true;

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

    res.json(streak);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Add activity
router.post('/activities', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { type, action, details } = req.body;

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const activity = await Activity.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      type,
      action,
      details
    });

    res.json(activity);
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
}


);

export default router;