import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/generate', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    console.log('🤖 Starting recovery plan generation...');
    
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set in environment variables');
      return res.status(500).json({ 
        success: false,
        error: 'AI service temporarily unavailable',
        details: 'Recovery plan generation is currently disabled. Please try again later.'
      });
    }

    const { workoutType, intensity, soreness } = req.body;

    console.log('📝 Recovery request data:', { workoutType, intensity, soreness });

    if (!workoutType || !intensity || !soreness) {
      return res.status(400).json({ 
        success: false,
        error: 'Workout type, intensity, and soreness are required' 
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Create a detailed, personalized recovery plan for someone who just completed a workout with these specifications:
      
      WORKOUT DETAILS:
      - Workout Type: ${workoutType}
      - Intensity Level: ${intensity}
      - Current Soreness: ${soreness}
      
      Please provide a comprehensive recovery plan that includes:
      
      1. IMMEDIATE RECOVERY (0-2 hours post-workout):
         - Specific hydration recommendations (amount, type of fluids)
         - Post-workout nutrition (specific foods, timing, portions)
         - Immediate stretching or mobility exercises
      
      2. SHORT-TERM RECOVERY (2-24 hours):
         - Active recovery activities
         - Sleep optimization tips
         - Nutrition timing and meal suggestions
         - Supplement recommendations if applicable
      
      3. LONG-TERM RECOVERY (24-72 hours):
         - When to train the same muscle group again
         - Progressive recovery activities
         - Signs to watch for (overtraining, injury)
      
      4. SPECIFIC RECOMMENDATIONS:
         - Foam rolling techniques
         - Stretching routines
         - Recovery modalities (ice, heat, compression)
         - Lifestyle factors (stress management, sleep quality)
      
      IMPORTANT FORMATTING:
      - Use clear section headers but NO markdown (no #, **, *)
      - Use bullet points with • symbols for lists
      - Be specific and actionable
      - Include timing recommendations
      - Keep it practical and evidence-based
      - Make it easy to read with proper line breaks
      
      Make the response personalized to the workout type, intensity, and soreness level provided.
      Keep the response under 1500 words.
    `;

    console.log('🤖 Generating recovery plan with Gemini...');

    try {
      // Call Gemini API with timeout
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const recoveryPlan = response.text();

      if (!recoveryPlan) {
        console.error('❌ Gemini returned empty response');
        return res.status(500).json({ 
          success: false,
          error: 'Failed to generate recovery plan - empty response from AI'
        });
      }

      console.log('✅ Recovery plan generated successfully');
      
      // Log activity
      const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
      if (user) {
        await Activity.create({
          userId: user._id,
          clerkUserId: req.user!.clerkUserId,
          type: 'recovery',
          action: 'Generated AI recovery plan',
          details: `Workout: ${workoutType}, Intensity: ${intensity}, Soreness: ${soreness}`
        });
        console.log('✅ Recovery activity saved to dashboard');
      }

      res.json({
        success: true,
        recoveryPlan: recoveryPlan.trim(),
        timestamp: new Date().toISOString()
      });

    } catch (geminiError: any) {
      console.error('❌ Gemini API error:', geminiError);
      
      // Provide fallback recovery advice
      const fallbackAdvice = generateFallbackRecoveryPlan(workoutType, intensity, soreness);
      
      res.json({
        success: true,
        recoveryPlan: fallbackAdvice,
        timestamp: new Date().toISOString(),
        note: 'Using fallback recovery plan due to AI service issue'
      });
    }

  } catch (error: any) {
    console.error('❌ Recovery generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate recovery plan',
      details: error.message 
    });
  }
});

// Fallback recovery plan generator
function generateFallbackRecoveryPlan(workoutType: string, intensity: string, soreness: string): string {
  const plans: { [key: string]: string } = {
    'push_light_mild': `RECOVERY PLAN: Post-Light Push Workout (Mild Soreness)

IMMEDIATE RECOVERY (0-2 hours):
• Hydrate with 500ml water + electrolytes
• Consume 20g protein + 40g carbs within 30 minutes
• Light chest and shoulder stretches

SHORT-TERM RECOVERY (2-24 hours):
• Light walking or cycling
• 7-9 hours quality sleep
• Balanced meals with lean protein

LONG-TERM RECOVERY (24-72 hours):
• Train same muscles in 48 hours
• Monitor soreness levels
• Continue light mobility work`,

    'push_medium_moderate': `RECOVERY PLAN: Post-Medium Push Workout (Moderate Soreness)

IMMEDIATE RECOVERY (0-2 hours):
• Hydrate with 750ml water + electrolytes
• Consume 30g protein + 60g carbs within 30 minutes
• Foam roll chest and shoulders

SHORT-TERM RECOVERY (2-24 hours):
• Active recovery: light swimming or yoga
• Focus on sleep quality
• Anti-inflammatory foods

LONG-TERM RECOVERY (24-72 hours):
• Train same muscles in 48-72 hours
• Use compression if needed
• Listen to body signals`,

    'pull_light_mild': `RECOVERY PLAN: Post-Light Pull Workout (Mild Soreness)

IMMEDIATE RECOVERY (0-2 hours):
• Hydrate with 500ml water
• 20g protein + complex carbs
• Back and bicep stretches

SHORT-TERM RECOVERY (2-24 hours):
• Light rowing machine
• Proper sleep positioning
• Hydration focus

Ready for next pull session in 48 hours.`,

    'pull_medium_moderate': `RECOVERY PLAN: Post-Medium Pull Workout (Moderate Soreness)

IMMEDIATE RECOVERY (0-2 hours):
• Hydrate with 750ml electrolyte drink
• 30g protein + 50g carbs
• Foam roll upper back

SHORT-TERM RECOVERY (2-24 hours):
• Light mobility work
• Sleep 8+ hours
• Balanced nutrition

Wait 48-72 hours before next pull session.`,

    'legs_light_mild': `RECOVERY PLAN: Post-Light Legs Workout (Mild Soreness)

IMMEDIATE RECOVERY (0-2 hours):
• Hydrate well
• Protein + carbs meal
• Leg stretches

SHORT-TERM RECOVERY (2-24 hours):
• Light walking
• Elevate legs if needed
• Proper nutrition

Ready for legs in 48 hours.`,

    'legs_medium_moderate': `RECOVERY PLAN: Post-Medium Legs Workout (Moderate Soreness)

IMMEDIATE RECOVERY (0-2 hours):
• Hydrate with electrolytes
• 30g protein + 70g carbs
• Foam roll legs

SHORT-TERM RECOVERY (2-24 hours):
• Light cycling
• Compression garments
• Quality sleep

Wait 72 hours before next legs session.`
  };

  const key = `${workoutType}_${intensity}_${soreness}`;
  return plans[key] || `BASIC RECOVERY PLAN

Workout: ${workoutType}
Intensity: ${intensity}
Soreness: ${soreness}

GENERAL RECOVERY ADVICE:
• Hydrate well throughout the day
• Consume protein-rich meals
• Get 7-9 hours of sleep
• Light active recovery activities
• Listen to your body's signals
• Consider foam rolling and stretching

Wait 48-72 hours before training the same muscle group intensely again.`;
}

export default router;