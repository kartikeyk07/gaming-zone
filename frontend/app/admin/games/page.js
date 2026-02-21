'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Gamepad2, Plus, Pencil, Trash2, ArrowLeft, Save, X, 
  Loader2, Search
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';

export default function AdminGamesPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerHour: 200,
    zoneId: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'admin') {
        router.push('/login');
        return;
      }
      fetchData();
    }
  }, [user, userRole, authLoading]);

  const fetchData = async () => {
    try {
      const [gamesSnap, zonesSnap] = await Promise.all([
        getDocs(collection(db, 'games')),
        getDocs(collection(db, 'gamingZones'))
      ]);
      setGames(gamesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setZones(zonesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const zone = zones.find(z => z.id === formData.zoneId);

    try {
      const gameData = {
        name: formData.name,
        description: formData.description,
        pricePerHour: Number(formData.pricePerHour),
        zoneId: formData.zoneId,
        zoneName: zone?.name || '',
        updatedAt: new Date().toISOString()
      };

      if (editingGame) {
        await updateDoc(doc(db, 'games', editingGame.id), gameData);
        toast.success('Game updated successfully');
      } else {
        gameData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'games'), gameData);
        toast.success('Game created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error('Failed to save game');
    }

    setSubmitting(false);
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setFormData({
      name: game.name || '',
      description: game.description || '',
      pricePerHour: game.pricePerHour || 200,
      zoneId: game.zoneId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (gameId) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      await deleteDoc(doc(db, 'games', gameId));
      toast.success('Game deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  };

  const resetForm = () => {
    setEditingGame(null);
    setFormData({
      name: '',
      description: '',
      pricePerHour: 200,
      zoneId: ''
    });
  };

  const filteredGames = games.filter(game => 
    game.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.zoneName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Games..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/10 bg-background-paper">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="font-mono text-primary text-xs tracking-[0.2em] uppercase">Admin</p>
                <h1 className="font-orbitron font-bold text-xl uppercase tracking-tight">
                  Games
                </h1>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn-skew flex items-center gap-2 px-6 py-3 bg-primary text-black font-orbitron font-bold text-sm uppercase tracking-widest hover:shadow-neon transition-all"
              data-testid="add-game-btn"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Game
              </span>
            </button>
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
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
          />
        </div>

        {/* Games Table */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-20 border border-white/10 bg-background-paper">
            <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="font-orbitron font-bold text-2xl mb-2">No Games Found</h3>
          </div>
        ) : (
          <div className="border border-white/10 bg-background-paper overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Game</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Zone</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Price/Hour</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGames.map((game, index) => (
                    <motion.tr 
                      key={game.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-rajdhani font-semibold">{game.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{game.description}</p>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{game.zoneName}</td>
                      <td className="p-4 font-mono text-accent">₹{game.pricePerHour}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(game)}
                            className="p-2 border border-white/20 hover:border-primary hover:text-primary transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(game.id)}
                            className="p-2 border border-white/20 hover:border-secondary hover:text-secondary transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-background-paper border border-white/10"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-orbitron font-bold text-xl uppercase tracking-wider">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Game Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Zone *
                </label>
                <select
                  value={formData.zoneId}
                  onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                >
                  <option value="">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Price Per Hour *
                </label>
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-white/20 font-rajdhani font-semibold uppercase hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-skew px-6 py-3 bg-primary text-black font-orbitron font-bold uppercase tracking-widest hover:shadow-neon transition-all disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
