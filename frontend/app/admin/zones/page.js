'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MapPin, Plus, Pencil, Trash2, ArrowLeft, Save, X, 
  Loader2, Gamepad2, Menu, Search
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';

export default function AdminZonesPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    timing: '',
    image: '',
    description: '',
    isOpen: true,
    startingPrice: 200
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'admin') {
        router.push('/login');
        return;
      }
      fetchZones();
    }
  }, [user, userRole, authLoading]);

  const fetchZones = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'gamingZones'));
      setZones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const zoneData = {
        ...formData,
        startingPrice: Number(formData.startingPrice),
        updatedAt: new Date().toISOString()
      };

      if (editingZone) {
        await updateDoc(doc(db, 'gamingZones', editingZone.id), zoneData);
        toast.success('Zone updated successfully');
      } else {
        zoneData.createdAt = new Date().toISOString();
        zoneData.rating = 0;
        zoneData.games = [];
        await addDoc(collection(db, 'gamingZones'), zoneData);
        toast.success('Zone created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchZones();
    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error('Failed to save zone');
    }

    setSubmitting(false);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name || '',
      area: zone.area || '',
      city: zone.city || '',
      address: zone.address || '',
      phone: zone.phone || '',
      email: zone.email || '',
      timing: zone.timing || '',
      image: zone.image || '',
      description: zone.description || '',
      isOpen: zone.isOpen ?? true,
      startingPrice: zone.startingPrice || 200
    });
    setShowModal(true);
  };

  const handleDelete = async (zoneId) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;

    try {
      await deleteDoc(doc(db, 'gamingZones', zoneId));
      toast.success('Zone deleted successfully');
      fetchZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone');
    }
  };

  const resetForm = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      area: '',
      city: '',
      address: '',
      phone: '',
      email: '',
      timing: '',
      image: '',
      description: '',
      isOpen: true,
      startingPrice: 200
    });
  };

  const filteredZones = zones.filter(zone => 
    zone.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Zones..." />;
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
                  Gaming Zones
                </h1>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn-skew flex items-center gap-2 px-6 py-3 bg-primary text-black font-orbitron font-bold text-sm uppercase tracking-widest hover:shadow-neon transition-all"
              data-testid="add-zone-btn"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Zone
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
            placeholder="Search zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
          />
        </div>

        {/* Zones Grid */}
        {filteredZones.length === 0 ? (
          <div className="text-center py-20 border border-white/10 bg-background-paper">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="font-orbitron font-bold text-2xl mb-2">No Zones Found</h3>
            <p className="text-muted-foreground mb-6">Add your first gaming zone</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredZones.map((zone, index) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-white/10 bg-background-paper hover:border-primary/30 transition-colors"
                data-testid={`zone-item-${zone.id}`}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={zone.image || 'https://images.pexels.com/photos/28471428/pexels-photo-28471428.jpeg'}
                    alt={zone.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-paper to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-mono uppercase ${
                      zone.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {zone.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-rajdhani font-bold text-lg uppercase tracking-wider mb-2">
                    {zone.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {zone.area}, {zone.city}
                  </p>
                  <p className="text-accent font-mono text-sm mb-4">
                    From ₹{zone.startingPrice}/hr
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-white/20 hover:border-primary hover:text-primary transition-colors"
                      data-testid={`edit-zone-${zone.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="flex items-center justify-center px-4 py-2 border border-white/20 hover:border-secondary hover:text-secondary transition-colors"
                      data-testid={`delete-zone-${zone.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background-paper border border-white/10"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-background-paper z-10">
              <h2 className="font-orbitron font-bold text-xl uppercase tracking-wider">
                {editingZone ? 'Edit Zone' : 'Add New Zone'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Zone Name *
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
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Area *
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Timing
                  </label>
                  <input
                    type="text"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    placeholder="10:00 AM - 12:00 AM"
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Starting Price
                  </label>
                  <input
                    type="number"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isOpen"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <label htmlFor="isOpen" className="font-rajdhani font-semibold">
                  Zone is Open
                </label>
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
                    {submitting ? 'Saving...' : 'Save Zone'}
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
