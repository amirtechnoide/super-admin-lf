"use client";

import Link from "next/link";
import {
  ArrowRight,
  Eye,
  FileText,
  MessageSquare,
  PenSquare,
  PencilLine,
} from "lucide-react";
import { getActivity, getRecentPosts, getStats, getViewsSeries } from "@/lib/data";
import { useAsync } from "@/lib/hooks/use-async";
import { useActiveSite, useAppStore } from "@/lib/store/app-store";
import { formatNumber, formatRelative } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PostStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ViewsChart } from "@/components/dashboard/views-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SiteDot } from "@/components/layout/site-switcher";

export default function OverviewPage() {
  const activeSiteId = useAppStore((s) => s.activeSiteId);
  const activeSite = useActiveSite();
  const sites = useAppStore((s) => s.sites);
  const aggregated = activeSiteId === null;

  const stats = useAsync(() => getStats(activeSiteId), [activeSiteId]);
  const series = useAsync(() => getViewsSeries(activeSiteId), [activeSiteId]);
  const recent = useAsync(() => getRecentPosts(activeSiteId, 5), [activeSiteId]);
  const activity = useAsync(() => getActivity(activeSiteId, 7), [activeSiteId]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Vue d'ensemble"
        description={
          aggregated
            ? `Chiffres agrégés sur les ${sites.length || 5} sites.`
            : `Activité du blog ${activeSite?.name ?? "…"} sur les 30 derniers jours.`
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

      {/* KPIs ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.loading || !stats.data ? (
          Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))
        ) : (
          <>
            <KpiCard
              label="Articles publiés"
              value={formatNumber(stats.data.published)}
              hint={aggregated ? "tous sites confondus" : "sur ce site"}
              icon={FileText}
              highlight
            />
            <KpiCard
              label="Brouillons"
              value={formatNumber(stats.data.drafts)}
              hint="en cours d'écriture"
              icon={PencilLine}
            />
            <KpiCard
              label="Vues du mois"
              value={formatNumber(stats.data.monthlyViews)}
              trend={stats.data.viewsTrend}
              hint="vs 15 jours précédents"
              icon={Eye}
            />
            <KpiCard
              label="Commentaires en attente"
              value={formatNumber(stats.data.pendingComments)}
              hint="à modérer"
              icon={MessageSquare}
            />
          </>
        )}
      </div>

      {/* Courbe + activité ------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle>Vues sur 30 jours</CardTitle>
            {stats.data ? (
              <span className="font-mono text-xs text-muted tabular">
                {formatNumber(stats.data.monthlyViews)} au total
              </span>
            ) : null}
          </CardHeader>
          <CardContent>
            {series.loading || !series.data ? (
              <Skeleton className="h-[180px] w-full sm:h-[200px]" />
            ) : (
              <ViewsChart points={series.data} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              items={activity.data ?? []}
              loading={activity.loading}
              showSite={aggregated}
            />
          </CardContent>
        </Card>
      </div>

      {/* Articles récents -------------------------------------------------- */}
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

        {recent.loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2 px-4 py-3.5 sm:px-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : (recent.data ?? []).length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun article pour l'instant"
            description="Créez le premier article de ce site pour lancer le blog."
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
            {(recent.data ?? []).map((post) => {
              const site = sites.find((s) => s.id === post.siteId);
              return (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:items-center sm:px-5"
                  >
                    {aggregated ? (
                      <span className="mt-1.5 shrink-0 sm:mt-0">
                        <SiteDot color={site?.accentColor} />
                      </span>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {post.title}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                        {formatRelative(post.updatedAt)}
                        {aggregated && site ? ` · ${site.name}` : ""} ·{" "}
                        {formatNumber(post.views)} vues
                      </p>
                    </div>
                    <div className="shrink-0">
                      <PostStatusBadge status={post.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
