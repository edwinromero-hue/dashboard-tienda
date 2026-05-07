'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type FeaturedProduct } from '@/lib/api/client';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { nombreDepartamento } from '@/lib/geo/department-codes';
import { prettyMunicipality } from '@/lib/geo/municipality-aliases';
import { cn } from '@/lib/utils/cn';
import { ShowcaseCard, ShowcaseCardSkeleton } from './ShowcaseCard';

export function ProductShowcase() {
  const [items, setItems] = useState<FeaturedProduct[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const selectDepartamento = useDashboardStore((s) => s.selectDepartamento);
  const selectTienda = useDashboardStore((s) => s.selectTienda);
  const departamento = useDashboardStore((s) => s.selectedDepartamentoCodigo);
  const municipio = useDashboardStore((s) => s.selectedMunicipioName);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setItems(null);
    api
      .featured(12, { departamento, municipio })
      .then((r) => !cancelled && setItems(r))
      .catch(() => !cancelled && setItems([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [refreshKey, departamento, municipio]);

  // Reset scroll cuando cambia el contexto
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [departamento, municipio]);

  const contextLabel = municipio
    ? `Productos en ${prettyMunicipality(municipio)}`
    : departamento
      ? `Productos en ${nombreDepartamento(departamento)}`
      : null;

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [items]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 232;
    el.scrollBy({ left: dir === 'left' ? -cardWidth * 3 : cardWidth * 3, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative bg-white"
    >
      {/* Header — título + chip de contexto */}
      <div className="flex items-center justify-between gap-3 px-8 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[16px] font-black tracking-tight text-brand-900">
            Ofertas destacadas
          </h3>
          {contextLabel ? (
            <motion.span
              key={contextLabel}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-800 ring-1 ring-accent-200"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {contextLabel}
            </motion.span>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-400">
              Productos del día
            </span>
          )}
        </div>
      </div>

      {/* Carrusel — usamos spacer divs en lugar de padding porque el padding-right
          en flex+overflow-x-auto no se respeta al final del scroll */}
      <div
        ref={scrollRef}
        className={cn(
          'flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-6 pt-2',
        )}
        style={{ scrollbarWidth: 'thin', scrollPaddingInline: '40px' }}
      >
        {/* Spacer izquierdo */}
        <div aria-hidden className="w-10 shrink-0" />

        <AnimatePresence mode="wait">
          {items === null ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ShowcaseCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid h-48 w-full place-items-center text-sm text-brand-400"
            >
              No hay productos disponibles.
            </motion.div>
          ) : (
            <motion.div
              key={`items-${refreshKey}`}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={{
                visible: { transition: { staggerChildren: 0.04 } },
              }}
              className="flex gap-4"
            >
              {items.map((p, i) => (
                <motion.div
                  key={`${p.id}-${i}`}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="snap-start"
                >
                  <ShowcaseCard
                    product={p}
                    onGoToStore={() => {
                      if (p.departamentoCodigo) {
                        selectDepartamento(p.departamentoCodigo);
                        setTimeout(() => selectTienda(p.tiendaId), 60);
                      }
                    }}
                    onGoToRegion={() => {
                      if (p.departamentoCodigo) selectDepartamento(p.departamentoCodigo);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spacer derecho */}
        <div aria-hidden className="w-10 shrink-0" />
      </div>

      {/* Botones flotantes — flechas a izquierda/derecha y shuffle a la esquina */}
      <FloatingArrow
        side="left"
        disabled={!canScrollLeft}
        onClick={() => scroll('left')}
      />
      <FloatingArrow
        side="right"
        disabled={!canScrollRight}
        onClick={() => scroll('right')}
      />

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setRefreshKey((k) => k + 1)}
        disabled={loading}
        className="absolute right-5 top-3 z-10 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-brand-200 bg-white px-4 text-[12px] font-bold text-brand-700 shadow-sm transition-colors duration-200 hover:border-accent-400 hover:text-accent-700 disabled:opacity-50"
        aria-label="Mezclar productos"
      >
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          animate={loading ? { rotate: 360 } : { rotate: 0 }}
          transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 4h5v5M4 20l16.5-16.5M21 15v5h-5M4 4l4.5 4.5M15 21l-4.5-4.5" />
        </motion.svg>
        <span className="hidden uppercase tracking-wider sm:inline">Mezclar</span>
      </motion.button>
    </motion.div>
  );
}

function FloatingArrow({
  side,
  disabled,
  onClick,
}: {
  side: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      animate={{ opacity: disabled ? 0 : 1 }}
      className={cn(
        'absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full',
        'border border-brand-200 bg-white text-brand-700 shadow-lg',
        'transition-colors duration-200 hover:border-accent-400 hover:text-accent-700',
        disabled && 'pointer-events-none',
        side === 'left' ? 'left-3' : 'right-3',
      )}
      aria-label={side === 'left' ? 'Anterior' : 'Siguiente'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {side === 'left' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
        )}
      </svg>
    </motion.button>
  );
}
