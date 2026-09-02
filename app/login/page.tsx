"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/auth-store";
import { LoginForm } from "@/components/auth/login-form";
import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  // Un admin déjà connecté n'a rien à faire sur cet écran.
  React.useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden bg-bg"
      style={
        {
          // Le logo LF COMPANY est monochrome : l'encre du thème fait un bien
          // meilleur accent qu'une couleur rapportée. Bouton noir sur fond
          // clair, blanc sur fond sombre.
          "--accent": "var(--text)",
          "--accent-contrast": "var(--bg)",
        } as React.CSSProperties
      }
    >
      {/* Fond : un halo doux et la marque en filigrane, sans motif répétitif. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_50%_-10%,var(--surface-3),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 opacity-[0.035] dark:opacity-[0.06]"
      >
        <LogoMark size={520} />
      </div>

      <header className="relative flex items-center justify-between px-5 py-5 sm:px-8">
        <span className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-display text-[13px] font-semibold tracking-tight">
            LF COMPANY
          </span>
        </span>
        <ThemeToggle />
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="animate-rise mb-8 text-center">
            <LogoMark size={54} className="mx-auto" />
            <h1 className="mt-2.5 font-display text-[28px] font-semibold leading-tight tracking-tight">
              Content de vous revoir
            </h1>
            <p className="mx-auto mt-2.5 max-w-[19rem] text-[13px] leading-relaxed text-muted">
              Connectez-vous pour rédiger et publier les articles de vos
              entreprises.
            </p>
          </div>

          <div
            className="animate-rise rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-7"
            style={{ animationDelay: "60ms" }}
          >
            <LoginForm />
          </div>

          <p
            className="animate-rise mt-7 text-center text-[12px] text-muted"
            style={{ animationDelay: "120ms" }}
          >
            Administration réservée aux équipes{" "}
            <a
              href="https://lf-company.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-text underline-offset-4 transition-colors hover:underline"
            >
              LF COMPANY
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
