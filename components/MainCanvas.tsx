'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { useIdleStore } from '@/lib/store/useIdleStore';
import { ColombiaMap } from '@/components/map/ColombiaMap';
import { MapFilterHint } from '@/components/map/MapFilterHint';
import { ProductsGrid } from '@/components/products/ProductsGrid';
import { BrandLogo } from '@/components/BrandLogo';
import { ProductShowcase } from '@/components/showcase/ProductShowcase';
import { cn } from '@/lib/utils/cn';

export function MainCanvas() {
  const view = useDashboardStore((s) => s.view);
  const tiendaId = useDashboardStore((s) => s.selectedTiendaId);
  const idle = useIdleStore((s) => s.idle);

  const showShowcase = view === 'map' && !idle;

  // En idle el chrome desaparece y el mapa ocupa toda la viewport.
  // Map card: chrome reforzado con sombra verde-acento → indica que es el elemento principal.
  const mapChrome = !idle
    ? cn(
        'rounded-3xl border border-brand-200 bg-white',
        'shadow-[0_12px_36px_-8px_rgba(45,107,58,0.18),0_2px_8px_-2px_rgba(15,23,42,0.06)]',
        'ring-1 ring-accent-200/40',
      )
    : '';

  // Showcase card: chrome más discreto → menos peso visual que el mapa.
  const showcaseChrome = !idle
    ? 'rounded-3xl border border-brand-200/70 bg-white/90'
    : '';

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col',
        idle ? 'gap-0' : 'gap-4',
        'transition-[gap] duration-700 ease-in-out',
      )}
    >
      {/* Map card */}
      <div
        className={cn(
          'relative min-h-0 flex-1 overflow-hidden',
          'transition-[border-radius,box-shadow] duration-700 ease-in-out',
          mapChrome,
        )}
      >
        <BrandLogo />
        <MapFilterHint />

        {/* Mapa siempre montado para mantener el WebGL context */}
        <div
          className="absolute inset-0"
          style={{
            visibility: view === 'map' ? 'visible' : 'hidden',
            pointerEvents: view === 'map' ? 'auto' : 'none',
          }}
        >
          <ColombiaMap />
        </div>

        <AnimatePresence>
          {view === 'products' && tiendaId && (
            <motion.div
              key="products-overlay"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10"
            >
              <ProductsGrid tiendaId={tiendaId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Showcase card — peso visual reducido para no competir con el mapa */}
      <AnimatePresence>
        {showShowcase && (
          <motion.div
            key="showcase-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
            className={cn('relative shrink-0 overflow-hidden', showcaseChrome)}
          >
            <ProductShowcase />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
