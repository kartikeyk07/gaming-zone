'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Search, Shield, User, Ban } from 'lucide-react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

export default function AdminUsersPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'admin') {
        router.push('/login');
        return;
      }
      fetchUsers();
    }
  }, [user, userRole, authLoading]);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Users..." />;
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
                Users
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
          />
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20 border border-white/10 bg-background-paper">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="font-orbitron font-bold text-2xl mb-2">No Users Found</h3>
          </div>
        ) : (
          <div className="border border-white/10 bg-background-paper overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">User</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Role</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Joined</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, index) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/30">
                            {u.role === 'admin' ? (
                              <Shield className="w-5 h-5 text-primary" />
                            ) : (
                              <User className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-rajdhani font-semibold">{u.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-mono text-sm">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-mono uppercase ${
                          u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-sm text-muted-foreground">
                        {u.createdAt ? format(parseISO(u.createdAt), 'dd MMM yyyy') : '-'}
                      </td>
                      <td className="p-4">
                        {u.uid !== user?.uid && (
                          <button
                            onClick={() => toggleRole(u.id, u.role)}
                            className="px-4 py-2 text-sm border border-white/20 hover:border-primary hover:text-primary transition-colors font-mono uppercase"
                          >
                            Make {u.role === 'admin' ? 'User' : 'Admin'}
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
