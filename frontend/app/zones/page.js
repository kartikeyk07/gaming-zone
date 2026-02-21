'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, ArrowRight, Search, Filter, Gamepad2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import LoadingScreen from '@/components/LoadingScreen';

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'gamingZones'));
      const zonesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setZones(zonesData);
      
      // Extract unique cities
      const uniqueCities = [...new Set(zonesData.map(z => z.city).filter(Boolean))];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
    setLoading(false);
  };

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.area?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'all' || zone.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  if (loading) {
    return <LoadingScreen message="Loading Gaming Zones..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <p className="font-mono text-primary text-sm tracking-[0.3em] uppercase mb-4">
              // SELECT YOUR ARENA
            </p>
            <h1 className="font-orbitron font-bold text-4xl md:text-5xl uppercase tracking-tight mb-4">
              Gaming <span className="text-primary">Zones</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Choose from our premium gaming facilities across multiple locations
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 font-mono text-white placeholder:text-gray-600 focus:border-primary transition-colors"
                data-testid="zones-search-input"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="pl-12 pr-8 py-3 bg-black/50 border border-white/10 font-mono text-white focus:border-primary transition-colors appearance-none cursor-pointer min-w-[180px]"
                data-testid="zones-city-filter"
              >
                <option value="all">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Zones Grid */}
          {filteredZones.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="font-orbitron font-bold text-2xl mb-2">No Zones Found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredZones.map((zone, index) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/zones/${zone.id}`}
                    className="block group"
                    data-testid={`zone-card-${zone.id}`}
                  >
                    <div className="relative overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 bg-background-paper">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={zone.image || 'https://images.pexels.com/photos/28471428/pexels-photo-28471428.jpeg'}
                          alt={zone.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-paper via-transparent to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 text-xs font-mono uppercase tracking-wider ${
                            zone.isOpen ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {zone.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-rajdhani font-bold text-xl uppercase tracking-wider group-hover:text-primary transition-colors">
                            {zone.name}
                          </h3>
                          {zone.rating && (
                            <div className="flex items-center gap-1 text-accent">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-mono text-sm">{zone.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-sm font-mono">{zone.area}, {zone.city}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-mono">{zone.timing || '10:00 AM - 12:00 AM'}</span>
                        </div>

                        {/* Games Tags */}
                        {zone.games && zone.games.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {zone.games.slice(0, 3).map(game => (
                              <span 
                                key={game} 
                                className="px-2 py-1 text-xs font-mono uppercase bg-primary/10 text-primary border border-primary/20"
                              >
                                {game}
                              </span>
                            ))}
                            {zone.games.length > 3 && (
                              <span className="px-2 py-1 text-xs font-mono text-muted-foreground">
                                +{zone.games.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground font-mono">
                            From ₹{zone.startingPrice || 200}/hr
                          </span>
                          <span className="flex items-center gap-2 text-primary font-rajdhani font-semibold uppercase text-sm group-hover:translate-x-2 transition-transform">
                            Book Now <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
