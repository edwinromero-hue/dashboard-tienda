'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { nombreDepartamento } from '@/lib/geo/department-codes';
import { prettyMunicipality } from '@/lib/geo/municipality-aliases';
import type { Tienda, CategoryStat } from '@/types/domain';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { CategoryFilters } from './CategoryFilters';

export function DepartmentPanel({ codigo }: { codigo: string }) {
  const [tiendas, setTiendas] = useState<Tienda[] | null>(null);
  const [breakdown, setBreakdown] = useState<CategoryStat[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtro activo por categoriaId + cache de IDs por categoría
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [filterIds, setFilterIds] = useState<Set<string> | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const filterCacheRef = useState(() => new Map<number, Set<string>>())[0];

  const selectTienda = useDashboardStore((s) => s.selectTienda);
  const selectDepartamento = useDashboardStore((s) => s.selectDepartamento);
  const selectedMunicipio = useDashboardStore((s) => s.selectedMunicipioName);
  const selectMunicipio = useDashboardStore((s) => s.selectMunicipio);

  // Reset al cambiar de departamento o municipio
  useEffect(() => {
    let cancelled = false;
    setTiendas(null);
    setBreakdown(null);
    setError(null);
    setSelectedCategoryId(null);
    setFilterIds(null);
    filterCacheRef.clear();

    Promise.all([
      api.tiendasByDepartamento(codigo, selectedMunicipio),
      api.breakdownByDepartamento(codigo),
    ])
      .then(([t, b]) => {
        if (cancelled) return;
        setTiendas(t);
        setBreakdown(b);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [codigo, selectedMunicipio, filterCacheRef]);

  // Cargar IDs cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategoryId === null) {
      setFilterIds(null);
      return;
    }
    const cached = filterCacheRef.get(selectedCategoryId);
    if (cached) {
      setFilterIds(cached);
      return;
    }
    let cancelled = false;
    setFilterLoading(true);
    api
      .storeIdsByCategoria(codigo, selectedCategoryId)
      .then((ids) => {
        if (cancelled) return;
        filterCacheRef.set(selectedCategoryId, ids);
        setFilterIds(ids);
      })
      .finally(() => !cancelled && setFilterLoading(false));
    return () => {
      cancelled = true;
    };
  }, [codigo, selectedCategoryId, filterCacheRef]);

  const visibleTiendas = useMemo(() => {
    if (!tiendas) return null;
    if (!filterIds) return tiendas;
    return tiendas.filter((t) => filterIds.has(t.id));
  }, [tiendas, filterIds]);

  return (
    <motion.div
      key={codigo}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-brand-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-500">
              <button
                onClick={() => selectDepartamento(codigo)}
                className={selectedMunicipio ? 'uppercase tracking-wider hover:text-accent-700' : 'uppercase tracking-wider'}
              >
                {selectedMunicipio ? nombreDepartamento(codigo) : 'Departamento'}
              </button>
              {selectedMunicipio && (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                  <span className="uppercase tracking-wider text-accent-700">Municipio</span>
                </>
              )}
            </div>
            <h2 className="mt-0.5 truncate text-lg font-semibold text-brand-900">
              {selectedMunicipio
                ? prettyMunicipality(selectedMunicipio)
                : nombreDepartamento(codigo)}
            </h2>
            {selectedMunicipio && (
              <button
                onClick={() => selectMunicipio(null)}
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-brand-500 hover:text-accent-700"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0 6 6m-6-6 6-6" />
                </svg>
                Ver todo {nombreDepartamento(codigo)}
              </button>
            )}
          </div>
          <button
            onClick={() => selectDepartamento(null)}
            className="grid h-7 w-7 place-items-center rounded-full text-brand-400 transition hover:bg-brand-100 hover:text-brand-700"
            aria-label="Cerrar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tiendas === null ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <Badge variant="accent">
              {visibleTiendas?.length ?? tiendas.length}{' '}
              {tiendas.length === 1 ? 'tienda' : 'tiendas'}
              {selectedCategoryId !== null && tiendas.length !== visibleTiendas?.length
                ? ` de ${tiendas.length}`
                : ''}
            </Badge>
          )}
          {breakdown && breakdown.length > 0 && (
            <Badge>{breakdown.length} categorías</Badge>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="border-b border-brand-200 bg-brand-50/40 px-5 py-3">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-500">
            ¿Qué venden?
          </h3>
          {filterLoading && (
            <span className="text-[10px] text-brand-400">filtrando…</span>
          )}
        </div>
        {breakdown === null ? (
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        ) : breakdown.length === 0 ? (
          <p className="text-xs text-brand-400">Sin productos cargados.</p>
        ) : (
          <CategoryFilters
            data={breakdown}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-500">
          Tiendas
        </h3>
        {visibleTiendas === null ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : visibleTiendas.length === 0 ? (
          <p className="text-xs text-brand-400">
            {selectedCategoryId !== null
              ? 'Ninguna tienda de este departamento vende esa categoría.'
              : 'Aún no hay tiendas registradas en este departamento.'}
          </p>
        ) : (
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.04 } },
            }}
            className="space-y-2"
          >
            {visibleTiendas.map((t) => (
              <motion.li
                key={t.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <button
                  onClick={() => selectTienda(t.id)}
                  className="group flex w-full items-start gap-3 rounded-xl border border-brand-200 bg-white p-3 text-left transition hover:border-accent-400 hover:shadow-sm"
                >
                  <StoreAvatar logoUrl={t.logoUrl} nombre={t.nombre} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-brand-900">
                      {t.nombre}
                    </div>
                    <div className="truncate text-xs text-brand-500">
                      {t.direccion}
                    </div>
                    {t.telefono && (
                      <div className="mt-0.5 text-[11px] text-brand-400">
                        {t.telefono}
                      </div>
                    )}
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mt-1 text-brand-300 transition group-hover:translate-x-0.5 group-hover:text-accent-500"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.div>
  );
}

function StoreAvatar({ logoUrl, nombre }: { logoUrl: string | null; nombre: string }) {
  const initials = nombre
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (logoUrl) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-brand-200 bg-white">
        <Image
          src={logoUrl}
          alt={nombre}
          fill
          sizes="40px"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-50 text-[11px] font-bold tracking-wide text-accent-700">
      {initials || (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5 12 3l9 6.5V21H3V9.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
        </svg>
      )}
    </div>
  );
}
