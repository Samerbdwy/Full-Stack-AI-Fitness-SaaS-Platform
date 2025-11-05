import express from 'express';
import { Purchase } from '../models/Purchase';
import { User } from '../models/User';

const router = express.Router();

// Clerk webhook for payment success
router.post('/clerk-payment-success', async (req, res) => {
  try {
    const { data } = req.body;
    
    // Verify this is a valid Clerk webhook (in production)
    console.log('🔄 Processing Clerk payment webhook:', data);

    // Extract payment information
    const { customer_id, payment_intent_id, amount, metadata } = data;
    
    // Find the purchase by session ID or customer ID
    const purchase = await Purchase.findOne({
      $or: [
        { clerkSessionId: payment_intent_id },
        { clerkUserId: customer_id },
        { orderId: metadata?.order_id }
      ]
    });

    if (!purchase) {
      console.error('❌ Purchase not found for webhook');
      return res.status(404).json({ error: 'Purchase not found' });
    }

    // Update purchase status
    purchase.status = 'completed';
    purchase.clerkPaymentId = payment_intent_id;
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
      console.log('✅ User subscription updated:', user.email);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;