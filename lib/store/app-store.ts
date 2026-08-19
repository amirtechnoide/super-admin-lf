"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  /** `null` = « Toutes les entreprises » (vue agrégée). */
  activeCompanyId: number | null;
  setActiveCompany: (companyId: number | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeCompanyId: null,
      setActiveCompany: (activeCompanyId) => set({ activeCompanyId }),
    }),
    {
      name: "sogafric.preferences",
      // La réhydratation est déclenchée après le montage (voir Providers) :
      // sinon le premier rendu client différerait du HTML serveur.
      skipHydration: true,
    }
  )
);
