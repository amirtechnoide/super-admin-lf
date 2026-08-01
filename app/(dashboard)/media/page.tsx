"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, ImageIcon, Search, Trash2, Upload } from "lucide-react";
import { bulkDeleteMedia, getMedia, uploadMedia } from "@/lib/data";
import { useAsync, useDebounced } from "@/lib/hooks/use-async";
import { useActiveSite, useAppStore } from "@/lib/store/app-store";
import { cn, formatBytes, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaThumb } from "@/components/media/media-thumb";
import { SiteDot } from "@/components/layout/site-switcher";

export default function MediaPage() {
  const activeSiteId = useAppStore((s) => s.activeSiteId);
  const activeSite = useActiveSite();
  const sites = useAppStore((s) => s.sites);
  const aggregated = activeSiteId === null;

  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounced(query, 300);
  const media = useAsync(
    () => getMedia({ siteId: activeSiteId, query: debouncedQuery || undefined }),
    [activeSiteId, debouncedQuery]
  );

  // La sélection ne suit pas un changement de site.
  const [scope, setScope] = React.useState(activeSiteId);
  if (scope !== activeSiteId) {
    setScope(activeSiteId);
    setSelected([]);
  }

  /** Téléversement simulé : on n'enregistre que les métadonnées. */
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!activeSiteId) {
      toast.error("Choisissez un site avant de téléverser un média.");
      return;
    }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadMedia({
          siteId: activeSiteId,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
        });
      }
      toast.success(
        files.length > 1 ? `${files.length} médias ajoutés` : "Média ajouté"
      );
      media.reload();
    } finally {
      setUploading(false);
    }
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function confirmDelete() {
    const count = selected.length;
    await bulkDeleteMedia(selected);
    toast.success(`${count} média(s) supprimé(s)`);
    setSelected([]);
    media.reload();
  }

  const items = media.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Médias"
        description={
          aggregated
            ? "Bibliothèque agrégée — sélectionnez un site pour téléverser."
            : `Bibliothèque de ${activeSite?.name ?? "ce site"}.`
        }
        actions={
          <>
            {selected.length > 0 ? (
              <Button variant="outline" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
                Supprimer ({selected.length})
              </Button>
            ) : null}
            <Button
              onClick={() => inputRef.current?.click()}
              disabled={uploading || aggregated}
            >
              <Upload />
              {uploading ? "Téléversement…" : "Téléverser"}
            </Button>
          </>
        }
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {/* Zone de dépôt ---------------------------------------------------- */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-7 text-center transition-colors",
          dragging
            ? "border-accent bg-accent-softer"
            : "border-border-strong bg-surface"
        )}
      >
        <Upload className="size-5 text-muted" />
        <p className="text-[13px] font-medium">
          Déposez vos fichiers ici
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="ml-1 text-accent underline-offset-4 hover:underline"
            disabled={aggregated}
          >
            ou parcourez
          </button>
        </p>
        <p className="text-xs text-muted">
          Téléversement simulé — aucun fichier n&apos;est réellement stocké.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-3 sm:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher par nom de fichier…"
              className="pl-9"
              aria-label="Rechercher un média"
            />
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {media.loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[4/3] w-full rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title={
                query ? "Aucun média ne correspond" : "Bibliothèque vide"
              }
              description={
                query
                  ? "Essayez un autre nom de fichier."
                  : "Déposez un premier fichier pour alimenter la bibliothèque de ce site."
              }
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => {
                const isSelected = selected.includes(item.id);
                const site = sites.find((s) => s.id === item.siteId);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-lg border text-left transition-colors",
                        isSelected
                          ? "border-accent bg-accent-softer"
                          : "border-border bg-surface hover:border-border-strong"
                      )}
                    >
                      <MediaThumb item={item} className="aspect-[4/3]" />

                      <span
                        className={cn(
                          "absolute left-2 top-2 flex size-5 items-center justify-center rounded-md border transition-colors",
                          isSelected
                            ? "border-accent bg-accent text-accent-contrast"
                            : "border-white/80 bg-black/10 text-transparent backdrop-blur-[1px]"
                        )}
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </span>

                      <span className="block p-2.5">
                        <span className="flex items-center gap-1.5">
                          {aggregated ? (
                            <SiteDot color={site?.accentColor} />
                          ) : null}
                          <span className="min-w-0 flex-1 truncate text-xs font-medium">
                            {item.name}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] text-muted">
                          {formatBytes(item.size)} ·{" "}
                          {formatDateShort(item.uploadedAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Supprimer ${selected.length} média(s) ?`}
        description="Les fichiers sélectionnés disparaîtront de la bibliothèque. Les articles qui les utilisent ne seront pas modifiés."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
