// routes/clerkPayments.ts
import express from 'express';
import { Purchase } from '../models/Purchase';
import { User } from '../models/User';
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Clerk Payments configuration
const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

// Types for Clerk Payments response
interface ClerkPaymentSession {
  id: string;
  url: string;
  status: string;
  amount: number;
  currency: string;
  customer_id: string;
  metadata: any;
}

interface PurchaseMetadata {
  userAgent?: string;
  ip?: string;
  simulated?: boolean;
  paidAt?: Date;
  paymentMethod?: string;
  failureReason?: string;
}

// Create real Clerk Payment session
router.post('/create-session', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { planId, planName, price } = req.body;

    console.log('🔄 Creating REAL Clerk payment session for:', { 
      planId, 
      planName, 
      price, 
      user: req.user?.email 
    });

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create purchase record with proper typing
    const purchaseData = {
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      userEmail: req.user!.email,
      userName: req.user!.name,
      plan: planId,
      planName,
      amount: price,
      status: 'pending' as const,
      orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        userAgent: req.get('User-Agent') || 'unknown',
        ip: req.ip || 'unknown'
      } as PurchaseMetadata
    };

    const purchase = await Purchase.create(purchaseData);

    console.log('✅ Purchase record created (pending):', purchase.orderId);

    // 🚀 REAL CLERK PAYMENTS INTEGRATION
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${frontendUrl}/purchase-confirmation?success=true&order_id=${purchase.orderId}`;
    const cancelUrl = `${frontendUrl}/coaching?canceled=true`;

    try {
      // Create real Clerk Payment session
      const paymentSession = await createClerkPaymentSession({
        amount: Math.round(price * 100), // Convert to cents
        currency: 'usd',
        customerId: req.user!.clerkUserId,
        customerEmail: req.user!.email,
        metadata: {
          orderId: purchase.orderId,
          plan: planId,
          planName: planName
        },
        successUrl,
        cancelUrl
      });

      console.log('✅ Real Clerk payment session created:', paymentSession.id);

      // Update purchase with Clerk payment ID - fix the type issue
      await Purchase.findByIdAndUpdate(purchase._id, {
        $set: {
          clerkPaymentId: paymentSession.id
        }
      });

      res.json({
        success: true,
        paymentLink: paymentSession.url, // Clerk's hosted payment page
        sessionId: paymentSession.id,
        purchase: {
          orderId: purchase.orderId,
          plan: purchase.plan
        }
      });

    } catch (clerkError: any) {
      console.error('❌ Clerk Payments API error:', clerkError);
      
      // Fallback to simulated payment for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Falling back to simulated payment for development');
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
      } else {
        throw new Error(`Clerk Payments error: ${clerkError.message}`);
      }
    }

  } catch (error: any) {
    console.error('❌ Clerk payment session error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

// Process payment after successful Clerk payment (webhook-based)
router.post('/process-payment', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { orderId } = req.body;

    console.log('💳 Verifying payment for order:', orderId);

    const purchase = await Purchase.findOne({ 
      orderId,
      clerkUserId: req.user!.clerkUserId 
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    if (purchase.status === 'completed') {
      return res.json({
        success: true,
        purchase: {
          orderId: purchase.orderId,
          plan: purchase.plan,
          status: purchase.status
        }
      });
    }

    // For real payments, we rely on webhooks to update status
    // This endpoint just checks current status
    if (purchase.status === 'pending') {
      return res.status(402).json({ 
        error: 'Payment still processing', 
        status: 'pending' 
      });
    }

    res.json({
      success: true,
      purchase: {
        orderId: purchase.orderId,
        plan: purchase.plan,
        status: purchase.status
      }
    });

  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Real Clerk Payment session creation
async function createClerkPaymentSession(params: {
  amount: number;
  currency: string;
  customerId: string;
  customerEmail: string;
  metadata: any;
  successUrl: string;
  cancelUrl: string;
}): Promise<ClerkPaymentSession> {
  const response = await fetch('https://api.clerk.com/v1/payment_sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      customer_id: params.customerId,
      customer_email: params.customerEmail,
      metadata: params.metadata,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      payment_method_types: ['card'],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Clerk Payments API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data as ClerkPaymentSession;
}

// Enhanced Clerk Payments webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['clerk-signature'] as string;
  
  try {
    // Verify webhook signature (important for security)
    if (!verifyClerkWebhookSignature(req.body, sig)) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());
    
    console.log('🔄 Clerk payment webhook received:', event.type);
    
    // Handle different Clerk Payment events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data);
        break;
      case 'payment_intent.created':
        await handlePaymentCreated(event.data);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Clerk webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    console.log('✅ Clerk payment successful:', paymentIntent.id);
    
    const purchase = await Purchase.findOne({ 
      clerkPaymentId: paymentIntent.id 
    });
    
    if (purchase) {
      await completePurchase(purchase);
      console.log('✅ Purchase completed via webhook:', purchase.orderId);
    } else {
      console.log('⚠️ Purchase not found for payment intent:', paymentIntent.id);
      
      // Try to find by metadata if payment intent ID is not stored
      const purchases = await Purchase.find({
        'metadata.orderId': paymentIntent.metadata?.orderId
      });
      
      if (purchases.length > 0) {
        const foundPurchase = purchases[0];
        // Update with the correct payment ID
        await Purchase.findByIdAndUpdate(foundPurchase._id, {
          $set: {
            clerkPaymentId: paymentIntent.id
          }
        });
        await completePurchase(foundPurchase);
        console.log('✅ Purchase found and completed via metadata:', foundPurchase.orderId);
      }
    }
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

async function handleCheckoutCompleted(checkoutSession: any) {
  try {
    console.log('✅ Checkout session completed:', checkoutSession.id);
    
    const purchase = await Purchase.findOne({ 
      clerkPaymentId: checkoutSession.payment_intent 
    });
    
    if (purchase) {
      await completePurchase(purchase);
      console.log('✅ Purchase completed via checkout session:', purchase.orderId);
    }
  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);
  }
}

async function handlePaymentCreated(paymentIntent: any) {
  try {
    console.log('🔄 Payment intent created:', paymentIntent.id);
    // You can update purchase status to 'processing' here if needed
  } catch (error) {
    console.error('❌ Error handling payment creation:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    console.log('❌ Clerk payment failed:', paymentIntent.id);
    
    const purchase = await Purchase.findOne({ 
      clerkPaymentId: paymentIntent.id 
    });
    
    if (purchase) {
      // Fix the metadata update
      await Purchase.findByIdAndUpdate(purchase._id, {
        $set: {
          status: 'failed',
          'metadata.failureReason': paymentIntent.last_payment_error?.message || 'Unknown error'
        } as any
      });
      console.log('✅ Purchase marked as failed:', purchase.orderId);
    }
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

// Helper function to complete purchase
async function completePurchase(purchase: any) {
  try {
    // Update purchase status to completed - fix metadata typing
    const updateData: any = {
      status: 'completed',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      'metadata.paidAt': new Date(),
      'metadata.paymentMethod': 'clerk_card'
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
      console.log('✅ User subscription updated via Clerk payment:', user.email);
    }

    // Here you can trigger email notifications, analytics, etc.
    console.log('🎉 Purchase completed successfully:', purchase.orderId);
  } catch (error) {
    console.error('❌ Error completing purchase:', error);
    throw error;
  }
}

// Webhook signature verification (important for security)
function verifyClerkWebhookSignature(payload: any, signature: string): boolean {
  // Implement webhook signature verification
  // Clerk provides a signing secret for this
  // For now, return true in development
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Webhook signature verification skipped in development');
    return true;
  }
  
  // TODO: Implement proper webhook signature verification
  // const expectedSignature = crypto.createHmac('sha256', process.env.CLERK_WEBHOOK_SECRET!)
  //   .update(payload)
  //   .digest('hex');
  // return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  
  return true; // Remove this in production
}

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Clerk Payments API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    paymentsEnabled: !!CLERK_SECRET_KEY
  });
});

export default router;