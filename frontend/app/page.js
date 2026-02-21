'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Gamepad2, MapPin, Zap, Trophy, Clock, Users, ArrowRight, Joystick, Target, Ghost } from 'lucide-react';
import Navbar from '@/components/Navbar';

const features = [
  { icon: Zap, title: 'Instant Booking', description: 'Book your slot in seconds with real-time availability' },
  { icon: Trophy, title: 'Multiple Games', description: 'Pickleball, Snooker, Bowling, and more' },
  { icon: Clock, title: 'Flexible Slots', description: 'Choose from morning to midnight slots' },
  { icon: Users, title: 'Group Bookings', description: 'Perfect for parties and corporate events' },
];

const games = [
  { icon: Target, name: 'Pickleball', color: 'primary' },
  { icon: Joystick, name: 'Snooker', color: 'secondary' },
  { icon: Ghost, name: 'Bowling', color: 'accent' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/28471428/pexels-photo-28471428.jpeg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-primary text-sm tracking-[0.3em] uppercase mb-6">
              // THE ULTIMATE GAMING EXPERIENCE
            </p>
            <h1 className="font-orbitron font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none mb-6">
              <span className="text-white">BOOK YOUR</span>
              <br />
              <span className="neon-text text-primary">GAME NOW</span>
            </h1>
            <p className="font-rajdhani text-xl md:text-2xl text-gray-400 max-w-xl mb-10">
              Experience premium gaming at our state-of-the-art facilities. 
              Multiple locations, endless fun.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/zones"
                className="btn-skew inline-flex items-center gap-3 px-8 py-4 bg-primary text-black font-orbitron font-bold uppercase tracking-widest hover:shadow-neon-lg transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  Explore Zones
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
              <Link
                href="/login"
                className="btn-skew inline-flex items-center gap-3 px-8 py-4 border border-primary/50 text-primary font-orbitron font-bold uppercase tracking-widest hover:bg-primary/10 transition-all duration-300"
              >
                <span>Get Started</span>
              </Link>
            </div>
          </motion.div>

          {/* Floating Game Icons */}
          <div className="absolute right-10 top-1/3 hidden lg:flex flex-col gap-6">
            {games.map((game, i) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className={`w-16 h-16 flex items-center justify-center border border-${game.color}/30 bg-black/50 backdrop-blur-sm hover:border-${game.color} transition-colors group`}
              >
                <game.icon className={`w-8 h-8 text-${game.color} group-hover:scale-110 transition-transform`} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-background-paper">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="font-mono text-primary text-sm tracking-[0.3em] uppercase mb-4">
              // WHY CHOOSE US
            </p>
            <h2 className="font-orbitron font-bold text-4xl md:text-5xl uppercase tracking-tight">
              Level Up Your <span className="text-primary">Experience</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-black/60 border border-white/5 hover:border-primary/30 transition-all duration-300"
              >
                <feature.icon className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-rajdhani font-bold text-xl uppercase tracking-wider mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Gamepad2 className="w-16 h-16 text-primary mx-auto mb-8" />
            <h2 className="font-orbitron font-bold text-4xl md:text-5xl uppercase tracking-tight mb-6">
              Ready to <span className="neon-text-red text-secondary">Play?</span>
            </h2>
            <p className="font-rajdhani text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Find the nearest gaming zone, pick your game, and book your slot in minutes.
            </p>
            <Link
              href="/zones"
              className="btn-skew inline-flex items-center gap-3 px-10 py-5 bg-primary text-black font-orbitron font-bold text-lg uppercase tracking-widest hover:shadow-neon-lg transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                Find Gaming Zones
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-6 h-6 text-primary" />
              <span className="font-orbitron font-bold tracking-wider">
                <span className="text-primary">NEON</span>
                <span className="text-white">NEXUS</span>
              </span>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              © 2026 NeonNexus Gaming. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
