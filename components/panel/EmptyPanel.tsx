'use client';

import { motion } from 'framer-motion';
import { HomeIntroCard } from '@/components/home/HomeIntroCard';
import { PopularCategoriesCard } from '@/components/home/PopularCategoriesCard';

export function EmptyPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-full min-h-0 flex-col gap-4"
    >
      {/* Intro: altura natural, no se encoge */}
      <div className="shrink-0">
        <HomeIntroCard />
      </div>
      {/* Categorías: ocupa todo el espacio restante hasta abajo */}
      <PopularCategoriesCard />
    </motion.div>
  );
}
