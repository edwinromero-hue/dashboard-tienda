'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api/client';
import { nombreDepartamento } from '@/lib/geo/department-codes';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface DeptRow {
  codigo: string;
  nombre: string;
  total: number;
}

const TOP_N = 6;

export function TopDepartamentosChart() {
  const [rows, setRows] = useState<DeptRow[] | null>(null);
  const [allCount, setAllCount] = useState(0);
  const selectDepartamento = useDashboardStore((s) => s.selectDepartamento);

  useEffect(() => {
    let cancelled = false;
    api
      .tiendaCounts()
      .then((counts) => {
        if (cancelled) return;
        const list: DeptRow[] = Object.entries(counts)
          .map(([codigo, total]) => ({
            codigo,
            nombre: nombreDepartamento(codigo),
            total,
          }))
          .sort((a, b) => b.total - a.total);
        setAllCount(list.reduce((sum, r) => sum + r.total, 0));
        setRows(list.slice(0, TOP_N));
      })
      .catch(() => !cancelled && setRows([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const max = useMemo(() => (rows && rows.length > 0 ? rows[0].total : 1), [rows]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-sm">
      {/* Header con resumen */}
      <header className="relative overflow-hidden border-b border-brand-200/80 bg-gradient-to-br from-accent-50 to-white px-5 py-4">
        <div className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full bg-accent-200/40 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-black tracking-tight text-brand-900">
              Top departamentos
            </h3>
            <p className="mt-0.5 text-[11px] text-brand-500">
              Ranking por densidad de tiendas activas
            </p>
          </div>
          {rows !== null && (
            <div className="text-right">
              <div className="text-2xl font-black tabular-nums leading-none text-accent-700">
                {formatNumber(allCount)}
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-500">
                Tiendas en total
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="px-5 py-4">
        {rows === null ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ChartRowSkeleton key={i} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-xs text-brand-400">
            Aún no hay datos disponibles.
          </p>
        ) : (
          <ol className="space-y-3">
            {rows.map((d, i) => (
              <ChartRow
                key={d.codigo}
                rank={i + 1}
                row={d}
                max={max}
                index={i}
                onSelect={() => selectDepartamento(d.codigo)}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

const PODIUM = {
  1: { ring: 'ring-amber-300', chip: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-300/50', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]' },
  2: { ring: 'ring-slate-300', chip: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-300/50', glow: 'shadow-[0_0_10px_rgba(148,163,184,0.35)]' },
  3: { ring: 'ring-orange-300', chip: 'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-orange-300/50', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.35)]' },
} as const;

function ChartRow({
  rank,
  row,
  max,
  index,
  onSelect,
}: {
  rank: number;
  row: DeptRow;
  max: number;
  index: number;
  onSelect: () => void;
}) {
  const pct = max > 0 ? (row.total / max) * 100 : 0;
  const podium = (PODIUM as any)[rank] as (typeof PODIUM)[1] | undefined;
  const isPodium = !!podium;

  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
    >
      <motion.button
        type="button"
        onClick={onSelect}
        whileTap={{ scale: 0.98 }}
        className="group block min-h-[60px] w-full cursor-pointer rounded-2xl border border-transparent px-2 py-2 text-left transition-all duration-200 hover:border-accent-200 hover:bg-accent-50/60"
      >
        {/* Línea superior: chip rango + nombre + total */}
        <div className="mb-1.5 flex items-center gap-2.5">
          <span
            className={cn(
              'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-black tabular-nums shadow',
              isPodium
                ? podium.chip
                : 'bg-brand-100 text-brand-600 group-hover:bg-accent-100 group-hover:text-accent-800',
            )}
          >
            {rank}
          </span>
          <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-brand-900 group-hover:text-accent-800">
            {row.nombre}
          </span>
          <span className="shrink-0 text-[14px] font-black tabular-nums text-brand-700">
            {formatNumber(row.total)}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="shrink-0 text-brand-300 transition group-hover:translate-x-0.5 group-hover:text-accent-600"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </div>

        {/* Barra */}
        <div className="relative h-2.5 overflow-hidden rounded-full bg-brand-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, delay: 0.15 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative h-full rounded-full',
              isPodium
                ? 'bg-gradient-to-r from-accent-500 via-accent-400 to-accent-300'
                : 'bg-gradient-to-r from-accent-300 to-accent-200',
              isPodium && podium.glow,
            )}
          >
            {/* Brillo animado dentro de la barra (top 1) */}
            {rank === 1 && (
              <motion.span
                className="pointer-events-none absolute inset-y-0 -inset-x-2 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ['-50%', '150%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </motion.div>
        </div>
      </motion.button>
    </motion.li>
  );
}

function ChartRowSkeleton() {
  return (
    <div className="px-2 py-2">
      <div className="mb-1.5 flex items-center gap-2.5">
        <div className="h-7 w-7 shrink-0 rounded-full shimmer-bg" />
        <div className="h-3.5 flex-1 rounded shimmer-bg" />
        <div className="h-3.5 w-10 rounded shimmer-bg" />
      </div>
      <div className="h-2.5 rounded-full shimmer-bg" />
    </div>
  );
}
