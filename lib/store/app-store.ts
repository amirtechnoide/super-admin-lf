"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Admin, Site } from "@/lib/types";
import { seedAdmin } from "@/lib/data/seed";

interface AppState {
  /** `null` = « Tous les sites » (vue agrégée). */
  activeSiteId: string | null;
  sites: Site[];
  admin: Admin;
  sitesLoaded: boolean;
  setActiveSite: (siteId: string | null) => void;
  setSites: (sites: Site[]) => void;
  setAdmin: (admin: Admin) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeSiteId: "camci",
      sites: [],
      admin: seedAdmin,
      sitesLoaded: false,
      setActiveSite: (activeSiteId) => set({ activeSiteId }),
      setSites: (sites) => set({ sites, sitesLoaded: true }),
      setAdmin: (admin) => set({ admin }),
    }),
    {
      name: "lfc-admin-preferences",
      // Seul le site actif est mémorisé ; les données viennent de lib/data/.
      partialize: (state) => ({ activeSiteId: state.activeSiteId }),
      // La réhydratation est déclenchée après le montage (voir Providers) :
      // sinon le premier rendu client différerait du HTML serveur.
      skipHydration: true,
    }
  )
);

/** Le site actif complet, ou `null` en vue agrégée. */
export function useActiveSite(): Site | null {
  const activeSiteId = useAppStore((s) => s.activeSiteId);
  const sites = useAppStore((s) => s.sites);
  if (!activeSiteId) return null;
  return sites.find((s) => s.id === activeSiteId) ?? null;
}
