import mongoose, { Document, Schema } from 'mongoose';

export interface IStreak extends Document {
  userId: mongoose.Types.ObjectId;
  clerkUserId: string;
  currentStreak: number;
  lastCheckIn: Date;
  totalCheckIns: number;
  weeklyCheckIns: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const streakSchema = new Schema<IStreak>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  clerkUserId: { 
    type: String, 
    required: true 
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  lastCheckIn: {
    type: Date,
    default: Date.now
  },
  totalCheckIns: {
    type: Number,
    default: 0
  },
  weeklyCheckIns: {
    monday: { type: Boolean, default: false },
    tuesday: { type: Boolean, default: false },
    wednesday: { type: Boolean, default: false },
    thursday: { type: Boolean, default: false },
    friday: { type: Boolean, default: false },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

export const Streak = mongoose.model<IStreak>('Streak', streakSchema);