import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  clerkUserId: string;
  plan: 'silver' | 'pro' | 'premium';
  duration: '1month' | '3months';
  amount: number;
  currency: 'EGP' | 'USD';
  paymentMethod: 'paypal' | 'instapay' | 'bank_transfer';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string; // PayPal/Instapay transaction ID
  startsAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  clerkUserId: { 
    type: String, 
    required: true 
  },
  plan: {
    type: String,
    enum: ['silver', 'pro', 'premium'],
    required: true
  },
  duration: {
    type: String,
    enum: ['1month', '3months'],
    required: true
  },
  amount: { type: Number, required: true },
  currency: {
    type: String,
    enum: ['EGP', 'USD'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'instapay', 'bank_transfer'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: { type: String },
  startsAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);