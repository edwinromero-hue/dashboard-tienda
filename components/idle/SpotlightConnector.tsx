'use client';

import { motion } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

// Línea que conecta la esquina interior de la tarjeta con el centroide del
// departamento. Estilo futurista: trazo con gradiente blanco→accent, draw-in
// animado, punto pulsante en el extremo del mapa.
export function SpotlightConnector({
  from,
  to,
  gradientId,
}: {
  from: Point;
  to: Point;
  gradientId: string;
}) {
  // Línea ortogonal con elbow para look "HUD". Toma el camino más corto:
  // primero horizontal, luego vertical (o viceversa según ángulo).
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Codo a 60% del trayecto en X (luego baja/sube): da un quiebre limpio.
  const elbowX = from.x + dx * 0.55;
  const path = `M ${from.x} ${from.y} L ${elbowX} ${from.y} L ${elbowX} ${to.y} L ${to.x} ${to.y}`;

  return (
    <g>
      <defs>
        <linearGradient
          id={gradientId}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#a8d863" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7ab83c" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Halo / glow */}
      <motion.path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.25}
        style={{ filter: 'blur(4px)' }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
      />

      {/* Trazo principal */}
      <motion.path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
      />

      {/* Anchor en la tarjeta (pequeño cuadro abierto) */}
      <motion.rect
        x={from.x - 3}
        y={from.y - 3}
        width={6}
        height={6}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.5}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />

      {/* Pulso en el centroide del departamento */}
      <motion.circle
        cx={to.x}
        cy={to.y}
        r={5}
        fill="#8cc63f"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.4, ease: 'backOut' }}
        style={{ transformOrigin: `${to.x}px ${to.y}px`, filter: 'drop-shadow(0 0 6px rgba(140,198,63,0.9))' }}
      />
      {/* Anillo pulsante */}
      <motion.circle
        cx={to.x}
        cy={to.y}
        r={5}
        fill="none"
        stroke="#8cc63f"
        strokeWidth={2}
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 0, scale: 3.4 }}
        transition={{
          delay: 0.9,
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: `${to.x}px ${to.y}px` }}
      />
    </g>
  );
}
