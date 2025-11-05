// Fixed: src/routes/workouts.ts
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Don't initialize here - wait until the route handler
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    // Check if API key is configured FIRST
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set in environment variables');
      return res.status(500).json({ 
        error: 'AI service temporarily unavailable',
        details: 'Workout generation is currently disabled. Please try again later.'
      });
    }

    // Initialize Gemini inside the route handler after checking env var
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const { goal, equipment, duration, fitnessLevel } = req.body;

    if (!goal || !equipment || !duration) {
      return res.status(400).json({ error: 'Goal, equipment, and duration are required' });
    }

    const prompt = `
      Create a detailed workout plan with the following specifications:
      - Fitness Goal: ${goal}
      - Available Equipment: ${equipment}
      - Workout Duration: ${duration}
      - Fitness Level: ${fitnessLevel || 'intermediate'}
      
      IMPORTANT FORMATTING RULES:
      - Use clear line breaks between sections
      - Use bullet points (*) for lists
      - Use numbered lists for steps
      - DO NOT use tables or pipe symbols (|)
      - Keep proper spacing between lines
      
      Please provide a structured workout plan with:
      1. Warm-up exercises (5-10 minutes)
      2. Main workout with specific exercises, sets, reps, and rest periods
      3. Cool-down stretches
      4. Total estimated time
      
      Format the response with proper line breaks and spacing for easy reading.
      Use this format for exercises: "Exercise Name: 3 sets of 8-12 reps, 60 seconds rest"
    `;

    console.log('🤖 Generating workout with Gemini...');

    // Call Gemini API with latest SDK
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const workoutPlan = response.text();

    if (!workoutPlan) {
      return res.status(500).json({ error: 'Failed to generate workout plan' });
    }

    // Clean up the response
    const cleanWorkoutPlan = workoutPlan
      .replace(/\|/g, '')
      .replace(/-{3,}/g, '')
      .replace(/\*\*/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    console.log('✅ Workout generated successfully');
    
    // Log activity
    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (user) {
      await Activity.create({
        userId: user._id,
        clerkUserId: req.user!.clerkUserId,
        type: 'workout',
        action: 'Generated AI workout',
        details: `Goal: ${goal}, Equipment: ${equipment}`
      });
    }

    res.json({
      success: true,
      workout: cleanWorkoutPlan,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Workout generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate workout',
      details: error.message 
    });
  }
});

export default router;