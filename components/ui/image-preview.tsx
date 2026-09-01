"use client";

import * as React from "react";
import { ImageOff, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { useObjectUrl } from "@/lib/hooks/use-object-url";
import { Button } from "./button";

/**
 * Aperçu d'une image avant envoi. Un fichier local est affiché via une URL
 * d'objet (révoquée dès qu'il change, sinon le navigateur garde le blob en
 * mémoire) et une image déjà stockée via son URL distante.
 */
export function ImagePreview({
  file,
  url,
  onRemove,
  aspect = "aspect-square",
  fit = "contain",
  className,
}: {
  file?: File | null;
  url?: string | null;
  onRemove?: () => void;
  aspect?: string;
  /** `contain` affiche l'image entière, `cover` remplit le cadre en rognant. */
  fit?: "cover" | "contain";
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const objectUrl = useObjectUrl(file);

  const source = file ? objectUrl : url ?? null;

  // Nouvelle source = nouvel essai de chargement, ajusté pendant le rendu.
  const [lastSource, setLastSource] = React.useState(source);
  if (lastSource !== source) {
    setLastSource(source);
    setFailed(false);
  }

  // Le blob n'est prêt qu'après l'effet : on tient la place plutôt que de
  // faire disparaître le cadre le temps d'un rendu.
  if (!source) {
    return file ? (
      <div
        className={cn(
          "rounded-lg border border-border bg-surface-2",
          aspect,
          className
        )}
      />
    ) : null;
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-surface-2",
        className
      )}
    >
      {failed ? (
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1.5 px-3 text-muted",
            aspect
          )}
        >
          <ImageOff className="size-5" />
          <span className="break-all text-center font-mono text-[10px]">
            Image introuvable
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- blob local ou domaine de stockage non déclaré
        <img
          src={source}
          alt=""
          onError={() => setFailed(true)}
          className={cn(
            "w-full",
            fit === "contain" ? "object-contain p-3" : "object-cover",
            aspect
          )}
        />
      )}

      {onRemove ? (
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute right-2 top-2 shadow-sm"
          onClick={onRemove}
          aria-label="Retirer l'image"
        >
          <X />
        </Button>
      ) : null}

      {file ? (
        <p className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2.5 py-1.5 font-mono text-[10px] text-white backdrop-blur-sm">
          {file.name} · {formatBytes(file.size)} · envoyé à l&apos;enregistrement
        </p>
      ) : null}
    </div>
  );
}
