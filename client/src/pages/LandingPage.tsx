// src/pages/LandingPage.tsx
import { motion } from 'framer-motion';
import { Dumbbell, Trophy, Activity, Target, ArrowRight, Sparkles, Utensils, Heart, BookOpen, Calculator } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';

const LandingPage = () => {
  const { openSignIn } = useClerk();

  return (
    <div className="min-h-screen bg-savage-black text-white font-savage overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
        
        {/* BACKGROUND ELEMENTS */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-64 h-64 bg-savage-neon-blue rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.2, 0.15],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-savage-neon-orange rounded-full blur-3xl"
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="text-center z-10 max-w-4xl mx-auto w-full">
          
          {/* BARBELL ANIMATION - MUCH FASTER */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-4 h-8 bg-savage-neon-green rounded-md"
              />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
                className="w-4 h-10 bg-savage-neon-blue rounded-md"
              />
              
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-28 h-2 bg-gradient-to-r from-gray-300 to-gray-100 rounded-full shadow-lg">
                  <div className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-savage-neon-orange rounded-full" />
                  <div className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-savage-neon-orange rounded-full" />
                </div>
              </motion.div>
              
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-4 h-10 bg-savage-neon-purple rounded-md"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                className="w-4 h-8 bg-savage-neon-green rounded-md"
              />
            </div>
          </motion.div>

          {/* MAIN HEADLINE - BRIGHTER FIT TEXT */}
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, type: "spring" }}
            className="text-5xl md:text-7xl font-black mb-3 leading-tight"
          >
            <span className="text-savage-neon-blue drop-shadow-[0_0_20px_rgba(0,245,255,0.9)] font-bold animate-pulse">
              FIT
            </span>
            <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">AI</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xl md:text-2xl font-bold mb-3 text-gray-100"
          >
            TRAIN <span className="text-savage-neon-green">SMARTER</span>
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-base text-gray-300 mb-6 max-w-2xl mx-auto"
          >
            AI-powered fitness that adapts to your strength. No excuses. Just results.
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12"
          >
            <motion.button
              onClick={() => openSignIn()}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "#00f5ff",
                color: "#0a0a0a"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-transparent border-2 border-savage-neon-blue text-savage-neon-blue font-bold text-base rounded-lg transition-all duration-0 flex items-center gap-2"
            >
              START LIFTING NOW
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => openSignIn()}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "#39ff14",
                color: "#0a0a0a"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-transparent border-2 border-savage-neon-green text-savage-neon-green font-bold text-base rounded-lg transition-all duration-0 flex items-center gap-2"
            >
              SEE RESULTS
              <Trophy className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* QUICK STATS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {[
              { number: "50K+", label: "LIFTS", color: "text-savage-neon-blue" },
              { number: "99%", label: "ACCURACY", color: "text-savage-neon-green" },
              { number: "24/7", label: "AI COACH", color: "text-savage-neon-orange" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className={`text-lg font-black ${stat.color}`}>
                  {stat.number}
                </div>
                <div className="text-xs text-gray-400 font-medium mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* SCROLL INDICATOR */}
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-gray-400">SCROLL FOR MORE</div>
            <Dumbbell className="w-3 h-3 text-savage-neon-green" />
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION - WITH ALL OUR ACTUAL FEATURES */}
      <section className="py-16 bg-savage-steel">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
            className="text-3xl md:text-4xl font-black text-center mb-12 text-white"
          >
            EVERYTHING YOU NEED TO <span className="text-savage-neon-green">SUCCEED</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Target, 
                title: "AI WORKOUT GENERATOR", 
                desc: "Personalized workout plans based on your goals and equipment",
                color: "blue" 
              },
              { 
                icon: Utensils, 
                title: "CALORIE & NUTRITION TRACKER", 
                desc: "AI-powered meal planning and calorie tracking for your goals",
                color: "green" 
              },
              { 
                icon: BookOpen, 
                title: "EXERCISE LIBRARY", 
                desc: "Complete PPL exercise database with form guides and tutorials",
                color: "orange" 
              },
              { 
                icon: Activity, 
                title: "PROGRESS ANALYTICS", 
                desc: "Track your lifts, measurements, and body composition over time",
                color: "purple" 
              },
              { 
                icon: Heart, 
                title: "RECOVERY & WELLNESS", 
                desc: "AI recovery advice, sleep tracking, and wellness recommendations",
                color: "blue" 
              },
              { 
                icon: Calculator, 
                title: "BMI & MACRO CALCULATOR", 
                desc: "Smart calculators for BMI, TDEE, and optimal macronutrients",
                color: "green" 
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0, delay: index * 0 }}
                whileHover={{ scale: 1.03, y: -3 }}
                className="text-center p-5 rounded-xl bg-savage-black/50 backdrop-blur-sm border border-gray-800 hover:border-savage-neon-blue transition-all duration-300 h-full flex flex-col"
              >
                <div className={`w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                  feature.color === 'blue' ? 'bg-savage-neon-blue' :
                  feature.color === 'green' ? 'bg-savage-neon-green' :
                  feature.color === 'orange' ? 'bg-savage-neon-orange' :
                  'bg-savage-neon-purple'
                }`}>
                  <feature.icon className="w-5 h-5 text-savage-black" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed flex-1">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-12 bg-savage-black border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-black mb-4 text-white"
          >
            READY TO <span className="text-savage-neon-green">TRANSFORM</span> YOUR FITNESS?
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-300 mb-6 max-w-2xl mx-auto"
          >
            Join thousands of athletes already training smarter with FITAI
          </motion.p>
          <motion.button
            onClick={() => openSignIn()}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0, delay: 0 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 20px rgba(255, 107, 53, 0.8)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-savage-neon-orange text-savage-black font-bold text-lg rounded-lg transition-all duration-0 flex items-center gap-2 mx-auto border-2 border-savage-neon-orange"
          >
            <Sparkles className="w-5 h-5" />
            START YOUR JOURNEY NOW
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;