"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth/auth-store";
import { LoginForm } from "@/components/auth/login-form";

/** Accent propre à l'écran de connexion : aucune entreprise n'est encore active. */
const BRAND_ACCENT = "#2F5BEA";

const HIGHLIGHTS = [
  "Un seul dashboard pour tous les blogs clients",
  "Rédaction, publication et brouillons en un clic",
  "Chiffres consolidés, mis à jour en direct",
];

export default function LoginPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  // Un admin déjà connecté n'a rien à faire sur cet écran.
  React.useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  return (
    <div
      className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,520px)]"
      style={
        {
          "--accent": BRAND_ACCENT,
          "--accent-contrast": "#ffffff",
        } as React.CSSProperties
      }
    >
      {/* Panneau de marque, masqué sous lg pour laisser la place au formulaire. */}
      <aside className="relative hidden overflow-hidden bg-[#0E1220] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60rem 40rem at 15% 10%, rgba(47,91,234,0.35), transparent 60%), radial-gradient(45rem 35rem at 85% 85%, rgba(14,154,167,0.28), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(70% 60% at 50% 40%, #000 40%, transparent 100%)",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-md bg-white text-[11px] font-semibold text-[#0E1220]"
          >
            SG
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">
            Sogafric Blog
          </span>
        </div>

        <div className="relative max-w-md">
          <h2 className="animate-rise font-display text-[34px] font-semibold leading-[1.15] tracking-tight">
            Vos blogs clients,
            <br />
            pilotés depuis un seul écran.
          </h2>
          <ul className="mt-7 space-y-3">
            {HIGHLIGHTS.map((item, index) => (
              <li
                key={item}
                className="animate-rise flex items-start gap-2.5 text-[13px] leading-relaxed text-white/70"
                style={{ animationDelay: `${80 + index * 70}ms` }}
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-white/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-[11px] text-white/35">
          Administration réservée aux équipes Sogafric
        </p>
      </aside>

      {/* Colonne formulaire */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span
              aria-hidden
              className="flex size-7 items-center justify-center rounded-md bg-text text-[11px] font-semibold text-bg"
            >
              SG
            </span>
            <span className="font-display text-sm font-semibold tracking-tight">
              Sogafric Blog
            </span>
          </div>

          <div className="animate-rise mb-7 space-y-1.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Content de vous revoir
            </h1>
            <p className="text-[13px] leading-relaxed text-muted">
              Connectez-vous pour gérer les articles de vos entreprises.
            </p>
          </div>

          <div
            className="animate-rise"
            style={{ animationDelay: "60ms" }}
          >
            <LoginForm />
          </div>

          {/* Signature de l'agence. Elle est sous le formulaire, seule
              colonne visible à toutes les tailles d'écran. */}
          <p
            className="animate-rise mt-8 text-center text-[12px] text-muted"
            style={{ animationDelay: "120ms" }}
          >
            Créé par{" "}
            <a
              href="https://lf-company.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-text underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              LF COMPANY
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
