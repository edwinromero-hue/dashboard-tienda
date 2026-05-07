'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Producto } from '@/types/domain';
import { formatCOP } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';

const variants = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
};

export function ProductCard({ producto }: { producto: Producto }) {
  return (
    <motion.article
      variants={variants}
      whileHover={{ y: -3 }}
      className="group overflow-hidden rounded-2xl border border-brand-200 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-100">
        {producto.imagenUrl ? (
          <Image
            src={producto.imagenUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m4 16 5-5 4 4 3-3 4 4" />
            </svg>
          </div>
        )}
        <div className="absolute left-2 top-2">
          <Badge variant="accent" className="backdrop-blur-sm">
            {producto.categoria}
          </Badge>
        </div>
      </div>
      <div className="p-3">
        <h3
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-brand-900"
          title={producto.nombre}
        >
          {producto.nombre}
        </h3>
        <div className="mt-2 text-base font-bold tabular-nums text-accent-700">
          {formatCOP(producto.precio)}
        </div>
      </div>
    </motion.article>
  );
}
