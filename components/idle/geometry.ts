// Geometría compartida del modo idle: 4 cuadrantes anclados a las esquinas
// del viewport del mapa. Las tarjetas se posicionan vía CSS y la línea SVG
// usa estos mismos cálculos para alinearse con la esquina interior de la
// tarjeta (la que apunta al mapa).

export const QUADRANTS = ['NW', 'NE', 'SW', 'SE'] as const;
export type Quadrant = (typeof QUADRANTS)[number];

// Desplazamiento desde el borde del contenedor hasta la tarjeta (debe coincidir
// con las clases de Tailwind en FloatingStoreCard.tsx → top/left/bottom/right).
export const SLOT_INSET_PX = 48; // 12 * 4 (Tailwind '12')

import { FLOATING_CARD_W, FLOATING_CARD_H } from './FloatingStoreCard';

// Devuelve la coordenada en píxeles del punto donde la línea SVG se conecta
// a la tarjeta (la esquina de la tarjeta que mira hacia el centro del mapa).
export function slotAnchorPixel(
  q: Quadrant,
  containerW: number,
  containerH: number,
): { x: number; y: number } {
  switch (q) {
    case 'NW':
      return {
        x: SLOT_INSET_PX + FLOATING_CARD_W,
        y: SLOT_INSET_PX + FLOATING_CARD_H,
      };
    case 'NE':
      return {
        x: containerW - SLOT_INSET_PX - FLOATING_CARD_W,
        y: SLOT_INSET_PX + FLOATING_CARD_H,
      };
    case 'SW':
      return {
        x: SLOT_INSET_PX + FLOATING_CARD_W,
        y: containerH - SLOT_INSET_PX - FLOATING_CARD_H,
      };
    case 'SE':
      return {
        x: containerW - SLOT_INSET_PX - FLOATING_CARD_W,
        y: containerH - SLOT_INSET_PX - FLOATING_CARD_H,
      };
  }
}

// Cuadrante de un punto respecto al centro del contenedor.
export function quadrantOf(
  px: { x: number; y: number },
  containerW: number,
  containerH: number,
): Quadrant {
  const cx = containerW / 2;
  const cy = containerH / 2;
  if (px.x < cx) return px.y < cy ? 'NW' : 'SW';
  return px.y < cy ? 'NE' : 'SE';
}
