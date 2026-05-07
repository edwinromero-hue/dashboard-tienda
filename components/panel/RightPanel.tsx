'use client';

import { AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { EmptyPanel } from './EmptyPanel';
import { DepartmentPanel } from './DepartmentPanel';
import { StorePanel } from './StorePanel';

export function RightPanel() {
  const departamento = useDashboardStore((s) => s.selectedDepartamentoCodigo);
  const tiendaId = useDashboardStore((s) => s.selectedTiendaId);

  return (
    <AnimatePresence mode="wait">
      {tiendaId ? (
        <StorePanel
          key={`store-${tiendaId}`}
          tiendaId={tiendaId}
          departamentoCodigo={departamento}
        />
      ) : departamento ? (
        <DepartmentPanel key={`dept-${departamento}`} codigo={departamento} />
      ) : (
        <EmptyPanel key="empty" />
      )}
    </AnimatePresence>
  );
}
