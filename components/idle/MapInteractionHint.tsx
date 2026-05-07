'use client';

import { motion } from 'framer-motion';

// CTA central inferior: invita a tocar el mapa.
// Estilo glass oscuro + ícono tap pulsante. Geométricamente centrada.
export function MapInteractionHint() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="pointer-events-none absolute bottom-16 left-1/2 z-30 -translate-x-1/2"
    >
      <div className="relative flex items-center justify-center gap-4 overflow-hidden rounded-full bg-slate-950/65 px-8 py-3.5 backdrop-blur-xl ring-1 ring-white/20 shadow-[0_12px_44px_-10px_rgba(60,160,80,0.6),inset_0_1px_0_rgba(255,255,255,0.18)]">
        {/* Halo verde superior */}
        <div className="pointer-events-none absolute -inset-x-10 -top-6 h-12 bg-gradient-to-b from-accent-400/45 to-transparent blur-2xl" />

        {/* Ícono tap con anillos pulsantes */}
        <span className="relative grid h-7 w-7 shrink-0 place-items-center">
          <motion.span
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full ring-2 ring-accent-300"
          />
          <motion.span
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 2.0, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, delay: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full ring-2 ring-accent-400"
          />
          <motion.span
            animate={{ scale: [1, 0.85, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative h-3 w-3 rounded-full bg-accent-300 shadow-[0_0_12px_rgba(140,198,63,0.95)]"
          />
        </span>

        {/* Texto */}
        <span className="relative whitespace-nowrap text-[15px] font-bold uppercase tracking-[0.18em] text-white drop-shadow">
          Toca para explorar
        </span>
      </div>
    </motion.div>
  );
}
