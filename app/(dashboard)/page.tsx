"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  PencilLine,
  PenSquare,
  Send,
} from "lucide-react";
import { useStats } from "@/lib/queries/use-stats";
import { usePosts } from "@/lib/queries/use-posts";
import { useAppStore } from "@/lib/store/app-store";
import { formatNumber, formatRelative } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton, ListSkeleton, Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PostsPerCompanyChart } from "@/components/dashboard/posts-per-company-chart";
import {
  CompanyDot,
  useActiveCompany,
} from "@/components/layout/company-switcher";

export default function OverviewPage() {
  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const activeCompany = useActiveCompany();
  const aggregated = activeCompanyId === null;

  // `/stats` est global : l'API n'accepte pas de filtre par entreprise.
  const stats = useStats();
  const recent = usePosts({
    companyId: activeCompanyId,
    page: 0,
    size: 5,
    sort: "updatedAt,desc",
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Vue d'ensemble"
        description={
          aggregated
            ? "Chiffres agrégés sur l'ensemble des entreprises."
            : `Derniers articles de ${activeCompany?.name ?? "…"} — les compteurs restent globaux.`
        }
        actions={
          <Button asChild>
            <Link href="/posts/new">
              <PenSquare />
              Nouvel article
            </Link>
          </Button>
        }
      />

      {stats.isError ? (
        <Card>
          <QueryError error={stats.error} onRetry={() => stats.refetch()} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.isPending || !stats.data ? (
            Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))
          ) : (
            <>
              <KpiCard
                label="Articles publiés"
                value={formatNumber(stats.data.totalPublishedPosts)}
                hint="visibles sur les sites"
                icon={Send}
                highlight
              />
              <KpiCard
                label="Brouillons"
                value={formatNumber(stats.data.totalDraftPosts)}
                hint="en cours d'écriture"
                icon={PencilLine}
              />
              <KpiCard
                label="Articles au total"
                value={formatNumber(stats.data.totalPosts)}
                hint="brouillons inclus"
                icon={FileText}
              />
              <KpiCard
                label="Entreprises"
                value={formatNumber(stats.data.totalCompanies)}
                hint="blogs administrés"
                icon={Building2}
              />
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle>Articles par entreprise</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/companies">
                Gérer
                <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.isPending || !stats.data ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <PostsPerCompanyChart rows={stats.data.postsPerCompany} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Périmètre courant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-3 py-2.5">
              {activeCompany ? (
                <CompanyDot company={activeCompany} />
              ) : (
                <span aria-hidden className="size-2.5 rounded-full bg-muted" />
              )}
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">
                  {activeCompany?.name ?? "Toutes les entreprises"}
                </p>
                <p className="truncate font-mono text-[11px] text-muted">
                  {activeCompany?.code ?? "vue agrégée"}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              Le sélecteur en haut de page filtre les articles et la recherche.
              Les compteurs ci-dessus viennent de{" "}
              <span className="font-mono">/stats</span>, qui reste global.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle>Articles récents</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/posts">
              Tout voir
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>

        {recent.isError ? (
          <QueryError error={recent.error} onRetry={() => recent.refetch()} />
        ) : recent.isPending ? (
          <ListSkeleton rows={4} />
        ) : recent.data.content.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun article pour l'instant"
            description="Créez le premier article — il apparaîtra immédiatement ici."
            action={
              <Button asChild>
                <Link href="/posts/new">
                  <PenSquare />
                  Créer un article
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {recent.data.content.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:items-center sm:px-5"
                >
                  {aggregated ? (
                    <span className="mt-1.5 shrink-0 sm:mt-0">
                      <CompanyDot company={post.company} />
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                      {formatRelative(post.updatedAt)}
                      {aggregated && post.company ? ` · ${post.company.name}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <PostStatusBadge status={post.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
