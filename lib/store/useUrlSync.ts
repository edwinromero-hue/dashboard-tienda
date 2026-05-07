'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDashboardStore } from './useDashboardStore';

export function useUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydratedRef = useRef(false);

  // Hidratar store desde URL al montar (una sola vez)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    useDashboardStore.getState().hydrateFromUrl({
      dept: searchParams.get('dept'),
      mun: searchParams.get('mun'),
      store: searchParams.get('store'),
    });
  }, [searchParams]);

  // Sincronizar URL cuando cambia el store (debounced)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = useDashboardStore.subscribe((state) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const params = new URLSearchParams();
        if (state.selectedDepartamentoCodigo) {
          params.set('dept', state.selectedDepartamentoCodigo);
        }
        if (state.selectedMunicipioName) {
          params.set('mun', state.selectedMunicipioName);
        }
        if (state.selectedTiendaId) {
          params.set('store', state.selectedTiendaId);
        }
        const qs = params.toString();
        const next = qs ? `${pathname}?${qs}` : pathname;
        router.replace(next, { scroll: false });
      }, 100);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [pathname, router]);
}
