"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, Plus } from "lucide-react";
import { useCompanies } from "@/lib/queries/use-companies";
import { useStats } from "@/lib/queries/use-stats";
import { useAppStore } from "@/lib/store/app-store";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-state";
import { CompanyFormDialog } from "@/components/companies/company-form-dialog";
import { CompanyLogo } from "@/components/layout/company-switcher";

export default function CompaniesPage() {
  const companies = useCompanies();
  const stats = useStats();
  const setActiveCompany = useAppStore((s) => s.setActiveCompany);
  const [createOpen, setCreateOpen] = React.useState(false);

  /** Nombre d'articles par entreprise, fourni par /stats. */
  function postCount(name: string): number | null {
    const row = stats.data?.postsPerCompany.find((r) => r.companyName === name);
    return row?.postCount ?? (stats.data ? 0 : null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Entreprises"
        description="Les blogs que vous administrez depuis ce dashboard."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Ajouter une entreprise
          </Button>
        }
      />

      {companies.isError ? (
        <Card>
          <QueryError
            error={companies.error}
            onRetry={() => companies.refetch()}
          />
        </Card>
      ) : companies.isPending ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} className="h-[150px]" />
          ))}
        </div>
      ) : companies.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="Aucune entreprise enregistrée"
            description="Ajoutez une première entreprise pour commencer à publier des articles."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus />
                Ajouter une entreprise
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {companies.data.map((company) => {
            const count = postCount(company.name);
            return (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.id}`}
                  onClick={() => setActiveCompany(company.id)}
                  className="group flex h-full flex-col rounded-xl border border-border bg-surface p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <CompanyLogo company={company} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {company.name}
                      </p>
                      <p className="truncate font-mono text-[11px] text-muted">
                        {company.code}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted transition-colors group-hover:text-text" />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted tabular">
                      {count === null
                        ? "…"
                        : `${formatNumber(count)} article${count > 1 ? "s" : ""}`}
                    </span>
                    {company.logoUrl ? null : (
                      <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                        sans logo
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <CompanyFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
