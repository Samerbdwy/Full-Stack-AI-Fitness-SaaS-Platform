import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  SignIn, 
  SignUp 
} from '@clerk/clerk-react';

// Import ALL components
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import WorkoutGenerator from './pages/WorkoutGenerator';
import Nutrition from './pages/Nutrition';
import NutritionResults from './pages/NutritionResults';
import FoodLog from './pages/FoodLog';
import FoodLogHistory from './pages/FoodLogHistory';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Recovery from './pages/Recovery';
import OnlineCoaching from './pages/OnlineCoaching';
import PurchaseConfirmation from './pages/PurchaseConfirmation';
import Checkout from './pages/Checkout'; // 🆕 ADD CHECKOUT PAGE
import Sidebar from './pages/Sidebar';
import Header from './pages/Header';


const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <div className="min-h-screen bg-savage-gradient text-white font-savage">
          {/* Signed Out - Show Landing/Auth Pages */}
          <SignedOut>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route 
                path="/sign-in/*" 
                element={
                  <div className="min-h-screen flex items-center justify-center p-4 bg-savage-gradient">
                    <SignIn 
                      routing="path" 
                      path="/sign-in"
                      signUpUrl="/sign-up"
                      afterSignInUrl="/"
                    />
                  </div>
                } 
              />
              <Route 
                path="/sign-up/*" 
                element={
                  <div className="min-h-screen flex items-center justify-center p-4 bg-savage-gradient">
                    <SignUp 
                      routing="path" 
                      path="/sign-up"
                      signInUrl="/sign-in"
                      afterSignUpUrl="/"
                    />
                  </div>
                } 
              />
              {/* Redirect any other routes to landing */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </SignedOut>

          {/* Signed In - Show Main App */}
          <SignedIn>
            <div className="flex h-screen">
              {/* Sidebar - Hidden on mobile, visible on desktop */}
              <div className="hidden lg:block">
                <Sidebar />
              </div>
              
              {/* Mobile Sidebar Overlay */}
              <AnimatePresence>
                {sidebarOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed left-0 top-0 z-50 lg:hidden">
                      <Sidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                  </>
                )}
              </AnimatePresence>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                
                <main className="flex-1 overflow-y-auto">
                  <div className="container mx-auto px-4 py-6">
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/workouts" element={<WorkoutGenerator />} />
                        
                        {/* Nutrition Routes */}
                        <Route path="/nutrition" element={<Nutrition />} />
                        <Route path="/nutrition-results" element={<NutritionResults />} />
                        <Route path="/food-log" element={<FoodLog />} />
                        <Route path="/food-log-history" element={<FoodLogHistory />} />
                        
                        <Route path="/exercises" element={<ExerciseLibrary />} />
                        <Route path="/recovery" element={<Recovery />} />
                        <Route path="/coaching" element={<OnlineCoaching />} />
                        <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
                        <Route path="/checkout" element={<Checkout />} /> {/* 🆕 ADD CHECKOUT ROUTE */}
                        
                        {/* Add more routes as needed */}
                      </Routes>
                    </AnimatePresence>
                  </div>
                </main>
              </div>
            </div>
          </SignedIn>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;