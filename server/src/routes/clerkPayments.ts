// routes/clerkPayments.ts
import express from 'express';
import mongoose from 'mongoose';
import { Purchase } from '../models/Purchase';
import { User } from '../models/User';
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Clerk Payments configuration
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

// Types for Clerk Billing API
interface ClerkBillingSession {
  id: string;
  url: string;
  status: string;
  object: string;
  client_secret?: string;
}

interface ClerkBillingSessionParams {
  priceId: string;
  customerId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: any;
}

// DEBUG ENDPOINT - Updated for Clerk Billing
router.post('/debug-create-session', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { planId, planName, price } = req.body;
    
    console.log('🔍 DEBUG - Environment check:');
    console.log('CLERK_SECRET_KEY exists:', !!process.env.CLERK_SECRET_KEY);
    console.log('CLERK_PUBLISHABLE_KEY exists:', !!process.env.CLERK_PUBLISHABLE_KEY);
    
    // Test Clerk Billing API directly
    if (process.env.CLERK_SECRET_KEY) {
      try {
        // Get the correct price ID for the plan
        const priceId = getClerkPriceId(planId);
        
        const testResponse = await fetch('https://api.clerk.com/v1/billing/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price_id: priceId,
            customer_id: req.user!.clerkUserId,
            success_url: `${process.env.FRONTEND_URL || 'https://your-frontend-app.vercel.app'}/purchase-confirmation?success=true`,
            cancel_url: `${process.env.FRONTEND_URL || 'https://your-frontend-app.vercel.app'}/coaching?canceled=true`,
            metadata: {
              plan: planId,
              test: true
            }
          }),
        });
        
        console.log('🔍 DEBUG - Clerk Billing API response status:', testResponse.status);
        const responseText = await testResponse.text();
        console.log('🔍 DEBUG - Clerk Billing API response text:', responseText);
        
        res.json({
          clerkSecretKey: !!process.env.CLERK_SECRET_KEY,
          clerkPublishableKey: !!process.env.CLERK_PUBLISHABLE_KEY,
          apiResponseStatus: testResponse.status,
          apiResponse: responseText,
          user: req.user?.email,
          priceIdUsed: priceId
        });
        
      } catch (apiError: any) {
        console.log('🔍 DEBUG - Clerk Billing API error:', apiError);
        const errorMessage = apiError?.message || String(apiError);
        
        res.json({
          clerkSecretKey: !!process.env.CLERK_SECRET_KEY,
          clerkPublishableKey: !!process.env.CLERK_PUBLISHABLE_KEY,
          apiError: errorMessage,
          user: req.user?.email
        });
      }
    } else {
      res.json({
        clerkSecretKey: false,
        clerkPublishableKey: !!process.env.CLERK_PUBLISHABLE_KEY,
        user: req.user?.email,
        error: 'No CLERK_SECRET_KEY found'
      });
    }
    
  } catch (error: any) {
    console.error('🔍 DEBUG - Error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

// Create real Clerk Billing session
router.post('/create-session', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { planId, planName, price } = req.body;

    console.log('🔄 Creating REAL Clerk billing session for:', { 
      planId, 
      planName, 
      price, 
      user: req.user?.email 
    });

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create purchase record
    const purchase = await Purchase.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      userEmail: req.user!.email,
      userName: req.user!.name,
      plan: planId,
      planName,
      amount: price,
      status: 'pending',
      orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        userAgent: req.get('User-Agent') || 'unknown',
        ip: req.ip || 'unknown',
        planId,
        planName
      }
    });

    console.log('✅ Purchase record created (pending):', purchase.orderId);

    // 🚀 REAL CLERK BILLING INTEGRATION
    const frontendUrl = process.env.FRONTEND_URL || 'https://your-frontend-app.vercel.app';
    
    try {
      // Get the Clerk price ID for this plan
      const priceId = getClerkPriceId(planId);

      // Create real Clerk Billing session
      const billingSession = await createClerkBillingSession({
        priceId: priceId,
        customerId: req.user!.clerkUserId,
        metadata: {
          orderId: purchase.orderId,
          plan: planId,
          planName: planName,
          purchaseId: String(purchase._id)
        },
        successUrl: `${frontendUrl}/purchase-confirmation?success=true&order_id=${purchase.orderId}`,
        cancelUrl: `${frontendUrl}/coaching?canceled=true`
      });

      console.log('✅ Real Clerk billing session created:', billingSession.id);

      // Update purchase with Clerk billing session ID
      await Purchase.findByIdAndUpdate(purchase._id, {
        $set: {
          clerkSessionId: billingSession.id
        }
      });

      res.json({
        success: true,
        paymentLink: billingSession.url, // Clerk's hosted billing page
        sessionId: billingSession.id,
        purchase: {
          orderId: purchase.orderId,
          plan: purchase.plan
        }
      });

    } catch (clerkError: any) {
      console.error('❌ Clerk Billing API error:', clerkError);
      
      // Fallback to checkout page
      console.log('🔄 Falling back to checkout page');
      const paymentLink = `${frontendUrl}/checkout?order_id=${purchase.orderId}&plan=${purchase.plan}&price=${purchase.amount}`;
      
      res.json({
        success: true,
        paymentLink,
        simulated: true,
        purchase: {
          orderId: purchase.orderId,
          plan: purchase.plan
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Clerk billing session error:', error);
    res.status(500).json({ error: 'Failed to create billing session' });
  }
});

// Helper function to get Clerk price IDs
function getClerkPriceId(planId: string): string {
  // Your actual Clerk Billing price IDs
  const priceMap: { [key: string]: string } = {
    'pro_plan': 'cplan_34zTRfWqohpHgmPm8MEZAuat7ZF', // Pro Plan
    'premium_plan': 'cplan_34zTXwdFJoi7KHbOpCfjRSZNYjS' // Premium Plan
  };

  const priceId = priceMap[planId];
  if (!priceId) {
    throw new Error(`No price ID configured for plan: ${planId}`);
  }

  console.log(`🔑 Using Clerk price ID: ${priceId} for plan: ${planId}`);
  return priceId;
}

// Real Clerk Billing session creation
async function createClerkBillingSession(params: ClerkBillingSessionParams): Promise<ClerkBillingSession> {
  if (!CLERK_SECRET_KEY) {
    throw new Error('Clerk secret key not configured');
  }

  const response = await fetch('https://api.clerk.com/v1/billing/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_id: params.priceId,
      customer_id: params.customerId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Clerk Billing API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data as ClerkBillingSession;
}

// Process payment (for checkout page fallback)
router.post('/process-payment', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { orderId } = req.body;

    console.log('💳 Processing payment for order:', orderId);

    const purchase = await Purchase.findOne({ 
      orderId,
      clerkUserId: req.user!.clerkUserId 
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    if (purchase.status === 'completed') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process payment
    await processPayment(purchase, user);

    console.log('✅ Payment processed successfully for:', user.email);

    res.json({
      success: true,
      purchase: {
        orderId: purchase.orderId,
        plan: purchase.plan,
        status: purchase.status
      }
    });

  } catch (error: any) {
    console.error('❌ Payment processing error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Enhanced Clerk Payments webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());
    
    console.log('🔄 Clerk billing webhook received:', event.type);
    
    // Handle different Clerk Billing events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Clerk webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful checkout
async function handleCheckoutCompleted(checkoutSession: any) {
  try {
    console.log('✅ Checkout session completed:', checkoutSession.id);
    
    // Find purchase by session ID
    const purchase = await Purchase.findOne({ 
      clerkSessionId: checkoutSession.id 
    });
    
    if (purchase) {
      await completePurchase(purchase);
      console.log('✅ Purchase completed via checkout session:', purchase.orderId);
    } else {
      console.log('⚠️ No purchase found for checkout session:', checkoutSession.id);
    }
  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log('✅ Subscription created:', subscription.id);
    // You can handle subscription-specific logic here
  } catch (error) {
    console.error('❌ Error handling subscription creation:', error);
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    console.log('✅ Invoice payment succeeded:', invoice.id);
    // Handle recurring payments
  } catch (error) {
    console.error('❌ Error handling invoice payment:', error);
  }
}

// FIXED: completePurchase function
async function completePurchase(purchase: any) {
  try {
    // Update purchase status to completed
    const updateData: any = {
      status: 'completed',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      'metadata.paidAt': new Date(),
      'metadata.paymentMethod': 'clerk_billing'
    };

    await Purchase.findByIdAndUpdate(purchase._id, {
      $set: updateData
    });

    // Update user subscription
    const user = await User.findOne({ clerkUserId: purchase.clerkUserId });
    if (user) {
      user.subscription = purchase.plan;
      user.currentPlan = purchase.plan;
      user.subscriptionStatus = 'active';
      user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
      console.log('✅ User subscription updated via Clerk billing:', user.email);
    }

    console.log('🎉 Purchase completed successfully:', purchase.orderId);
  } catch (error) {
    console.error('❌ Error completing purchase:', error);
    throw error;
  }
}

// Payment processing (for checkout page fallback)
async function processPayment(purchase: any, user: any) {
  try {
    // Update purchase status to completed
    await Purchase.findByIdAndUpdate(purchase._id, {
      status: 'completed',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      'metadata.paidAt': new Date(),
      'metadata.simulated': true
    });

    // Update user subscription
    await User.findByIdAndUpdate(user._id, {
      subscription: purchase.plan,
      currentPlan: purchase.plan,
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    console.log('✅ Payment and subscription updated for:', user.email);
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    throw error;
  }
}

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Clerk Billing API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL || 'https://your-frontend-app.vercel.app',
    paymentsEnabled: !!CLERK_SECRET_KEY
  });
});

export default router;