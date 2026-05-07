'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api/client';
import type { Producto } from '@/types/domain';
import { ProductCard } from './ProductCard';
import { BackToMapButton } from './BackToMapButton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

export function ProductsGrid({ tiendaId }: { tiendaId: string }) {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProductos(null);
    setError(null);
    api
      .productosByTienda(tiendaId)
      .then((p) => !cancelled && setProductos(p))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [tiendaId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col bg-brand-50"
    >
      <div className="flex items-center justify-between border-b border-brand-200 bg-white px-6 py-4">
        <BackToMapButton />
        <div className="text-xs text-brand-500">
          {productos && (
            <span>
              <span className="font-semibold text-brand-900">{productos.length}</span>{' '}
              productos
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {productos === null ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-brand-200 bg-white"
              >
                <div className="aspect-square shimmer-bg" />
                <div className="space-y-2 p-3">
                  <div className="shimmer-bg h-4 w-3/4 rounded" />
                  <div className="shimmer-bg h-5 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-sm font-medium text-brand-700">
                Esta tienda aún no tiene productos cargados.
              </p>
              <p className="mt-1 text-xs text-brand-400">
                Vuelve al mapa para explorar otras tiendas.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {productos.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
