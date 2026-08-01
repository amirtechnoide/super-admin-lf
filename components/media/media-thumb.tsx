"use client";

import { FileText, ImageIcon, Shapes } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Vignette de média. Aucun fichier réel n'existe côté serveur : on rend un
 * placeholder typé plutôt qu'une image cassée.
 */
export function MediaThumb({
  item,
  className,
}: {
  item: MediaItem;
  className?: string;
}) {
  const isPdf = item.type === "application/pdf";
  const isSvg = item.type === "image/svg+xml";
  const Icon = isPdf ? FileText : isSvg ? Shapes : ImageIcon;

  // Teinte stable dérivée du nom : la grille reste lisible et calme.
  const hue =
    [...item.name].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-surface-2",
        className
      )}
      style={
        isPdf
          ? undefined
          : {
              backgroundImage: `linear-gradient(135deg, hsl(${hue} 32% 92%), hsl(${(hue + 40) % 360} 28% 86%))`,
            }
      }
    >
      <Icon className="size-6 text-black/25 dark:text-white/35" />
      <span className="absolute bottom-1 right-1 rounded bg-black/45 px-1 py-0.5 font-mono text-[9px] uppercase text-white">
        {item.name.split(".").pop()}
      </span>
    </div>
  );
}
