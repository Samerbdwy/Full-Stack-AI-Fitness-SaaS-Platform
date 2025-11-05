import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import workoutRoutes from './routes/workouts';
import foodLogRoutes from './routes/foodLogs';
import recoveryRoutes from './routes/recovery';

dotenv.config();

console.log('🔧 Environment check - MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://fitai-tracker-zqh8.vercel.app',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Cache-Control',
    'Accept',
    'Origin'
  ]
}));

app.options('*', cors());

app.use(express.json());

// SIMPLE MONGODB CONNECTION
const connectDB = async () => {
  try {
    console.log('🔧 Attempting MongoDB connection...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    // Simple connection without complex options
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB connected successfully');
    
  } catch (error: any) {
    console.error('❌ MongoDB connection FAILED:', error.message);
    throw error;
  }
};

// Global error handlers
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

// Routes
app.get('/api/health', (req, res) => {
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
});

// 🆕 ADD THIS DEBUG ROUTE
app.get('/api/debug-db', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    // Try a simple query
    const User = require('./models/User').User;
    const userCount = await User.countDocuments();
    
    res.json({
      connection: states[state],
      connected: state === 1,
      userCount,
      mongoUriExists: !!process.env.MONGODB_URI,
      environment: process.env.NODE_ENV
    });
  } catch (error: any) {
    res.json({
      connection: 'failed',
      connected: false,
      error: error.message,
      mongoUriExists: !!process.env.MONGODB_URI,
      environment: process.env.NODE_ENV
    });
  }
});

// Import and use routes
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import webhookRoutes from './routes/webhooks';
import paymentRoutes from './routes/payments';
import clerkPaymentRoutes from './routes/clerkPayments';

// Use all routes
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/clerk-payments', clerkPaymentRoutes);
app.use('/api/food-logs', foodLogRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/recovery', recoveryRoutes);

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
    // Don't connect DB at startup in serverless
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Server running in production mode - DB will connect on first request');
    } else {
      await connectDB();
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

startServer();

export default app;