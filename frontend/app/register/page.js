'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gamepad2, Mail, Lock, User, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      await register(formData.email, formData.password, formData.name, formData.phone);
      toast.success('Account created successfully!');
      router.push('/zones');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Image */}
      <div 
        className="hidden lg:block flex-1 bg-cover bg-center relative"
        style={{ backgroundImage: 'url(https://images.pexels.com/photos/12789438/pexels-photo-12789438.jpeg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="absolute bottom-20 left-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-orbitron font-bold text-3xl text-white/90"
          >
            JOIN THE<br />ARENA
          </motion.p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <Gamepad2 className="w-10 h-10 text-primary" />
            <span className="font-orbitron font-bold text-2xl tracking-wider">
              <span className="text-primary">NEON</span>
              <span className="text-white">NEXUS</span>
            </span>
          </Link>

          <div className="mb-8">
            <p className="font-mono text-primary text-sm tracking-[0.3em] uppercase mb-4">
              // NEW PLAYER
            </p>
            <h1 className="font-orbitron font-bold text-4xl uppercase tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Register to start booking your games
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 font-mono text-white placeholder:text-gray-600 focus:border-primary transition-colors"
                  data-testid="register-name-input"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="player@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 font-mono text-white placeholder:text-gray-600 focus:border-primary transition-colors"
                  data-testid="register-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 font-mono text-white placeholder:text-gray-600 focus:border-primary transition-colors"
                  data-testid="register-phone-input"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-black/50 border border-white/10 font-mono text-white placeholder:text-gray-600 focus:border-primary transition-colors"
                  data-testid="register-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 font-mono text-white placeholder:text-gray-600 focus:border-primary transition-colors"
                  data-testid="register-confirm-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-skew py-4 bg-primary text-black font-orbitron font-bold uppercase tracking-widest hover:shadow-neon-lg transition-all duration-300 disabled:opacity-50"
              data-testid="register-submit-button"
            >
              <span className="flex items-center justify-center gap-3">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Creating Account...' : 'Start Playing'}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Already a player?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
