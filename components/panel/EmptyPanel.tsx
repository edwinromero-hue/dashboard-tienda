'use client';

import { motion } from 'framer-motion';
import { HomeIntroCard } from '@/components/home/HomeIntroCard';
import { PopularCategoriesCard } from '@/components/home/PopularCategoriesCard';
import { TopDepartamentosChart } from '@/components/home/TopDepartamentosChart';

export function EmptyPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 pb-4"
    >
      <HomeIntroCard />
      <PopularCategoriesCard />
      <TopDepartamentosChart />
    </motion.div>
  );
}
