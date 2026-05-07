'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useDashboardStore } from '@/lib/store/useDashboardStore';

// Tiendas asociadas a Tu Negocio en Línea (mock visual; conectable a API después).
const PARTNER_STORES = [
  {
    storeId: 't-bog-01',
    deptCode: '11',
    name: 'Tienda Chapinero',
    city: 'Bogotá D.C.',
    initial: 'C',
    bg: 'bg-accent-600',
  },
  {
    storeId: 't-ant-01',
    deptCode: '05',
    name: 'Mercado El Poblado',
    city: 'Medellín',
    initial: 'M',
    bg: 'bg-rose-500',
  },
  {
    storeId: 't-vlc-01',
    deptCode: '76',
    name: 'Tienda Granada',
    city: 'Cali',
    initial: 'G',
    bg: 'bg-amber-500',
  },
  {
    storeId: 't-atl-02',
    deptCode: '08',
    name: 'Punto Norte',
    city: 'Barranquilla',
    initial: 'N',
    bg: 'bg-sky-500',
  },
];

export function HomeIntroCard() {
  const selectDepartamento = useDashboardStore((s) => s.selectDepartamento);
  const selectTienda = useDashboardStore((s) => s.selectTienda);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-sm">
      {/* Hero degradado superior */}
      <div className="relative bg-gradient-to-br from-accent-50 via-white to-brand-50 px-6 pb-6 pt-7">
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

      {/* Tiendas asociadas */}
      <div className="border-t border-brand-200/80 px-5 pb-5 pt-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-[14px] font-bold tracking-tight text-brand-900">
            Tiendas asociadas
          </h3>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400">
            Aliados oficiales
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PARTNER_STORES.map((s, i) => (
            <PartnerTile
              key={s.storeId}
              store={s}
              index={i}
              onSelect={() => {
                selectDepartamento(s.deptCode);
                setTimeout(() => selectTienda(s.storeId), 60);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerTile({
  store,
  index,
  onSelect,
}: {
  store: (typeof PARTNER_STORES)[number];
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onClick={onSelect}
      className={cn(
        'group relative flex min-h-[68px] cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-brand-200 bg-white p-3 text-left',
        'shadow-sm transition-shadow duration-200 hover:border-accent-400 hover:shadow-md',
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div
        className={cn(
          'relative grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white shadow-inner',
          store.bg,
        )}
      >
        <span className="text-lg font-black">{store.initial}</span>
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold leading-tight text-brand-900">
          {store.name}
        </p>
        <p className="truncate text-[11px] text-brand-500">{store.city}</p>
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
