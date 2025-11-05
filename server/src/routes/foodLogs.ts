// FIXED: src/routes/foodLogs.ts
import express from 'express';
import { FoodLog } from '../models/FoodLog';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { requireAuth, attachUser, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all food logs for user
router.get('/', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const foodLogs = await FoodLog.find({ 
      clerkUserId: req.user!.clerkUserId 
    }).sort({ date: -1 });

    res.json({
      success: true,
      foodLogs
    });
  } catch (error: any) {
    console.error('❌ Get food logs error:', error);
    res.status(500).json({ 
      error: 'Failed to get food logs',
      details: error.message 
    });
  }
});

// Get food log by date - FIXED: Better date handling
router.get('/:date', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const inputDate = new Date(req.params.date);
    
    // Create date range for the entire day
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('🔍 Looking for food log:', {
      clerkUserId: req.user!.clerkUserId,
      date: req.params.date,
      startOfDay,
      endOfDay
    });

    const foodLog = await FoodLog.findOne({
      clerkUserId: req.user!.clerkUserId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!foodLog) {
      console.log('📭 No food log found for date:', req.params.date);
      return res.status(404).json({ 
        success: false,
        error: 'No food log found for this date' 
      });
    }

    console.log('✅ Food log found:', foodLog._id);
    res.json({
      success: true,
      foodLog
    });
  } catch (error: any) {
    console.error('❌ Get food log error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get food log',
      details: error.message 
    });
  }
});

// Create or update food log - FIXED: Better error handling and validation
router.post('/', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const { date, meals } = req.body;

    console.log('💾 Saving food log request:', { date, mealsCount: meals?.length });

    if (!date || !meals || !Array.isArray(meals)) {
      return res.status(400).json({ 
        success: false,
        error: 'Date and meals array are required' 
      });
    }

    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Validate meals - FIXED: Better validation
    for (const meal of meals) {
      if (!meal.name || meal.name.trim() === '') {
        return res.status(400).json({ 
          success: false,
          error: 'Each meal must have a name' 
        });
      }
      
      if (meal.calories === undefined || meal.protein === undefined || 
          meal.carbs === undefined || meal.fat === undefined) {
        return res.status(400).json({ 
          success: false,
          error: 'Each meal must have calories, protein, carbs, and fat values' 
        });
      }

      // Convert to numbers and validate
      const calories = Number(meal.calories) || 0;
      const protein = Number(meal.protein) || 0;
      const carbs = Number(meal.carbs) || 0;
      const fat = Number(meal.fat) || 0;

      if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Nutrition values cannot be negative' 
        });
      }
    }

    const logDate = new Date(date);
    
    // Create date range for upsert
    const startOfDay = new Date(logDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(logDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('📝 Upserting food log for date range:', { startOfDay, endOfDay });

    // FIXED: Better upsert with proper date handling
    const foodLog = await FoodLog.findOneAndUpdate(
      {
        clerkUserId: req.user!.clerkUserId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      },
      {
        userId: user._id,
        clerkUserId: req.user!.clerkUserId,
        date: logDate, // Use the exact date from request
        meals: meals.map(meal => ({
          name: meal.name.trim(),
          calories: Number(meal.calories) || 0,
          protein: Number(meal.protein) || 0,
          carbs: Number(meal.carbs) || 0,
          fat: Number(meal.fat) || 0
        }))
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('✅ Food log saved successfully:', foodLog._id);

    // Log activity
    await Activity.create({
      userId: user._id,
      clerkUserId: req.user!.clerkUserId,
      type: 'nutrition',
      action: 'Logged daily food intake',
      details: `Logged ${meals.length} meals, ${foodLog.totalCalories} total calories`
    });

    console.log('✅ Food log saved for:', req.user!.email);

    res.json({
      success: true,
      foodLog
    });

  } catch (error: any) {
    console.error('❌ Save food log error:', error);
    
    // FIXED: More specific error messages
    let errorMessage = 'Failed to save food log';
    if (error.name === 'ValidationError') {
      errorMessage = 'Data validation failed: ' + Object.values(error.errors).map((e: any) => e.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = 'Food log for this date already exists';
    }

    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: error.message 
    });
  }
});

// Delete food log - FIXED: Better date handling
router.delete('/:date', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    const inputDate = new Date(req.params.date);
    
    // Create date range
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    const foodLog = await FoodLog.findOneAndDelete({
      clerkUserId: req.user!.clerkUserId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!foodLog) {
      return res.status(404).json({ 
        success: false,
        error: 'No food log found for this date' 
      });
    }

    // Log activity
    const user = await User.findOne({ clerkUserId: req.user!.clerkUserId });
    if (user) {
      await Activity.create({
        userId: user._id,
        clerkUserId: req.user!.clerkUserId,
        type: 'nutrition',
        action: 'Deleted food log',
        details: `Deleted food log for ${req.params.date}`
      });
    }

    console.log('✅ Food log deleted for:', req.user!.email);

    res.json({
      success: true,
      message: 'Food log deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Delete food log error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete food log',
      details: error.message 
    });
  }
});

export default router;