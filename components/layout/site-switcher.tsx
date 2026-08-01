"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Layers, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/app-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Pastille de couleur du site — le repère visuel du multi-tenant. */
export function SiteDot({
  color,
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color ?? "var(--muted)" }}
    />
  );
}

/**
 * Combobox de sélection du site actif. L'admin voit les 5 sites, plus une
 * option « Tous les sites » pour la vue agrégée.
 */
export function SiteSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const sites = useAppStore((s) => s.sites);
  const activeSiteId = useAppStore((s) => s.activeSiteId);
  const setActiveSite = useAppStore((s) => s.setActiveSite);

  const activeSite = sites.find((s) => s.id === activeSiteId) ?? null;
  const filtered = sites.filter((site) =>
    `${site.name} ${site.domain}`.toLowerCase().includes(query.toLowerCase())
  );

  function select(id: string | null) {
    setActiveSite(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="site-switcher-list"
          aria-label="Changer de site"
          className={cn(
            "flex h-9 max-md:h-10 min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-[13px] font-medium transition-colors hover:border-border-strong",
            "max-w-[190px] sm:max-w-[240px]"
          )}
        >
          {activeSite ? (
            <SiteDot color={activeSite.accentColor} />
          ) : (
            <Layers className="size-3.5 shrink-0 text-muted" />
          )}
          <span className="truncate">
            {activeSite?.name ?? "Tous les sites"}
          </span>
          <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        id="site-switcher-list"
        className="w-[min(20rem,calc(100vw-1.5rem))] p-0"
        align="start"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-3.5 shrink-0 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un site…"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted"
            autoFocus
          />
        </div>

        <div className="max-h-[min(60vh,20rem)] overflow-y-auto scrollbar-thin p-1">
          <button
            type="button"
            onClick={() => select(null)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-surface-2",
              !activeSiteId && "bg-surface-2"
            )}
          >
            <Layers className="size-4 shrink-0 text-muted" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">Tous les sites</span>
              <span className="block truncate text-xs text-muted">
                Vue agrégée sur {sites.length} sites
              </span>
            </span>
            {!activeSiteId ? (
              <Check className="size-4 shrink-0 text-accent" />
            ) : null}
          </button>

          <div className="my-1 h-px bg-border" />

          {filtered.length === 0 ? (
            <p className="px-2.5 py-6 text-center text-[13px] text-muted">
              Aucun site ne correspond à « {query} ».
            </p>
          ) : (
            filtered.map((site) => (
              <button
                key={site.id}
                type="button"
                onClick={() => select(site.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-surface-2",
                  site.id === activeSiteId && "bg-surface-2"
                )}
              >
                <SiteDot color={site.accentColor} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{site.name}</span>
                  <span className="block truncate font-mono text-xs text-muted">
                    {site.domain}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted tabular">
                  {site.postsCount}
                </span>
                {site.id === activeSiteId ? (
                  <Check className="size-4 shrink-0 text-accent" />
                ) : null}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
