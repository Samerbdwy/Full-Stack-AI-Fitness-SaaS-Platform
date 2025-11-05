import express from 'express';
import { Purchase } from '../models/Purchase';
import { User } from '../models/User';
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create payment session
router.post('/create-session', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { planId, planName, price } = req.body;

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create purchase record (pending status)
    const purchase = await Purchase.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      userEmail: req.user!.email,
      userName: req.user!.name,
      plan: planId,
      planName,
      amount: price,
      status: 'pending',
      orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // In a real implementation, you would integrate with Clerk Payments API here
    // For now, we'll simulate creating a payment session
    const sessionData = {
      sessionId: `sess_${Date.now()}`,
      clientSecret: `cs_${Math.random().toString(36).substr(2)}`,
      purchaseId: purchase._id
    };

    res.json({
      success: true,
      session: sessionData,
      purchase: {
        id: purchase._id,
        orderId: purchase.orderId
      }
    });
  } catch (error: any) {
    console.error('Create payment session error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

// Handle payment success webhook
router.post('/webhook/success', async (req: AuthRequest, res) => {
  try {
    const { purchaseId, sessionId, paymentId } = req.body;

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    // Update purchase status
    purchase.status = 'completed';
    purchase.clerkSessionId = sessionId;
    purchase.clerkPaymentId = paymentId;
    purchase.currentPeriodStart = new Date();
    purchase.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await purchase.save();

    // Update user subscription
    const user = await User.findOne({ clerkUserId: purchase.clerkUserId });
    if (user) {
      user.subscription = purchase.plan;
      user.currentPlan = purchase.plan;
      user.subscriptionStatus = 'active';
      user.subscriptionExpiresAt = purchase.currentPeriodEnd;
      await user.save();
    }

    res.json({ success: true, message: 'Payment processed successfully' });
  } catch (error: any) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Get user's purchases
router.get('/purchases', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const purchases = await Purchase.find({ clerkUserId: req.user!.clerkUserId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      purchases
    });
  } catch (error: any) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

export default router;