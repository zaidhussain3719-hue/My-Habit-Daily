import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { DEFAULT_LOGO } from '../data/initialData';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white p-8 select-none">
      {/* Top ambient decor */}
      <div className="w-full flex justify-between items-center opacity-60 text-xs font-mono tracking-widest text-emerald-300">
        <span>MY HABIT DAILY</span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          MATERIAL 3
        </span>
      </div>

      {/* Main animated center */}
      <div className="flex flex-col items-center text-center my-auto">
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          {/* Glowing halo background */}
          <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />

          {/* Logo container */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-3xl p-1.5 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-2xl shadow-emerald-900/50 flex items-center justify-center">
            <img
              src={DEFAULT_LOGO}
              alt="My Habit Daily Logo"
              className="w-full h-full object-cover rounded-2xl shadow-inner"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 font-display"
        >
          My Habit Daily
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="text-emerald-200/80 text-sm md:text-base font-medium max-w-xs"
        >
          Build better habits, one day at a time
        </motion.p>
      </div>

      {/* Bottom loading bar & footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-xs flex flex-col items-center gap-3"
      >
        <div className="w-full h-1.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/40">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full shadow-lg shadow-emerald-400/50"
          />
        </div>
        <span className="text-xs text-emerald-400/70 font-medium">Securing Cloud Sync & Streaks...</span>
      </motion.div>
    </div>
  );
};
