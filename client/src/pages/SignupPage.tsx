// src/pages/SignupPage.tsx
import { motion } from 'framer-motion';
import { Dumbbell, Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface SignupPageProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

const SignupPage = ({ onSignup, onSwitchToLogin }: SignupPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Temporary - will integrate with Clerk later
    onSignup();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-savage-gradient flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-savage-neon-purple rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-savage-neon-green rounded-full blur-3xl"
        />
      </div>

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onSwitchToLogin}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </motion.button>

        {/* Barbell Header */}
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 120, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="w-4 h-10 bg-savage-neon-blue rounded-md"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              className="w-6 h-12 bg-savage-neon-orange rounded-md"
            />
            
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="w-32 h-3 bg-gradient-to-r from-gray-300 to-gray-100 rounded-full shadow-lg">
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-savage-neon-green rounded-full" />
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-savage-neon-green rounded-full" />
              </div>
            </motion.div>
            
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              className="w-6 h-12 bg-savage-neon-purple rounded-md"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
              className="w-4 h-10 bg-savage-neon-blue rounded-md"
            />
          </div>
        </motion.div>

        {/* Main Card */}
        <div className="bg-savage-steel/90 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-savage-neon-purple/20 to-savage-neon-blue/20 p-6 text-center border-b border-gray-800">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <Dumbbell className="w-8 h-8 text-savage-neon-green" />
              <h1 className="text-3xl font-black">
                <span className="text-savage-neon-blue drop-shadow-[0_0_20px_rgba(0,245,255,0.9)] font-bold animate-pulse">
                  JOIN
                </span>
                <span className="text-white"> FITAI</span>
              </h1>
            </motion.div>
            <p className="text-gray-300">Start your fitness journey today! 🚀</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Athlete"
                  className="w-full bg-savage-black border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-savage-neon-purple focus:outline-none focus:ring-2 focus:ring-savage-neon-purple/20 transition-all"
                  required
                />
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="athlete@example.com"
                  className="w-full bg-savage-black border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-savage-neon-blue focus:outline-none focus:ring-2 focus:ring-savage-neon-blue/20 transition-all"
                  required
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-savage-black border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:border-savage-neon-green focus:outline-none focus:ring-2 focus:ring-savage-neon-green/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-savage-black border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-savage-neon-orange focus:outline-none focus:ring-2 focus:ring-savage-neon-orange/20 transition-all"
                  required
                />
              </div>
            </motion.div>

            {/* Terms Agreement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-start gap-2 text-sm text-gray-300"
            >
              <input 
                type="checkbox" 
                className="mt-1 rounded border-gray-600 bg-savage-black text-savage-neon-blue focus:ring-savage-neon-blue" 
                required 
              />
              <span>
                I agree to the{' '}
                <button type="button" className="text-savage-neon-blue hover:text-cyan-400">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-savage-neon-blue hover:text-cyan-400">
                  Privacy Policy
                </button>
              </span>
            </motion.div>

            {/* Signup Button - FIXED WITH ORANGE */}
            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 20px rgba(255, 107, 53, 0.8)"
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-savage-neon-orange text-savage-black font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 text-lg border-2 border-savage-neon-orange"
            >
              <Sparkles className="w-5 h-5" />
              START MY JOURNEY
            </motion.button>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-gray-400 pt-4"
            >
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-savage-neon-blue hover:text-cyan-400 font-semibold transition-colors"
              >
                Sign in
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;