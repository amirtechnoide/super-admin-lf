"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, FileText, Plus } from "lucide-react";
import { useCompanies } from "@/lib/queries/use-companies";
import { useStats } from "@/lib/queries/use-stats";
import { useAppStore } from "@/lib/store/app-store";
import { accentForCompany } from "@/lib/theme/company-accent";
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
                  className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-lg"
                >
                  {/* Bandeau teinté : l'entreprise se reconnaît au premier regard. */}
                  <div
                    className="h-16 w-full"
                    style={{
                      backgroundImage: `linear-gradient(120deg, ${accentForCompany(company)}2e, ${accentForCompany(company)}0a)`,
                    }}
                  />

                  <div className="flex flex-1 flex-col p-4 pt-0 sm:p-5 sm:pt-0">
                    {/* Le logo chevauche le bandeau, comme une fiche d'identité. */}
                    <CompanyLogo
                      company={company}
                      className="-mt-7 size-14 border-4 border-surface text-base shadow-sm"
                    />

                    <p className="mt-3 truncate text-[15px] font-semibold tracking-tight transition-colors group-hover:text-accent">
                      {company.name}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted">
                      {company.code}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted tabular">
                        <FileText className="size-3.5" />
                        {count === null
                          ? "…"
                          : `${formatNumber(count)} article${count > 1 ? "s" : ""}`}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors group-hover:text-accent">
                        Ouvrir
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    </div>
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
