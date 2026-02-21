'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Database, Loader2, CheckCircle, AlertCircle, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

const seedData = {
  gamingZones: [
    {
      name: 'NeonNexus Central',
      area: 'Connaught Place',
      city: 'Delhi',
      address: 'Block A, CP',
      phone: '+91 98765 43210',
      email: 'central@neonnexus.com',
      timing: '10:00 AM - 12:00 AM',
      image: 'https://images.pexels.com/photos/28471428/pexels-photo-28471428.jpeg',
      isOpen: true,
      rating: 4.8,
      startingPrice: 300,
      games: ['Pickleball', 'Snooker', 'Bowling'],
      description: 'Our flagship gaming zone in the heart of Delhi. State-of-the-art facilities with professional equipment.'
    },
    {
      name: 'NeonNexus South',
      area: 'Koramangala',
      city: 'Bangalore',
      address: '5th Block, Koramangala',
      phone: '+91 98765 43211',
      email: 'south@neonnexus.com',
      timing: '9:00 AM - 11:00 PM',
      image: 'https://images.pexels.com/photos/7862374/pexels-photo-7862374.jpeg',
      isOpen: true,
      rating: 4.6,
      startingPrice: 250,
      games: ['Pickleball', 'Table Tennis', 'Pool'],
      description: 'Premium gaming experience in the tech hub of India. Perfect for corporate events and casual gaming.'
    },
    {
      name: 'NeonNexus West',
      area: 'Bandra',
      city: 'Mumbai',
      address: 'Hill Road, Bandra West',
      phone: '+91 98765 43212',
      email: 'west@neonnexus.com',
      timing: '10:00 AM - 1:00 AM',
      image: 'https://images.pexels.com/photos/12789438/pexels-photo-12789438.jpeg',
      isOpen: true,
      rating: 4.9,
      startingPrice: 400,
      games: ['Bowling', 'Snooker', 'Pickleball'],
      description: 'The ultimate gaming destination in Mumbai. Featuring neon-lit bowling alleys and premium snooker tables.'
    }
  ],
  games: [
    { name: 'Pickleball', pricePerHour: 400, description: 'Fast-paced paddle sport combining elements of tennis, badminton, and ping-pong.' },
    { name: 'Snooker', pricePerHour: 300, description: 'Classic cue sport played on a large green baize-covered table.' },
    { name: 'Bowling', pricePerHour: 350, description: 'Lane-based sport where players roll a ball to knock down pins.' },
    { name: 'Table Tennis', pricePerHour: 200, description: 'Fast-paced racket sport played on a divided table.' },
    { name: 'Pool', pricePerHour: 250, description: '8-ball and 9-ball pool on professional tables.' }
  ],
  cafeMenu: [
    { name: 'Classic Burger', category: 'Food', price: 180, description: 'Juicy beef patty with fresh veggies' },
    { name: 'Margherita Pizza', category: 'Food', price: 250, description: 'Classic tomato and mozzarella' },
    { name: 'French Fries', category: 'Snacks', price: 120, description: 'Crispy golden fries with dipping sauce' },
    { name: 'Nachos', category: 'Snacks', price: 150, description: 'Tortilla chips with cheese and salsa' },
    { name: 'Chicken Wings', category: 'Snacks', price: 220, description: 'Spicy buffalo wings' },
    { name: 'Coca Cola', category: 'Beverages', price: 60, description: '330ml can' },
    { name: 'Red Bull', category: 'Beverages', price: 150, description: '250ml energy drink' },
    { name: 'Fresh Lime Soda', category: 'Beverages', price: 80, description: 'Refreshing lime with soda' },
    { name: 'Cappuccino', category: 'Coffee', price: 120, description: 'Classic Italian coffee' },
    { name: 'Cold Coffee', category: 'Coffee', price: 140, description: 'Iced coffee with cream' }
  ]
};

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [completed, setCompleted] = useState(false);

  const addStatus = (message, type = 'info') => {
    setStatus(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const seedDatabase = async () => {
    setLoading(true);
    setStatus([]);
    setCompleted(false);

    try {
      // Create Admin User
      addStatus('Creating admin user...');
      try {
        const adminCred = await createUserWithEmailAndPassword(auth, 'admin@neonnexus.com', 'admin123');
        await updateProfile(adminCred.user, { displayName: 'Admin User' });
        await setDoc(doc(db, 'users', adminCred.user.uid), {
          uid: adminCred.user.uid,
          email: 'admin@neonnexus.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        addStatus('Admin user created: admin@neonnexus.com / admin123', 'success');
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          addStatus('Admin user already exists', 'info');
        } else {
          throw authError;
        }
      }

      // Seed Gaming Zones
      addStatus('Seeding gaming zones...');
      const zoneIds = [];
      for (const zone of seedData.gamingZones) {
        const zoneRef = await addDoc(collection(db, 'gamingZones'), {
          ...zone,
          createdAt: new Date().toISOString()
        });
        zoneIds.push({ id: zoneRef.id, name: zone.name, games: zone.games });
        addStatus(`Created zone: ${zone.name}`, 'success');
      }

      // Seed Games for each zone
      addStatus('Seeding games...');
      for (const zone of zoneIds) {
        for (const gameName of zone.games) {
          const gameData = seedData.games.find(g => g.name === gameName);
          if (gameData) {
            await addDoc(collection(db, 'games'), {
              ...gameData,
              zoneId: zone.id,
              zoneName: zone.name,
              createdAt: new Date().toISOString()
            });
            addStatus(`Added ${gameName} to ${zone.name}`, 'success');
          }
        }
      }

      // Seed Cafe Menu for each zone
      addStatus('Seeding cafe menu...');
      for (const zone of zoneIds) {
        for (const item of seedData.cafeMenu) {
          await addDoc(collection(db, 'cafeMenu'), {
            ...item,
            zoneId: zone.id,
            zoneName: zone.name,
            isAvailable: true,
            createdAt: new Date().toISOString()
          });
        }
        addStatus(`Added cafe menu to ${zone.name}`, 'success');
      }

      addStatus('Database seeding completed!', 'success');
      setCompleted(true);
    } catch (error) {
      console.error('Seed error:', error);
      addStatus(`Error: ${error.message}`, 'error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <Gamepad2 className="w-10 h-10 text-primary" />
            <span className="font-orbitron font-bold text-2xl tracking-wider">
              <span className="text-primary">NEON</span>
              <span className="text-white">NEXUS</span>
            </span>
          </Link>
          
          <h1 className="font-orbitron font-bold text-3xl uppercase tracking-tight mb-4">
            Database <span className="text-primary">Seeder</span>
          </h1>
          <p className="text-muted-foreground">
            Initialize the database with sample gaming zones, games, and cafe items
          </p>
        </div>

        <div className="p-6 border border-white/10 bg-background-paper mb-6">
          <h3 className="font-rajdhani font-bold text-lg uppercase tracking-wider mb-4">
            What will be created:
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span> 3 Gaming Zones (Delhi, Bangalore, Mumbai)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span> 5 Games (Pickleball, Snooker, Bowling, etc.)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span> 10 Cafe Menu Items
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span> Admin Account (admin@neonnexus.com / admin123)
            </li>
          </ul>
        </div>

        {status.length > 0 && (
          <div className="p-4 border border-white/10 bg-black/50 mb-6 max-h-80 overflow-y-auto font-mono text-sm">
            {status.map((s, i) => (
              <div key={i} className={`flex items-start gap-2 py-1 ${
                s.type === 'success' ? 'text-green-400' : 
                s.type === 'error' ? 'text-red-400' : 'text-muted-foreground'
              }`}>
                <span className="text-gray-600">[{s.time}]</span>
                {s.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5" />}
                {s.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5" />}
                <span>{s.message}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={seedDatabase}
            disabled={loading}
            className="flex-1 btn-skew py-4 bg-primary text-black font-orbitron font-bold uppercase tracking-widest hover:shadow-neon-lg transition-all duration-300 disabled:opacity-50"
            data-testid="seed-database-btn"
          >
            <span className="flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Seed Database
                </>
              )}
            </span>
          </button>

          {completed && (
            <Link
              href="/zones"
              className="btn-skew px-8 py-4 border border-primary/50 text-primary font-orbitron font-bold uppercase tracking-widest hover:bg-primary/10 transition-all duration-300"
            >
              <span>View Zones</span>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
