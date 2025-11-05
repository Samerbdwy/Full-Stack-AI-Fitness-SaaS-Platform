// src/models/FoodLog.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IFoodLog extends Document {
  userId: mongoose.Types.ObjectId;
  clerkUserId: string;
  date: Date;
  meals: IMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: Date;
  updatedAt: Date;
}

const mealSchema = new Schema<IMeal>({
  name: { type: String, required: true },
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbs: { type: Number, required: true, min: 0 },
  fat: { type: Number, required: true, min: 0 }
});

const foodLogSchema = new Schema<IFoodLog>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  clerkUserId: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    index: true
  },
  meals: [mealSchema],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Compound index for user and date
foodLogSchema.index({ clerkUserId: 1, date: 1 }, { unique: true });

// Calculate totals before saving
foodLogSchema.pre('save', function(next) {
  this.totalCalories = this.meals.reduce((sum, meal) => sum + meal.calories, 0);
  this.totalProtein = this.meals.reduce((sum, meal) => sum + meal.protein, 0);
  this.totalCarbs = this.meals.reduce((sum, meal) => sum + meal.carbs, 0);
  this.totalFat = this.meals.reduce((sum, meal) => sum + meal.fat, 0);
  next();
});

export const FoodLog = mongoose.model<IFoodLog>('FoodLog', foodLogSchema);