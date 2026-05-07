'use client';

import Image from 'next/image';

// Categorías colombianas de retail local con imágenes Unsplash estables.
const CATEGORIES = [
  {
    name: 'Frutas',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
    tint: 'from-red-100',
  },
  {
    name: 'Lácteos',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    tint: 'from-blue-100',
  },
  {
    name: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80',
    tint: 'from-amber-100',
  },
  {
    name: 'Snacks',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80',
    tint: 'from-orange-100',
  },
  {
    name: 'Carnes',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
    tint: 'from-rose-100',
  },
  {
    name: 'Aseo',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
    tint: 'from-teal-100',
  },
  {
    name: 'Panadería',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    tint: 'from-amber-100',
  },
  {
    name: 'Granos',
    image: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400&q=80',
    tint: 'from-yellow-100',
  },
];

export function PopularCategoriesCard() {
  // Duplicamos el array para que el loop del marquee sea perfecto: cuando llega
  // a -50% de translateX, las copias 7-12 ocupan el lugar de las 1-6 sin saltos.
  const items = [...CATEGORIES, ...CATEGORIES];

  return (
    <section className="overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-sm">
      <header className="flex items-baseline justify-between px-5 pt-5 pb-3">
        <h3 className="text-[16px] font-black tracking-tight text-brand-900">
          Categorías populares
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400">
          {CATEGORIES.length} categorías
        </span>
      </header>

      {/* Marquee horizontal infinito (pausa en hover/touch) */}
      <div className="group relative pb-5">
        {/* Edge fades para sugerir continuidad */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent" />

        <div className="flex w-fit gap-4 px-5 animate-marquee-x group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused]">
          {items.map((c, i) => (
            <CategoryCircle key={`${c.name}-${i}`} category={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCircle({
  category,
}: {
  category: (typeof CATEGORIES)[number];
}) {
  return (
    <button
      type="button"
      className="group/cat flex w-[88px] shrink-0 cursor-pointer flex-col items-center gap-1.5"
    >
      <div className="relative h-[78px] w-[78px] overflow-hidden rounded-full bg-brand-100 ring-2 ring-white shadow-md transition-shadow duration-300 group-hover/cat:shadow-xl">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-500 group-hover/cat:scale-110"
          unoptimized
        />
        <div
          className={`pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr ${category.tint} via-transparent to-transparent opacity-50 mix-blend-multiply`}
        />
        <div className="pointer-events-none absolute inset-0 rounded-full ring-0 ring-accent-400/0 transition-all duration-300 group-hover/cat:ring-4 group-hover/cat:ring-accent-400/40" />
      </div>
      <p className="truncate text-[11px] font-bold tracking-tight text-brand-900 group-hover/cat:text-accent-700">
        {category.name}
      </p>
    </button>
  );
}
