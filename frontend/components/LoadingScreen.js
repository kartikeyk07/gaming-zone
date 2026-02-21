'use client';

import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      {/* Animated Game Controller */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-8"
      >
        <Gamepad2 className="w-20 h-20 text-primary" />
      </motion.div>

      {/* Loading Dots */}
      <div className="loading-dots mb-4">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-rajdhani text-lg text-muted-foreground tracking-wider uppercase"
      >
        {message}
      </motion.p>

      {/* Neon Lines */}
      <div className="absolute bottom-0 left-0 right-0 h-1">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
