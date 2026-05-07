'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { FeaturedProduct } from '@/lib/api/client';
import { formatCOP } from '@/lib/utils/format';

const CARD_WIDTH = 216;

export function ShowcaseCard({
  product,
  onGoToStore,
  onGoToRegion,
}: {
  product: FeaturedProduct;
  onGoToStore: () => void;
  onGoToRegion: () => void;
}) {
  const discount = product.comparePrecio
    ? Math.round(((product.comparePrecio - product.precio) / product.comparePrecio) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{ width: CARD_WIDTH }}
      className="group flex shrink-0 flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white transition hover:border-accent-300 hover:shadow-lg"
    >
      {/* Imagen */}
      <button
        onClick={onGoToStore}
        className="relative block aspect-square w-full overflow-hidden bg-brand-50"
      >
        {product.imagenUrl ? (
          <Image
            src={product.imagenUrl}
            alt={product.nombre}
            fill
            sizes={`${CARD_WIDTH}px`}
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : null}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow">
            -{discount}%
          </span>
        )}
        {product.categoria && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-accent-700 shadow-sm backdrop-blur">
            {product.categoria}
          </span>
        )}
      </button>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <button onClick={onGoToStore} className="text-left">
          <h3
            className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug text-brand-900 group-hover:text-accent-700"
            title={product.nombre}
          >
            {product.nombre}
          </h3>
        </button>

        <div className="flex flex-col">
          <div className="text-lg font-bold tabular-nums leading-none text-brand-900">
            {formatCOP(product.precio)}
          </div>
          {product.comparePrecio && (
            <div className="mt-0.5 text-[11px] tabular-nums text-brand-400 line-through">
              {formatCOP(product.comparePrecio)}
            </div>
          )}
        </div>

        {/* Tienda + región */}
        <div className="mt-auto space-y-1.5">
          <button
            onClick={onGoToStore}
            className="flex w-full min-w-0 items-center gap-1.5 text-left"
          >
            {product.tiendaLogo ? (
              <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded border border-brand-200 bg-white">
                <Image
                  src={product.tiendaLogo}
                  alt=""
                  fill
                  sizes="20px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="grid h-5 w-5 shrink-0 place-items-center rounded bg-brand-200 text-[8px] font-bold text-brand-600">
                {product.tiendaNombre.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="truncate text-[11px] font-medium text-brand-700">
              {product.tiendaNombre}
            </span>
          </button>

          <button
            onClick={onGoToRegion}
            className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-medium text-accent-700 transition hover:bg-accent-100"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {product.departamentoNombre}
          </button>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onGoToStore}
          className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-accent-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-600"
        >
          Ir a la tienda
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

export function ShowcaseCardSkeleton() {
  return (
    <div
      style={{ width: CARD_WIDTH }}
      className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white"
    >
      <div className="aspect-square w-full shimmer-bg" />
      <div className="space-y-2 p-3">
        <div className="shimmer-bg h-4 w-full rounded" />
        <div className="shimmer-bg h-4 w-2/3 rounded" />
        <div className="shimmer-bg h-6 w-1/3 rounded" />
        <div className="shimmer-bg h-4 w-1/2 rounded" />
        <div className="shimmer-bg h-8 w-full rounded-full" />
      </div>
    </div>
  );
}
