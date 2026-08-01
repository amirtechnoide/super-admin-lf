"use client";

import type { ActivityLog } from "@/lib/types";
import { useAppStore } from "@/lib/store/app-store";
import { formatRelative } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteDot } from "@/components/layout/site-switcher";

export function ActivityFeed({
  items,
  loading,
  showSite,
}: {
  items: ActivityLog[];
  loading: boolean;
  showSite: boolean;
}) {
  const sites = useAppStore((s) => s.sites);
  const admin = useAppStore((s) => s.admin);

  if (loading) {
    return (
      <ul className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="space-y-1.5">
            <Skeleton className="h-3.5 w-full max-w-[85%]" />
            <Skeleton className="h-3 w-20" />
          </li>
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-[13px] text-muted">
        Aucune activité récente sur ce périmètre.
      </p>
    );
  }

  return (
    <ol className="space-y-3.5">
      {items.map((item) => {
        const site = sites.find((s) => s.id === item.siteId);
        return (
          <li key={item.id} className="flex gap-2.5">
            <span className="mt-1.5 shrink-0">
              <SiteDot color={site?.accentColor} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug text-text">
                <span className="font-medium">{admin.name}</span>{" "}
                <span className="text-muted">{item.action}</span>{" "}
                <span className="font-medium">{item.target}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted">
                {formatRelative(item.timestamp)}
                {showSite && site ? <>· {site.name}</> : null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
