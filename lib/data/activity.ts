import type { ActivityLog, OverviewStats, ViewsPoint } from "@/lib/types";
import { clone, db, sleep } from "./db";

export async function getActivity(
  siteId: string | null,
  limit = 8
): Promise<ActivityLog[]> {
  await sleep(280);
  const items = db.activity
    .filter((a) => (siteId ? a.siteId === siteId : true))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return clone(items.slice(0, limit));
}

/** KPIs de l'overview. `siteId = null` => agrégé sur les 5 sites. */
export async function getStats(siteId: string | null): Promise<OverviewStats> {
  await sleep(320);
  const posts = db.posts.filter((p) => (siteId ? p.siteId === siteId : true));
  const comments = db.comments.filter((c) =>
    siteId ? c.siteId === siteId : true
  );

  const series = getSeriesFor(siteId);
  const monthlyViews = series.reduce((sum, point) => sum + point.views, 0);
  const half = Math.floor(series.length / 2);
  const previous = series.slice(0, half).reduce((s, p) => s + p.views, 0);
  const current = series.slice(half).reduce((s, p) => s + p.views, 0);
  const viewsTrend =
    previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);

  return {
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status === "draft").length,
    monthlyViews,
    pendingComments: comments.filter((c) => c.status === "pending").length,
    viewsTrend,
  };
}

function getSeriesFor(siteId: string | null): ViewsPoint[] {
  if (siteId) return db.viewsSeries[siteId] ?? [];

  // Vue agrégée : somme jour par jour sur tous les sites.
  const totals = new Map<string, number>();
  for (const series of Object.values(db.viewsSeries)) {
    for (const point of series) {
      totals.set(point.date, (totals.get(point.date) ?? 0) + point.views);
    }
  }
  return [...totals.entries()]
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getViewsSeries(
  siteId: string | null
): Promise<ViewsPoint[]> {
  await sleep(340);
  return clone(getSeriesFor(siteId));
}
