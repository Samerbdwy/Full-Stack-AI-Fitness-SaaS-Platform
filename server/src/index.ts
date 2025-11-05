import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import workoutRoutes from './routes/workouts';
import foodLogRoutes from './routes/foodLogs';
import recoveryRoutes from './routes/recovery';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🚀 VERCEL-OPTIMIZED CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-app.vercel.app', // Replace with your actual frontend URL
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// 🚀 VERCEL-OPTIMIZED MONGODB CONNECTION
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // Serverless-friendly connection settings
     await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Optimized for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false, // Disable buffering for serverless
    });
    
    console.log('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// 🚀 GLOBAL ERROR HANDLERS FOR SERVERLESS
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // In production, we don't want to exit the process
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'FitAI Tracker Server is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import and use routes
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import webhookRoutes from './routes/webhooks';
import paymentRoutes from './routes/payments';
import clerkPaymentRoutes from './routes/clerkPayments';
import { User } from './models/User';
import { Goal } from './models/Goal';
import { Streak } from './models/Streak';

// Import the auth middleware
import { requireAuth, attachUser, AuthRequest } from './middleware/auth';

// 🚀 USE ALL ROUTES
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/clerk-payments', clerkPaymentRoutes);
app.use('/api/food-logs', foodLogRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/recovery', recoveryRoutes);

// Test user creation route (disable in production if needed)
app.post('/api/create-test-user', async (req, res) => {
  try {
    // Optional: Disable in production for security
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Test user creation disabled in production' });
    }

    const { clerkUserId, email, name } = req.body;
    
    const existingUser = await User.findOne({ clerkUserId });
    if (existingUser) {
      return res.json({ message: 'User already exists', user: existingUser });
    }

    const user = await User.create({
      clerkUserId,
      email,
      name,
    });

    console.log('✅ Test user created:', user.email);
    res.json({ message: 'Test user created', user });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ error: 'Failed to create test user' });
  }
});

// Test protected route
app.get('/api/protected', requireAuth, (req: AuthRequest, res) => {
  res.json({ 
    message: 'This is a protected route!',
    user: req.user,
    environment: process.env.NODE_ENV || 'development'
  });
});

// 🔥 FIXED DEBUG ROUTE - Using Mongoose models instead of native driver
app.get('/api/debug/simple', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    console.log('=== 🔍 SIMPLE DEBUG ===');
    console.log('User making request:', req.user!.clerkUserId, req.user!.email);
    
    // Get current user's data using Mongoose models
    const userGoals = await Goal.find({ clerkUserId: req.user!.clerkUserId });
    const userStreak = await Streak.findOne({ clerkUserId: req.user!.clerkUserId });
    
    console.log('User goals count:', userGoals.length);
    console.log('User streak:', userStreak ? userStreak.currentStreak : 'none');

    res.json({
      user: {
        id: req.user!.clerkUserId,
        email: req.user!.email
      },
      data: {
        goals: userGoals.length,
        streak: userStreak ? userStreak.currentStreak : 0,
        goalsList: userGoals.map(g => g.text)
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Simple debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

// 🔥 ENHANCED DEBUG ROUTE - Shows all database state
app.get('/api/debug/full', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    // Optional: Disable in production for security
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Full debug disabled in production' });
    }

    console.log('=== 🐛 FULL DEBUG ===');
    console.log('Request from user:', req.user!.clerkUserId, req.user!.email);
    
    // Get current user's data
    const currentUserGoals = await Goal.find({ clerkUserId: req.user!.clerkUserId });
    const currentUserStreak = await Streak.findOne({ clerkUserId: req.user!.clerkUserId });
    
    // Get ALL data from database (for debugging only)
    const allUsers = await User.find({}).select('clerkUserId email name');
    const allGoals = await Goal.find({}).select('clerkUserId text');
    const allStreaks = await Streak.find({}).select('clerkUserId currentStreak');

    res.json({
      currentUser: {
        clerkUserId: req.user!.clerkUserId,
        email: req.user!.email,
        name: req.user!.name
      },
      currentUserData: {
        goals: currentUserGoals.length,
        streak: currentUserStreak ? currentUserStreak.currentStreak : 0,
        goalsList: currentUserGoals.map(g => ({ text: g.text, completed: g.completed }))
      },
      databaseState: {
        totalUsers: allUsers.length,
        totalGoals: allGoals.length,
        totalStreaks: allStreaks.length,
        allUsers: allUsers.map(u => ({ email: u.email, clerkUserId: u.clerkUserId })),
        allGoals: allGoals.map(g => ({ clerkUserId: g.clerkUserId, text: g.text })),
        allStreaks: allStreaks.map(s => ({ clerkUserId: s.clerkUserId, streak: s.currentStreak }))
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method 
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// Graceful shutdown (primarily for non-serverless environments)
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Only listen in non-serverless environments
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
        console.log(`👤 User routes: http://localhost:${PORT}/api/users`);
        console.log(`📊 Dashboard routes: http://localhost:${PORT}/api/dashboard`);
        console.log(`🔗 Webhook routes: http://localhost:${PORT}/api/webhooks`);
        console.log(`💳 Payment routes: http://localhost:${PORT}/api/payments`);
        console.log(`💳 Clerk Payment routes: http://localhost:${PORT}/api/clerk-payments`);
        console.log(`🍽️ Food log routes: http://localhost:${PORT}/api/food-logs`);
        console.log(`💪 Workout routes: http://localhost:${PORT}/api/workouts`);
        console.log(`🧘 Recovery routes: http://localhost:${PORT}/api/recovery`);
        console.log(`🧪 Test user route: http://localhost:${PORT}/api/create-test-user`);
        console.log(`🔐 Protected route: http://localhost:${PORT}/api/protected`);
        console.log(`🐛 Simple debug: http://localhost:${PORT}/api/debug/simple`);
        console.log(`🐛 Full debug: http://localhost:${PORT}/api/debug/full`);
      });
    } else {
      console.log('✅ Server configured for Vercel serverless environment');
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

startServer();

// Export for Vercel serverless
export default app;