'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, MapPin, Gamepad2, Coffee, Users, 
  Calendar, BarChart3, Settings, LogOut, Menu, X,
  ChevronRight, TrendingUp, DollarSign
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { format, subDays, startOfDay } from 'date-fns';

const sidebarLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/zones', icon: MapPin, label: 'Gaming Zones' },
  { href: '/admin/games', icon: Gamepad2, label: 'Games' },
  { href: '/admin/cafe', icon: Coffee, label: 'Cafe Menu' },
  { href: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/admin/users', icon: Users, label: 'Users' },
];

export default function AdminDashboard() {
  const { user, userRole, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalZones: 0,
    totalGames: 0,
    totalBookings: 0,
    totalUsers: 0,
    todayBookings: 0,
    revenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (userRole !== 'admin') {
        router.push('/zones');
        return;
      }
      fetchDashboardData();
    }
  }, [user, userRole, authLoading]);

  const fetchDashboardData = async () => {
    try {
      // Fetch counts
      const [zonesSnap, gamesSnap, bookingsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'gamingZones')),
        getDocs(collection(db, 'games')),
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'users'))
      ]);

      // Calculate today's bookings
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayBookings = bookingsSnap.docs.filter(doc => doc.data().date === today);

      // Calculate revenue
      const totalRevenue = bookingsSnap.docs
        .filter(doc => doc.data().status === 'confirmed')
        .reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);

      setStats({
        totalZones: zonesSnap.size,
        totalGames: gamesSnap.size,
        totalBookings: bookingsSnap.size,
        totalUsers: usersSnap.size,
        todayBookings: todayBookings.length,
        revenue: totalRevenue
      });

      // Fetch recent bookings
      const recentQuery = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentSnap = await getDocs(recentQuery);
      setRecentBookings(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Admin Dashboard..." />;
  }

  const statCards = [
    { label: 'Gaming Zones', value: stats.totalZones, icon: MapPin, color: 'primary' },
    { label: 'Total Games', value: stats.totalGames, icon: Gamepad2, color: 'secondary' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'accent' },
    { label: 'Today\'s Bookings', value: stats.todayBookings, icon: TrendingUp, color: 'primary' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'secondary' },
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'accent' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-background-paper border border-white/10"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-background-paper border-r border-white/10 z-40 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <span className="font-orbitron font-bold text-lg tracking-wider">
              <span className="text-primary">NEON</span>
              <span className="text-white">NEXUS</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground mt-2 font-mono uppercase tracking-wider">
            Admin Panel
          </p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                    link.href === '/admin' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-rajdhani font-semibold">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-secondary hover:bg-secondary/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-rajdhani font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-10">
            <p className="font-mono text-primary text-sm tracking-[0.3em] uppercase mb-2">
              // ADMIN DASHBOARD
            </p>
            <h1 className="font-orbitron font-bold text-3xl md:text-4xl uppercase tracking-tight">
              Welcome, <span className="text-primary">{user?.displayName || 'Admin'}</span>
            </h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 border border-white/10 bg-background-paper hover:border-${stat.color}/30 transition-colors`}
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-8 h-8 text-${stat.color}`} />
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="font-orbitron font-bold text-3xl">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div className="border border-white/10 bg-background-paper">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-orbitron font-bold text-lg uppercase tracking-wider">
                Recent Bookings
              </h2>
              <Link href="/admin/bookings" className="text-primary text-sm font-rajdhani font-semibold hover:underline">
                View All
              </Link>
            </div>
            
            {recentBookings.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No bookings yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">User</th>
                      <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Game</th>
                      <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Zone</th>
                      <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Amount</th>
                      <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(booking => (
                      <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4 font-rajdhani">{booking.userName || booking.userEmail}</td>
                        <td className="p-4 font-rajdhani">{booking.gameName}</td>
                        <td className="p-4 text-muted-foreground text-sm">{booking.zoneName}</td>
                        <td className="p-4 font-mono text-sm">{booking.date} {booking.timeSlot}</td>
                        <td className="p-4 font-mono text-accent">₹{booking.totalAmount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-mono uppercase ${
                            booking.status === 'confirmed' ? 'text-green-400 bg-green-500/20' :
                            booking.status === 'cancelled' ? 'text-red-400 bg-red-500/20' :
                            'text-yellow-400 bg-yellow-500/20'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
