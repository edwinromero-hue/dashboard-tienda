'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface BigCategory {
  name: string;
  titleLines: string[];
  bg: string;
  titleColor: string;
  image: string;
  imageAlt: string;
}

const CATEGORIES: BigCategory[] = [
  {
    name: 'Frutas',
    titleLines: ['Encuentra', 'frutas frescas'],
    bg: 'bg-emerald-100',
    titleColor: 'text-emerald-950',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=720&q=80',
    imageAlt: 'Frutas frescas',
  },
  {
    name: 'Lácteos',
    titleLines: ['Lácteos', 'del día'],
    bg: 'bg-sky-100',
    titleColor: 'text-sky-950',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=720&q=80',
    imageAlt: 'Lácteos del día',
  },
  {
    name: 'Bebidas',
    titleLines: ['Bebidas', 'para refrescar'],
    bg: 'bg-amber-100',
    titleColor: 'text-amber-950',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=720&q=80',
    imageAlt: 'Bebidas',
  },
  {
    name: 'Snacks',
    titleLines: ['Snacks', 'favoritos'],
    bg: 'bg-orange-100',
    titleColor: 'text-orange-950',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=720&q=80',
    imageAlt: 'Snacks',
  },
  {
    name: 'Carnes',
    titleLines: ['Carnes', 'premium'],
    bg: 'bg-rose-100',
    titleColor: 'text-rose-950',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=720&q=80',
    imageAlt: 'Carnes premium',
  },
  {
    name: 'Aseo',
    titleLines: ['Productos', 'para el hogar'],
    bg: 'bg-teal-100',
    titleColor: 'text-teal-950',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=720&q=80',
    imageAlt: 'Productos de aseo',
  },
  {
    name: 'Panadería',
    titleLines: ['Pan recién', 'horneado'],
    bg: 'bg-yellow-100',
    titleColor: 'text-yellow-950',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=720&q=80',
    imageAlt: 'Panadería',
  },
  {
    name: 'Granos',
    titleLines: ['Granos', 'selectos'],
    bg: 'bg-stone-100',
    titleColor: 'text-stone-950',
    image: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=720&q=80',
    imageAlt: 'Granos',
  },
];

// Velocidad del autoscroll en píxeles por segundo
const AUTO_SPEED_PX_S = 60;
// Pausa después de la última interacción del usuario
const RESUME_DELAY_MS = 2500;

export function PopularCategoriesCard() {
  // Duplicamos para hacer loop infinito sin saltos visibles.
  const items = [...CATEGORIES, ...CATEGORIES];
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = now - last;
      last = now;

      // Autoscroll solo si el usuario no ha interactuado recientemente
      if (now - lastInteractionRef.current > RESUME_DELAY_MS) {
        el.scrollLeft += (AUTO_SPEED_PX_S * dt) / 1000;
      }

      // Loop: cuando llegamos a la mitad (donde empiezan las copias),
      // reseteamos al inicio. Como el contenido es idéntico, no se nota.
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) {
        el.scrollLeft -= half;
      } else if (el.scrollLeft < 0) {
        el.scrollLeft += half;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Detección de interacción del usuario (no de scroll programático)
    const onUserInteract = () => {
      lastInteractionRef.current = performance.now();
    };
    el.addEventListener('pointerdown', onUserInteract);
    el.addEventListener('wheel', onUserInteract, { passive: true });
    el.addEventListener('touchstart', onUserInteract, { passive: true });
    el.addEventListener('touchmove', onUserInteract, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', onUserInteract);
      el.removeEventListener('wheel', onUserInteract);
      el.removeEventListener('touchstart', onUserInteract);
      el.removeEventListener('touchmove', onUserInteract);
    };
  }, []);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-sm">
      <header className="flex shrink-0 items-baseline justify-between px-5 pt-5 pb-3">
        <h3 className="text-[16px] font-black tracking-tight text-brand-900">
          Categorías populares
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400">
          {CATEGORIES.length} colecciones
        </span>
      </header>

      {/* Carrusel: autoscroll JS + scroll manual con dedo/mouse */}
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 cursor-grab gap-3 overflow-x-auto overflow-y-hidden px-3 pb-4 active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((c, i) => (
          <BigCategoryCard key={`${c.name}-${i}`} category={c} />
        ))}
      </div>
    </section>
  );
}

function BigCategoryCard({ category }: { category: BigCategory }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      className={cn(
        'group/card relative flex h-full w-72 shrink-0 cursor-pointer flex-col overflow-hidden rounded-3xl text-left',
        'shadow-md transition-shadow duration-300 hover:shadow-xl',
        category.bg,
      )}
    >
      {/* Título arriba */}
      <div className="shrink-0 px-5 pt-5 pb-3">
        <h4
          className={cn(
            'text-[26px] font-black leading-[1.05] tracking-tight',
            category.titleColor,
          )}
        >
          {category.titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h4>
      </div>

      {/* Imagen ocupa el resto */}
      <div className="relative min-h-0 flex-1">
        <Image
          src={category.image}
          alt={category.imageAlt}
          fill
          sizes="288px"
          className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          unoptimized
          draggable={false}
        />
      </div>

      {/* Chevron flotante esquina superior derecha */}
      <div className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-brand-700 shadow-sm backdrop-blur-sm transition-colors duration-200 group-hover/card:bg-white group-hover/card:text-accent-700">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </motion.button>
  );
}
