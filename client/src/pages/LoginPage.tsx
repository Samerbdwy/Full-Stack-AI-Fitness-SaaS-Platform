// src/pages/LoginPage.tsx
import { motion } from "framer-motion";
import { Dumbbell, Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
}

const LoginPage = ({ onLogin, onSwitchToSignup }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token & trigger parent callback
      localStorage.setItem("token", data.token);
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-savage-gradient flex items-center justify-center p-4">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-savage-neon-blue rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.25, 0.15] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-savage-neon-orange rounded-full blur-3xl"
        />
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header barbell */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 120, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="w-4 h-10 bg-savage-neon-green rounded-md"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              className="w-6 h-12 bg-savage-neon-blue rounded-md"
            />
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="w-32 h-3 bg-gradient-to-r from-gray-300 to-gray-100 rounded-full shadow-lg">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-savage-neon-orange rounded-full" />
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-savage-neon-orange rounded-full" />
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
              className="w-4 h-10 bg-savage-neon-green rounded-md"
            />
          </div>
        </motion.div>

        <div className="bg-savage-steel/90 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-savage-neon-blue/20 to-savage-neon-green/20 p-6 text-center border-b border-gray-800">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Dumbbell className="w-8 h-8 text-savage-neon-green" />
              <h1 className="text-3xl font-black">
                <span className="text-savage-neon-blue drop-shadow-[0_0_20px_rgba(0,245,255,0.9)] font-bold animate-pulse">
                  FIT
                </span>
                <span className="text-white">AI</span>
              </h1>
            </div>
            <p className="text-gray-300">Train smarter. Lift heavier. 💪</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  className="w-full bg-savage-black border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-savage-neon-blue focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-savage-black border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:border-savage-neon-green focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-500 text-sm text-center font-semibold">
                {error}
              </div>
            )}

            {/* Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 border-2 ${
                loading
                  ? "bg-gray-600 border-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-savage-neon-orange text-savage-black border-savage-neon-orange hover:shadow-[0_0_20px_rgba(255,107,53,0.8)]"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {loading ? "Logging in..." : "LIFT & LOGIN"}
            </motion.button>

            {/* Signup link */}
            <div className="text-center text-gray-400 mt-4">
              New to FITAI?{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-savage-neon-blue hover:text-cyan-400 font-semibold"
              >
                Create an account
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
