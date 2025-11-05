import express from 'express';
import { User } from '../models/User';
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Use individual middleware functions
router.get('/profile', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      id: user._id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      age: user.age,
      weight: user.weight,
      height: user.height,
      fitnessLevel: user.fitnessLevel,
      goals: user.goals,
      subscription: user.subscription,
      subscriptionExpiresAt: user.subscriptionExpiresAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { age, weight, height, fitnessLevel, goals } = req.body;
    
    const user = await User.findOneAndUpdate(
      { clerkUserId: req.user!.clerkUserId },
      { age, weight, height, fitnessLevel, goals },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        age: user.age,
        weight: user.weight,
        height: user.height,
        fitnessLevel: user.fitnessLevel,
        goals: user.goals,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;