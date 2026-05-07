'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { FeaturedProduct } from '@/lib/api/client';
import { formatCOP } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Quadrant } from './geometry';

const SLOT_CLASS: Record<Quadrant, string> = {
  NW: 'top-12 left-12',
  NE: 'top-12 right-12',
  SW: 'bottom-12 left-12',
  SE: 'bottom-12 right-12',
};

const ENTER_FROM: Record<Quadrant, { x: number; y: number }> = {
  NW: { x: -40, y: -40 },
  NE: { x: 40, y: -40 },
  SW: { x: -40, y: 40 },
  SE: { x: 40, y: 40 },
};

export const FLOATING_CARD_W = 340;
export const FLOATING_CARD_H = 220;

export function FloatingStoreCard({
  product,
  quadrant,
}: {
  product: FeaturedProduct;
  quadrant: Quadrant;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, ...ENTER_FROM[quadrant] }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, ...ENTER_FROM[quadrant] }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn('absolute z-30 pointer-events-none', SLOT_CLASS[quadrant])}
      style={{ width: FLOATING_CARD_W, height: FLOATING_CARD_H }}
    >
      {/* Dark glass card */}
      <div
        className={cn(
          'relative h-full w-full overflow-hidden rounded-3xl',
          'bg-slate-950/55 backdrop-blur-2xl',
          'ring-1 ring-white/15',
          'shadow-[0_12px_48px_-8px_rgba(60,160,80,0.55),inset_0_1px_0_rgba(255,255,255,0.18)]',
        )}
      >
        {/* Halo verde superior */}
        <div className="pointer-events-none absolute -inset-x-8 -top-12 h-28 bg-gradient-to-b from-accent-400/55 via-accent-300/15 to-transparent blur-2xl" />

        {/* Grid sutil tipo HUD */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Layout */}
        <div className="relative flex h-full gap-4 p-4">
          {/* Logo de tienda + chip de departamento */}
          <div className="flex w-[112px] shrink-0 flex-col items-center gap-2">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-900/60 ring-1 ring-white/25 shadow-inner">
              {product.tiendaLogo ? (
                <Image
                  src={product.tiendaLogo}
                  alt={product.tiendaNombre}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-3xl font-black text-accent-300">
                  {product.tiendaNombre.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <span className="line-clamp-2 text-center text-[13px] font-bold uppercase tracking-[0.1em] leading-tight text-white drop-shadow">
              {product.tiendaNombre}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-100 ring-1 ring-accent-300/40">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-300 shadow-[0_0_6px_rgba(140,198,63,0.95)]" />
              {product.departamentoNombre}
            </span>
          </div>

          {/* Producto destacado */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/15">
              {product.imagenUrl && (
                <Image
                  src={product.imagenUrl}
                  alt={product.nombre}
                  fill
                  sizes="200px"
                  className="object-cover"
                  unoptimized
                />
              )}
              {product.categoria && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/15">
                  {product.categoria}
                </span>
              )}
            </div>

            <div>
              <h3
                className="line-clamp-2 text-[13px] font-semibold leading-snug text-white drop-shadow"
                title={product.nombre}
              >
                {product.nombre}
              </h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-extrabold tabular-nums text-white drop-shadow">
                  {formatCOP(product.precio)}
                </span>
                {product.comparePrecio && (
                  <span className="text-[11px] tabular-nums text-white/55 line-through">
                    {formatCOP(product.comparePrecio)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Brackets de marco futurista */}
        <CornerBracket position="tl" />
        <CornerBracket position="tr" />
        <CornerBracket position="bl" />
        <CornerBracket position="br" />
      </div>
    </motion.div>
  );
}

function CornerBracket({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const map = {
    tl: 'top-1 left-1 border-t-2 border-l-2 rounded-tl-2xl',
    tr: 'top-1 right-1 border-t-2 border-r-2 rounded-tr-2xl',
    bl: 'bottom-1 left-1 border-b-2 border-l-2 rounded-bl-2xl',
    br: 'bottom-1 right-1 border-b-2 border-r-2 rounded-br-2xl',
  } as const;
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute h-4 w-4 border-accent-300/90',
        map[position],
      )}
    />
  );
}
