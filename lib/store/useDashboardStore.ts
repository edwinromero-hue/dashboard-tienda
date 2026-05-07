'use client';

import { create } from 'zustand';
import type { DashboardView } from '@/types/domain';

interface DashboardState {
  selectedDepartamentoCodigo: string | null;
  selectedMunicipioName: string | null;       // MPIO_CNMBR del GeoJSON
  selectedTiendaId: string | null;
  hoveredDepartamentoCodigo: string | null;
  hoveredMunicipioName: string | null;
  view: DashboardView;

  selectDepartamento: (codigo: string | null) => void;
  selectMunicipio: (name: string | null) => void;
  selectTienda: (id: string | null) => void;
  setHovered: (codigo: string | null) => void;
  setHoveredMunicipio: (name: string | null) => void;
  backToMap: () => void;
  hydrateFromUrl: (params: {
    dept: string | null;
    mun: string | null;
    store: string | null;
  }) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedDepartamentoCodigo: null,
  selectedMunicipioName: null,
  selectedTiendaId: null,
  hoveredDepartamentoCodigo: null,
  hoveredMunicipioName: null,
  view: 'map',

  selectDepartamento: (codigo) =>
    set({
      selectedDepartamentoCodigo: codigo,
      selectedMunicipioName: null,
      selectedTiendaId: null,
      view: 'map',
    }),

  selectMunicipio: (name) => set({ selectedMunicipioName: name, selectedTiendaId: null }),

  selectTienda: (id) =>
    set((state) => ({
      selectedTiendaId: id,
      view: id ? 'products' : state.view === 'products' ? 'map' : state.view,
    })),

  setHovered: (codigo) => set({ hoveredDepartamentoCodigo: codigo }),

  setHoveredMunicipio: (name) => set({ hoveredMunicipioName: name }),

  backToMap: () => set({ selectedTiendaId: null, view: 'map' }),

  hydrateFromUrl: ({ dept, mun, store }) =>
    set({
      selectedDepartamentoCodigo: dept,
      selectedMunicipioName: mun,
      selectedTiendaId: store,
      view: store ? 'products' : 'map',
    }),
}));
