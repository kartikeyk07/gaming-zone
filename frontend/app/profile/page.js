'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFormData({
          name: data.name || user.displayName || '',
          email: data.email || user.email || '',
          phone: data.phone || ''
        });
      } else {
        setFormData({
          name: user.displayName || '',
          email: user.email || '',
          phone: ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.name
        });
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        phone: formData.phone,
        updatedAt: new Date().toISOString()
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }

    setSaving(false);
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Profile..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-sm uppercase tracking-wider">Back</span>
            </button>

            <div className="mb-10">
              <p className="font-mono text-primary text-sm tracking-[0.3em] uppercase mb-4">
                // PLAYER PROFILE
              </p>
              <h1 className="font-orbitron font-bold text-4xl uppercase tracking-tight">
                My <span className="text-primary">Profile</span>
              </h1>
            </div>

            <div className="p-8 border border-white/10 bg-background-paper">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-12 pr-4 py-4 bg-black/30 border border-white/5 font-mono text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full btn-skew py-4 bg-primary text-black font-orbitron font-bold uppercase tracking-widest hover:shadow-neon-lg transition-all disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-3">
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
