import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  clerkUserId: string;
  type: 'goal' | 'workout' | 'nutrition' | 'recovery' | 'streak' | 'achievement';
  action: string;
  details?: string;
  timestamp: Date;
}

const activitySchema = new Schema<IActivity>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  clerkUserId: { 
    type: String, 
    required: true 
  },
  type: {
    type: String,
    enum: ['goal', 'workout', 'nutrition', 'recovery', 'streak', 'achievement'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);