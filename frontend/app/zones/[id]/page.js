'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MapPin, Clock, Star, Phone, Mail, ArrowLeft, 
  Target, Joystick, Ghost, Waves, CircleDot, 
  ChevronLeft, ChevronRight, Coffee, Calendar
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import LoadingScreen from '@/components/LoadingScreen';
import Link from 'next/link';

const gameIcons = {
  'Pickleball': Target,
  'Snooker': CircleDot,
  'Bowling': Ghost,
  'Pool': Waves,
  'Table Tennis': Joystick,
  'default': Target
};

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [zone, setZone] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchZoneDetails();
    }
  }, [params.id]);

  const fetchZoneDetails = async () => {
    try {
      // Fetch zone details
      const zoneDoc = await getDoc(doc(db, 'gamingZones', params.id));
      if (zoneDoc.exists()) {
        setZone({ id: zoneDoc.id, ...zoneDoc.data() });
      }

      // Fetch games for this zone
      const gamesQuery = query(collection(db, 'games'), where('zoneId', '==', params.id));
      const gamesSnapshot = await getDocs(gamesQuery);
      const gamesData = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching zone:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingScreen message="Loading Zone Details..." />;
  }

  if (!zone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-orbitron font-bold text-2xl mb-4">Zone Not Found</h2>
          <Link href="/zones" className="text-primary hover:underline">
            Back to Zones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${zone.image || 'https://images.pexels.com/photos/28471428/pexels-photo-28471428.jpeg'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-12 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-mono text-sm uppercase tracking-wider">Back to Zones</span>
              </button>

              <div className="flex items-start justify-between flex-wrap gap-6">
                <div>
                  <h1 className="font-orbitron font-black text-4xl md:text-5xl uppercase tracking-tight mb-4">
                    {zone.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="font-mono">{zone.address}, {zone.area}, {zone.city}</span>
                    </div>
                    {zone.rating && (
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-mono">{zone.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`px-4 py-2 font-mono uppercase tracking-wider ${
                  zone.isOpen ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {zone.isOpen ? 'Open Now' : 'Currently Closed'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="font-orbitron font-bold text-2xl uppercase tracking-wider mb-4 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary" />
                About
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {zone.description || 'Experience premium gaming at this state-of-the-art facility. Featuring multiple game options, a comfortable atmosphere, and professional equipment for the ultimate gaming experience.'}
              </p>
            </motion.section>

            {/* Games Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-orbitron font-bold text-2xl uppercase tracking-wider mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary" />
                Available Games
              </h2>

              {games.length === 0 ? (
                <div className="text-center py-12 border border-white/10 bg-background-paper">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No games available at this moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {games.map((game, index) => {
                    const IconComponent = gameIcons[game.name] || gameIcons.default;
                    return (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <Link
                          href={`/book/${game.id}?zone=${params.id}`}
                          className="block group"
                          data-testid={`game-card-${game.id}`}
                        >
                          <div className="p-6 border border-white/10 hover:border-primary/50 bg-background-paper transition-all duration-300 group-hover:shadow-neon">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 flex items-center justify-center border border-primary/30 bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                <IconComponent className="w-7 h-7 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-rajdhani font-bold text-xl uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">
                                  {game.name}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                  {game.description || 'Experience premium gaming with professional equipment'}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-accent font-mono">
                                    ₹{game.pricePerHour}/hr
                                  </span>
                                  <span className="text-sm text-primary font-rajdhani font-semibold uppercase flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                                    Book <ChevronRight className="w-4 h-4" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24 space-y-6"
            >
              {/* Info Card */}
              <div className="p-6 border border-white/10 bg-background-paper">
                <h3 className="font-orbitron font-bold text-lg uppercase tracking-wider mb-6">
                  Zone Info
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Timing</p>
                      <p className="font-mono">{zone.timing || '10:00 AM - 12:00 AM'}</p>
                    </div>
                  </div>
                  
                  {zone.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact</p>
                        <p className="font-mono">{zone.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {zone.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                        <p className="font-mono text-sm">{zone.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cafe Card */}
              <div className="p-6 border border-white/10 bg-background-paper">
                <div className="flex items-center gap-3 mb-4">
                  <Coffee className="w-6 h-6 text-accent" />
                  <h3 className="font-orbitron font-bold text-lg uppercase tracking-wider">
                    Cafe Available
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Add snacks and beverages to your booking!
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  *Optional add-on during checkout
                </p>
              </div>

              {/* Guidelines */}
              <div className="p-6 border border-white/10 bg-background-paper">
                <h3 className="font-orbitron font-bold text-lg uppercase tracking-wider mb-4">
                  Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Arrive 10 minutes before your slot
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Wear appropriate footwear
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Equipment provided on-site
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Cancellation allowed up to 2 hours before
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
