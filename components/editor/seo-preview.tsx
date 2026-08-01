"use client";

import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

/** Aperçu du snippet Google, mis à jour en direct. */
export function SeoPreview({
  domain,
  slug,
  metaTitle,
  metaDescription,
  fallbackTitle,
  fallbackDescription,
}: {
  domain: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  fallbackTitle: string;
  fallbackDescription: string;
}) {
  const title = metaTitle.trim() || fallbackTitle || "Titre de l'article";
  const description =
    metaDescription.trim() ||
    fallbackDescription ||
    "Ajoutez une méta-description pour contrôler le texte affiché dans les résultats de recherche.";

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
          <Globe className="size-3 text-muted" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium leading-tight text-text">
            {domain}
          </p>
          <p className="truncate font-mono text-[10px] leading-tight text-muted">
            {domain}/blog/{slug || "slug-de-larticle"}
          </p>
        </div>
      </div>

      <p
        className={cn(
          "mt-2 line-clamp-2 text-[15px] leading-snug",
          "text-[#1a0dab] dark:text-[#8ab4f8]"
        )}
      >
        {title}
      </p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}

/** Compteur de caractères avec seuil recommandé. */
export function CharCounter({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const over = value > max;
  return (
    <span
      className={cn(
        "font-mono tabular",
        over ? "text-danger" : value > max * 0.9 ? "text-warning" : "text-muted"
      )}
    >
      {value}/{max}
    </span>
  );
}
