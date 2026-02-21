'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, Users, Coffee, Check, 
  ChevronLeft, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import Navbar from '@/components/Navbar';
import LoadingScreen from '@/components/LoadingScreen';
import CafeModal from '@/components/CafeModal';
import PaymentModal from '@/components/PaymentModal';
import { toast } from 'sonner';

const timeSlots = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [game, setGame] = useState(null);
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Booking State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(1);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [cafeItems, setCafeItems] = useState([]);
  
  // Modals
  const [showCafeModal, setShowCafeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const zoneId = searchParams.get('zone');

  useEffect(() => {
    if (params.gameId && zoneId) {
      fetchDetails();
    }
  }, [params.gameId, zoneId]);

  useEffect(() => {
    if (game && selectedDate) {
      fetchBookedSlots();
    }
  }, [game, selectedDate]);

  const fetchDetails = async () => {
    try {
      // Fetch game
      const gameDoc = await getDoc(doc(db, 'games', params.gameId));
      if (gameDoc.exists()) {
        setGame({ id: gameDoc.id, ...gameDoc.data() });
      }

      // Fetch zone
      const zoneDoc = await getDoc(doc(db, 'gamingZones', zoneId));
      if (zoneDoc.exists()) {
        setZone({ id: zoneDoc.id, ...zoneDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    }
    setLoading(false);
  };

  const fetchBookedSlots = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const q = query(
        collection(db, 'bookings'),
        where('gameId', '==', params.gameId),
        where('date', '==', dateStr),
        where('status', 'in', ['confirmed', 'pending'])
      );
      const snapshot = await getDocs(q);
      const booked = snapshot.docs.map(doc => doc.data().timeSlot);
      setBookedSlots(booked);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const isSlotAvailable = (slot) => {
    // Check if slot is in the past
    const now = new Date();
    const slotDate = new Date(selectedDate);
    const [hours] = slot.split(':').map(Number);
    slotDate.setHours(hours, 0, 0, 0);
    
    if (slotDate < now) return false;
    
    // Check if slot is booked
    return !bookedSlots.includes(slot);
  };

  const getDateRange = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startOfDay(new Date()), i));
    }
    return dates;
  };

  const calculateTotal = () => {
    const gameTotal = (game?.pricePerHour || 0) * duration;
    const cafeTotal = cafeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return gameTotal + cafeTotal;
  };

  const handlePaymentComplete = async (paymentMethod) => {
    if (!user) {
      toast.error('Please login to book');
      router.push('/login');
      return;
    }

    setSubmitting(true);
    
    try {
      const bookingData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.name,
        gameId: game.id,
        gameName: game.name,
        zoneId: zone.id,
        zoneName: zone.name,
        zoneAddress: `${zone.address}, ${zone.area}, ${zone.city}`,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedSlot,
        duration,
        cafeItems: cafeItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        gameTotal: (game?.pricePerHour || 0) * duration,
        cafeTotal: cafeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        totalAmount: calculateTotal(),
        paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      // Send confirmation email
      try {
        await fetch('/api/email/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            type: 'confirmation',
            booking: { ...bookingData, id: docRef.id }
          })
        });
      } catch (emailError) {
        console.error('Email failed:', emailError);
      }

      toast.success('Booking confirmed!');
      setShowPaymentModal(false);
      router.push(`/bookings?success=${docRef.id}`);
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Booking failed. Please try again.');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return <LoadingScreen message="Loading Booking..." />;
  }

  if (!game || !zone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
          <h2 className="font-orbitron font-bold text-2xl mb-4">Game Not Found</h2>
          <button onClick={() => router.back()} className="text-primary hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-sm uppercase tracking-wider">Back</span>
            </button>

            <p className="font-mono text-primary text-sm tracking-[0.3em] uppercase mb-4">
              // BOOK YOUR SLOT
            </p>
            <h1 className="font-orbitron font-bold text-4xl uppercase tracking-tight mb-2">
              {game.name}
            </h1>
            <p className="text-muted-foreground">
              {zone.name} • {zone.area}, {zone.city}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Date Selection */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 border border-white/10 bg-background-paper"
              >
                <h2 className="font-orbitron font-bold text-lg uppercase tracking-wider mb-6 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  Select Date
                </h2>
                
                <div className="grid grid-cols-7 gap-2">
                  {getDateRange().map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 text-center transition-all duration-300 ${
                          isSelected 
                            ? 'bg-primary text-black border-primary' 
                            : 'border border-white/10 hover:border-primary/50'
                        }`}
                        data-testid={`date-${format(date, 'yyyy-MM-dd')}`}
                      >
                        <p className="font-mono text-xs uppercase">{format(date, 'EEE')}</p>
                        <p className="font-orbitron font-bold text-lg">{format(date, 'd')}</p>
                        {isToday && <p className="text-xs mt-1">Today</p>}
                      </button>
                    );
                  })}
                </div>
              </motion.section>

              {/* Time Slots */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 border border-white/10 bg-background-paper"
              >
                <h2 className="font-orbitron font-bold text-lg uppercase tracking-wider mb-6 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  Select Time
                </h2>
                
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                  {timeSlots.map((slot) => {
                    const available = isSlotAvailable(slot);
                    const isSelected = selectedSlot === slot;
                    
                    return (
                      <button
                        key={slot}
                        onClick={() => available && setSelectedSlot(slot)}
                        disabled={!available}
                        className={`p-3 font-mono text-sm transition-all duration-300 ${
                          !available 
                            ? 'bg-white/5 text-gray-600 cursor-not-allowed line-through' 
                            : isSelected 
                              ? 'bg-primary text-black' 
                              : 'border border-white/10 hover:border-primary/50'
                        }`}
                        data-testid={`slot-${slot}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex gap-6 mt-4 text-xs font-mono">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary" /> Selected
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-white/10" /> Available
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-white/5" /> Booked
                  </span>
                </div>
              </motion.section>

              {/* Duration */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 border border-white/10 bg-background-paper"
              >
                <h2 className="font-orbitron font-bold text-lg uppercase tracking-wider mb-6 flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  Duration
                </h2>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setDuration(Math.max(1, duration - 1))}
                    className="w-12 h-12 flex items-center justify-center border border-white/20 hover:border-primary transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="px-8 py-3 border border-primary/30 bg-primary/5">
                    <span className="font-orbitron font-bold text-2xl">{duration}</span>
                    <span className="text-muted-foreground ml-2">hour{duration > 1 ? 's' : ''}</span>
                  </div>
                  <button
                    onClick={() => setDuration(Math.min(4, duration + 1))}
                    className="w-12 h-12 flex items-center justify-center border border-white/20 hover:border-primary transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.section>

              {/* Cafe Add-on */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 border border-white/10 bg-background-paper"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coffee className="w-5 h-5 text-accent" />
                    <div>
                      <h2 className="font-orbitron font-bold text-lg uppercase tracking-wider">
                        Cafe Menu
                      </h2>
                      <p className="text-sm text-muted-foreground">Add snacks & drinks (optional)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCafeModal(true)}
                    className="px-6 py-3 border border-accent/30 text-accent font-rajdhani font-semibold uppercase tracking-wider hover:bg-accent/10 transition-colors"
                    data-testid="open-cafe-modal"
                  >
                    {cafeItems.length > 0 ? `${cafeItems.length} Items Added` : 'Browse Menu'}
                  </button>
                </div>
                
                {cafeItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    {cafeItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                        <span className="font-mono">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.section>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-24"
              >
                <div className="p-6 border border-white/10 bg-background-paper">
                  <h3 className="font-orbitron font-bold text-lg uppercase tracking-wider mb-6">
                    Booking Summary
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Game</span>
                      <span className="font-rajdhani font-semibold">{game.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zone</span>
                      <span className="font-rajdhani font-semibold">{zone.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-mono">{format(selectedDate, 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-mono">{selectedSlot || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-mono">{duration} hr{duration > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Game ({duration}hr x ₹{game.pricePerHour})</span>
                      <span className="font-mono">₹{game.pricePerHour * duration}</span>
                    </div>
                    {cafeItems.length > 0 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Cafe Items</span>
                        <span className="font-mono">
                          ₹{cafeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-white/10">
                      <span>Total</span>
                      <span className="text-accent font-orbitron">₹{calculateTotal()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error('Please login to book');
                        router.push('/login');
                        return;
                      }
                      if (!selectedSlot) {
                        toast.error('Please select a time slot');
                        return;
                      }
                      setShowPaymentModal(true);
                    }}
                    disabled={!selectedSlot || submitting}
                    className="w-full btn-skew py-4 bg-primary text-black font-orbitron font-bold uppercase tracking-widest hover:shadow-neon-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="proceed-to-payment"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Proceed to Payment
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CafeModal
        isOpen={showCafeModal}
        onClose={() => setShowCafeModal(false)}
        zoneId={zone?.id}
        onAddItems={setCafeItems}
        existingItems={cafeItems}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={calculateTotal()}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
