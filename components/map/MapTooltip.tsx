'use client';

import { motion } from 'framer-motion';
import { Popup } from 'react-map-gl/maplibre';

export function MapTooltip({
  longitude,
  latitude,
  nombre,
  totalTiendas,
}: {
  longitude: number;
  latitude: number;
  nombre: string;
  totalTiendas: number;
}) {
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      closeButton={false}
      closeOnClick={false}
      offset={12}
      anchor="bottom"
    >
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="text-sm font-semibold text-brand-900">{nombre}</div>
        <div className="text-xs text-brand-600">
          {totalTiendas === 0
            ? 'Sin tiendas'
            : `${totalTiendas} ${totalTiendas === 1 ? 'tienda' : 'tiendas'}`}
        </div>
      </motion.div>
    </Popup>
  );
}
