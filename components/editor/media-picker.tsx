"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import { getMedia } from "@/lib/data";
import { useAsync } from "@/lib/hooks/use-async";
import { cn, formatBytes } from "@/lib/utils";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaThumb } from "@/components/media/media-thumb";

/** Sélecteur de média — réutilise la bibliothèque du site actif. */
export function MediaPickerDialog({
  open,
  onOpenChange,
  siteId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string | null;
  onSelect: (url: string) => void;
}) {
  const media = useAsync(
    () => (open ? getMedia({ siteId }) : Promise.resolve([])),
    [open, siteId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Choisir un média</DialogTitle>
          <DialogDescription>
            Les médias de la bibliothèque du site actif.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {media.loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[4/3] w-full" />
              ))}
            </div>
          ) : (media.data ?? []).length === 0 ? (
            <EmptyState
              icon={ImageOff}
              title="Bibliothèque vide"
              description="Téléversez d'abord un média depuis l'écran Médias."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {(media.data ?? []).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.url);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "group overflow-hidden rounded-lg border border-border bg-surface text-left transition-colors hover:border-accent"
                  )}
                >
                  <MediaThumb item={item} className="aspect-[4/3]" />
                  <div className="p-2">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <p className="truncate font-mono text-[10px] text-muted">
                      {formatBytes(item.size)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
