"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { login } from "@/lib/api/auth";
import { authRequestSchema, type AuthRequest } from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import { useAuthStore } from "@/lib/auth/auth-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

/** Champ avec icône à gauche et action optionnelle à droite. */
function TextField({
  id,
  label,
  icon: Icon,
  error,
  action,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          id={id}
          className={cn(
            "h-11 w-full rounded-xl border bg-surface pl-9 pr-10 text-sm text-text",
            "placeholder:text-muted/70 transition-all duration-150",
            "hover:border-border-strong",
            "focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent-soft",
            error ? "border-danger" : "border-border",
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {action ? (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {action}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="animate-rise text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function LoginForm({
  onForgotPassword,
}: {
  onForgotPassword: () => void;
}) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<AuthRequest>({
    resolver: zodResolver(authRequestSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session.token, session.refreshToken);
      router.replace("/");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError &&
        (error.status === 403 || error.status === 401)
          ? "Adresse e-mail ou mot de passe incorrect."
          : error instanceof ApiError
            ? error.message
            : "La connexion a échoué.";
      form.setError("password", { message });
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="space-y-4"
      noValidate
    >
      <TextField
        id="email"
        label="Adresse e-mail"
        icon={Mail}
        type="email"
        autoComplete="email"
        placeholder="vous@exemple.com"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />

      <TextField
        id="password"
        label="Mot de passe"
        icon={Lock}
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        error={form.formState.errors.password?.message}
        action={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        }
        {...form.register("password")}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[13px] text-muted underline-offset-4 transition-colors hover:text-text hover:underline"
        >
          Mot de passe oublié
        </button>
      </div>

      <Button
        type="submit"
        size="lg"
        className="group w-full rounded-xl"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Spinner />
            Connexion…
          </>
        ) : (
          <>
            Se connecter
            <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}
