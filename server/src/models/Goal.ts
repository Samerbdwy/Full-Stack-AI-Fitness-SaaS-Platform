import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  clerkUserId: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  clerkUserId: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);