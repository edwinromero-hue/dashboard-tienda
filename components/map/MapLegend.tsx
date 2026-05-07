'use client';

import { motion } from 'framer-motion';

export function MapLegend({ max }: { max: number }) {
  if (max <= 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="pointer-events-none absolute bottom-6 left-6 rounded-xl border border-brand-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm"
    >
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
        Tiendas por departamento
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-brand-500">0</span>
        <div className="h-2 w-44 rounded-full bg-gradient-to-r from-accent-100 via-accent-400 to-accent-900" />
        <span className="text-[11px] text-brand-500">{max}+</span>
      </div>
    </motion.div>
  );
}
