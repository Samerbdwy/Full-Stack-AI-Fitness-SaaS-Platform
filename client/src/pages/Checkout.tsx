// src/pages/Checkout.tsx
import { motion } from 'framer-motion';
import { CreditCard, Lock, ArrowLeft, Loader } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });
  const [errors, setErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });
  
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order_id');
  const plan = searchParams.get('plan');
  const price = searchParams.get('price');

  // Fix for planName - handle null/undefined safely
  const getPlanName = () => {
    if (!plan) return 'Fitness Plan';
    return `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`;
  };

  const planName = getPlanName();

  useEffect(() => {
    if (!orderId || !plan || !price) {
      navigate('/coaching');
    }
  }, [orderId, plan, price, navigate]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches ? matches[0] : '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : cleaned;
  };

  // Format expiry date with slash
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Format CVC (numbers only)
  const formatCVC = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    switch (field) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        break;
      case 'cvc':
        formattedValue = formatCVC(value);
        break;
      case 'cardholderName':
        formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      cardholderName: ''
    };

    // Card number validation (16 digits)
    const cardDigits = formData.cardNumber.replace(/\s/g, '');
    if (cardDigits.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    // Expiry date validation (MM/YY format)
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please use MM/YY format';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVC validation (3-4 digits)
    if (formData.cvc.length < 3 || formData.cvc.length > 4) {
      newErrors.cvc = 'CVC must be 3-4 digits';
    }

    // Cardholder name validation
    if (formData.cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      alert('Please fix the errors in the form before proceeding.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Call the backend to process the payment
      const token = await getToken();
      const response = await fetch('/api/clerk-payments/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      if (data.success) {
        console.log('✅ Payment processed successfully:', data);
        
        // After payment is processed, redirect to confirmation
        navigate('/purchase-confirmation', {
          state: {
            plan: plan?.toUpperCase() || 'PRO',
            planName: planName,
            price: parseInt(price || '0'),
            orderId: orderId,
            sessionId: `sess_${Date.now()}`,
            purchase: data.purchase
          }
        });
      } else {
        throw new Error(data.error || 'Payment processing failed');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      alert(`Payment failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  if (!orderId || !plan || !price) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-savage-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Invalid Checkout Session</h2>
          <button 
            onClick={() => navigate('/coaching')}
            className="bg-savage-neon-blue text-savage-black font-bold px-6 py-2 rounded-lg hover:bg-cyan-400"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-savage-black to-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/coaching')}
            className="flex items-center gap-2 text-savage-neon-blue hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Plans
          </button>
          <div className="flex items-center gap-2 text-savage-neon-green">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-semibold">Secure Checkout</span>
          </div>
        </div>

        {/* Checkout Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-savage-steel to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Purchase</h1>
          <p className="text-gray-400 mb-8">
            You're purchasing: <span className="text-savage-neon-green font-semibold">{planName}</span>
          </p>

          {/* Order Summary */}
          <div className="bg-savage-black/50 rounded-xl p-6 mb-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">{planName}</span>
              <span className="text-savage-neon-green font-bold">${price}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Billed monthly</span>
              <span className="text-gray-400">Cancel anytime</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Order ID:</span>
                <span className="text-savage-neon-blue font-mono">{orderId}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-savage-black/30 rounded-xl p-6 border border-gray-600 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-savage-neon-blue" />
              <h3 className="text-lg font-bold text-white">Payment Information</h3>
            </div>
            
            {/* Payment Form with Validation */}
            <div className="space-y-4">
              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-savage-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-savage-neon-blue focus:outline-none"
                />
                {errors.cardholderName && (
                  <p className="text-red-400 text-xs mt-1">{errors.cardholderName}</p>
                )}
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full bg-savage-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-savage-neon-blue focus:outline-none"
                />
                {errors.cardNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full bg-savage-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-savage-neon-blue focus:outline-none"
                  />
                  {errors.expiryDate && (
                    <p className="text-red-400 text-xs mt-1">{errors.expiryDate}</p>
                  )}
                </div>
                
                {/* CVC */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CVC</label>
                  <input
                    type="text"
                    value={formData.cvc}
                    onChange={(e) => handleInputChange('cvc', e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full bg-savage-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-savage-neon-blue focus:outline-none"
                  />
                  {errors.cvc && (
                    <p className="text-red-400 text-xs mt-1">{errors.cvc}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isProcessing 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-savage-neon-green to-green-500 text-savage-black hover:shadow-2xl hover:shadow-green-500/30'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Processing Payment...
              </div>
            ) : (
              `Pay $${price}`
            )}
          </button>

          <p className="text-center text-gray-400 text-sm mt-4">
            🔒 Your payment is secure and encrypted
          </p>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-savage-neon-blue/10 border border-savage-neon-blue/30 rounded-lg"
            >
              <p className="text-savage-neon-blue text-sm text-center">
                Processing your payment securely...
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;