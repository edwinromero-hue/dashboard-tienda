'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { MapRef } from 'react-map-gl/maplibre';
import { api, type FeaturedProduct } from '@/lib/api/client';
import { useIdleStore } from '@/lib/store/useIdleStore';
import {
  loadColombiaGeoJSON,
  featureBbox,
} from '@/lib/geo/colombia-departments';
import { FloatingStoreCard } from './FloatingStoreCard';
import { SpotlightConnector } from './SpotlightConnector';
import { MapInteractionHint } from './MapInteractionHint';
import {
  QUADRANTS,
  type Quadrant,
  quadrantOf,
  slotAnchorPixel,
} from './geometry';

const ROTATE_MS = 8000;

interface Spotlight {
  product: FeaturedProduct;
  centroid: [number, number]; // lng, lat
}

type SpotlightsByQuadrant = Partial<Record<Quadrant, Spotlight>>;

export function IdleOverlay({ mapRef }: { mapRef: RefObject<MapRef | null> }) {
  const idle = useIdleStore((s) => s.idle);

  const [centroidsByDept, setCentroidsByDept] =
    useState<Record<string, [number, number]>>({});
  const [spotlights, setSpotlights] = useState<SpotlightsByQuadrant>({});
  const [pixels, setPixels] = useState<Partial<Record<Quadrant, { x: number; y: number }>>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Centroides de departamentos (una sola vez)
  useEffect(() => {
    let cancelled = false;
    loadColombiaGeoJSON().then((geo) => {
      if (cancelled) return;
      const map: Record<string, [number, number]> = {};
      for (const f of geo.features) {
        const [minLng, minLat, maxLng, maxLat] = featureBbox(f);
        map[f.properties.DPTO_CCDGO] = [
          (minLng + maxLng) / 2,
          (minLat + maxLat) / 2,
        ];
      }
      setCentroidsByDept(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Pickear spotlights al entrar en idle + rotar cada ROTATE_MS
  useEffect(() => {
    if (!idle) {
      setSpotlights({});
      return;
    }
    if (Object.keys(centroidsByDept).length === 0) return;

    let cancelled = false;

    const pick = async () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const map = mapRef.current?.getMap();
      if (!rect || !map) return;

      let items: FeaturedProduct[] = [];
      try {
        items = await api.featured(40);
      } catch {
        items = [];
      }
      if (cancelled) return;

      // Dedup por departamento (1 tienda destacada por depto en este ciclo)
      const seen = new Set<string>();
      const candidates: { quadrant: Quadrant; spotlight: Spotlight }[] = [];
      for (const p of items) {
        if (!p.departamentoCodigo || seen.has(p.departamentoCodigo)) continue;
        const c = centroidsByDept[p.departamentoCodigo];
        if (!c) continue;
        const px = map.project(c);
        const q = quadrantOf(
          { x: px.x, y: px.y },
          rect.width,
          rect.height,
        );
        candidates.push({ quadrant: q, spotlight: { product: p, centroid: c } });
        seen.add(p.departamentoCodigo);
      }

      // Agrupar y elegir uno por cuadrante (random dentro del grupo)
      const byQ: Record<Quadrant, Spotlight[]> = { NW: [], NE: [], SW: [], SE: [] };
      for (const { quadrant, spotlight } of candidates) {
        byQ[quadrant].push(spotlight);
      }
      const next: SpotlightsByQuadrant = {};
      for (const q of QUADRANTS) {
        const pool = byQ[q];
        if (pool.length) next[q] = pool[Math.floor(Math.random() * pool.length)];
      }
      setSpotlights(next);
    };

    pick();
    const t = setInterval(pick, ROTATE_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [idle, centroidsByDept, mapRef]);

  // Reproyectar centroides cuando se mueva/zoom el mapa o cambie la ventana
  useEffect(() => {
    if (!idle) return;
    const map = mapRef.current?.getMap();
    const el = containerRef.current;
    if (!map || !el) return;

    const recompute = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
      const next: Partial<Record<Quadrant, { x: number; y: number }>> = {};
      for (const q of QUADRANTS) {
        const s = spotlights[q];
        if (!s) continue;
        const px = map.project(s.centroid);
        next[q] = { x: px.x, y: px.y };
      }
      setPixels(next);
    };

    recompute();
    map.on('move', recompute);
    map.on('zoom', recompute);
    map.on('resize', recompute);
    window.addEventListener('resize', recompute);
    return () => {
      map.off('move', recompute);
      map.off('zoom', recompute);
      map.off('resize', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, [idle, spotlights, mapRef]);

  return (
    <AnimatePresence>
      {idle && (
        <motion.div
          ref={containerRef}
          key="idle-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute inset-0 z-20"
        >
          {/* Sutil tinte de fondo para realzar las tarjetas glass */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/10 via-transparent to-accent-900/15" />

          {/* SVG con las líneas conectoras */}
          <svg
            className="absolute inset-0 h-full w-full"
            width={size.w || '100%'}
            height={size.h || '100%'}
          >
            <AnimatePresence>
              {QUADRANTS.map((q) => {
                const s = spotlights[q];
                const p = pixels[q];
                if (!s || !p || !size.w || !size.h) return null;
                const from = slotAnchorPixel(q, size.w, size.h);
                const key = `${q}-${s.product.tiendaId}-${s.product.id}`;
                return (
                  <motion.g
                    key={key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <SpotlightConnector
                      from={from}
                      to={p}
                      gradientId={`grad-${q}-${s.product.id}`}
                    />
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>

          {/* Tarjetas */}
          <AnimatePresence>
            {QUADRANTS.map((q) => {
              const s = spotlights[q];
              if (!s) return null;
              const key = `${q}-${s.product.tiendaId}-${s.product.id}`;
              return <FloatingStoreCard key={key} product={s.product} quadrant={q} />;
            })}
          </AnimatePresence>

          {/* CTA central inferior */}
          <MapInteractionHint />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
