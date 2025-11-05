import { motion } from 'framer-motion';
import { Crown, Zap, Check, Star, Mail, Clock, Users, Award, ArrowRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk, PricingTable } from '@clerk/clerk-react';

const OnlineCoaching = () => {
  const [selectedPlan, setSelectedPlan] = useState<'pro_plan' | 'premium_plan' | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPricingTable, setShowPricingTable] = useState(false);
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { openSignIn, session } = useClerk();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const plans = [
    {
      id: 'pro_plan',
      name: 'Pro Plan',
      price: 97,
      duration: 'month',
      description: 'Perfect for serious lifters wanting personalized guidance',
      popular: true,
      icon: Zap,
      features: [
        'Custom workout programming',
        'Nutrition plan tailored to your goals',
        'Form check via video analysis',
        'Weekly progress tracking',
        'Priority email support (24h response)',
        'Exercise substitution guidance',
        'Monthly program adjustments',
        'Access to private community'
      ],
      buttonText: 'Get Pro Coaching'
    },
    {
      id: 'premium_plan', 
      name: 'Premium Plan',
      price: 247,
      duration: 'month',
      description: 'Elite 1-on-1 coaching for maximum results',
      popular: false,
      icon: Crown,
      features: [
        'Everything in Pro PLUS:',
        '1-on-1 weekly video calls (4x/month)',
        'Unlimited messaging support',
        'Custom meal plans with recipes',
        'Daily check-ins & accountability',
        'Advanced progress analytics',
        'Lifestyle & habit coaching',
        'Priority support (4h response)',
        'Goal setting sessions'
      ],
      buttonText: 'Go Premium'
    }
  ];

  const handleShowPricingTable = () => {
    if (!isSignedIn) {
      openSignIn({
        redirectUrl: window.location.href,
      });
      return;
    }
    setShowPricingTable(true);
    // Scroll to pricing table
    setTimeout(() => {
      document.getElementById('clerk-pricing-table')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const scrollToPricing = () => {
    if (showPricingTable) {
      document.getElementById('clerk-pricing-table')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    } else {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-savage-black to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-savage-neon-blue/10 text-savage-neon-blue px-4 py-2 rounded-full text-sm font-medium mb-6 border border-savage-neon-blue/20">
            <Star className="w-4 h-4" />
            Transform Your Fitness Journey
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Online Coaching
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Get personalized 1-on-1 coaching from certified fitness experts. 
            Transform your body with science-backed programs tailored to your unique goals and lifestyle.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {[
            {
              icon: Users,
              title: 'Certified Coaches',
              description: 'Work with experienced fitness professionals who have proven track records'
            },
            {
              icon: Award,
              title: 'Proven Results',
              description: 'Science-backed methods that deliver real, measurable results'
            },
            {
              icon: Clock,
              title: '24/7 Support',
              description: 'Get guidance and motivation whenever you need it'
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-gradient-to-br from-savage-steel to-gray-800 p-8 rounded-2xl border border-gray-700 text-center shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-savage-neon-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <benefit.icon className="w-8 h-8 text-savage-neon-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
              <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Plans - Show either custom cards or Clerk PricingTable */}
        <motion.div
          id="pricing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Select the coaching level that matches your goals and commitment
            </p>
          </div>

          {!showPricingTable ? (
            // Custom Pricing Cards
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative flex flex-col h-full"
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                      <span className="bg-gradient-to-r from-savage-neon-orange to-orange-500 text-savage-black font-bold px-6 py-2 rounded-full text-sm flex items-center gap-2 whitespace-nowrap shadow-lg border-2 border-orange-300">
                        <Star className="w-4 h-4 fill-current" />
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className={`bg-gradient-to-br from-savage-steel to-gray-800 rounded-3xl border-2 p-8 flex flex-col flex-1 relative overflow-hidden ${
                    plan.popular 
                      ? 'border-savage-neon-orange shadow-2xl shadow-orange-500/20' 
                      : 'border-gray-700 shadow-xl'
                  } ${plan.popular ? 'mt-4' : ''}`}>
                    
                    <div className={`absolute top-0 left-0 w-full h-1 ${
                      plan.popular ? 'bg-savage-neon-orange' : 'bg-savage-neon-blue'
                    }`} />
                    
                    <div className="text-center mb-8 flex-shrink-0">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                        plan.popular 
                          ? 'bg-savage-neon-orange/10' 
                          : 'bg-savage-neon-blue/10'
                      }`}>
                        <plan.icon className={`w-10 h-10 ${
                          plan.popular ? 'text-savage-neon-orange' : 'text-savage-neon-blue'
                        }`} />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3">{plan.name}</h3>
                      <p className="text-gray-300 mb-6 min-h-[3rem] flex items-center justify-center">
                        {plan.description}
                      </p>
                      
                      <div className="mb-2">
                        <span className="text-5xl font-bold text-savage-neon-green">${plan.price}</span>
                        <span className="text-gray-400 text-lg">/{plan.duration}</span>
                      </div>
                      <p className="text-gray-400 text-sm">Cancel anytime</p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-4">
                          <Check className="w-6 h-6 text-savage-neon-green mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 leading-relaxed text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-6 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleShowPricingTable}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden group ${
                          plan.popular
                            ? 'bg-gradient-to-r from-savage-neon-orange to-orange-500 text-savage-black hover:shadow-2xl hover:shadow-orange-500/30'
                            : 'bg-gradient-to-r from-savage-neon-blue to-cyan-500 text-savage-black hover:shadow-2xl hover:shadow-cyan-500/30'
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {plan.buttonText}
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Clerk Pricing Table
            <motion.div
              id="clerk-pricing-table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Select Your Plan
                </h3>
                <p className="text-gray-400 mb-2">
                  Choose the plan that works best for you
                </p>
                <div className="bg-savage-neon-blue/10 border border-savage-neon-blue/20 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-savage-neon-blue">
                    
                    <span className="text-sm font-medium">After your purchase, a coach will contact you via email within 24 hours. Please remember to check your spam or trash folders just in case.

If you haven’t received an email within 24 hours, please reach out to samercoding@gmail.com
 for assistance.</span>
                  </div>
                </div>
              </div>
              
              <PricingTable 
                checkoutProps={{
                  appearance: {
                    variables: {
                      colorPrimary: '#3b82f6',
                      colorBackground: '#1f2937',
                      colorText: '#ffffff',
                      colorInputBackground: '#374151',
                    }
                  }
                }}
                appearance={{
                  variables: {
                    colorBackground: '#111827',
                    colorText: '#ffffff',
                    colorPrimary: '#3b82f6',
                  }
                }}
              />
              
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowPricingTable(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ← Back to plan overview
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-savage-steel to-gray-800 rounded-3xl p-12 border border-gray-700 mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Choose Plan', desc: 'Select your coaching level' },
              { step: '2', title: 'Complete Purchase', desc: 'Secure checkout with instant access' },
              { step: '3', title: 'Coach Assignment', desc: 'Get matched with your expert coach within 24 hours' },
              { step: '4', title: 'Start Training', desc: 'Begin your transformation journey' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-savage-neon-green text-savage-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                question: 'How quickly will I be contacted after purchase?',
                answer: 'A certified coach will reach out to you via email within 24 hours of your purchase to schedule your initial consultation and begin your fitness journey.'
              },
              {
                question: 'What happens after I subscribe?',
                answer: 'Immediately after your purchase, your assigned coach will contact you via the Gmail address you used to sign up with typically within 24 hours. If you haven’t been contacted within that time, please reach out to samercoding@gmail.com for further assistance '
              },
              {
                question: 'Can I change or cancel my plan?',
                answer: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the end of your current billing cycle.'
              },
              {
                question: 'What makes your coaches different?',
                answer: 'Our coaches are certified professionals with proven track records. They specialize in evidence-based training methods and provide personalized attention to each client.'
              },
              {
                question: 'How do I communicate with my coach?',
                answer: 'After your coach reaches out, you\'ll communicate through whatsapp, email, and scheduled video calls (depending on your plan). Premium plans include unlimited messaging and weekly video sessions.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-savage-steel border border-gray-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Body?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of clients who have achieved their dream physique with our proven coaching system.
            Your dedicated coach will contact you within 24 hours to start your journey!
          </p>
          <motion.button
            onClick={scrollToPricing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-savage-neon-orange to-orange-500 text-savage-black font-bold px-8 py-4 rounded-xl text-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all"
          >
            Choose Your Plan Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default OnlineCoaching;