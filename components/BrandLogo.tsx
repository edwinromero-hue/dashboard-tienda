'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useIdleStore } from '@/lib/store/useIdleStore';

export function BrandLogo() {
  const idle = useIdleStore((s) => s.idle);

  return (
    <AnimatePresence mode="wait">
      {idle ? (
        <motion.div
          key="idle-logo"
          initial={{ opacity: 0, y: -16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.9 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="pointer-events-none absolute left-1/2 top-10 z-30 -translate-x-1/2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.BvshXUw1.svg"
            alt="Tu Negocio en Línea"
            className="h-24 w-auto drop-shadow-lg md:h-28"
          />
        </motion.div>
      ) : (
        <motion.div
          key="active-logo"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute right-5 top-5 z-20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.BvshXUw1.svg"
            alt="Tu Negocio en Línea"
            className="h-10 w-auto drop-shadow-sm"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
