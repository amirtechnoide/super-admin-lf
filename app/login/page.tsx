"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/data";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const setAdmin = useAppStore((s) => s.setAdmin);
  const [email, setEmail] = React.useState("amir@lfc.studio");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Saisissez votre adresse e-mail.");
      return;
    }
    setError(null);
    setPending(true);
    // UI seule : aucune authentification réelle n'est effectuée.
    const admin = await signIn(email);
    setAdmin(admin);
    router.push("/");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="mb-7 flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-md bg-text text-[11px] font-semibold text-bg"
          >
            LF
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">
            Studio Blog
          </span>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-5 space-y-1">
            <h1 className="text-lg font-semibold tracking-tight">Connexion</h1>
            <p className="text-[13px] text-muted">
              Accédez à l&apos;administration des blogs de vos cinq sites.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label="Adresse e-mail" htmlFor="email" error={error ?? undefined}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@exemple.com"
              />
            </Field>

            <Field label="Mot de passe" htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() =>
              toast("Lien de réinitialisation envoyé", {
                description: `Consultez la boîte de réception de ${email || "votre adresse"}.`,
              })
            }
            className="mt-4 text-[13px] text-muted underline-offset-4 transition-colors hover:text-text hover:underline"
          >
            Mot de passe oublié
          </button>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-muted">
          Interface de démonstration — les données sont simulées et aucune
          authentification n&apos;est effectuée.
        </p>
      </div>
    </div>
  );
}
