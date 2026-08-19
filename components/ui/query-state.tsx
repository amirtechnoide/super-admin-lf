"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { Button } from "./button";

/** Erreur de chargement : dit quoi faire, sans s'excuser. */
export function QueryError({
  error,
  onRetry,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Le chargement a échoué. Réessayez.";

  return (
    <div
      className={
        className ??
        "flex flex-col items-center gap-3 px-6 py-12 text-center"
      }
    >
      <div className="flex size-11 items-center justify-center rounded-xl border border-danger/20 bg-danger/10">
        <AlertTriangle className="size-5 text-danger" />
      </div>
      <p className="max-w-sm text-[13px] leading-relaxed text-text">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw />
          Réessayer
        </Button>
      ) : null}
    </div>
  );
}
