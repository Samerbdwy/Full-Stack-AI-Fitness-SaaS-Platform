import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    clerkUserId: string;
    email: string;
    name: string;
    mongoUserId: string;
  };
}

// Define the Clerk session claims type for TypeScript
interface ClerkSessionClaims {
  email?: string;
  primary_email_address?: string;
  email_addresses?: Array<{ email_address?: string }>;
  first_name?: string;
  last_name?: string;
  name?: string;
  username?: string;
  [key: string]: any; // Allow other properties
}

// Clerk middleware
export const requireAuth = clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

export const attachUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    
    console.log('=== 🔐 AUTH MIDDLEWARE ===');
    console.log('Clerk User ID:', auth.userId);
    
    if (!auth.userId) {
      console.log('❌ NO AUTH USER ID - UNAUTHORIZED');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const clerkUserId = auth.userId;
    
    // 🔥 FIXED: Safe property access with TypeScript typing
    const sessionClaims = auth.sessionClaims as ClerkSessionClaims | undefined;
    
    console.log('🔍 Session Claims Type:', typeof sessionClaims);
    console.log('🔍 Session Claims Keys:', sessionClaims ? Object.keys(sessionClaims) : 'none');
    
    // 🔥 FIXED: Safe email extraction with proper checks
    const safeClerkId = clerkUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
let email = `user${safeClerkId}@gmail.com`; // Safe fallback
    
    if (sessionClaims) {
      if (typeof sessionClaims.email === 'string') {
        email = sessionClaims.email;
        console.log('✅ Using email from sessionClaims.email');
      } else if (typeof sessionClaims.primary_email_address === 'string') {
        email = sessionClaims.primary_email_address;
        console.log('✅ Using email from sessionClaims.primary_email_address');
      } else if (Array.isArray(sessionClaims.email_addresses) && 
                 sessionClaims.email_addresses[0] && 
                 typeof sessionClaims.email_addresses[0].email_address === 'string') {
        email = sessionClaims.email_addresses[0].email_address;
        console.log('✅ Using email from sessionClaims.email_addresses[0].email_address');
      } else {
        console.log('⚠️ No email found in session claims, using fallback');
      }
    } else {
      console.log('⚠️ No session claims available');
    }

    // 🔥 FIXED: Safe name extraction with proper checks
    let name = `User-${clerkUserId.slice(0, 8)}`; // Default fallback
    
    if (sessionClaims) {
      if (typeof sessionClaims.first_name === 'string' && typeof sessionClaims.last_name === 'string') {
        name = `${sessionClaims.first_name} ${sessionClaims.last_name}`.trim();
        console.log('✅ Using name from first_name + last_name');
      } else if (typeof sessionClaims.first_name === 'string') {
        name = sessionClaims.first_name;
        console.log('✅ Using name from first_name');
      } else if (typeof sessionClaims.name === 'string') {
        name = sessionClaims.name;
        console.log('✅ Using name from name');
      } else if (typeof sessionClaims.username === 'string') {
        name = sessionClaims.username;
        console.log('✅ Using name from username');
      } else {
        console.log('⚠️ No name found in session claims, using fallback');
      }
    }

    console.log('👤 FINAL USER DATA:', { clerkUserId, email, name });

    // Find or create user with proper error handling
    let user = await User.findOne({ clerkUserId });
    
    if (!user) {
      console.log('🆕 CREATING NEW USER:', email);
      
      try {
        user = await User.create({
          clerkUserId,
          email,
          name,
          fitnessLevel: 'beginner',
          goals: [],
          subscription: 'free'
        });
        
        console.log('✅ NEW USER CREATED:', user.email);
        
      } catch (createError: any) {
        console.error('❌ FAILED TO CREATE USER:', createError);
        
        // Fallback: Try with guaranteed unique email
        try {
          const fallbackEmail = `user-${clerkUserId}@fitai.com`;
          user = await User.create({
            clerkUserId,
            email: fallbackEmail,
            name: `User-${clerkUserId.slice(0, 8)}`,
            fitnessLevel: 'beginner',
            goals: [],
            subscription: 'free'
          });
          console.log('✅ USER CREATED WITH FALLBACK EMAIL');
        } catch (finalError: any) {
          console.error('❌ CRITICAL: Cannot create user account:', finalError);
          return res.status(500).json({ 
            error: 'Cannot create user account',
            details: 'Please try logging out and back in'
          });
        }
      }
    } else {
      console.log('✅ EXISTING USER FOUND:', user.email);
    }

    // Convert ObjectId to string safely
    const mongoUserId = user._id ? user._id.toString() : '';

    // Attach user to request
    req.user = {
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      mongoUserId: mongoUserId
    };

    console.log('✅ USER ATTACHED TO REQUEST');
    console.log('=== 🔐 AUTH COMPLETE ===');
    next();
  } catch (error: any) {
    console.error('❌ AUTH MIDDLEWARE FAILED:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message || 'Please try logging out and back in'
    });
  }
};

export const protectedRoute = [requireAuth, attachUser];