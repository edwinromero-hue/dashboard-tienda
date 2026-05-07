'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { nombreDepartamento } from '@/lib/geo/department-codes';
import { formatNumber } from '@/lib/utils/format';
import type { Tienda } from '@/types/domain';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

export function StorePanel({
  tiendaId,
  departamentoCodigo,
}: {
  tiendaId: string;
  departamentoCodigo: string | null;
}) {
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [categoriasUnicas, setCategoriasUnicas] = useState<number | null>(null);

  const backToMap = useDashboardStore((s) => s.backToMap);

  useEffect(() => {
    if (!departamentoCodigo) return;
    let cancelled = false;
    setTienda(null);
    setProductCount(null);
    setCategoriasUnicas(null);
    Promise.all([
      api.tiendasByDepartamento(departamentoCodigo),
      api.productosByTienda(tiendaId),
    ]).then(([tiendas, productos]) => {
      if (cancelled) return;
      setTienda(tiendas.find((t) => t.id === tiendaId) ?? null);
      setProductCount(productos.length);
      setCategoriasUnicas(new Set(productos.map((p) => p.categoria)).size);
    });
    return () => {
      cancelled = true;
    };
  }, [tiendaId, departamentoCodigo]);

  return (
    <motion.div
      key={tiendaId}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col"
    >
      {/* Banner / fallback */}
      {tienda?.bannerUrl ? (
        <div className="relative h-24 w-full overflow-hidden bg-brand-100">
          <Image
            src={tienda.bannerUrl}
            alt=""
            fill
            sizes="20vw"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/40" />
        </div>
      ) : (
        <div className="h-24 w-full bg-gradient-to-br from-accent-100 via-accent-50 to-brand-100" />
      )}

      <div className="relative border-b border-brand-200 px-5 pb-4">
        {/* Logo overlapping banner */}
        <div className="relative -mt-8 mb-2 inline-block">
          {tienda === null ? (
            <Skeleton className="h-16 w-16 rounded-xl" />
          ) : tienda.logoUrl ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
              <Image
                src={tienda.logoUrl}
                alt={tienda.nombre}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-xl border-2 border-white bg-accent-50 text-base font-bold text-accent-700 shadow-md">
              {tienda.nombre
                .split(/\s+/)
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase() || '·'}
            </div>
          )}
        </div>

        <button
          onClick={backToMap}
          className="absolute right-5 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-brand-600 shadow-sm backdrop-blur transition hover:text-accent-600"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
          </svg>
          Volver
        </button>

        {tienda === null ? (
          <>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-6 w-48" />
            <Skeleton className="mt-2 h-3 w-40" />
          </>
        ) : (
          <>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-500">
              Tienda · {nombreDepartamento(tienda.departamentoCodigo)}
            </div>
            <h2 className="mt-0.5 text-lg font-semibold leading-tight text-brand-900">
              {tienda.nombre}
            </h2>
            <p className="mt-1.5 text-xs text-brand-500">{tienda.direccion}</p>
            {tienda.telefono && (
              <p className="mt-0.5 text-xs text-brand-400">{tienda.telefono}</p>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">
            Productos
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-brand-900">
            {productCount === null ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              formatNumber(productCount)
            )}
          </div>
        </div>
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">
            Categorías
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-brand-900">
            {categoriasUnicas === null ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              formatNumber(categoriasUnicas)
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-brand-200 px-5 py-3">
        <Badge variant="success">Productos visibles a la izquierda</Badge>
      </div>
    </motion.div>
  );
}
