import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  clerkUserId: string;
  email: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  
  // Updated subscription fields - ✅ UPDATED
  subscription: 'free' | 'pro_plan' | 'premium_plan';
  subscriptionStatus: 'active' | 'canceled' | 'expired' | 'past_due';
  currentPlan: 'free' | 'pro_plan' | 'premium_plan';
  subscriptionExpiresAt?: Date;
  purchases: mongoose.Types.ObjectId[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // 🆕 ADD THESE METHOD DECLARATIONS
  hasActiveSubscription(): boolean;
  getActivePlan(): string;
  hasPaidSubscription(): boolean;
}

const userSchema = new Schema<IUser>({
  clerkUserId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    index: true
    // 🔥 REMOVED: Email validation - we don't need it
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    default: 'FitAI User'
  },
  age: { 
    type: Number,
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age must be reasonable']
  },
  weight: { 
    type: Number,
    min: [20, 'Weight must be at least 20kg'],
    max: [300, 'Weight must be reasonable']
  },
  height: { 
    type: Number,
    min: [100, 'Height must be at least 100cm'],
    max: [250, 'Height must be reasonable']
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  goals: [{
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'endurance', 'strength', 'general-fitness']
  }],
  
  // Updated subscription fields - ✅ UPDATED
  subscription: {
    type: String,
    enum: ['free', 'pro_plan', 'premium_plan'], // ✅ Changed from ['free', 'pro', 'premium']
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'past_due'],
    default: 'active'
  },
  currentPlan: {
    type: String,
    enum: ['free', 'pro_plan', 'premium_plan'], // ✅ Changed from ['free', 'pro', 'premium']
    default: 'free'
  },
  subscriptionExpiresAt: { 
    type: Date
    // 🔥 REMOVED: Subscription validation - we don't need it
  },
  purchases: [{
    type: Schema.Types.ObjectId,
    ref: 'Purchase'
  }]
}, {
  timestamps: true,
  autoIndex: true,
  minimize: false
});

// Indexes
userSchema.index({ clerkUserId: 1, email: 1 }, { unique: true });
userSchema.index({ subscription: 1 });
userSchema.index({ subscriptionStatus: 1 });
userSchema.index({ currentPlan: 1 });
userSchema.index({ subscriptionExpiresAt: 1 }, { 
  sparse: true,
  expireAfterSeconds: 0
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Ensure email is properly formatted
  if (this.isModified('email') && (this.email.includes('unknown') || this.email.includes('undefined'))) {
    const safeClerkId = this.clerkUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
    this.email = `user${safeClerkId}@fitai.com`;
  }
  
  // Set default name if not provided
  if (!this.name || this.name.trim() === '') {
    this.name = `User-${this.clerkUserId.slice(-6)}`;
  }
  
  // Ensure subscription fields are consistent
  if (this.isModified('subscription')) {
    this.currentPlan = this.subscription;
  }
  
  // Set free users to always be active
  if (this.subscription === 'free') {
    this.subscriptionStatus = 'active';
  }
  
  next();
});

// 🆕 ADD THE MISSING METHODS

// Instance method to check subscription status
userSchema.methods.hasActiveSubscription = function(): boolean {
  if (this.subscription === 'free') return true;
  if (!this.subscriptionExpiresAt) return false;
  return this.subscriptionExpiresAt > new Date() && this.subscriptionStatus === 'active';
};

// Instance method to get active plan
userSchema.methods.getActivePlan = function(): string {
  if (!this.hasActiveSubscription()) return 'free';
  return this.currentPlan;
};

// Instance method to check if user has pro or premium
userSchema.methods.hasPaidSubscription = function(): boolean {
  return this.hasActiveSubscription() && this.currentPlan !== 'free';
};

// Static method for safe user creation
userSchema.statics.findOrCreate = async function(clerkUserId: string, userData: Partial<IUser>) {
  try {
    let user = await this.findOne({ clerkUserId });
    
    if (!user) {
      const safeClerkId = clerkUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
      
      if (!userData.email || userData.email.includes('unknown') || userData.email.includes('undefined')) {
        userData.email = `user${safeClerkId}@fitai.com`;
      }
      
      if (!userData.name || userData.name.trim() === '') {
        userData.name = `User-${clerkUserId.slice(-6)}`;
      }
      
      user = await this.create({
        clerkUserId,
        ...userData
      });
    }
    
    return user;
  } catch (error: any) {
    console.error('User findOrCreate error:', error);
    throw error;
  }
};

export const User = mongoose.model<IUser>('User', userSchema);

// Ensure indexes are created
User.createIndexes().catch((error) => {
  console.log('User indexes already exist or error:', error.message);
});