'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Coffee, Plus, Pencil, Trash2, ArrowLeft, Save, X, 
  Loader2, Search
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';

export default function AdminCafePage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Food',
    price: 100,
    zoneId: '',
    isAvailable: true
  });

  const categories = ['Food', 'Snacks', 'Beverages', 'Coffee'];

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
      const [itemsSnap, zonesSnap] = await Promise.all([
        getDocs(collection(db, 'cafeMenu')),
        getDocs(collection(db, 'gamingZones'))
      ]);
      setItems(itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      const itemData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        zoneId: formData.zoneId,
        zoneName: zone?.name || '',
        isAvailable: formData.isAvailable,
        updatedAt: new Date().toISOString()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'cafeMenu', editingItem.id), itemData);
        toast.success('Item updated successfully');
      } else {
        itemData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'cafeMenu'), itemData);
        toast.success('Item created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }

    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'Food',
      price: item.price || 100,
      zoneId: item.zoneId || '',
      isAvailable: item.isAvailable ?? true
    });
    setShowModal(true);
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteDoc(doc(db, 'cafeMenu', itemId));
      toast.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'Food',
      price: 100,
      zoneId: '',
      isAvailable: true
    });
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.zoneName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Cafe Menu..." />;
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
                  Cafe Menu
                </h1>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn-skew flex items-center gap-2 px-6 py-3 bg-primary text-black font-orbitron font-bold text-sm uppercase tracking-widest hover:shadow-neon transition-all"
              data-testid="add-item-btn"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Item
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
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
          />
        </div>

        {/* Items Table */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 border border-white/10 bg-background-paper">
            <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="font-orbitron font-bold text-2xl mb-2">No Items Found</h3>
          </div>
        ) : (
          <div className="border border-white/10 bg-background-paper overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Item</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Category</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Zone</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Price</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-rajdhani font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-mono uppercase bg-accent/10 text-accent">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{item.zoneName}</td>
                      <td className="p-4 font-mono text-accent">₹{item.price}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-mono uppercase ${
                          item.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 border border-white/20 hover:border-primary hover:text-primary transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                  />
                </div>
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 font-mono focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <label htmlFor="isAvailable" className="font-rajdhani font-semibold">
                  Available
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
