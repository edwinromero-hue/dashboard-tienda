'use client';

import { motion } from 'framer-motion';
import type { CategoryStat } from '@/types/domain';

const PALETTE = [
  '#7ab83c',
  '#5fa128',
  '#3f7e1f',
  '#a8d863',
  '#2d6b3a',
  '#8cc63f',
  '#1e5b2a',
];

export function CategoryBreakdown({ data }: { data: CategoryStat[] }) {
  const top = data.slice(0, 6);
  const max = Math.max(...top.map((d) => d.totalProductos), 1);

  return (
    <div className="space-y-2.5">
      {top.map((item, i) => (
        <div key={item.categoria} className="space-y-1">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-brand-700">{item.categoria}</span>
            <span className="tabular-nums text-brand-500">
              {item.totalProductos}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.totalProductos / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
