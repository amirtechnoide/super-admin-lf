"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PostsView = "cards" | "table";

interface AppState {
  /** `null` = « Toutes les entreprises » (vue agrégée). */
  activeCompanyId: number | null;
  /** Affichage de la liste d'articles, mémorisé d'une session à l'autre. */
  postsView: PostsView;
  setActiveCompany: (companyId: number | null) => void;
  setPostsView: (view: PostsView) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeCompanyId: null,
      postsView: "cards",
      setActiveCompany: (activeCompanyId) => set({ activeCompanyId }),
      setPostsView: (postsView) => set({ postsView }),
    }),
    {
      name: "sogafric.preferences",
      // La réhydratation est déclenchée après le montage (voir Providers) :
      // sinon le premier rendu client différerait du HTML serveur.
      skipHydration: true,
    }
  )
);
