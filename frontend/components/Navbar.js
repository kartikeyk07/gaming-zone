'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, userRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Gamepad2 className="w-8 h-8 text-primary" />
            </motion.div>
            <span className="font-orbitron font-bold text-xl tracking-wider">
              <span className="text-primary">NEON</span>
              <span className="text-white">NEXUS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/zones" className="font-rajdhani font-semibold uppercase tracking-wider text-gray-400 hover:text-primary transition-colors">
              Gaming Zones
            </Link>
            {user && (
              <Link href="/bookings" className="font-rajdhani font-semibold uppercase tracking-wider text-gray-400 hover:text-primary transition-colors">
                My Bookings
              </Link>
            )}
            {userRole === 'admin' && (
              <Link href="/admin" className="font-rajdhani font-semibold uppercase tracking-wider text-gray-400 hover:text-secondary transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 border border-primary/30 hover:border-primary transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-rajdhani font-semibold text-sm">{user.displayName || user.email}</span>
                </button>
                
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-12 w-48 glass border border-white/10"
                  >
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="font-rajdhani">Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors text-secondary"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-rajdhani">Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-skew px-6 py-2 bg-primary text-black font-orbitron font-bold text-sm uppercase tracking-widest hover:shadow-neon transition-all duration-300"
              >
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden glass border-t border-white/10"
        >
          <div className="px-6 py-4 space-y-4">
            <Link href="/zones" className="block font-rajdhani font-semibold uppercase tracking-wider text-gray-400 hover:text-primary">
              Gaming Zones
            </Link>
            {user && (
              <Link href="/bookings" className="block font-rajdhani font-semibold uppercase tracking-wider text-gray-400 hover:text-primary">
                My Bookings
              </Link>
            )}
            {userRole === 'admin' && (
              <Link href="/admin" className="block font-rajdhani font-semibold uppercase tracking-wider text-gray-400 hover:text-secondary">
                Admin Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="block font-rajdhani font-semibold uppercase tracking-wider text-secondary"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="block font-rajdhani font-semibold uppercase tracking-wider text-primary">
                Login
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
