"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Layers, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/app-store";
import { useCompanies } from "@/lib/queries/use-companies";
import { accentForCompany } from "@/lib/theme/company-accent";
import type { Company } from "@/lib/api/schemas";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Pastille de couleur de l'entreprise — le repère visuel du multi-tenant. */
export function CompanyDot({
  company,
  className,
}: {
  company?: Company | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: accentForCompany(company) }}
    />
  );
}

/**
 * Combobox de sélection de l'entreprise active. L'admin voit toutes les
 * entreprises, plus une option « Toutes les entreprises » pour la vue agrégée.
 */
export function CompanySwitcher() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const setActiveCompany = useAppStore((s) => s.setActiveCompany);
  const { data: companies = [], isLoading } = useCompanies();

  const activeCompany = companies.find((c) => c.id === activeCompanyId) ?? null;
  const filtered = companies.filter((company) =>
    `${company.name} ${company.code}`.toLowerCase().includes(query.toLowerCase())
  );

  function select(id: number | null) {
    setActiveCompany(id);
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
          aria-controls="company-switcher-list"
          aria-label="Changer d'entreprise"
          className={cn(
            "flex h-9 max-md:h-10 min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-[13px] font-medium transition-colors hover:border-border-strong",
            "max-w-[190px] sm:max-w-[240px]"
          )}
        >
          {activeCompany ? (
            <CompanyDot company={activeCompany} />
          ) : (
            <Layers className="size-3.5 shrink-0 text-muted" />
          )}
          <span className="truncate">
            {activeCompany?.name ?? "Toutes les entreprises"}
          </span>
          <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        id="company-switcher-list"
        className="w-[min(20rem,calc(100vw-1.5rem))] p-0"
        align="start"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-3.5 shrink-0 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une entreprise…"
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
              activeCompanyId === null && "bg-surface-2"
            )}
          >
            <Layers className="size-4 shrink-0 text-muted" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                Toutes les entreprises
              </span>
              <span className="block truncate text-xs text-muted">
                Vue agrégée sur {companies.length} entreprise
                {companies.length > 1 ? "s" : ""}
              </span>
            </span>
            {activeCompanyId === null ? (
              <Check className="size-4 shrink-0 text-accent" />
            ) : null}
          </button>

          <div className="my-1 h-px bg-border" />

          {isLoading ? (
            <p className="px-2.5 py-6 text-center text-[13px] text-muted">
              Chargement…
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-2.5 py-6 text-center text-[13px] text-muted">
              {query
                ? `Aucune entreprise ne correspond à « ${query} ».`
                : "Aucune entreprise enregistrée."}
            </p>
          ) : (
            filtered.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => select(company.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors hover:bg-surface-2",
                  company.id === activeCompanyId && "bg-surface-2"
                )}
              >
                <CompanyDot company={company} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {company.name}
                  </span>
                  <span className="block truncate font-mono text-xs text-muted">
                    {company.code}
                  </span>
                </span>
                {company.id === activeCompanyId ? (
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

/** Logo de l'entreprise, avec repli sur un monogramme teinté. */
export function CompanyLogo({
  company,
  className,
}: {
  company: Company;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const accent = accentForCompany(company);

  if (company.logoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- domaine R2 non déclaré dans next.config
      <img
        src={company.logoUrl}
        alt=""
        onError={() => setFailed(true)}
        className={cn(
          "shrink-0 rounded-lg border border-border object-cover",
          className
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-display text-sm font-semibold",
        className
      )}
      style={{ backgroundColor: `${accent}1f`, color: accent }}
    >
      {company.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

/** Renvoie l'entreprise active, ou `null` en vue agrégée. */
export function useActiveCompany(): Company | null {
  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const { data: companies = [] } = useCompanies();
  return companies.find((c) => c.id === activeCompanyId) ?? null;
}

