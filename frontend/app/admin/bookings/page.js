'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calendar, ArrowLeft, Search, Filter, Eye, 
  CheckCircle, XCircle, Clock, Loader2
} from 'lucide-react';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const statusColors = {
  confirmed: 'text-green-400 bg-green-500/20 border-green-500/30',
  pending: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  cancelled: 'text-red-400 bg-red-500/20 border-red-500/30',
  completed: 'text-blue-400 bg-blue-500/20 border-blue-500/30'
};

export default function AdminBookingsPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'admin') {
        router.push('/login');
        return;
      }
      fetchBookings();
    }
  }, [user, userRole, authLoading]);

  const fetchBookings = async () => {
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (bookingId, status) => {
    setUpdatingId(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
    setUpdatingId(null);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.gameName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.zoneName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Bookings..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/10 bg-background-paper">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="font-mono text-primary text-xs tracking-[0.2em] uppercase">Admin</p>
              <h1 className="font-orbitron font-bold text-xl uppercase tracking-tight">
                All Bookings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user, game, zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 font-mono text-sm uppercase tracking-wider whitespace-nowrap transition-all ${
                  statusFilter === status 
                    ? 'bg-primary text-black' 
                    : 'border border-white/10 hover:border-primary/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 border border-white/10 bg-background-paper">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="font-orbitron font-bold text-2xl mb-2">No Bookings Found</h3>
          </div>
        ) : (
          <div className="border border-white/10 bg-background-paper overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Game</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Zone</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Date & Time</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Payment</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <motion.tr 
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-rajdhani font-semibold">{booking.userName}</p>
                          <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-4 font-rajdhani">{booking.gameName}</td>
                      <td className="p-4 text-muted-foreground text-sm">{booking.zoneName}</td>
                      <td className="p-4">
                        <p className="font-mono text-sm">{booking.date}</p>
                        <p className="text-xs text-muted-foreground">{booking.timeSlot} ({booking.duration}hr)</p>
                      </td>
                      <td className="p-4 font-mono text-accent">₹{booking.totalAmount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-mono uppercase ${
                          booking.paymentMethod === 'online' ? 'text-green-400 bg-green-500/20' : 'text-yellow-400 bg-yellow-500/20'
                        }`}>
                          {booking.paymentMethod === 'online' ? 'Paid' : 'Cash'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-mono uppercase border ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {booking.status === 'confirmed' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(booking.id, 'completed')}
                              disabled={updatingId === booking.id}
                              className="p-2 border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
                              title="Mark Complete"
                            >
                              {updatingId === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => updateStatus(booking.id, 'cancelled')}
                              disabled={updatingId === booking.id}
                              className="p-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            disabled={updatingId === booking.id}
                            className="p-2 border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                            title="Confirm"
                          >
                            {updatingId === booking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
