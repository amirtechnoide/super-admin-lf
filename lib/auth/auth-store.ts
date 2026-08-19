"use client";

import { create } from "zustand";

const TOKEN_KEY = "sogafric.token";
const REFRESH_KEY = "sogafric.refreshToken";

/** Lit le champ `sub` du JWT — le backend y place l'e-mail de l'admin. */
function readEmailFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json) as { sub?: string };
    return parsed.sub ?? null;
  } catch {
    return null;
  }
}

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  email: string | null;
  status: AuthStatus;
  setSession: (token: string, refreshToken: string) => void;
  clearSession: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  email: null,
  // `loading` tant que le localStorage n'a pas été lu : évite de rediriger
  // vers /login un admin déjà connecté au premier rendu.
  status: "loading",

  setSession: (token, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    set({
      token,
      refreshToken,
      email: readEmailFromToken(token),
      status: "authenticated",
    });
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    set({
      token: null,
      refreshToken: null,
      email: null,
      status: "anonymous",
    });
  },

  hydrate: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    set({
      token,
      refreshToken,
      email: readEmailFromToken(token),
      status: token && refreshToken ? "authenticated" : "anonymous",
    });
  },
}));

/* Accès hors composants React — utilisé par les intercepteurs axios. */
export const authStorage = {
  getToken: () => useAuthStore.getState().token,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setSession: (token: string, refreshToken: string) =>
    useAuthStore.getState().setSession(token, refreshToken),
  clear: () => useAuthStore.getState().clearSession(),
};
