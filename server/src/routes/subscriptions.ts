import express from 'express';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get available plans
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      {
        name: 'silver',
        title: 'Silver Plan',
        description: 'Great For Professional Users',
        durations: ['1month', '3months'],
        features: [
          'Weekly check-ins and updates',
          'Q&A via WhatsApp',
          'Adjusted Flexible Diet',
          'Diet based on your BMR',
          'Supplements recommendation',
          'Cardio and Abs routine',
          'Gym And Home Workouts'
        ],
        pricing: {
          '1month': { EGP: 2000, USD: 40 },
          '3months': { EGP: 5000, USD: 100 }
        }
      },
      {
        name: 'pro',
        title: 'Pro Plan', 
        description: 'Advanced 1-Month Intensive Coaching',
        durations: ['1month'],
        features: [
          'Everything in Silver PLUS:',
          'Personalized workout plans',
          'Priority support (24h response)',
          'Advanced progress analytics',
          'Custom meal plans with recipes',
          'Video form analysis',
          'Weekly video check-ins'
        ],
        pricing: {
          '1month': { EGP: 3000, USD: 60 }
        }
      },
      {
        name: 'premium',
        title: 'Premium Plan',
        description: 'Elite 3-Month Transformation Program', 
        durations: ['3months'],
        features: [
          'Everything in Pro PLUS:',
          '1-on-1 coaching sessions (4x/month)',
          'Unlimited messaging support',
          'Fully custom program design',
          'Nutritional coaching',
          'Lifestyle & habit coaching',
          'Elite priority support (4h response)',
          'Goal setting & accountability'
        ],
        pricing: {
          '3months': { EGP: 8000, USD: 160 }
        }
      }
    ]
  });
});

// Create subscription - use individual middleware
router.post('/create', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { plan, duration, currency, paymentMethod } = req.body;
    
    // Pricing configuration
    const PRICING = {
      silver: {
        '1month': { EGP: 2000, USD: 40 },
        '3months': { EGP: 5000, USD: 100 }
      },
      pro: {
        '1month': { EGP: 3000, USD: 60 }
      },
      premium: {
        '3months': { EGP: 8000, USD: 160 }
      }
    };

    if (!PRICING[plan as keyof typeof PRICING]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const planPricing = PRICING[plan as keyof typeof PRICING];
    
    if (!planPricing[duration as keyof typeof planPricing]) {
      return res.status(400).json({ error: `Duration ${duration} not available for ${plan} plan` });
    }

    const amount = planPricing[duration as keyof typeof planPricing][currency as 'EGP' | 'USD'];
    
    // Calculate expiration date
    const startsAt = new Date();
    const expiresAt = new Date();
    
    if (duration === '1month') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (duration === '3months') {
      expiresAt.setMonth(expiresAt.getMonth() + 3);
    }

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create subscription record
    const subscription = await Subscription.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      plan,
      duration,
      amount,
      currency,
      paymentMethod,
      paymentStatus: 'pending',
      startsAt,
      expiresAt
    });

    // Update user's subscription level
    await User.findOneAndUpdate(
      { clerkUserId: req.user!.clerkUserId },
      { 
        subscription: plan,
        subscriptionExpiresAt: expiresAt
      }
    );

    res.json({
      message: 'Subscription created. Proceed to payment.',
      subscription: {
        id: subscription._id,
        plan: subscription.plan,
        duration: subscription.duration,
        amount: subscription.amount,
        currency: subscription.currency,
        paymentMethod: subscription.paymentMethod,
        expiresAt: subscription.expiresAt
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get user's current subscription
router.get('/current', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const activeSubscription = await Subscription.findOne({
      userId: user._id,
      paymentStatus: 'completed',
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.json({
      currentPlan: user.subscription,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      activeSubscription: activeSubscription ? {
        plan: activeSubscription.plan,
        duration: activeSubscription.duration,
        expiresAt: activeSubscription.expiresAt,
        paymentStatus: activeSubscription.paymentStatus
      } : null
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

export default router;