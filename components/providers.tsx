"use client";

import * as React from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError } from "@/lib/api/errors";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useCompanies } from "@/lib/queries/use-companies";
import { useAppStore } from "@/lib/store/app-store";
import { accentForCompany, NEUTRAL_ACCENT } from "@/lib/theme/company-accent";
import { contrastOn } from "@/lib/utils";

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Inutile d'insister sur une erreur d'authentification ou un 404 :
        // l'intercepteur a déjà tenté le rafraîchissement du jeton.
        const status = error instanceof ApiError ? error.status : undefined;
        if (status && [400, 401, 403, 404, 409].includes(status)) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
};

/**
 * Injecte la couleur de l'entreprise active dans `--accent`. C'est le seul
 * endroit où l'identité d'un client teinte le chrome du dashboard.
 */
function AccentProvider({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const { data: companies } = useCompanies({
    enabled: status === "authenticated",
  });

  const company = companies?.find((c) => c.id === activeCompanyId) ?? null;
  const accent = company ? accentForCompany(company) : NEUTRAL_ACCENT;

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-contrast", contrastOn(accent));
  }, [accent]);

  return <>{children}</>;
}

/** Relit le jeton et les préférences après l'hydratation React. */
function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  React.useEffect(() => {
    hydrate();
    void useAppStore.persist.rehydrate();
  }, [hydrate]);

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
  // Une instance par montage : jamais partagée entre deux rendus serveur.
  const [queryClient] = React.useState(() => new QueryClient(queryConfig));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <SessionBootstrap>
          <AccentProvider>
            {children}
            <ThemedToaster />
          </AccentProvider>
        </SessionBootstrap>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
