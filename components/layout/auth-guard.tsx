"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/auth-store";

/** Bloque l'accès au dashboard tant qu'aucun jeton valide n'est en mémoire. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  React.useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="flex items-center gap-3 text-[13px] text-muted">
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-border border-t-accent"
          />
          {status === "loading"
            ? "Vérification de la session…"
            : "Redirection vers la connexion…"}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
