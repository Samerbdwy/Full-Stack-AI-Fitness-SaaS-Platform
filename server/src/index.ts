import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import workoutRoutes from './routes/workouts';
import foodLogRoutes from './routes/foodLogs';
import recoveryRoutes from './routes/recovery';

dotenv.config();

// Debug environment variables
console.log('🔧 Environment check - MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5000;

// 🚀 FIXED CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://fitai-tracker-zqh8.vercel.app', // REMOVED TRAILING SLASH
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// 🚀 FIXED: SERVERLESS-OPTIMIZED MONGODB CONNECTION
let cachedConnection: typeof mongoose | null = null;

const connectDB = async () => {
  try {
    console.log('🔧 Attempting MongoDB connection...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is undefined in environment variables');
      throw new Error('MONGODB_URI is not defined');
    }

    // Use cached connection if available and connected
    if (cachedConnection && cachedConnection.connection.readyState === 1) {
      console.log('✅ Using cached MongoDB connection');
      return cachedConnection;
    }

    console.log('🔧 Creating new MongoDB connection...');
    
    // 🚀 SERVERLESS-OPTIMIZED CONNECTION
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      bufferCommands: false,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Event handlers for connection monitoring
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      cachedConnection = null;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      cachedConnection = null;
    });
    
    return cachedConnection;
    
  } catch (error: any) {
    console.error('❌ MongoDB connection FAILED:');
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    
    cachedConnection = null;
    throw error;
  }
};

// 🚀 GLOBAL ERROR HANDLERS
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Routes
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.json({ 
      message: 'FitAI Tracker Server is running!',
      database: {
        state: states[dbState],
        connected: dbState === 1
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      database: 'Error checking connection'
    });
  }
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

// Database test route
app.get('/api/test-db', async (req, res) => {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    
    res.json({
      database: 'Connected',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      database: 'Connection failed',
      error: error.message
    });
  }
});

// 🔥 DEBUG ROUTE
app.get('/api/debug/simple', requireAuth, attachUser, async (req: AuthRequest, res) => {
  try {
    console.log('=== 🔍 SIMPLE DEBUG ===');
    
    const userGoals = await Goal.find({ clerkUserId: req.user!.clerkUserId });
    const userStreak = await Streak.findOne({ clerkUserId: req.user!.clerkUserId });
    
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

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Always start server in both environments
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for frontend`);
    });
    
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