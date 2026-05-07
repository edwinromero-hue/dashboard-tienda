'use client';

import { useEffect } from 'react';
import { useIdleStore } from '@/lib/store/useIdleStore';
import { useDashboardStore } from '@/lib/store/useDashboardStore';

const IDLE_MS = 30_000;

export function useIdleDetector() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const goActive = () => {
      if (useIdleStore.getState().idle) {
        useIdleStore.getState().setIdle(false);
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        // Al entrar a idle, limpiamos selección para que el mapa vuelva a la
        // vista nacional y los puntos de los 4 cuadrantes sean alcanzables.
        const dash = useDashboardStore.getState();
        if (dash.selectedTiendaId) dash.selectTienda(null);
        if (dash.selectedDepartamentoCodigo) dash.selectDepartamento(null);
        useIdleStore.getState().setIdle(true);
      }, IDLE_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      'pointerdown',
      'pointermove',
      'keydown',
      'wheel',
      'touchstart',
    ];
    events.forEach((e) => window.addEventListener(e, goActive, { passive: true }));
    goActive();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, goActive));
    };
  }, []);
}
