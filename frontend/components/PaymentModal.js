'use client';

import { motion } from 'framer-motion';
import { X, CreditCard, Wallet, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function PaymentModal({ isOpen, onClose, totalAmount, onPaymentComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  const processMockPayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 95% success rate
    const success = Math.random() < 0.95;
    setPaymentResult(success ? 'success' : 'failed');
    
    if (success) {
      setTimeout(() => {
        onPaymentComplete('online');
      }, 1500);
    }
    
    setProcessing(false);
  };

  const handlePayAtVenue = () => {
    onPaymentComplete('cash');
  };

  const resetModal = () => {
    setPaymentMethod('');
    setPaymentResult(null);
    setCardDetails({ number: '', expiry: '', cvv: '' });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-background-paper border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-orbitron font-bold text-xl uppercase tracking-wider">
            Payment
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentResult === 'success' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h3 className="font-orbitron font-bold text-xl mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground">Redirecting to confirmation...</p>
            </motion.div>
          ) : paymentResult === 'failed' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center py-8"
            >
              <XCircle className="w-20 h-20 text-secondary mx-auto mb-4" />
              <h3 className="font-orbitron font-bold text-xl mb-2">Payment Failed</h3>
              <p className="text-muted-foreground mb-6">Please try again or choose a different method</p>
              <button
                onClick={() => setPaymentResult(null)}
                className="btn-skew px-6 py-3 bg-primary text-black font-orbitron font-bold uppercase tracking-widest"
              >
                <span>Try Again</span>
              </button>
            </motion.div>
          ) : !paymentMethod ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="font-orbitron font-bold text-3xl text-accent">₹{totalAmount}</p>
              </div>

              <button
                onClick={() => setPaymentMethod('online')}
                className="w-full flex items-center gap-4 p-4 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <CreditCard className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <p className="font-rajdhani font-semibold">Pay Online</p>
                  <p className="text-sm text-muted-foreground">Credit/Debit Card (Demo)</p>
                </div>
              </button>

              <button
                onClick={handlePayAtVenue}
                className="w-full flex items-center gap-4 p-4 border border-white/10 hover:border-accent/50 hover:bg-accent/5 transition-all"
              >
                <Wallet className="w-6 h-6 text-accent" />
                <div className="text-left">
                  <p className="font-rajdhani font-semibold">Pay at Gaming Zone</p>
                  <p className="text-sm text-muted-foreground">Cash on arrival</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="font-orbitron font-bold text-2xl text-accent">₹{totalAmount}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2 font-mono uppercase tracking-wider">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardDetails.number}
                    onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2 font-mono uppercase tracking-wider">
                      Expiry
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2 font-mono uppercase tracking-wider">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="***"
                      value={cardDetails.cvv}
                      onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Demo Mode: 95% success rate. Use any card details.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod('')}
                  className="flex-1 px-4 py-3 border border-white/20 font-rajdhani font-semibold uppercase hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={processMockPayment}
                  disabled={processing}
                  className="flex-1 btn-skew px-4 py-3 bg-primary text-black font-orbitron font-bold uppercase tracking-widest hover:shadow-neon transition-all disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {processing ? 'Processing...' : 'Pay Now'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
