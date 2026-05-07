'use client';

import { motion } from 'framer-motion';
import { useDashboardStore } from '@/lib/store/useDashboardStore';

export function BackToMapButton() {
  const backToMap = useDashboardStore((s) => s.backToMap);
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={backToMap}
      className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm transition hover:border-accent-400 hover:text-accent-700"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
      </svg>
      Volver al mapa
    </motion.button>
  );
}
