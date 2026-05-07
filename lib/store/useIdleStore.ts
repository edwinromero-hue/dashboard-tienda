'use client';

import { create } from 'zustand';

interface IdleState {
  idle: boolean;
  setIdle: (v: boolean) => void;
}

export const useIdleStore = create<IdleState>((set) => ({
  idle: false,
  setIdle: (v) => set({ idle: v }),
}));
