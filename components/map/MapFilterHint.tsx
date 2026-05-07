'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { useIdleStore } from '@/lib/store/useIdleStore';

const AUTO_COLLAPSE_MS = 6000;
const RE_EXPAND_MS = 4000;

/**
 * Pill que indica que el mapa es el filtro principal.
 *
 * Comportamiento dinámico para no tapar contenido:
 * - Inicio: expandido (Filtro principal · Toca un departamento)
 * - Tras 6s: colapsa a un punto pulsante (~36px)
 * - Si hay selección: se oculta
 * - Al deseleccionar: vuelve como punto colapsado (no expandido)
 * - Tap sobre el punto: reexpande 4s y vuelve a colapsar
 * - Idle: oculto (la CTA central toma el rol)
 */
export function MapFilterHint() {
  const hasSelection = useDashboardStore(
    (s) => s.selectedDepartamentoCodigo !== null || s.selectedTiendaId !== null,
  );
  const idle = useIdleStore((s) => s.idle);

  const [expanded, setExpanded] = useState(true);

  // Auto-colapso al iniciar
  useEffect(() => {
    if (!expanded) return;
    const t = setTimeout(() => setExpanded(false), AUTO_COLLAPSE_MS);
    return () => clearTimeout(t);
  }, [expanded]);

  const handleTapDot = () => {
    setExpanded(true);
    const t = setTimeout(() => setExpanded(false), RE_EXPAND_MS);
    return () => clearTimeout(t);
  };

  if (idle || hasSelection) return null;

  return (
    <AnimatePresence mode="wait">
      {expanded ? (
        <motion.div
          key="expanded"
          initial={{ opacity: 0, y: -6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.4, x: -10, transition: { duration: 0.3 } }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute left-20 top-5 z-20 inline-flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2 shadow-md ring-1 ring-brand-200 backdrop-blur-md"
        >
          <Dot />
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-700">
              Filtro principal
            </span>
            <span className="text-[12px] font-semibold text-brand-800">
              Toca un departamento
            </span>
          </span>
        </motion.div>
      ) : (
        <motion.button
          key="collapsed"
          type="button"
          onClick={handleTapDot}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          whileTap={{ scale: 0.88 }}
          className="absolute left-20 top-5 z-20 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 shadow-md ring-1 ring-brand-200 backdrop-blur-md transition-shadow duration-200 hover:shadow-lg"
          aria-label="Mostrar instrucción del filtro"
        >
          <Dot />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Dot() {
  return (
    <span className="relative grid h-2.5 w-2.5 place-items-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-accent-400 opacity-60" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-accent-500 shadow-[0_0_6px_rgba(140,198,63,0.9)]" />
    </span>
  );
}
