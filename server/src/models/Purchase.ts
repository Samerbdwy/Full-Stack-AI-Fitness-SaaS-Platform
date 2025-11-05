import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchase extends Document {
  // User Information
  userId: mongoose.Types.ObjectId;
  clerkUserId: string;
  userEmail: string;
  userName?: string;
  
  // Purchase Details
  plan: 'pro_plan' | 'premium_plan';
  planName: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  
  // Payment Status
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  
  // Clerk Payment Information
  clerkPaymentId?: string;
  clerkSessionId?: string;
  orderId: string;
  
  // Subscription Management
  subscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>({
  // User Information
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  clerkUserId: { 
    type: String, 
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String
  },
  
  // Purchase Details - ✅ UPDATED ENUM
  plan: {
    type: String,
    enum: ['pro_plan', 'premium_plan'], // ✅ Changed from ['pro', 'premium']
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { 
    type: String, 
    default: 'clerk' 
  },
  
  // Clerk Payment Information
  clerkPaymentId: { 
    type: String,
    index: true
  },
  clerkSessionId: {
    type: String,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Subscription Management
  subscriptionId: {
    type: String
  },
  currentPeriodStart: {
    type: Date
  },
  currentPeriodEnd: {
    type: Date
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for faster queries
purchaseSchema.index({ clerkUserId: 1, createdAt: -1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ userEmail: 1 });
purchaseSchema.index({ plan: 1, status: 1 });
purchaseSchema.index({ 'metadata.sessionId': 1 });

// Virtual for formatted amount
purchaseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Method to check if purchase is active
purchaseSchema.methods.isActive = function(): boolean {
  return this.status === 'completed' && 
         (!this.currentPeriodEnd || this.currentPeriodEnd > new Date());
};

// Static method to find active subscriptions by user
purchaseSchema.statics.findActiveByUser = function(clerkUserId: string) {
  return this.find({
    clerkUserId,
    status: 'completed',
    $or: [
      { currentPeriodEnd: { $exists: false } },
      { currentPeriodEnd: { $gt: new Date() } }
    ]
  });
};

// Pre-save middleware to generate order ID if not provided
purchaseSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

export const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema);