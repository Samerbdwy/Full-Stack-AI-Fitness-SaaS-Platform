import { motion } from 'framer-motion';
import { Check, Mail, Clock, User, ArrowLeft, Download, Calendar } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';

const PurchaseConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [purchaseData, setPurchaseData] = useState<any>(null);

  useEffect(() => {
    if (location.state) {
      console.log('✅ Purchase confirmation received data:', location.state);
      setPurchaseData(location.state);
      
      // 🔥 REMOVED: No need to call create-session again
      // The purchase is already created in OnlineCoaching
    } else {
      console.log('❌ No purchase data, redirecting to coaching');
      navigate('/coaching');
    }
  }, [location, navigate]);

  // 🔥 REMOVED: handleSavePurchase and processPaymentWebhook functions
  // These are already handled in the payments route

  const handleDownloadReceipt = () => {
    if (!purchaseData) return;
    
    const receiptData = {
      orderId: purchaseData.orderId || `order_${Date.now()}`,
      plan: purchaseData.planName,
      amount: purchaseData.price ? `$${purchaseData.price}` : '$97',
      date: new Date().toLocaleDateString(),
      customer: user?.fullName || 'Customer',
      email: user?.primaryEmailAddress?.emailAddress || ''
    };

    // Generate receipt text
    const receiptText = `
      SAVAGE FITNESS - RECEIPT
      ========================
      
      Order ID: ${receiptData.orderId}
      Date: ${receiptData.date}
      
      Customer: ${receiptData.customer}
      Email: ${receiptData.email}
      
      Item: ${receiptData.plan}
      Amount: ${receiptData.amount}
      
      Status: PAID
      Payment Method: Clerk Payments
      
      Thank you for your purchase!
      =============================
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savage-receipt-${receiptData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!purchaseData || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-savage-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-savage-neon-green mx-auto mb-4"></div>
          <p className="text-savage-neon-blue text-lg">Loading your purchase details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-savage-black to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/coaching')}
            className="flex items-center gap-2 text-savage-neon-blue hover:text-cyan-400 transition-colors px-4 py-2 rounded-lg border border-savage-neon-blue/20 hover:border-cyan-400/30"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Coaching
          </button>
          
          <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
            Status: <span className="text-savage-neon-green font-semibold">{purchaseData.plan} Plan</span>
          </div>
        </div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 bg-gradient-to-br from-savage-steel to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl"
        >
          <div className="w-20 h-20 bg-savage-neon-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-10 h-10 text-savage-black" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-savage-neon-green">
            Welcome to {purchaseData.planName}!
          </h1>
          
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
            Thank you for your purchase! Your {purchaseData.plan} coaching plan is now active. 
            An expert coach will reach out to you via email within 24 hours to begin your transformation.
          </p>

          {purchaseData.orderId && (
            <div className="inline-block bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-600">
              <p className="text-gray-300 text-sm">
                Order ID: <span className="font-mono text-savage-neon-blue">{purchaseData.orderId}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Rest of your component remains the same */}
        {/* Quick Actions, Next Steps, Final CTA */}
      </div>
    </div>
  );
};

export default PurchaseConfirmation;