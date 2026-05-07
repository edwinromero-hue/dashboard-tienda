'use client';

import { motion } from 'framer-motion';
import type { CategoryStat } from '@/types/domain';
import { cn } from '@/lib/utils/cn';

interface Props {
  data: CategoryStat[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryFilters({ data, selectedId, onSelect }: Props) {
  if (data.length === 0) return null;
  return (
    <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => onSelect(null)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition',
          selectedId === null
            ? 'bg-brand-900 text-white'
            : 'bg-brand-100 text-brand-700 hover:bg-brand-200',
        )}
      >
        Todas
      </motion.button>
      {data.map((c, i) => {
        const active = selectedId === c.categoriaId;
        return (
          <motion.button
            key={c.categoriaId}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 * i }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(active ? null : c.categoriaId)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition',
              active
                ? 'bg-accent-600 text-white shadow-sm'
                : 'bg-brand-100 text-brand-700 hover:bg-accent-50 hover:text-accent-700',
            )}
          >
            <span>{c.categoria}</span>
            <span
              className={cn(
                'rounded-full px-1.5 text-[10px] tabular-nums',
                active ? 'bg-white/20 text-white' : 'bg-white text-brand-500',
              )}
            >
              {c.totalProductos}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
