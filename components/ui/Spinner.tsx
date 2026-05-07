'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(
        'h-5 w-5 rounded-full border-2 border-accent-500 border-t-transparent',
        className,
      )}
      aria-label="Cargando"
    />
  );
}
