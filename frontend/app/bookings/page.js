'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Receipt, X, CheckCircle, 
  AlertCircle, Loader2, Filter
} from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO, isAfter, subHours } from 'date-fns';
import Navbar from '@/components/Navbar';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';

const statusColors = {
  confirmed: 'text-green-400 bg-green-500/20 border-green-500/30',
  pending: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  cancelled: 'text-red-400 bg-red-500/20 border-red-500/30',
  completed: 'text-blue-400 bg-blue-500/20 border-blue-500/30'
};

function BookingsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  const successId = searchParams.get('success');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (successId) {
      toast.success('Booking confirmed successfully!');
    }
  }, [successId]);

  const fetchBookings = async () => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setLoading(false);
  };

  const canCancel = (booking) => {
    if (booking.status !== 'confirmed') return false;
    
    const bookingDate = parseISO(`${booking.date}T${booking.timeSlot}`);
    const cancelDeadline = subHours(bookingDate, 2);
    return isAfter(cancelDeadline, new Date());
  };

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });

      // Send cancellation email
      const booking = bookings.find(b => b.id === bookingId);
      try {
        await fetch('/api/email/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            type: 'cancellation',
            booking
          })
        });
      } catch (emailError) {
        console.error('Email failed:', emailError);
      }

      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to cancel booking');
    }
    setCancellingId(null);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Your Bookings..." />;
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
            <p className="font-mono text-primary text-sm tracking-[0.3em] uppercase mb-4">
              // YOUR BOOKINGS
            </p>
            <h1 className="font-orbitron font-bold text-4xl md:text-5xl uppercase tracking-tight mb-4">
              My <span className="text-primary">Bookings</span>
            </h1>
          </motion.div>

          {/* Filter */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 font-mono text-sm uppercase tracking-wider whitespace-nowrap transition-all ${
                  filter === status 
                    ? 'bg-primary text-black' 
                    : 'border border-white/10 hover:border-primary/50'
                }`}
                data-testid={`filter-${status}`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-white/10 bg-background-paper"
            >
              <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="font-orbitron font-bold text-2xl mb-2">No Bookings Found</h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'all' ? "You haven't made any bookings yet" : `No ${filter} bookings`}
              </p>
              <button
                onClick={() => router.push('/zones')}
                className="btn-skew px-8 py-4 bg-primary text-black font-orbitron font-bold uppercase tracking-widest hover:shadow-neon transition-all"
              >
                <span>Book Now</span>
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 border border-white/10 bg-background-paper hover:border-primary/30 transition-colors"
                  data-testid={`booking-${booking.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-rajdhani font-bold text-xl uppercase tracking-wider">
                          {booking.gameName}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-mono uppercase border ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-6 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-sm">{booking.zoneName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-sm font-mono">
                            {format(parseISO(booking.date), 'dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-mono">
                            {booking.timeSlot} ({booking.duration}hr)
                          </span>
                        </div>
                      </div>

                      {booking.cafeItems && booking.cafeItems.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <p className="text-sm text-muted-foreground">
                            Cafe: {booking.cafeItems.map(item => `${item.name} x${item.quantity}`).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-orbitron font-bold text-2xl text-accent">
                          ₹{booking.totalAmount}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono uppercase">
                          {booking.paymentMethod === 'cash' ? 'Pay at Venue' : 'Paid Online'}
                        </p>
                      </div>

                      {canCancel(booking) && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="flex items-center gap-2 px-4 py-2 border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors text-sm font-rajdhani font-semibold uppercase"
                          data-testid={`cancel-${booking.id}`}
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading Your Bookings..." />}>
      <BookingsContent />
    </Suspense>
  );
}
