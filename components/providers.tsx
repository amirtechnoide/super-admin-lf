"use client";

import * as React from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { getSites } from "@/lib/data";
import { useAppStore } from "@/lib/store/app-store";
import { contrastOn } from "@/lib/utils";

/**
 * Injecte la couleur du site actif dans `--accent`. C'est le seul endroit
 * où l'identité d'un client teinte le chrome du dashboard.
 */
function AccentProvider({ children }: { children: React.ReactNode }) {
  const activeSiteId = useAppStore((s) => s.activeSiteId);
  const sites = useAppStore((s) => s.sites);

  React.useEffect(() => {
    const site = sites.find((s) => s.id === activeSiteId);
    // Vue « Tous les sites » : accent neutre, aucun client mis en avant.
    const accent = site?.accentColor ?? "#52525b";
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-contrast", contrastOn(accent));
  }, [activeSiteId, sites]);

  return <>{children}</>;
}

/** Charge la liste des sites dans le store — via lib/data/, jamais de fetch. */
function SitesBootstrap({ children }: { children: React.ReactNode }) {
  const setSites = useAppStore((s) => s.setSites);
  const setActiveSite = useAppStore((s) => s.setActiveSite);

  React.useEffect(() => {
    // Restaure le site actif mémorisé, une fois l'hydratation terminée.
    void useAppStore.persist.rehydrate();

    let cancelled = false;
    getSites().then((sites) => {
      if (cancelled) return;
      setSites(sites);
      // Si le site mémorisé n'existe plus, on retombe sur la vue agrégée.
      const { activeSiteId } = useAppStore.getState();
      if (activeSiteId && !sites.some((s) => s.id === activeSiteId)) {
        setActiveSite(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [setSites, setActiveSite]);

  return <>{children}</>;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      theme={(resolvedTheme as "light" | "dark") ?? "light"}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border !border-border !bg-surface !text-text !shadow-md !font-sans",
          description: "!text-muted",
          actionButton: "!bg-accent !text-accent-contrast !rounded-lg",
          cancelButton: "!bg-surface-2 !text-text !rounded-lg",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SitesBootstrap>
        <AccentProvider>
          {children}
          <ThemedToaster />
        </AccentProvider>
      </SitesBootstrap>
    </ThemeProvider>
  );
}
