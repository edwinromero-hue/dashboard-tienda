'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// Marcas oficiales (mock visual; reemplazables por datos reales).
const BRAND_STORES = [
  { name: 'Adidas', tag: 'Deporte', initial: 'A', bg: 'bg-black', text: 'text-white' },
  { name: 'Nestlé', tag: 'Alimentos', initial: 'N', bg: 'bg-red-600', text: 'text-white' },
  { name: 'Dell', tag: 'Tecnología', initial: 'D', bg: 'bg-blue-600', text: 'text-white' },
  { name: 'Apple', tag: 'Electrónica', initial: '', bg: 'bg-slate-900', text: 'text-white' },
];

export function HomeIntroCard() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-sm">
      {/* Hero degradado superior */}
      <div className="relative bg-gradient-to-br from-accent-50 via-white to-brand-50 px-6 pb-6 pt-7">
        {/* Halo verde decorativo */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-accent-200/40 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <motion.img
            src="/logo.BvshXUw1.svg"
            alt="Tu Negocio en Línea"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-16 w-auto drop-shadow-sm"
          />
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-800 ring-1 ring-accent-200">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500 shadow-[0_0_6px_rgba(140,198,63,0.9)]" />
            Marketplace Colombia
          </span>
          <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight text-brand-900">
            Tiendas locales <br />
            <span className="text-accent-700">en un solo lugar</span>
          </h2>
          <p className="mt-2 max-w-[28ch] text-[13px] leading-relaxed text-brand-500">
            Toca un departamento del mapa para descubrir tiendas, categorías y ofertas cerca de ti.
          </p>
        </div>
      </div>

      {/* Brand stores */}
      <div className="border-t border-brand-200/80 px-5 pb-5 pt-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-[14px] font-bold tracking-tight text-brand-900">
            Marcas oficiales
          </h3>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400">
            Entrega 24h
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {BRAND_STORES.map((b, i) => (
            <BrandTile key={b.name} brand={b} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandTile({
  brand,
  index,
}: {
  brand: (typeof BRAND_STORES)[number];
  index: number;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn(
        'group relative flex min-h-[68px] cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-brand-200 bg-white p-3 text-left',
        'shadow-sm transition-shadow duration-200 hover:border-accent-400 hover:shadow-md',
      )}
    >
      {/* Glow on hover */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div
        className={cn(
          'relative grid h-12 w-12 shrink-0 place-items-center rounded-xl shadow-inner',
          brand.bg,
          brand.text,
        )}
      >
        {brand.initial ? (
          <span className="text-lg font-black">{brand.initial}</span>
        ) : (
          // Apple
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 12.04c-.03-2.74 2.24-4.05 2.34-4.12-1.27-1.86-3.25-2.12-3.96-2.15-1.69-.17-3.3 1-4.16 1-.87 0-2.19-.97-3.6-.95-1.85.03-3.55 1.07-4.5 2.73-1.92 3.33-.49 8.25 1.39 10.95.92 1.32 2.01 2.8 3.43 2.75 1.38-.06 1.9-.89 3.57-.89 1.66 0 2.13.89 3.59.86 1.48-.02 2.42-1.34 3.33-2.67 1.05-1.53 1.49-3.01 1.51-3.09-.03-.01-2.91-1.11-2.94-4.42ZM14.41 4.36c.74-.91 1.25-2.16 1.11-3.41-1.07.05-2.39.72-3.16 1.62-.69.81-1.3 2.1-1.14 3.32 1.2.09 2.42-.62 3.19-1.53Z" />
          </svg>
        )}
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold leading-tight text-brand-900">
          {brand.name}
        </p>
        <p className="truncate text-[11px] text-brand-500">{brand.tag}</p>
      </div>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="relative shrink-0 text-brand-300 transition group-hover:translate-x-0.5 group-hover:text-accent-600"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
      </svg>
    </motion.button>
  );
}
