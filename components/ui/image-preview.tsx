"use client";

import * as React from "react";
import { ImageOff, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "./button";

/**
 * Aperçu d'une image avant envoi. Un fichier local est affiché via une URL
 * d'objet — révoquée dès qu'il change, sinon le navigateur garde le blob en
 * mémoire — et une image déjà stockée via son URL distante.
 */
export function ImagePreview({
  file,
  url,
  onRemove,
  aspect = "aspect-[16/9]",
  className,
}: {
  file?: File | null;
  url?: string | null;
  onRemove?: () => void;
  aspect?: string;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);

  const objectUrl = React.useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  // L'URL d'objet est révoquée dès qu'elle change ou que le composant part.
  React.useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const source = objectUrl ?? url ?? null;

  // Nouvelle source = nouvel essai de chargement, ajusté pendant le rendu.
  const [lastSource, setLastSource] = React.useState(source);
  if (lastSource !== source) {
    setLastSource(source);
    setFailed(false);
  }

  if (!source) return null;

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
          className={cn("w-full object-cover", aspect)}
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
