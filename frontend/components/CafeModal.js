'use client';

import { motion } from 'framer-motion';
import { X, Plus, Minus, Coffee, UtensilsCrossed, GlassWater } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const categoryIcons = {
  'Snacks': UtensilsCrossed,
  'Beverages': GlassWater,
  'Coffee': Coffee,
  'Food': UtensilsCrossed,
};

export default function CafeModal({ isOpen, onClose, zoneId, onAddItems, existingItems = [] }) {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && zoneId) {
      fetchMenuItems();
    }
  }, [isOpen, zoneId]);

  useEffect(() => {
    // Initialize cart with existing items
    const initialCart = {};
    existingItems.forEach(item => {
      initialCart[item.id] = item.quantity;
    });
    setCart(initialCart);
  }, [existingItems]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cafeMenu'), where('zoneId', '==', zoneId));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
    setLoading(false);
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const getTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, qty]) => {
      const item = menuItems.find(m => m.id === itemId);
      return total + (item?.price || 0) * qty;
    }, 0);
  };

  const handleConfirm = () => {
    const selectedItems = Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(m => m.id === itemId);
      return { ...item, quantity };
    }).filter(item => item.quantity > 0);
    
    onAddItems(selectedItems);
    onClose();
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[80vh] bg-background-paper border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Coffee className="w-6 h-6 text-accent" />
            <h2 className="font-orbitron font-bold text-xl uppercase tracking-wider">
              Cafe Menu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          ) : Object.keys(groupedItems).length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No menu items available</p>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => {
              const IconComponent = categoryIcons[category] || UtensilsCrossed;
              return (
                <div key={category} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <h3 className="font-rajdhani font-bold text-lg uppercase tracking-wider text-primary">
                      {category}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-black/40 border border-white/5 hover:border-primary/30 transition-colors"
                      >
                        <div>
                          <h4 className="font-rajdhani font-semibold">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          <p className="text-accent font-mono text-sm mt-1">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={!cart[item.id]}
                            className="w-8 h-8 flex items-center justify-center border border-white/20 hover:border-secondary hover:text-secondary transition-colors disabled:opacity-30"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-mono w-8 text-center">{cart[item.id] || 0}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center border border-white/20 hover:border-primary hover:text-primary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Items: {Object.values(cart).reduce((a, b) => a + b, 0)}</p>
              <p className="font-orbitron font-bold text-xl text-accent">₹{getTotal()}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-white/20 font-rajdhani font-semibold uppercase tracking-wider hover:bg-white/5 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleConfirm}
                className="btn-skew px-6 py-3 bg-primary text-black font-orbitron font-bold uppercase tracking-widest hover:shadow-neon transition-all"
              >
                <span>Add to Booking</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
